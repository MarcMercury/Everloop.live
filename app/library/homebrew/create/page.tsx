'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Hammer } from 'lucide-react'
import { createHomebrew } from '@/lib/actions/homebrew'

type Kind = 'creature' | 'artifact' | 'concept' | 'location' | 'character'

const KIND_LABEL: Record<Kind, string> = {
  creature: 'Creature',
  artifact: 'Artifact / Item',
  concept: 'Concept / Faction',
  location: 'Location',
  character: 'NPC',
}

export default function CreateHomebrewPage() {
  const router = useRouter()
  const [kind, setKind] = useState<Kind>('creature')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')

  // Kind-specific fields kept simple and free-form.
  const [cr, setCr] = useState('1')
  const [hp, setHp] = useState(20)
  const [ac, setAc] = useState(13)
  const [rarity, setRarity] = useState('uncommon')
  const [region, setRegion] = useState('')
  const [extraJson, setExtraJson] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    let extra: Record<string, unknown> = {}
    if (extraJson.trim()) {
      try {
        extra = JSON.parse(extraJson)
      } catch {
        setError('Extra JSON is not valid JSON')
        return
      }
    }

    const data: Record<string, unknown> = { ...extra }
    if (kind === 'creature') {
      data.stats = { cr, hp, ac }
    } else if (kind === 'artifact') {
      data.rarity = rarity
    } else if (kind === 'location') {
      data.region = region
    }

    setSubmitting(true)
    const res = await createHomebrew({
      kind,
      name: name.trim(),
      description,
      data,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    })
    setSubmitting(false)

    if (res.error) {
      setError(res.error)
      return
    }
    if (res.slug) router.push(`/library/entity/${res.slug}`)
    else router.push('/library/homebrew')
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center gap-2 text-gold mb-2">
        <Hammer className="w-5 h-5" />
        <span className="uppercase tracking-[0.3em] text-xs">Homebrew Workshop</span>
      </div>
      <h1 className="font-serif text-3xl text-parchment mb-6">New Creation</h1>

      <form onSubmit={submit} className="space-y-6">
        <Card className="p-4 bg-charcoal-900/40 border-gold/15 space-y-4">
          <div>
            <Label className="text-parchment-muted text-xs uppercase tracking-wider">Kind</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                    kind === k
                      ? 'border-gold bg-gold/20 text-gold'
                      : 'border-gold/15 text-parchment-muted hover:border-gold/40'
                  }`}
                >
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="hb-name">Name</Label>
            <Input id="hb-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bell Marrow Stalker" />
          </div>

          <div>
            <Label htmlFor="hb-desc">Description</Label>
            <Textarea
              id="hb-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Evocative prose. Lean into the Pattern, Drift, and Fray where appropriate."
            />
          </div>

          <div>
            <Label htmlFor="hb-tags">Tags (comma-separated)</Label>
            <Input id="hb-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="drift, undead, bellroot" />
          </div>
        </Card>

        {kind === 'creature' && (
          <Card className="p-4 bg-charcoal-900/40 border-gold/15">
            <h2 className="font-serif text-lg text-parchment mb-3">Stat Block (basic)</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="hb-cr">CR</Label>
                <Input id="hb-cr" value={cr} onChange={(e) => setCr(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="hb-hp">HP</Label>
                <Input id="hb-hp" type="number" value={hp} onChange={(e) => setHp(Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="hb-ac">AC</Label>
                <Input id="hb-ac" type="number" value={ac} onChange={(e) => setAc(Number(e.target.value))} />
              </div>
            </div>
          </Card>
        )}

        {kind === 'artifact' && (
          <Card className="p-4 bg-charcoal-900/40 border-gold/15">
            <Label htmlFor="hb-rarity">Rarity</Label>
            <select
              id="hb-rarity"
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
              className="w-full px-3 py-2 rounded bg-charcoal-800 border border-gold/15 text-parchment text-sm mt-1"
            >
              {['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Card>
        )}

        {kind === 'location' && (
          <Card className="p-4 bg-charcoal-900/40 border-gold/15">
            <Label htmlFor="hb-region">Region</Label>
            <Input id="hb-region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Bellroot Hollow" />
          </Card>
        )}

        <Card className="p-4 bg-charcoal-900/40 border-gold/15">
          <Label htmlFor="hb-extra">Extra structured data (optional JSON)</Label>
          <Textarea
            id="hb-extra"
            value={extraJson}
            onChange={(e) => setExtraJson(e.target.value)}
            rows={6}
            placeholder='{"abilities":["..."],"weakness":"..."}'
            className="font-mono text-xs"
          />
        </Card>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting} className="bg-gold text-charcoal-950 hover:bg-gold/90">
            {submitting ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
