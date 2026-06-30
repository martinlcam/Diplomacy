# Diplomacy

A Discord bot for running games of Diplomacy — order submission, adjudication, and turn management.

Built with **Bun** + **TypeScript** + **discord.js v14**. Linted/formatted with **Biome**.

## Status

Bootstrap. The `/move` command is registered and responds; the full
source → destination dropdown flow lands once the province/adjacency map
(coming as a CSV) is wired in.

## Prerequisites

- [Bun](https://bun.sh) (v1.3+)
- A Discord account with permission to add a bot to your server

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Create the Discord application & bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**. Name it (e.g. "Diplomacy"), then **Create**.
2. Open the **Bot** tab → **Reset Token** → **Copy**. This is your `DISCORD_TOKEN`. (Keep it secret — never commit it.)
3. On the **General Information** tab, copy the **Application ID**. This is your `DISCORD_CLIENT_ID`.
4. No privileged intents are required — the bot uses only slash commands and message components.

### 3. Get your server (guild) ID

1. In Discord, open **User Settings → Advanced** and enable **Developer Mode**.
2. Right-click your server's icon → **Copy Server ID**. This is your `DISCORD_GUILD_ID`.

### 4. Configure environment

Create a `.env` file in the project root with:

```
DISCORD_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-application-id
DISCORD_GUILD_ID=your-server-id
```

`.env` is gitignored. Bun loads it automatically.

### 5. Invite the bot to your server

Open this URL in a browser (replace `YOUR_CLIENT_ID` with your Application ID):

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot+applications.commands&permissions=2147485696
```

`permissions=2147485696` grants **Send Messages** + **Use Application Commands**. Pick your server and authorize.

### 6. Register slash commands

```bash
bun run deploy
```

Registers commands to your guild (instant). Re-run whenever a command's
definition changes.

### 7. Run the bot

```bash
bun run dev    # watch mode (restarts on file changes)
# or
bun run start
```

You should see `✅ Logged in as <bot>#0000`. Try `/move` in your server.

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start the bot in watch mode |
| `bun run start` | Start the bot |
| `bun run deploy` | Register slash commands to the guild |
| `bun run typecheck` | Type-check with `tsc` |
| `bun run lint` | Lint with Biome |
| `bun run format` | Format with Biome |
| `bun run check` | Lint + format + apply safe fixes |

## Project layout

```
src/
  index.ts            bot bootstrap, login, interaction router
  config.ts           loads + validates env vars
  deploy-commands.ts  registers slash commands to the guild
  commands/
    index.ts          command registry
    move.ts           /move command
```
