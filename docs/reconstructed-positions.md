# Reconstructed current positions (from the Fall 2 + Winter 2 move log)

Derived by taking each unit's **last move destination** (Fall 2 orders) plus
**Winter 2 builds**. Kind guessed from province type (sea → Fleet, land → Army)
unless a build order specified A/F.

**Legend:** ✅ exact CSV match · 🟡 probable (matched by substring) ·
❓ NOT in the adjacency CSV — needs the canonical name or the map is missing it.

Fill in the **Discord ID** column (have each player run `/whoami`), fix any 🟡/❓
rows, then I'll generate `data/positions.json`.

---

## M.Cam 3.0 — Discord ID: `__________`
| current province | kind | confidence | from order |
|---|---|---|---|
| Frostheld | A | ✅ | Fossbarrow → Frostheld |
| Ghulfrost Mountain | A | 🟡 ("Ghulfrost") | Valar Bay → Ghulfrost |
| Valar | F? | ❓ (maybe "Valar's Bay", sea) | Gulf of Demacia → Valar |
| Velorus Islands | A | 🟡 ("Velorus") | Conq sea → Velorus |
| Kilgrove | A | ✅ | Kilgrove h |
| The Graygate | A | 🟡 ("Graygate") | Graygate h |

## notabeverage [IMPR] — Discord ID: `__________`
| current province | kind | confidence | from order |
|---|---|---|---|
| Nockmirch | A | ✅ | Plains of Valoran 3 → Nockmirch |
| Tokogol | A | ✅ | Ironspike Mountains → Tokogol |
| Blood Mountains | A | ✅ | Tokogol → Blood Mountains |
| Dalamor Coast | A | ✅ | Dalamor Plain → Dalamor Coast |
| Ruug | A | ✅ | Sea of Noxus 1 → Ruug |
| The Drakkengate | A | ✅ | Sea of Noxus 3 → The Drakkengate |
| Iron Pinnacle | A | ✅ | Winter build: A Iron Pinnacle |
| Immortal Bastion | A | ✅ | Winter build: A Immortal Bastion |

## Big Master Kusho — Discord ID: `__________`
| current province | kind | confidence | from order |
|---|---|---|---|
| Basilich | A | ✅ | Ionia → Basilich |
| Zhyun | A | ✅ | Vastaya → Zhyun |
| Shon Xan | ? | ❓ not in CSV | Puboe → Shon Xan |
| Vlonqu | ? | ❓ not in CSV | Dragonspine → Vlonqu |
| Ionia City | A | ✅ | Tevasa → Ionia City |
| Raikkon | F? | ❓ (maybe "Raikkon Sea", sea) | Noxus → Raikkon |
| Placidium of Navori | A | ✅ | Winter build: A |
| Temple of Pallas | F | ✅ | Winter build: F |
| Wuju | F | ✅ | Winter build: F |

## YAMASHITA [SLAY] — Discord ID: `__________`
| current province | kind | confidence | from order |
|---|---|---|---|
| Niveroya Island | F? | ❓ not in CSV | North Tracker's Sea → Niveroya Island |
| Rakelstake | A | ✅ | Stormpeaks → Rakelstake |
| East Fang | A | ✅ | Eastfang h |
| Trinity Mountains | A | ✅ | Trinity Mountains h |
| Naljaag | A? | ❓ not in CSV | Naljaag s → Ironspike Mountains (stays) |
| Ironspike Mountains | A | ✅ | Ice Spine Mountains → Ironspike Mountains |
| Quchar | A | ✅ | Winter build: Quchar (land) |
| Frostguard Citadel | A | 🟡 ("Frostguard") | Winter build: Frostguard (land) |

## YamKiu — Discord ID: `__________`
_Heavily abbreviated — most rows need confirmation._
| current province | kind | confidence | from order |
|---|---|---|---|
| Plains (which?) | A | ❓ ambiguous (7 "…Plains") | rock bay → plains |
| Aurma | F? | ❓ ("aruma" typo?) | west cent sea → aruma |
| The Great Sai (1/2/3?) | A | ❓ subregion | saj farj → great sai |
| Kalduga | A | ✅ | kald stay |
| Gate (which?) | ? | ❓ ambiguous | sai → gate |
| Sai (which?) | ? | ❓ ambiguous | south → sai |
| The City of Gardens | F | 🟡 | Winter build: boat in gardens |
| The Sun Disc | A | 🟡 | Winter build: ground in sun |
| Uzuris | F? | ❓ not in CSV | Winter build: boat in uzuris |

---

## Names used by players that are NOT in the adjacency CSV
These need either a canonical spelling or a fix to `runeterra_adjacency.csv`:
`Valar` · `Shon Xan` · `Vlonqu` · `Raikkon` (vs `Raikkon Sea`) ·
`Niveroya Island` · `Naljaag` · `Aruma` (vs `Aurma`?) · `Uzuris`/`Uzeris` ·
and YamKiu's `rock bay` / `plains` / `gate` / `sai` / `south` shorthands.
