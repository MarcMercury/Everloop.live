-- =====================================================
-- PLAYER DECK: D&D Live-Play Character Management
-- User-specific character roster for live D&D sessions
-- =====================================================

CREATE TABLE IF NOT EXISTS public.player_characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Core Identity
    name TEXT NOT NULL,
    race TEXT NOT NULL DEFAULT 'Human',
    subrace TEXT,
    class TEXT NOT NULL DEFAULT 'Fighter',
    subclass TEXT,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 20),
    experience_points INTEGER DEFAULT 0,
    background TEXT,
    alignment TEXT DEFAULT 'True Neutral',
    
    -- Appearance & Flavor
    portrait_url TEXT,
    token_url TEXT,  -- Round token image for battle maps
    appearance TEXT,
    personality_traits TEXT,
    ideals TEXT,
    bonds TEXT,
    flaws TEXT,
    backstory TEXT,
    
    -- Ability Scores (stored individually for quick access)
    strength INTEGER NOT NULL DEFAULT 10 CHECK (strength >= 1 AND strength <= 30),
    dexterity INTEGER NOT NULL DEFAULT 10 CHECK (dexterity >= 1 AND dexterity <= 30),
    constitution INTEGER NOT NULL DEFAULT 10 CHECK (constitution >= 1 AND constitution <= 30),
    intelligence INTEGER NOT NULL DEFAULT 10 CHECK (intelligence >= 1 AND intelligence <= 30),
    wisdom INTEGER NOT NULL DEFAULT 10 CHECK (wisdom >= 1 AND wisdom <= 30),
    charisma INTEGER NOT NULL DEFAULT 10 CHECK (charisma >= 1 AND charisma <= 30),
    
    -- Combat Stats
    max_hp INTEGER NOT NULL DEFAULT 10,
    current_hp INTEGER NOT NULL DEFAULT 10,
    temp_hp INTEGER DEFAULT 0,
    armor_class INTEGER NOT NULL DEFAULT 10,
    initiative_bonus INTEGER DEFAULT 0,
    speed INTEGER DEFAULT 30,
    hit_dice_total TEXT DEFAULT '1d10',    -- e.g. '5d10' or '3d8+2d6' for multiclass
    hit_dice_remaining TEXT DEFAULT '1d10',
    death_save_successes INTEGER DEFAULT 0 CHECK (death_save_successes >= 0 AND death_save_successes <= 3),
    death_save_failures INTEGER DEFAULT 0 CHECK (death_save_failures >= 0 AND death_save_failures <= 3),
    proficiency_bonus INTEGER DEFAULT 2,
    
    -- Spellcasting (JSONB for flexibility)
    -- { spellcasting_ability: "WIS", spell_save_dc: 15, spell_attack_bonus: 7,
    --   spell_slots: { "1": { max: 4, used: 1 }, "2": { max: 3, used: 0 }, ... },
    --   spells_known: [ { name: "Fireball", level: 3, school: "Evocation", prepared: true, concentration: false, description: "...", damage: "8d6 fire" }, ... ],
    --   cantrips: [ { name: "Fire Bolt", school: "Evocation", description: "...", damage: "2d10 fire" } ] }
    spellcasting JSONB DEFAULT '{}',
    
    -- Skills & Proficiencies (JSONB)
    -- { skills: { "athletics": "proficient", "stealth": "expertise", "arcana": null, ... },
    --   saving_throws: ["STR", "CON"],
    --   armor_proficiencies: ["light", "medium", "heavy", "shields"],
    --   weapon_proficiencies: ["simple", "martial"],
    --   tool_proficiencies: ["Thieves' tools", "Herbalism kit"],
    --   languages: ["Common", "Elvish", "Dwarvish"] }
    proficiencies JSONB DEFAULT '{}',
    
    -- Features & Traits (JSONB array)
    -- [ { name: "Second Wind", source: "Fighter", description: "...", uses_max: 1, uses_remaining: 1, recharge: "short_rest" },
    --   { name: "Darkvision", source: "Elf", description: "60 ft darkvision" } ]
    features JSONB DEFAULT '[]',
    
    -- Inventory & Equipment (JSONB)
    -- { weapons: [ { name: "Longsword", attack_bonus: 7, damage: "1d8+4 slashing", properties: ["versatile"], equipped: true } ],
    --   armor: { name: "Chain Mail", ac: 16, type: "heavy", equipped: true },
    --   shield: { name: "Shield", ac_bonus: 2, equipped: true },
    --   items: [ { name: "Rope, hempen", quantity: 1, weight: 10 }, ... ],
    --   currency: { cp: 0, sp: 15, ep: 0, gp: 150, pp: 2 },
    --   attunement: [ "Cloak of Protection", "Ring of Spell Storing" ] }
    inventory JSONB DEFAULT '{}',
    
    -- Conditions & Status (JSONB) - for live tracking
    -- { conditions: ["poisoned", "prone"], 
    --   concentration_spell: "Bless",
    --   inspiration: true,
    --   exhaustion_level: 0,
    --   notes: "Currently disguised as a merchant" }
    status JSONB DEFAULT '{}',
    
    -- Multiclass support (JSONB)
    -- [ { class: "Fighter", subclass: "Battle Master", level: 5 }, { class: "Rogue", subclass: "Assassin", level: 3 } ]
    multiclass JSONB DEFAULT '[]',
    
    -- Session notes (JSONB array of dated entries)
    -- [ { date: "2026-03-29", session: 15, notes: "Found the Amulet of Proof against Detection" } ]
    session_notes JSONB DEFAULT '[]',
    
    -- Companions / Familiars / Pets (JSONB)
    -- [ { name: "Shadow", type: "Wolf", hp: 11, max_hp: 11, ac: 13, notes: "Animal Companion" } ]
    companions JSONB DEFAULT '[]',
    
    -- Display preferences
    theme_color TEXT DEFAULT '#d4a84b',  -- Character accent color for the tile
    is_active BOOLEAN DEFAULT true,       -- Whether this character is in active play
    campaign_name TEXT,                   -- Which campaign this character is in
    dm_name TEXT,                         -- Who the DM is
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.player_characters ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own characters
CREATE POLICY "Users can view own characters"
    ON public.player_characters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own characters"
    ON public.player_characters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
    ON public.player_characters FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters"
    ON public.player_characters FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_player_characters_user ON public.player_characters(user_id);
CREATE INDEX IF NOT EXISTS idx_player_characters_active ON public.player_characters(user_id, is_active);

-- Auto-update trigger
CREATE TRIGGER update_player_characters_updated_at
    BEFORE UPDATE ON public.player_characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
