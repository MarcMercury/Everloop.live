# Task: Marek Sheet Parity + Modern D&D Character Builder Sweep

**Date:** 2026-04-25
**Scope:** `app/player-deck/**`, `components/player-deck/**`, `types/player-character.ts`, `supabase/migrations/`

## Goal

Make sure every field present in the user-supplied PDFs (`Marek_Character_Sheet (1).pdf`,
`MarekAzurePact_JavaScriptMarc (1).pdf` — Joost Wijnen / "MorePurpleMoreBetter" 5e sheet)
is also available in the Player Deck "Create / Edit Character" feature, and add any
modern fields that mainstream builders (D&D Beyond, Roll20, 5e2024, MPMB) commonly
support but Everloop currently lacks.

## Source Audit (PDFs)

Marek (Tiefling Warlock — the Celestial / Haunted One) showed these elements:

### Already covered by Everloop today

- Name, Class, Subclass, Level, XP, Background, Race, Alignment ✅
- Height, Weight, Age, Gender (no field), Hair, Eyes, Skin, Faith ✅ *(gender missing)*
- Ability scores + modifiers + saving throw proficiencies ✅
- AC (single number), Initiative bonus, Speed (walk only), HP / temp HP / current HP ✅
- Hit dice total/remaining, Death saves, Proficiency bonus ✅
- Skills + proficiency/expertise, Tool proficiencies, Languages ✅
- Armor / weapon proficiencies, Personality / Ideals / Bonds / Flaws / Backstory ✅
- Inventory items, weapons, armor, shield, currency (cp/sp/ep/gp/pp), attunement (string list) ✅
- Features & traits with usage tracking + recharge ✅
- Spellcasting (ability/DC/atk), spell slots, cantrips, spells with prepared/conc/ritual ✅
- Conditions, exhaustion level, concentration, inspiration (boolean), notes (free) ✅
- Companions, multiclass, session notes ✅

### Missing fields identified in PDFs

| Field | PDF Section | Notes |
|------|-------------|------|
| Player Name | Top of sheet | Different from DM name |
| Size | Top right | Tiny / Small / Medium / Large / Huge |
| Gender / Pronouns | Top right | |
| Multiple speeds | Combat speed line | walk / fly / swim / climb / burrow / hover |
| Encumbered / heavily encumbered speeds | Speed line | "20 ft" displayed |
| Senses (structured) | Top right | passive perception / investigation / insight, darkvision, blindsight, tremorsense, truesight |
| Damage Resistances | Defense panel ("Fire") | |
| Damage Immunities | (D&D standard) | |
| Damage Vulnerabilities | (D&D standard) | |
| Condition Immunities | (D&D standard) | |
| AC breakdown | Defense panel | armor bonus + shield + dex + magic + misc |
| Save advantages / disadvantages | Saving throw row | text notes per save |
| Reaction / bonus action used (per-round) | Actions panel | live tracker |
| Heroic Inspiration as count | (2024 PHB) | replace boolean for stackability |
| Wounds | Defense panel | "WOUNDS" boxes |
| Weapon range column | Attack table | "Melee, 20/60 ft" |
| Weapon damage type | Attack table | currently inside damage string |
| Weapon mastery (2024) | (D&D 2024) | Sap, Slow, Topple, etc. |
| Ammunition tracker | Attack table | per-type quantity |
| Spell SAVE column | Spell table | "Dex / Wis / —" |
| Spell source | Multiple spell tables | Pact / Tiefling / Tome rituals |
| Spell slot recharge type | Spell slot row | Warlock = short rest |
| Feats (separate list) | Feats column | distinct from features |
| Magic items (rich) | Possessions panel | name + description + attuned + charges |
| Lifestyle (daily price) | Equipment panel | Squalid → Aristocratic |
| Treasure / gems & valuables | Equipment panel | |
| Other Holdings | Possessions panel | property, businesses |
| Allies & Organizations | Background panel | |
| Enemies | Background panel | |
| Organization symbol url | Background panel | second portrait slot |

