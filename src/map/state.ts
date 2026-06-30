import type { UnitKind } from "./index.ts";

// PLACEHOLDER game state. Real unit ownership (who controls which provinces)
// will replace this once the power/assignment system lands. For now every
// player is handed the same small roster of real provinces so the /move
// flow is fully testable. Swapping this out is a single-file change.

export interface Unit {
  /** Province the unit currently occupies. */
  province: string;
  kind: UnitKind;
}

const PLACEHOLDER_UNITS: readonly Unit[] = [
  { province: "Argent Mountains", kind: "army" },
  { province: "Antathir Plain", kind: "army" },
  { province: "Aurma", kind: "army" },
  { province: "Amarantine Sea 1", kind: "fleet" },
  { province: "Amarantine Coast", kind: "fleet" },
];

/** Units controlled by a given Discord user this turn. */
export function getUnitsForUser(_userId: string): Unit[] {
  return [...PLACEHOLDER_UNITS];
}

/** Find one of a user's units by the province it occupies. */
export function getUnitAt(userId: string, province: string): Unit | undefined {
  return getUnitsForUser(userId).find((unit) => unit.province === province);
}
