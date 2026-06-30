import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import * as move from "./move.ts";

// Shape every slash command module must satisfy.
export type Command = {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

// All registered slash commands, keyed by command name for fast dispatch.
export const commands = new Map<string, Command>(
  [move].map((command) => [command.data.name, command]),
);
