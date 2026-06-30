// The Runeterra province graph, parsed from runeterra_adjacency.csv at startup.
// See docs/map-data.md for how the CSV was derived and what each column means.

export type ProvinceType = "land" | "sea";

export interface Province {
  /** Canonical province name, e.g. "Amarantine Sea 1". */
  name: string;
  type: ProvinceType;
  /** Circled by a canal ellipse — armies and fleets can both occupy it. */
  isCanal: boolean;
  /** Full neighbour list (the army-movement graph). */
  adjacent: string[];
  /** Provinces reachable by a fleet (subset of `adjacent`). */
  coastalAdjacent: string[];
}

/** Split a `; `-separated cell into trimmed, non-empty names. */
function splitList(cell: string): string[] {
  return cell
    .split(";")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

/**
 * Parse the adjacency CSV. No field contains a comma (neighbour lists use
 * `; ` separators), so a plain comma split into 5 columns is sufficient.
 */
function parse(csv: string): Map<string, Province> {
  const provinces = new Map<string, Province>();
  const lines = csv.split(/\r?\n/);

  for (const line of lines.slice(1)) {
    if (line.trim() === "") continue;
    const [name, type, isCanal, adjacent, coastalAdjacent] = line.split(",");
    if (!name || (type !== "land" && type !== "sea")) {
      throw new Error(`Malformed province row in adjacency CSV: "${line}"`);
    }
    provinces.set(name.trim(), {
      name: name.trim(),
      type,
      isCanal: isCanal?.trim() === "yes",
      adjacent: splitList(adjacent ?? ""),
      coastalAdjacent: splitList(coastalAdjacent ?? ""),
    });
  }

  return provinces;
}

const csvPath = `${import.meta.dir}/runeterra_adjacency.csv`;
const csv = await Bun.file(csvPath).text();

/** All provinces keyed by canonical name. */
export const provinces: ReadonlyMap<string, Province> = parse(csv);

/** Look up a province by exact name, or `undefined` if it doesn't exist. */
export function getProvince(name: string): Province | undefined {
  return provinces.get(name);
}

export type UnitKind = "army" | "fleet";

/**
 * Provinces a unit of `kind` may legally move into from `source`.
 *
 * - Armies move into adjacent land provinces.
 * - Fleets move into adjacent coastal/sea provinces (the coastal graph).
 *
 * Canals count as land but can also be entered by fleets, so they appear in
 * the coastal graph already. Returns names sorted for stable menu ordering.
 */
export function validDestinations(source: string, kind: UnitKind): string[] {
  const province = provinces.get(source);
  if (!province) return [];

  const names =
    kind === "fleet"
      ? province.coastalAdjacent
      : province.adjacent.filter((n) => {
          const target = provinces.get(n);
          return target?.type === "land" || target?.isCanal;
        });

  return [...names].sort((a, b) => a.localeCompare(b));
}
