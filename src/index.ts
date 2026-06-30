import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { commands } from "./commands/index.ts";
import { config } from "./config.ts";
import {
  handleMoveComponent,
  isMoveComponent,
} from "./interactions/move-flow.ts";

// The bot only uses slash commands and message components, so it needs the
// Guilds intent and nothing privileged (no message-content reading).
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (ready) => {
  console.log(`✅ Logged in as ${ready.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) {
        console.warn(`Received unknown command: ${interaction.commandName}`);
        return;
      }
      await command.execute(interaction);
      return;
    }

    if (
      (interaction.isButton() || interaction.isStringSelectMenu()) &&
      isMoveComponent(interaction.customId)
    ) {
      await handleMoveComponent(interaction);
      return;
    }
  } catch (error) {
    console.error("Error handling interaction:", error);
    if (
      interaction.isRepliable() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content: "⚠️ Something went wrong handling that interaction.",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

await client.login(config.token);
