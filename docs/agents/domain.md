# Domain Knowledge

*Stable facts about the Everloop universe and platform rules.*

---

## Canon Status Flow

Stories progress through these states:

```
                       ┌──────────────────────┐
                       ▼                      │
draft → submitted → under_review ──┬─→ canonical (published)
                                   ├─→ revision_requested ─┘
                                   └─→ rejected
```

- **draft**: Author is still editing
- **submitted**: Ready for review
- **under_review**: Being reviewed by AI + admin
- **revision_requested**: Lorekeeper asked for changes; the author can edit and
  resubmit (which moves it back to `submitted`)
- **rejected**: Did not pass canon review
- **canonical**: Published. Visible in the public Library.
- **approved** *(legacy)*: An older intermediate state. `approveStory()` no
  longer writes this value — admin approval transitions directly to
  `canonical` and sets `is_published = true`. The enum value is kept so any
  pre-existing rows continue to work, but no code path produces it.

---

## Public Visibility Rules

| Content Type      | Visible to Public? | Criteria                                                 |
|-------------------|--------------------|----------------------------------------------------------|
| Stories           | Yes                | `canon_status = 'canonical'` AND `is_published = true`   |
| Canon Entities    | Yes                | `status = 'canonical'`                                   |
| User Profiles     | Yes                | Always (public author pages)                             |
| Drafts            | No                 | Only visible to author                                   |
| Submitted/Review  | No                 | Only visible to author + admins                          |
| Revisions Requested | No               | Only visible to author + admins                          |

---

## Entity Types

The `canon_entities` table supports these types:

- `character` - Named individuals in the lore
- `location` - Places in the Everloop universe
- `artifact` - Magical or significant objects
- `event` - Historical occurrences
- `faction` - Groups, organizations, orders
- `concept` - Abstract ideas, magic systems
- `creature` - Non-human beings

---

## User Roles

| Role | Permissions |
|------|-------------|
| `writer` | Create stories, view own drafts |
| `curator` | All writer perms + moderate content |
| `lorekeeper` | All curator perms + edit canon entities |
| `admin` | Full access including admin dashboard |

---

## Glossary

- **The Pattern**: The vast lattice of luminous threads binding time, space, and thought into continuity — woven by the First Architects. It is the fabric of reality itself. Where it thins, Hollows spread.
- **The Fray**: The unraveling edge of reality where the Pattern frays and loops collapse — time stutters, memory bleeds, and the world forgets itself
- **Shard**: Broken remnants of the Anchors — each still hums with the intent that once held the world together. Each region contains an unknown number of Shards, and they naturally pull toward one another
- **Anchor**: Great pillars of intent driven into the Pattern by the First Architects to hold it firm
- **The Fold**: The intermediary plane of thought, design, and intent — the mind of creation
- **The Drift**: The primordial sea of chaos from which the First Architects drew substance
- **The Convergence**: The unspoken gravity at the center of all things — every quest, story, and journey in the Everloop inevitably bends toward the Shards. No one knows what happens when all Shards of a region are united, or what it would mean if every Shard across every region were brought together. Something world-altering. Something final
- **Canon**: Officially approved lore that becomes immutable history

Note: "Weaving" is an action (the First Architects *wove* the Pattern), not a standalone concept. The Pattern is the central artifact of creation.

---

## The Shard Doctrine (Narrative Design Principle)

The Shards are the gravitational center of the entire Everloop narrative. This is a design principle, not a rule writers must explicitly follow:

- **Every region** contains an unknown number of Shards scattered, hidden, guarded, or forgotten. There could be thousands across the world
- **Shards pull toward one another** — they want to be reunited. This creates natural narrative momentum
- **Shards behave like gravity, not objectives** — they are rare, increasingly encountered, misunderstood by most, valued differently by different factions, and quietly pulling toward each other over time. People are not "collecting shards" — they are dealing with the consequences of them
- **All stories, quests, and campaigns** should ultimately connect to the Shards — whether directly (finding, revealing, moving, using, or misunderstanding them) or indirectly (obstacles that delay discovery, characters whose arcs intersect with Shard-touched regions, factions that seek or fear them)
- **No one knows the endgame** — what happens when all Shards of a region converge is unknown. What happens when ALL Shards across ALL regions are united is the great unanswered question of the Everloop
- **This should be felt, not stated** — the pull toward the Shards should be atmospheric, not didactic. Characters may not even know why they're drawn somewhere. Writers should let the gravity show through consequences, not exposition
- **Every contribution matters** — writing a story, creating a character, building a creature, running a campaign — each is a thread that either advances or complicates the Convergence. This is why the platform exists: a collective narrative that is going somewhere, even if no one knows where

