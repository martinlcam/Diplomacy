# Diplomacy

Discord bot for Diplomacy games — order submission, adjudication, and turn management.

**Stack:** Bun, TypeScript, discord.js v14, Biome

## Game Rules

This is a Diplomacy variant. The bot must enforce / model these rules.

### Unit actions (per turn)

Every unit (army or fleet) takes one action:

- **Hold** — do nothing. Order: `Province A h`
- **Move** — move to an adjacent province. Armies move to land provinces;
  fleets move to coastal and sea provinces. Sea provinces may have multiple
  coasts, counted as separate provinces for fleets. Only one unit may occupy a
  province at a time. Order: `Province A - Province B`. Separate coast:
  `Province A - Province B SC`. Multi-subregion (plains/desert/high seas):
  `Province A - High Seas 2`.
- **Support** — support another unit's move into an adjacent province (+1
  attack strength), or support the defense of a non-moving/non-coring unit (+1
  defense). Orders: `Province A s Province B h` / `Province A s Province B - Province C`.
- **Convoy** — a fleet (or chain of fleets) on sea provinces convoys an army
  between two land provinces, as long as the fleets are collectively adjacent
  in a chain. The convoy is cancelled if a convoying fleet is dislodged.
  Order: `Sea Province c Province A - Province B`.
- **Core** — a unit on an owned province may core. If the coring unit is
  attacked (not necessarily dislodged), the core attempt fails. Two
  consecutive successful cores make the province a core centre for that power.
  Units may only be built on core centres. **Coring units cannot be
  supported.** Order: `Province A core`.

### Resolution

- An attack succeeds if it has more strength than the defender (or competing
  attackers). If the max attacker strength ties, no development occurs.
- A successful attack dislodges the defender, which must retreat to any
  province it could ordinarily move to **except the province it was attacked
  from**. A dislodged unit may instead disband.

### Turn cycle

- Phases cycle **Spring → Fall → Winter**.
- Spring and Fall are diplomacy turns: 15 min negotiation, then orders are
  submitted in <#1521326921202270338> and resolved simultaneously;
  adjudication discussion in <#1521326377767534637>.
- Retreat phases follow diplomacy turns when required.
- At the end of Fall, occupied supply centres become owned by the capturing
  power.
- Winter is the build phase: build units on core centres / disband until unit
  count matches owned supply-centre count. Fleets may only be built on coastal
  provinces.
- No diplomacy during retreat and build phases (3 min each). Any phase may end
  early if all players agree.

### Victory

82 supply centres total. Total victory = occupying **42** (more than half).
Surviving players may agree a shared draw at any time.

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
