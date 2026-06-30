import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.ts";
import { config } from "./config.ts";

// One-off script to register slash commands with Discord.
//
// We register to a single guild (config.guildId) so changes show up
// instantly during development. Run with: `bun run deploy`.
const body = [...commands.values()].map((command) => command.data.toJSON());

const rest = new REST().setToken(config.token);

console.log(
  `Registering ${body.length} command(s) to guild ${config.guildId}…`,
);

const data = (await rest.put(
  Routes.applicationGuildCommands(config.clientId, config.guildId),
  { body },
)) as unknown[];

console.log(`✅ Registered ${data.length} command(s).`);
