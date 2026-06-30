// Persists submitted orders to data/orders.json (gitignored). Loaded once at
// startup into memory, then written through on every change. Keyed by
// guild -> user -> source province, so each unit holds exactly one order and
// re-ordering the same unit overwrites the previous choice.

export type MoveOrder = {
  source: string;
  destination: string;
};

type OrdersFile = Record<string, Record<string, Record<string, MoveOrder>>>;

const FILE_PATH = `${process.cwd()}/data/orders.json`;

async function load(): Promise<OrdersFile> {
  const file = Bun.file(FILE_PATH);
  if (!(await file.exists())) return {};
  try {
    return (await file.json()) as OrdersFile;
  } catch {
    console.warn(`Could not parse ${FILE_PATH}; starting with empty orders.`);
    return {};
  }
}

const orders: OrdersFile = await load();

async function persist(): Promise<void> {
  // Bun.write creates parent directories as needed.
  await Bun.write(FILE_PATH, JSON.stringify(orders, null, 2));
}

// All move orders a user has staged in a guild, in insertion order.
export function getUserOrders(guildId: string, userId: string): MoveOrder[] {
  return Object.values(orders[guildId]?.[userId] ?? {});
}

// Save (or overwrite) the order for the unit at `order.source`.
export async function setOrder(
  guildId: string,
  userId: string,
  order: MoveOrder,
): Promise<void> {
  const guild = orders[guildId] ?? {};
  orders[guildId] = guild;
  const user = guild[userId] ?? {};
  guild[userId] = user;
  user[order.source] = order;
  await persist();
}

// Remove the single order for the unit at `source`, if present.
export async function removeOrder(
  guildId: string,
  userId: string,
  source: string,
): Promise<void> {
  if (orders[guildId]?.[userId]?.[source]) {
    delete orders[guildId][userId][source];
    await persist();
  }
}

// Remove every staged order for a user in a guild.
export async function clearUserOrders(
  guildId: string,
  userId: string,
): Promise<void> {
  if (orders[guildId]?.[userId]) {
    delete orders[guildId][userId];
    await persist();
  }
}
