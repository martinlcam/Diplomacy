# Diplomacy

A Discord bot for running games of Diplomacy — order submission, adjudication, and turn management.

## Game Rules

This is a Diplomacy variant.

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
  submitted in the orders channel and resolved simultaneously.
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