### Shard Narrative Patterns

Every quest or campaign ultimately resolves toward one of these outcomes:

- **A Shard is found** — uncovered in ruins, revealed in a creature's hoard, unearthed from a collapsed Hollow
- **A Shard is revealed** — hidden in plain sight, mistaken for a relic, recognized by a Vaultkeeper
- **A Shard is moved** — taken, stolen, traded, buried deeper, carried unknowingly
- **A Shard is misunderstood** — wielded as a weapon by someone who doesn't know what they hold, worshipped as a god
- **A Shard is used** (correctly or incorrectly) — stabilizing a region, tearing open a Fray zone, healing or destroying

Even indirect quests should point toward a Shard:

- "Find the scholar" → scholar knows a Shard's location
- "Track the creature" → creature is drawn to a Shard, or warped by one
- "Secure the city" → city's stability is tied to a Shard buried beneath it
- "Retrieve the relic" → the relic *is* a Shard, or was forged around one

### Core Writing Prompt (Use in All Creation Flows)

Every quest or campaign should implicitly answer:

- Where is the Shard?
- Who knows about it?
- Who is trying to control it?
- What changes because of it?

---

## Monsters and the Fray (Narrative Design Principle)

Monsters are not random creatures. They are consequences of instability — leaks from the Drift that entered the Everloop through the Fray after the First Architects' work was broken by the Rogue Architects.

**Clean Canon Definition:** Monsters are uncontrolled manifestations of the Drift entering the Everloop through the Fray, forming unstable and unnatural beings not bound by the Pattern or the First Map.

### What Monsters Are

- Monsters did **NOT always exist** — the Everloop originally had no monsters. The world functioned under the Pattern + First Map, which kept reality structured and stable
- Monsters only began appearing **after the Fray** — the breaking of the world by the Rogue Architects
- They are **not native** to the Everloop
- They are fragments of the Drift entering uncontrolled — forms not bound by the Pattern or First Map
- They are broken combinations of matter, memory, and intent — chaotic manifestations that passed through the cracks in reality

### The Fray Mechanism

The Fray is a break that cuts from the Everloop → through the Pattern → through the Fold → all the way back to the Drift. This is critical because:

- The world is no longer sealed
- The original structure (Pattern + First Map) is bypassed
- The Drift can now press directly into the Everloop unfiltered

### The Two-Way Pressure

- The Drift is **pulling the world inward** — toward dissolution
- At the same time, things from the Drift are **pushing outward** into the Everloop through the cracks
- Monsters are the result of that two-way pressure — the collision between a world trying to hold itself together and chaos trying to fill the gaps

### What Makes Monsters Monstrous

Because they lack:

- Consistent structure
- Stable identity
- Logical biology
- Predictable behavior

They are:

- Incomplete
- Overlapping
- Unstable
- Sometimes partially recognizable, sometimes not at all

They are essentially raw existence forcing itself into form without rules.

### How Monsters Form

Where the Fray is strongest, the boundary between the Everloop and the Drift breaks deeper. The Drift presses through. Something forms without rules — creatures that don't follow logic, bodies that don't hold consistent shape, behaviors that don't align with survival or instinct.

### Monster Origin Types (Guide for Creation, Not In-World Labels)

1. **Pure Drift Intrusions** — completely alien, no recognizable biology, exist in unstable states
2. **Corrupted Reality** — animals, people, or objects warped by Drift exposure. Part Everloop, part Drift. Often tied to Shards or Fray zones
3. **Echo Constructs** — formed from memory or repetition, repeat actions or behaviors, not fully alive, not fully gone

