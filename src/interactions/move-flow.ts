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
import { config } from "../config.ts";
import { validDestinations } from "../map/index.ts";
import { getUnitAt, getUnitsForUser } from "../map/state.ts";
import {
  type MoveOrder,
  clearUserOrders,
  getUserOrders,
  removeOrder,
  setOrder,
} from "../orders/store.ts";

// customId scheme (province names never contain ":"):
//   move:add            -> open the source picker
//   move:src            -> source select (value = province)
//   move:dst:<source>   -> destination select (value = province)
//   move:rm:<source>    -> remove just that one order
//   move:submit         -> post the order list to the orders channel
//   move:cancel         -> back to the order list
//   move:clear          -> wipe all of this user's orders
const PREFIX = "move";

// Discord allows 5 action rows per message. Reserve one for the action
// buttons, leaving four rows of up to five per-order remove buttons.
const REMOVE_BUTTONS_PER_ROW = 5;
const MAX_REMOVE_ROWS = 4;

type View = {
  content: string;
  components: ActionRowBuilder<MessageActionRowComponentBuilder>[];
};

function guildKey(guildId: string | null): string {
  return guildId ?? "global";
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

/** A row of red "remove this order" buttons, one per staged move. */
function removeRows(
  staged: MoveOrder[],
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
  const buttons = staged.map((order) =>
    new ButtonBuilder()
      .setCustomId(`${PREFIX}:rm:${order.source}`)
      .setLabel(`Remove ${order.source}`)
      .setStyle(ButtonStyle.Danger),
  );

  return chunk(buttons, REMOVE_BUTTONS_PER_ROW)
    .slice(0, MAX_REMOVE_ROWS)
    .map((row) =>
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        ...row,
      ),
    );
}

/** The order sheet: every staged move, its remove buttons, and the actions. */
function listView(guildId: string | null, userId: string): View {
  const staged = getUserOrders(guildKey(guildId), userId);

  const lines = staged.length
    ? staged
        .map((o, i) => `\`${i + 1}.\` ${o.source} → **${o.destination}**`)
        .join("\n")
    : "_No moves yet._";

  const actions =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${PREFIX}:add`)
        .setLabel("Add move")
        .setStyle(ButtonStyle.Primary),
    );
  if (staged.length) {
    actions.addComponents(
      new ButtonBuilder()
        .setCustomId(`${PREFIX}:submit`)
        .setLabel("Submit")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`${PREFIX}:clear`)
        .setLabel("Clear all")
        .setStyle(ButtonStyle.Danger),
    );
  }

  return {
    content: `**Your move orders**\n${lines}`,
    components: [...removeRows(staged), actions],
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

/** Format a player's orders in the game's notation: "Source - Destination". */
function formatOrders(displayName: string, staged: MoveOrder[]): string {
  const body = staged.map((o) => `${o.source} - ${o.destination}`).join("\n");
  return `**${displayName}**\n${body}`;
}

/** Post the staged orders to the orders channel; returns the resulting view. */
async function submit(interaction: MessageComponentInteraction): Promise<View> {
  const guildId = interaction.guildId;
  const userId = interaction.user.id;
  const staged = getUserOrders(guildKey(guildId), userId);

  if (staged.length === 0) return listView(guildId, userId);

  const channel = await interaction.client.channels
    .fetch(config.ordersChannelId)
    .catch(() => null);

  if (!channel?.isSendable()) {
    return {
      content:
        "⚠️ Couldn't post to the orders channel — check the bot's access there.",
      components: listView(guildId, userId).components,
    };
  }

  await channel.send({
    content: formatOrders(interaction.user.displayName, staged),
    allowedMentions: { parse: [] },
  });

  const base = listView(guildId, userId);
  return {
    content: `✅ Submitted to <#${config.ordersChannelId}>.\n${base.content}`,
    components: base.components,
  };
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

    case "rm": {
      const source = rest.join(":");
      if (source) await removeOrder(guildKey(guildId), userId, source);
      view = listView(guildId, userId);
      break;
    }

    case "submit":
      view = await submit(interaction);
      break;

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
