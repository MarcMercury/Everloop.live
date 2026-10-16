'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, User, BookOpen, Scroll, Wand2, Ruler } from 'lucide-react'
import { DND_ALIGNMENTS, DND_BACKGROUNDS } from '@/types/player-character'
import {
  getBackground,
} from '@/lib/data'
import { PortraitGenerator } from '../portrait-generator'
import { InfoButton } from '../forge-info'
import { InfoSection, InfoBullets } from '../info-popover'

export function StepDescription({
  name, setName, race, charClass, subclass,
  background, setBackground, alignment, setAlignment,
  portraitUrl, setPortraitUrl,
  personality, setPersonality, ideals, setIdeals, bonds, setBonds, flaws, setFlaws,
  backstory, setBackstory, appearance, setAppearance,
  height, setHeight, weight, setWeight, age, setAge,
  eyes, setEyes, hair, setHair, skin, setSkin, faith, setFaith,
  campaignName, setCampaignName, dmName, setDmName,
}: {
  name: string; setName: (v: string) => void
  race: string; charClass: string; subclass: string
  background: string; setBackground: (v: string) => void
  alignment: string; setAlignment: (v: string) => void
  portraitUrl: string; setPortraitUrl: (v: string) => void
  personality: string; setPersonality: (v: string) => void
  ideals: string; setIdeals: (v: string) => void
  bonds: string; setBonds: (v: string) => void
  flaws: string; setFlaws: (v: string) => void
  backstory: string; setBackstory: (v: string) => void
  appearance: string; setAppearance: (v: string) => void
  height: string; setHeight: (v: string) => void
  weight: string; setWeight: (v: string) => void
  age: string; setAge: (v: string) => void
  eyes: string; setEyes: (v: string) => void
  hair: string; setHair: (v: string) => void
  skin: string; setSkin: (v: string) => void
  faith: string; setFaith: (v: string) => void
  campaignName: string; setCampaignName: (v: string) => void
  dmName: string; setDmName: (v: string) => void
}) {
  const [aiLoading, setAiLoading] = useState<'backstory' | 'personality' | 'all' | null>(null)

  async function generateWithAI(field: 'backstory' | 'personality' | 'all') {
    setAiLoading(field)
    try {
      const res = await fetch('/api/player-deck/backstory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          race, charClass, subclass, background, alignment, name,
          personality, ideals, bonds, flaws, appearance, field,
        }),
      })
      if (!res.ok) throw new Error('Failed')

      const reader = res.body?.getReader()
      if (!reader) return

      let fullText = ''
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2))
              fullText += text
            } catch { /* skip */ }
          }
        }
      }

      if (field === 'backstory') {
        setBackstory(fullText.trim())
      } else if (field === 'personality') {
        parsePersonalityFields(fullText)
      } else {
        parsePersonalityFields(fullText)
        const backstoryMatch = fullText.match(/BACKSTORY:\s*([\s\S]*?)$/i)
        if (backstoryMatch) setBackstory(backstoryMatch[1].trim())
      }
    } catch (err) {
      console.error('AI generation error:', err)
    } finally {
      setAiLoading(null)
    }
  }

  function parsePersonalityFields(text: string) {
    const pMatch = text.match(/PERSONALITY:\s*([\s\S]+?)(?=\n[A-Z]|\s*$)/i)
    const iMatch = text.match(/IDEALS:\s*([\s\S]+?)(?=\n[A-Z]|\s*$)/i)
    const bMatch = text.match(/BONDS:\s*([\s\S]+?)(?=\n[A-Z]|\s*$)/i)
    const fMatch = text.match(/FLAWS:\s*([\s\S]+?)(?=\n[A-Z]|\s*$)/i)
    if (pMatch) setPersonality(pMatch[1].trim())
    if (iMatch) setIdeals(iMatch[1].trim())
    if (bMatch) setBonds(bMatch[1].trim())
    if (fMatch) setFlaws(fMatch[1].trim())
  }

  return (
    <div className="space-y-6">
      {/* AI Generate Bar */}
      <Card className="p-4 bg-purple-500/10 border-purple-500/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-purple-300">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-serif">AI Character Writer</span>
            <span className="text-xs text-parchment-muted hidden sm:inline">— from your race/class/background</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateWithAI('personality')}
              disabled={!!aiLoading}
              className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1"
            >
              {aiLoading === 'personality' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Personality
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateWithAI('backstory')}
              disabled={!!aiLoading}
              className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1"
            >
              {aiLoading === 'backstory' ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3" />}
              Backstory
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateWithAI('all')}
              disabled={!!aiLoading}
              className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1"
            >
              {aiLoading === 'all' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              Generate All
            </Button>
          </div>
        </div>
      </Card>

      {/* Identity */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <User className="w-4 h-4" /> Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="text-parchment text-sm">Character Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What shall this hero be called?"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment text-lg font-serif"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Background</Label>
            <select
              value={background}
              onChange={e => setBackground(e.target.value)}
              className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
            >
              <option value="">Select background...</option>
              {DND_BACKGROUNDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {background && (() => {
              const bg = getBackground(background)
              return bg ? (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {bg.skillProfs.map(s => (
                    <Badge key={s} variant="outline" className="border-emerald-500/20 text-emerald-400 text-[10px]">{s}</Badge>
                  ))}
                  {bg.toolProfs.map(t => (
                    <Badge key={t} variant="outline" className="border-blue-500/20 text-blue-300 text-[10px]">{t}</Badge>
                  ))}
                  <Badge variant="outline" className="border-gold-500/20 text-gold-500 text-[10px]">{bg.feature}</Badge>
                  <InfoButton
                    title={background}
                    subtitle="Background"
                    accent="#d4a84b"
                    className="text-parchment-muted/50 hover:text-gold-500 p-0.5 rounded touch-target"
                  >
                    <div className="space-y-3">
                      <InfoSection label={`Feature: ${bg.feature}`}>
                        <p className="text-parchment/90">{bg.featureDesc}</p>
                      </InfoSection>
                      <InfoSection label="Skill Proficiencies">
                        <p className="text-parchment/90">{bg.skillProfs.join(', ')}</p>
                      </InfoSection>
                      {bg.toolProfs.length > 0 && (
                        <InfoSection label="Tool Proficiencies">
                          <p className="text-parchment/90">{bg.toolProfs.join(', ')}</p>
                        </InfoSection>
                      )}
                      {bg.languages > 0 && (
                        <InfoSection label="Languages">
                          <p className="text-parchment/90">{bg.languages} of your choice</p>
                        </InfoSection>
                      )}
                      <InfoSection label="Starting Equipment">
                        <InfoBullets items={bg.equipment} />
                      </InfoSection>
                      <InfoSection label="Starting Gold">
                        <p className="text-parchment/90">{bg.gold} gp</p>
                      </InfoSection>
                    </div>
                  </InfoButton>
                </div>
              ) : null
            })()}
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Alignment</Label>
            <select
              value={alignment}
              onChange={e => setAlignment(e.target.value)}
              className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
            >
              {DND_ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-parchment-muted text-xs">Portrait URL (optional)</Label>
            <Input
              value={portraitUrl}
              onChange={e => setPortraitUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
        </div>
      </Card>

      {/* Physical Characteristics */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <Ruler className="w-4 h-4" /> Physical Characteristics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-parchment-muted text-xs">Age</Label>
            <Input
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 25"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Height</Label>
            <Input
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder={`e.g. 5'10"`}
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Weight</Label>
            <Input
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 175 lbs"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Eyes</Label>
            <Input
              value={eyes}
              onChange={e => setEyes(e.target.value)}
              placeholder="e.g. Green"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Hair</Label>
            <Input
              value={hair}
              onChange={e => setHair(e.target.value)}
              placeholder="e.g. Black, long"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Skin</Label>
            <Input
              value={skin}
              onChange={e => setSkin(e.target.value)}
              placeholder="e.g. Pale"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
          <div className="col-span-2 md:col-span-3">
            <Label className="text-parchment-muted text-xs">Faith / Deity</Label>
            <Input
              value={faith}
              onChange={e => setFaith(e.target.value)}
              placeholder="e.g. Tymora, Goddess of Luck"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
        </div>
      </Card>

      {/* Personality */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Personality & Story
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-parchment-muted text-xs">Personality Traits</Label>
            <textarea
              value={personality}
              onChange={e => setPersonality(e.target.value)}
              placeholder="How does your character act?"
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-20 resize-none"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Ideals</Label>
            <textarea
              value={ideals}
              onChange={e => setIdeals(e.target.value)}
              placeholder="What drives your character?"
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-20 resize-none"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Bonds</Label>
            <textarea
              value={bonds}
              onChange={e => setBonds(e.target.value)}
              placeholder="Who or what matters most?"
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-20 resize-none"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Flaws</Label>
            <textarea
              value={flaws}
              onChange={e => setFlaws(e.target.value)}
              placeholder="What's your weakness?"
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-20 resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-parchment-muted text-xs">Appearance</Label>
            <textarea
              value={appearance}
              onChange={e => setAppearance(e.target.value)}
              placeholder="Describe your character's appearance..."
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-20 resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-parchment-muted text-xs">Backstory</Label>
            <textarea
              value={backstory}
              onChange={e => setBackstory(e.target.value)}
              placeholder="Where did your character come from? What shapes them?"
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-28 resize-none"
            />
          </div>
        </div>
      </Card>

      {/* AI Portrait Generator */}
      <PortraitGenerator
        race={race}
        charClass={charClass}
        subclass={subclass}
        name={name}
        age={age}
        height={height}
        weight={weight}
        eyes={eyes}
        hair={hair}
        skin={skin}
        appearance={appearance}
        personality={personality}
        onPortraitSelect={(url) => setPortraitUrl(url)}
      />

      {/* Quest Info */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <Scroll className="w-4 h-4" /> Quest Info (optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-parchment-muted text-xs">Quest Name</Label>
            <Input
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              placeholder="e.g. Curse of Strahd"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">DM Name</Label>
            <Input
              value={dmName}
              onChange={e => setDmName(e.target.value)}
              placeholder="Your Dungeon Master"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
