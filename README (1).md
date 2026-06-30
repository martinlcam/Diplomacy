# Runeterra Diplomacy — Province Adjacency

`runeterra_adjacency.csv` — the adjacency graph for your Runeterra Diplomacy variant,
derived directly from the borders drawn in `Runeterra_Diplomacy.svg`.

## Columns

| column | meaning |
|---|---|
| `province` | province name (one per province; see special provinces below) |
| `type` | `land` or `sea` |
| `is_canal` | `yes` if the province is circled by a canal ellipse, else `no` |
| `adjacent` | all bordering provinces (army-movement graph), `; `-separated |
| `coastal_adjacent` | provinces reachable by a fleet (fleet-movement graph), `; `-separated |

208 rows total: 186 normal provinces + 22 numbered sub-spaces from the 6 special
provinces. 142 land / 66 sea. 12 canals. Average degree 7.7.

## Adjacency vs. coastal adjacency

- **adjacent** is the full neighbour list — anything an army could step into.
- **coastal_adjacent** is the fleet graph:
  - sea↔sea and sea↔land neighbours are always coastal;
  - land↔land neighbours are coastal **only where they share a coastline**
    (detected by a land–land border that actually meets the water), so two inland
    provinces that merely touch are *not* listed as coastal.
- `coastal_adjacent` is always a subset of `adjacent`. Land-locked provinces have an
  empty coastal list.

## Special (multi-space) provinces

The six specials are expanded into their numbered sub-spaces, named
`<Name> <n>` (e.g. `Sea of Noxus 1` … `Sea of Noxus 5`):

| special | type | sub-spaces |
|---|---|---|
| Sea of Noxus | sea | 5 |
| Conqueror's Sea | sea | 5 |
| Strait of Ionia | sea | 3 |
| Amarantine Sea | sea | 3 |
| Plains of Valoran | land | 3 |
| The Great Sai | land | 3 |

Per your rules, every sub-space is adjacent to **all** other sub-spaces of the same
special **and** to **all** external neighbours of the parent region; each external
neighbour, in turn, lists every sub-space. For the sea specials the sub-spaces are
mutually coastal; the two land specials (Valoran, Great Sai) are land-locked, so their
sub-spaces carry no coastal links.

## Canals

A canal is a land province circled by an ellipse/circle in the Borders layer. The 12:
Bilgewater Bay, Calais, Dawnhold, Fae'lor, Fallgren, Piltover, Shadow Isles, Tereshni,
The Serpentine Delta, Ursine Lands, Velorus Islands, Zuretta Archipelago.
(The small circles drawn around the special sub-space numbers were excluded.)

## How it was built

1. Every barrier line in the **Borders** and **Trace Layer** layers was rasterised at
   4096², plus a canvas-edge wall; the 36 striped (pattern-filled) Trace shapes were
   seeded as impassable so they don't bridge real provinces.
2. Each province label was used as a watershed seed; basins were grown by watershed on
   the negative distance transform of the open area. This follows your drawn borders
   exactly where they exist and **auto-closes the incomplete open-ocean boundaries at
   their narrowest necks** — the lines you drew as short radiating strokes.
3. Land/sea was set from the base map colour, overridden by clear name semantics
   (islands/archipelagos = land; sea/ocean/gulf/strait/bay/… = sea) and by the canal
   rule (a circled province is land).
4. Adjacency was read off shared basin borders; a few tiny island/port basins were
   completed by a short-range proximity pass.

`classification_map.png` is a colour-coded check: tan = land, blue = sea,
purple = special seas, olive = special lands, orange = canals, grey = impassable.

## Caveats worth a look

- **Split coasts.** Your WC/EC/NC/SC coast markers were left out (you asked for one name
  per province), so coastal adjacency is given at the province level. A handful of
  provinces drawn with separate coasts may need per-coast splitting before fleets behave
  correctly — the coast markers tell you which ones.
- **Open-ocean boundaries** between sea provinces were completed automatically where you
  left gaps; in a few wide-open stretches the exact dividing line is the algorithm's best
  guess at the midline rather than a line you drew.
- **The Serpentine Delta** is the one genuinely ambiguous marker: its text label sits in
  open water, so it's treated as the circled delta-island canal (land) adjacent to
  Bilgewater Pass, Harelport Bay, Amarantine Sea and The Jaws. Double-check it matches
  your intent.
