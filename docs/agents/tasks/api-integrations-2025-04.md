# API Integration Plan — Everloop Expansion

*Task: Integrate new external APIs for game mechanics, voice/audio, and 5e SRD data.*  
*Created: 2025-04-04*

---

## What Was Built

### New Service Libraries (`lib/`)

| File | Purpose | Auth Required |
|------|---------|---------------|
| `lib/open5e.ts` | Open5E API v2 client — spells, creatures, items, weapons, armor, conditions, feats, species, backgrounds, rules, global search | No (free API) |
| `lib/dnd5e-api.ts` | D&D 5e SRD API client (dnd5eapi.co) — classes, subclasses, features, class levels, spell lists, monsters, equipment, traits, proficiencies, rules | No (free API) |
| `lib/elevenlabs.ts` | ElevenLabs SDK wrapper — TTS with voice presets, streaming, sound effects, scene ambience, NPC dialogue, story narration | Yes (ELEVENLABS_API_KEY) |
| `lib/combat-tracker.ts` | Combat engine — initiative, turn order, HP/damage/healing, conditions, concentration saves, spell slots, ammo, features, short/long rests, token locking, NPC autopopulate | N/A (pure logic) |

### New API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/open5e` | GET | Query Open5E SRD data (spells, creatures, items, etc.) |
| `/api/dnd5e` | GET | Query dnd5eapi.co for class features, leveling, spell lists |
| `/api/elevenlabs/tts` | POST | Text-to-speech with voice presets (auth required) |
| `/api/elevenlabs/sfx` | POST | Sound effects & scene ambience generation (auth required) |
| `/api/elevenlabs/voices` | GET | List available voices and Everloop presets (auth required) |
| `/api/combat` | POST | Full combat tracker with 18 actions (auth required) |

### New Env Var

```
ELEVENLABS_API_KEY  — ElevenLabs API key for TTS + SFX (add to .env.local and Vercel)
```

---

## Integration Map: What Connects Where

### Open5E → Player Deck (Character Creation)
- Auto-lookup spell data when adding spells to character sheet
- Populate weapon/armor stats from SRD data
- Background descriptions and feature grants
- Race/species trait lookups

### Open5E → AI DM / Celestial Advisor
- Real-time creature stat lookups during combat encounters
- Condition descriptions for status explanations
- Rule clarifications via global search

### dnd5eapi → Character Leveling
- Class level features (what you get at each level)
- Subclass feature progression
- Spell slot scaling per level
- Proficiency bonus calculation

### ElevenLabs → Campaign Sessions
- DM narration audio for scene descriptions
- NPC dialogue with character-specific voices
- Scene ambience (combat, exploration, tavern, etc.)
- Story narration for published canon stories

### Combat Tracker → Campaign Engine
- Initiative rolling and turn management
- HP tracking with color-coded aura system
- Concentration save automation
- Spell slot / ammo / feature use tracking
- Short rest / long rest automation
- Token locking for DM control
- NPC autopopulation from Open5E creature data

---

## Combat Tracker Actions Reference

| Action | Required Params | Description |
|--------|----------------|-------------|
| `roll-initiative` | combat_state | Roll & sort all combatants |
| `next-turn` | combat_state | Advance to next turn/round |
| `damage` | combat_state, combatant_id, amount | Apply damage (temp HP first, break concentration) |
| `heal` | combat_state, combatant_id, amount | Apply healing (cap at max HP) |
| `add-condition` | combat_state, combatant_id, condition | Add D&D condition |
| `remove-condition` | combat_state, combatant_id, condition | Remove condition |
| `use-spell-slot` | combat_state, combatant_id, level | Expend a spell slot |
| `recover-spell-slot` | combat_state, combatant_id, level | Recover spell slot(s) |
| `use-feature` | combat_state, combatant_id, feature_name | Use a class feature (Channel Divinity, etc.) |
| `use-ammo` | combat_state, combatant_id, ammo_type | Expend ammo |
| `recover-ammo` | combat_state, combatant_id, ammo_type, count | Recover ammo |
| `short-rest` | combat_state, combatant_id | Short rest recovery |
| `long-rest` | combat_state, combatant_id | Full long rest recovery |
| `concentration-save` | combatant_id, damage_taken, constitution_mod | Auto-roll concentration save |
| `add-npc` | creature_data | Create NPC token from stat block |
| `lock-token` / `unlock-token` / `toggle-lock` | combatant_id | DM token lock control |
| `status` | combat_state | Get full combat overview with aura colors |

---

## Voice Presets (ElevenLabs)

| Preset Key | Use Case | Voice Style |
|------------|----------|-------------|
| `narrator_epic` | Story narration, lore | Deep, authoritative |
| `narrator_mystical` | Ethereal descriptions | Warm, ethereal |
| `dm_voice` | DM narration | Commanding |
| `npc_gruff` | Dwarf, guard, soldier | Gruff, older |
| `npc_gentle` | Healer, sage, elf | Soft, gentle |
| `npc_sinister` | Villain, dark entity | Dark, intense |

---

## Pitfalls & Decisions

1. ElevenLabs SDK uses camelCase for request params (`durationSeconds`, `promptInfluence`), not snake_case
2. `Buffer` cannot be used directly as `Response` body in Next.js — must wrap with `new Uint8Array(buffer)`
3. Open5E uses 24h cache (`revalidate: 86400`) since SRD data is static
4. Combat tracker is stateless on server — client passes `combat_state` in each request. For persistent combat, save state to campaign JSONB field
5. Token lock state is in-memory (resets on server restart). For production, consider moving to Supabase
6. `exhaustion` is NOT in the DndCondition type union — tracked separately via `CharacterStatus.exhaustion_level`
