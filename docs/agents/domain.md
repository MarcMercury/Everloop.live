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

- **The Fray**: A temporal anomaly that resets time in unstable zones
- **Shard**: Mystical artifacts that influence narrative outcomes
- **Anchor**: A person or place that stabilizes the Fray
- **Canon**: Officially approved lore that becomes immutable history
