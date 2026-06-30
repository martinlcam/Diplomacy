import type { MoveOrder } from "../orders/store.ts";
import type { UnitKind } from "./index.ts";

// Live game state: which units each player controls and where they sit.
// Keyed by Discord user ID. Persisted to data/positions.json and mutated when
// a player submits their orders, so the next /move shows the new positions.
//
// Seeded from src/map/initial-positions.json if present (the authoritative
// starting board, filled in once players are mapped to their Discord IDs).
// Until real assignments exist, DEMO_FALLBACK hands any unknown user a small
// demo roster so the flow stays testable — flip it off once positions.json is
// populated for real.

export type Unit = {
  // Province the unit currently occupies.
  province: string;
  kind: UnitKind;
};

type PlayerState = {
  // Display name, for readability in the JSON file. Optional.
  name?: string;
  units: Unit[];
};

type Positions = Record<string, PlayerState>;

const DEMO_FALLBACK = true;
const DEMO_UNITS: readonly Unit[] = [
  { province: "Argent Mountains", kind: "army" },
  { province: "Antathir Plain", kind: "army" },
  { province: "Nockmirch", kind: "army" },
  { province: "Amarantine Sea 1", kind: "fleet" },
  { province: "Amarantine Coast", kind: "fleet" },
];

const DATA_PATH = `${process.cwd()}/data/positions.json`;
const SEED_PATH = `${import.meta.dir}/initial-positions.json`;

async function load(): Promise<Positions> {
  const data = Bun.file(DATA_PATH);
  if (await data.exists()) {
    try {
      return (await data.json()) as Positions;
    } catch {
      console.warn(`Could not parse ${DATA_PATH}; reseeding.`);
    }
  }
  const seed = Bun.file(SEED_PATH);
  const positions: Positions = (await seed.exists())
    ? ((await seed.json()) as Positions)
    : {};
  await Bun.write(DATA_PATH, JSON.stringify(positions, null, 2));
  return positions;
}

const positions: Positions = await load();

async function persist(): Promise<void> {
  await Bun.write(DATA_PATH, JSON.stringify(positions, null, 2));
}

// Get a player's state, materializing a demo roster for unknown users.
function ensurePlayer(userId: string): PlayerState {
  let player = positions[userId];
  if (!player) {
    player = {
      units: DEMO_FALLBACK ? structuredClone(DEMO_UNITS as Unit[]) : [],
    };
    positions[userId] = player;
  }
  return player;
}

// Units controlled by a given Discord user.
export function getUnitsForUser(userId: string): Unit[] {
  return ensurePlayer(userId).units;
}

// Find one of a user's units by the province it occupies.
export function getUnitAt(userId: string, province: string): Unit | undefined {
  return getUnitsForUser(userId).find((unit) => unit.province === province);
}

// Apply a player's submitted moves to the board: each unit at `source`
// relocates to `destination`. Naive — no simultaneous-conflict resolution
// yet; that's the adjudication step. Persists the new positions.
export async function applyMoves(
  userId: string,
  moves: MoveOrder[],
): Promise<void> {
  const player = ensurePlayer(userId);
  for (const move of moves) {
    const unit = player.units.find((u) => u.province === move.source);
    if (unit) unit.province = move.destination;
  }
  await persist();
}