## Modern Builder Sweep (D&D Beyond / Roll20 / 2024 PHB)

Additional features outside Marek's sheet but standard in major builders:

- **Heroic Inspiration (numeric / stackable)** — 2024 PHB
- **Weapon Mastery property** — 2024 PHB (per weapon)
- **Bastion** — 2024 DMG (defenders, hirelings, facilities)
- **Origin Feat** — 2024 backgrounds grant a 1st-level feat
- **Sign Languages / Custom languages** — 2024 PHB
- **Multiple speed types** — D&D Beyond split layout
- **Passive Investigation / Insight** — D&D Beyond
- **Spell preparation count limit** (prepared / max prepared)
- **Pronouns** — modern character sheets

## Implementation Plan

1. Migration `20260425_001_expand_player_characters.sql`:
   - `player_name`, `size`, `gender`, `pronouns`, `allies`, `enemies`,
     `organizations`, `organization_symbol_url`, `lifestyle`, `notes` (TEXT)
   - `senses`, `speeds`, `ac_breakdown`, `damage_modifiers`,
     `saving_throw_modifiers`, `feats`, `treasure`, `wounds`, `spell_sources` (JSONB)

2. Extend `types/player-character.ts`:
   - New interfaces: `SensesData`, `SpeedsData`, `AcBreakdown`,
     `DamageModifiers`, `SavingThrowModifiers`, `FeatEntry`, `MagicItemEntry`,
     `Ammunition`, `TreasureData`, `Wound`, `SpellSource`
   - Extend `PlayerCharacter`, `Insert`, `Update`
   - Extend `SpellEntry`/`CantripEntry` with `save?`, `source?`, `components_detail?`
   - Extend `WeaponEntry` with `range?`, `damage_type?`, `weapon_mastery?`
   - Extend `InventoryData` with `magic_items?`, `ammunition?`
   - Extend `CharacterStatus` with `inspiration_count?`, `reaction_used?`,
     `bonus_action_used?`
   - Extend `SpellSlot` with `recharge?: 'short_rest' | 'long_rest'`
   - Add `SIZES`, `LIFESTYLES`, default constructors

3. Update `components/player-deck/character-form.tsx`:
   - Identity tab: add Player Name / Size / Gender / Pronouns; new
     "Allies, Enemies & Organizations" card; lifestyle dropdown; notes textarea
   - Combat tab: add Senses card (passive perception/inv/insight + darkvision/blindsight/tremorsense/truesight),
     Speeds card (walk/fly/swim/climb/burrow), AC breakdown card,
     Damage modifiers card (resistances/immunities/vulnerabilities/condition immunities),
     Save modifier notes
   - Features tab: new "Feats" sub-section
   - Spells tab: spell save column on entries, spell source on entries,
     per-slot recharge selector
   - Gear tab: structured magic items, ammunition tracker, treasure card

4. Run `npm run lint` to verify no regressions.

## Pitfalls

- `inspiration` boolean already present in `status` JSON — keep for back-compat,
  add `inspiration_count` alongside.
- `attunement: string[]` already present in `inventory` JSON — keep, add
  richer `magic_items` array.
- `spellcasting` schema already in use — extend optionally; new
  multi-source data goes in new top-level `spell_sources` column.
- Migration must use `ADD COLUMN IF NOT EXISTS` (idempotent).
- Server actions in `lib/actions/player-characters.ts` already pass JSONB
  through generically; no changes required there.

## Decisions

- Render new fields in *existing tabs* rather than adding more top-level
  tabs to keep mobile nav usable. Identity / Combat / Spells / Features / Gear
  remain the five tabs.
- Use TEXT (not arrays) for Allies / Enemies / Organizations to match
  the free-form nature of the PDF panels and the existing personality fields.
- AC breakdown is computed for *display*; the canonical value remains the
  `armor_class` integer (so live combat math keeps working).
