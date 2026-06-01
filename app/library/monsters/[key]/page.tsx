import { getCreature } from '@/lib/open5e'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CanonRefs } from '@/components/library/canon-refs'

export const dynamic = 'force-dynamic'

function mod(score: number) {
  const m = Math.floor((score - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

export default async function MonsterDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  let m
  try { m = await getCreature(key) } catch { notFound() }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link href="/library/monsters" className="text-xs text-parchment-muted hover:text-gold">← Monsters</Link>
      <h1 className="text-3xl font-serif text-parchment mt-2">{m.name}</h1>
      <p className="text-sm text-parchment-muted italic mt-1 capitalize">
        {m.size?.name} {m.type?.name} • {m.alignment} • CR {m.challenge_rating_text} ({m.experience_points?.toLocaleString()} XP)
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mt-6 text-sm">
        <Stat label="Armor Class" value={`${m.armor_class}${m.armor_description ? ` (${m.armor_description})` : ''}`} />
        <Stat label="Hit Points" value={`${m.hit_points} (${m.hit_dice})`} />
        <Stat label="Speed" value={Object.entries(m.speed || {}).map(([k,v]) => `${k} ${v} ft`).join(', ')} />
      </div>

      <div className="grid grid-cols-6 gap-2 mt-4 text-center">
        {([['STR', m.strength],['DEX', m.dexterity],['CON', m.constitution],['INT', m.intelligence],['WIS', m.wisdom],['CHA', m.charisma]] as const).map(([k,v]) => (
          <div key={k} className="rounded-md bg-teal-rich/30 border border-gold/10 px-2 py-2">
            <div className="text-xs uppercase tracking-wider text-parchment-muted">{k}</div>
            <div className="text-parchment text-lg font-mono">{v}</div>
            <div className="text-xs text-gold font-mono">{mod(v)}</div>
          </div>
        ))}
      </div>

      {m.special_abilities?.length > 0 && (
        <Section title="Special Abilities">
          {m.special_abilities.map((a, i) => (
            <Ability key={i} name={a.name} desc={a.description} />
          ))}
        </Section>
      )}

      {m.actions?.length > 0 && (
        <Section title="Actions">
          {m.actions.map((a, i) => (
            <Ability key={i} name={a.name} desc={a.description} />
          ))}
        </Section>
      )}

      {m.legendary_actions?.length > 0 && (
        <Section title="Legendary Actions">
          {m.legendary_actions.map((a, i) => (
            <Ability key={i} name={a.name} desc={a.description} />
          ))}
        </Section>
      )}

      <CanonRefs searchTerm={m.name} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md bg-teal-rich/30 border border-gold/10 px-3 py-2">
      <div className="text-xs uppercase tracking-wider text-parchment-muted">{label}</div>
      <div className="text-parchment mt-0.5">{value || '—'}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="font-serif text-xl text-gold border-b border-gold/20 pb-1 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Ability({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="text-sm">
      <span className="text-parchment font-semibold italic">{name}.</span>{' '}
      <span className="text-parchment-muted whitespace-pre-wrap">{desc}</span>
    </div>
  )
}
