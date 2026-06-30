import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  type InteractionUpdateOptions,
  type MessageActionRowComponentBuilder,
  type MessageComponentInteraction,
  MessageFlags,
  type MessageReplyOptions,
  StringSelectMenuBuilder,
} from "discord.js";
import { validDestinations } from "../map/index.ts";
import { getUnitAt, getUnitsForUser } from "../map/state.ts";
import { clearUserOrders, getUserOrders, setOrder } from "../orders/store.ts";

// customId scheme (province names never contain ":"):
//   move:add            -> open the source picker
//   move:src            -> source select (value = province)
//   move:dst:<source>   -> destination select (value = province)
//   move:cancel         -> back to the order list
//   move:clear          -> wipe all of this user's orders
const PREFIX = "move";

type View = {
  content: string;
  components: ActionRowBuilder<MessageActionRowComponentBuilder>[];
};

function guildKey(guildId: string | null): string {
  return guildId ?? "global";
}

/** The order sheet: every staged move plus the buttons to add/clear. */
function listView(guildId: string | null, userId: string): View {
  const staged = getUserOrders(guildKey(guildId), userId);

  const lines = staged.length
    ? staged
        .map((o, i) => `\`${i + 1}.\` ${o.source} → **${o.destination}**`)
        .join("\n")
    : "_No moves yet._";

  const buttons =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${PREFIX}:add`)
        .setLabel("Add move")
        .setEmoji("➕")
        .setStyle(ButtonStyle.Primary),
    );
  if (staged.length) {
    buttons.addComponents(
      new ButtonBuilder()
        .setCustomId(`${PREFIX}:clear`)
        .setLabel("Clear all")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger),
    );
  }

  return {
    content: `**Your move orders**\n${lines}`,
    components: [buttons],
  };
}

/** Pick which unit to move. */
function sourceView(userId: string): View {
  const units = getUnitsForUser(userId);

  const select = new StringSelectMenuBuilder()
    .setCustomId(`${PREFIX}:src`)
    .setPlaceholder("Choose a unit to move")
    .addOptions(
      units.map((unit) => ({
        label: unit.province,
        description: unit.kind === "fleet" ? "Fleet" : "Army",
        value: unit.province,
      })),
    );

  return {
    content: "**Add a move** — which unit?",
    components: [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        select,
      ),
      cancelRow(),
    ],
  };
}

/** Pick the destination for the unit at `source`. */
function destView(userId: string, source: string): View {
  const unit = getUnitAt(userId, source);
  if (!unit) {
    return {
      content: `⚠️ You don't have a unit in ${source} anymore.`,
      components: [cancelRow()],
    };
  }

  const destinations = validDestinations(source, unit.kind);
  if (destinations.length === 0) {
    return {
      content: `${source} has no legal moves — it can only hold.`,
      components: [cancelRow()],
    };
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId(`${PREFIX}:dst:${source}`)
    .setPlaceholder(`Where does ${source} move?`)
    .addOptions(destinations.map((name) => ({ label: name, value: name })));

  return {
    content: `**Add a move** — ${unit.kind} in ${source} moves to…`,
    components: [
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        select,
      ),
      cancelRow(),
    ],
  };
}

function cancelRow(): ActionRowBuilder<MessageActionRowComponentBuilder> {
  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${PREFIX}:cancel`)
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary),
  );
}

/** Entry point for the /move slash command. */
export async function startMove(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const view = listView(interaction.guildId, interaction.user.id);
  await interaction.reply({
    ...(view as MessageReplyOptions),
    flags: MessageFlags.Ephemeral,
  });
}

/** Routes every `move:*` button and select-menu interaction. */
export async function handleMoveComponent(
  interaction: MessageComponentInteraction,
): Promise<void> {
  const [, action, ...rest] = interaction.customId.split(":");
  const userId = interaction.user.id;
  const guildId = interaction.guildId;

  let view: View;

  switch (action) {
    case "add":
      view = sourceView(userId);
      break;

    case "src": {
      const source = interaction.isStringSelectMenu()
        ? interaction.values[0]
        : undefined;
      view = source ? destView(userId, source) : listView(guildId, userId);
      break;
    }

    case "dst": {
      const source = rest.join(":");
      const destination = interaction.isStringSelectMenu()
        ? interaction.values[0]
        : undefined;
      if (source && destination) {
        await setOrder(guildKey(guildId), userId, { source, destination });
      }
      view = listView(guildId, userId);
      break;
    }

    case "clear":
      await clearUserOrders(guildKey(guildId), userId);
      view = listView(guildId, userId);
      break;
    default:
      view = listView(guildId, userId);
  }

  await interaction.update(view as InteractionUpdateOptions);
}

/** Whether this component interaction belongs to the move flow. */
export function isMoveComponent(customId: string): boolean {
  return customId.startsWith(`${PREFIX}:`);
}
