/**
 * Loads and validates the environment variables the bot needs to run.
 * Bun loads `.env` automatically, so no dotenv import is required.
 * Fails fast with a clear message if anything is missing, so we never
 * try to log in with an undefined token.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in your .env file (see README.md).`,
    );
  }
  return value.trim();
}

export const config = {
  token: required("DISCORD_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  guildId: required("DISCORD_GUILD_ID"),
} as const;
