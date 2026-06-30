import {
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

// /move — submit a move order for one of your units.
//
// The full flow (source dropdown -> adjacent-destination dropdown -> confirm)
// lands once the province/adjacency map is wired up. For now this is a
// placeholder so we can verify the command registers and responds in the
// server.
export const data = new SlashCommandBuilder()
  .setName("move")
  .setDescription("Submit a move order for one of your units.");

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await interaction.reply({
    content:
      "🗺️ `/move` is wired up, but the province map isn't loaded yet. " +
      "Dropdowns for source → destination are coming once the map data lands.",
    flags: MessageFlags.Ephemeral,
  });
}
