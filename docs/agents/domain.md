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
- **Shard**: Broken remnants of the Anchors — each still hums with the intent that once held the world together
- **Anchor**: Great pillars of intent driven into the Pattern by the First Architects to hold it firm
- **The Fold**: The intermediary plane of thought, design, and intent — the mind of creation
- **The Drift**: The primordial sea of chaos from which the First Architects drew substance
- **Canon**: Officially approved lore that becomes immutable history

Note: "Weaving" is an action (the First Architects *wove* the Pattern), not a standalone concept. The Pattern is the central artifact of creation.
