import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { startMove } from "../interactions/move-flow.ts";

// /move — open this turn's order sheet. Players stage one move per unit
// (source -> destination) and can keep adding moves; all are resolved
// simultaneously at adjudication.
export const data = new SlashCommandBuilder()
  .setName("move")
  .setDescription("Open your order sheet and submit move orders.");

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await startMove(interaction);
}
