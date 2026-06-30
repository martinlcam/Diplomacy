# Diplomacy

Discord bot for Diplomacy games — order submission, adjudication, and turn management.

**Stack:** Bun, TypeScript, discord.js v14, Biome

## Commands

```bash
bun install
bun run dev       # watch mode
bun run start
bun run deploy    # register slash commands to guild
bun run typecheck
bun run lint
bun run format
bun run check
```

## Layout

```
src/
  index.ts            bot bootstrap, login, interaction router
  config.ts           loads + validates env vars
  deploy-commands.ts  registers slash commands to the guild
  commands/
    index.ts          command registry
    move.ts           /move command
```

## Code style

### Comments: use `//`, not `/* */`

Use line comments (`//`) for all comments. Do not use block comments (`/* */` or JSDoc-style `/** */`).

```typescript
// ❌ BAD
/**
 * /move — submit a move order for one of your units.
 */
export const data = new SlashCommandBuilder();

/** Shape every slash command module must satisfy. */
export interface CommandModule {}

// ✅ GOOD
// /move — submit a move order for one of your units.
export const data = new SlashCommandBuilder();

// Shape every slash command module must satisfy.
export type CommandModule = {};
```

For multi-line comments, use one `//` per line:

```typescript
// /move — submit a move order for one of your units.
// The full flow (source dropdown -> adjacent-destination dropdown -> confirm)
// lands once the province/adjacency map is wired up.
```

### Types over interfaces

Use `type` aliases for object shapes, unions, and reusable definitions. Do not use `interface`.

```typescript
// ❌ BAD
export interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

// ✅ GOOD
export type Command = {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};
```

Use `type` for unions and primitives too:

```typescript
// ❌ BAD
interface ProvinceId extends string {}

// ✅ GOOD
type ProvinceId = string;
type OrderKind = "move" | "hold" | "support" | "convoy";
```
