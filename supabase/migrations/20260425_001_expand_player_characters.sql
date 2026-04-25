-- =====================================================
-- Player Characters: Marek-sheet parity expansion (2026-04-25)
-- Adds fields present in the standard MPMB 5e character sheet
-- and modern builders (D&D Beyond / Roll20 / 2024 PHB) that
-- Everloop did not yet expose.
-- =====================================================

ALTER TABLE public.player_characters
  -- Identity / bio additions
  ADD COLUMN IF NOT EXISTS player_name TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS pronouns TEXT,
  ADD COLUMN IF NOT EXISTS lifestyle TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  -- Background panel (PDF)
  ADD COLUMN IF NOT EXISTS allies TEXT,
  ADD COLUMN IF NOT EXISTS enemies TEXT,
  ADD COLUMN IF NOT EXISTS organizations TEXT,
  ADD COLUMN IF NOT EXISTS organization_symbol_url TEXT,
  -- Combat / defense JSONB
  --   senses            : { passive_perception, passive_investigation, passive_insight,
  --                         darkvision, blindsight, tremorsense, truesight }
  --   speeds            : { walk, fly, swim, climb, burrow, hover, encumbered, heavily_encumbered }
  --   ac_breakdown      : { base, armor_bonus, shield_bonus, dex_mod, magic_bonus, misc_bonus, notes }
  --   damage_modifiers  : { resistances:[], immunities:[], vulnerabilities:[], condition_immunities:[] }
  --   saving_throw_modifiers : { advantages:[], disadvantages:[], notes }
  ADD COLUMN IF NOT EXISTS senses JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS speeds JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ac_breakdown JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS damage_modifiers JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS saving_throw_modifiers JSONB DEFAULT '{}'::jsonb,
  -- Feats: distinct from `features` (which mixes class/race/background traits).
  --   feats : [ { name, source, level_acquired, description } ]
  ADD COLUMN IF NOT EXISTS feats JSONB DEFAULT '[]'::jsonb,
  -- Treasure: gems / art / other holdings (Possessions + Other Holdings panels)
  --   treasure : { gems:[{name,value,quantity}], art:[{name,value,description}],
  --                other_holdings:string, total_value_gp:number }
  ADD COLUMN IF NOT EXISTS treasure JSONB DEFAULT '{}'::jsonb,
  -- Wounds / long-term injuries (Defense panel)
  --   wounds : [ { description, severity, healing_required, date }]
  ADD COLUMN IF NOT EXISTS wounds JSONB DEFAULT '[]'::jsonb,
  -- Multiple spell sources (Pact Magic vs Innate vs Tome rituals)
  --   spell_sources : [ { name, ability, save_dc, attack_bonus, recharge:'short_rest'|'long_rest'|'long_rest_or_short',
  --                       slots: { "1": { max, used }, ... }, spells: [...], cantrips: [...] } ]
  ADD COLUMN IF NOT EXISTS spell_sources JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.player_characters.size IS 'Creature size: Tiny / Small / Medium / Large / Huge / Gargantuan';
COMMENT ON COLUMN public.player_characters.lifestyle IS 'Wretched / Squalid / Poor / Modest / Comfortable / Wealthy / Aristocratic';
COMMENT ON COLUMN public.player_characters.senses IS 'Structured senses: passive scores + special vision ranges';
COMMENT ON COLUMN public.player_characters.speeds IS 'Multi-mode speed map (walk/fly/swim/climb/burrow/hover) + encumbrance';
COMMENT ON COLUMN public.player_characters.ac_breakdown IS 'Display-only breakdown of AC components; armor_class column remains canonical';
COMMENT ON COLUMN public.player_characters.damage_modifiers IS 'Damage resistances / immunities / vulnerabilities + condition immunities';
COMMENT ON COLUMN public.player_characters.feats IS 'Feats list (separate from racial/class features)';
COMMENT ON COLUMN public.player_characters.spell_sources IS 'Per-source spellcasting (Warlock pact, racial innate, ritual book) with own slots/recharge';