### What Makes Monsters Different

Unlike Dreamers or Vaultkeepers (who interact with and understand the Pattern), Monsters:

- Don't understand the Pattern
- Don't interact with it intentionally
- Are **unfiltered existence** — raw Drift given form by accident

### Monster Rule for Writers and Designers

If there is a Monster, there is a reason reality broke there. That reason connects to either a Shard or the Fray.

Monsters are not random enemies. They are signals that:

- The Fray is active
- Reality is broken here
- Something deeper (often a Shard) is involved

Every monster should answer:

- What broke here?
- What leaked through?
- What is it drawn to?

### How Monsters Connect to Shards

- Monsters may be **drawn to Shards** — sensing the Pattern's remnants, orbiting them like moths
- A Shard may **suppress** or **amplify** Monsters depending on its state
- An NPC villain may **wield a Shard unknowingly**, its power manifesting as monstrous influence
- A region with many Monsters likely has **active Fray zones** — and where there is Fray, there are often Shards

---

## Campaign Arc Design Principle

Every campaign should naturally follow this arc:

**Start**: A local problem, a contained issue, something "off" — a disturbance, a disappearance, a wrong that feels bigger than it should

**Middle**: Discovery of instability — introduction of a monster or distortion, clues toward something deeper, encounters with factions who know more than they say

**End**: Encounter with a Shard — a decision about it (take, move, use, protect, destroy, leave). The consequence of that decision (stability or further distortion) carries forward into the world

### The Quiet Truth

The world is reorganizing itself around the Shards. People think they are chasing them. They aren't. They are being pulled into alignment with them. And the Monsters? They are what happens when that process fails.

### One-Line Philosophy

*"Every story in the Everloop begins somewhere else… but it never ends there."*

---

## Shard Build Spec (4-Layer System)

Every shard MUST be built using these 4 layers:

### Layer 1: STATE (What form is it in?)

| State | Meaning |
|-------|---------|
| Raw | Unstable, exposed |
| Embedded | Fused into object/environment |
| Bound | Attached to a person |
| Buried | Hidden/inactive |
| Fractured | Multiple pieces |

### Layer 2: LOCATION (Where is it?)

**8 Regions** (11 shards each = 88 total):
- Virelay Coast (Trade / Civilization / Instability)
- Deyune Steps (Mountains / Stone / Permanence)
- Varnhalt Frontier (Ruins / Expansion / Conflict)
- Virelay Deep Forests (Growth / Mutation / Nature)
- Polar / Tundra Region
- Ocean / Deep Water
- Fray Zones (Active Collapse Regions)
- Unknown / Deep Regions

### Layer 3: EXPRESSION (What is it doing?)

Categories: Stability, Time, Memory, Reality Distortion, Life/Biological, Energy/Power, Emotional/Psychological, Perception, Environment, Shard Behavior. Pick 1-2 per shard.

### Layer 4: SITUATION (Why is this a story?)

Categories: Control/Ownership, Ignorance, Protection, Environment Challenge, Instability/Urgency, Moral Conflict, Chain Dependency, NPC-Centered, Hidden/Discovery, Conflict/War, Fray-Linked, Movement/Convergence. Pick 1-2 per shard.

### Core Design Rules

1. Shards are NOT artifacts or magic items — they are pieces of stabilized existence
2. Shards attempt to stabilize reality, but imperfectly — fixing one thing destabilizes another
3. Shards behave like gravity — they pull toward each other (slow, indirect, influenced by environment)
4. Every story leads to a Shard (directly or indirectly)
5. Shards take form based on what they bind to (Structure → object, Mind → possession, Chaos → monster interaction, Isolation → raw shard)
6. Nothing is a clean solution — using a shard fixes one thing and destabilizes another
7. The end state is unknown — all shards will eventually converge; no one knows what happens when they do

### Monster Integration Rule

If a monster exists near a shard, you MUST define:
- What broke here
- How the Fray connects
- Why the shard is involved

### Quest Design Rule

Every quest must result in one of:
- Discovery of a shard
- Movement toward a shard
- Change in shard state
- Conflict over a shard
