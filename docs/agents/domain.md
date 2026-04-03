# Domain Knowledge

*Stable facts about the Everloop universe and platform rules.*

---

## Canon Status Flow

Stories progress through these states:

```
draft → submitted → under_review → approved/rejected → canonical
```

- **draft**: Author is still editing
- **submitted**: Ready for review
- **under_review**: Being reviewed by AI + admin
- **approved**: Accepted into canon, awaiting final publish
- **rejected**: Did not pass canon review
- **canonical**: Published and part of the official lore

---

## Public Visibility Rules

| Content Type | Visible to Public? | Criteria |
|--------------|-------------------|----------|
| Stories | Yes | `canon_status IN ('canon', 'canonical')` AND `is_published = true` |
| Canon Entities | Yes | `status = 'canonical'` |
| User Profiles | Yes | Always (public author pages) |
| Drafts | No | Only visible to author |
| Submitted Stories | No | Only visible to author + admins |

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

- **Every region** contains an unknown number of Shards scattered, hidden, guarded, or forgotten
- **Shards pull toward one another** — they want to be reunited. This creates natural narrative momentum
- **All stories, quests, and campaigns** should ultimately connect to the Shards — whether directly (finding, stealing, guarding them) or indirectly (obstacles that delay discovery, characters whose arcs intersect with Shard-touched regions, factions that seek or fear them)
- **No one knows the endgame** — what happens when all Shards of a region converge is unknown. What happens when ALL Shards across ALL regions are united is the great unanswered question of the Everloop
- **This should be felt, not stated** — the pull toward the Shards should be atmospheric, not didactic. Characters may not even know why they're drawn somewhere. Writers should let the gravity show through consequences, not exposition
- **Every contribution matters** — writing a story, creating a character, building a creature, running a campaign — each is a thread that either advances or complicates the Convergence. This is why the platform exists: a collective narrative that is going somewhere, even if no one knows where
