import {
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

// /whoami — reply with the caller's Discord user ID and display name, so
// players can self-report the ID used to key their units in game state.
export const data = new SlashCommandBuilder()
  .setName("whoami")
  .setDescription("Show your Discord user ID (used to track your units).");

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.reply({
    content:
      `**${interaction.user.displayName}**\n` +
      `Discord user ID: \`${interaction.user.id}\``,
    flags: MessageFlags.Ephemeral,
  });
}
