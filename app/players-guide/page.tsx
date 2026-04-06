import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Gamepad2, Swords, Eye, Zap, AlertTriangle, HelpCircle } from 'lucide-react'
import { CollapsibleSection } from './collapsible-section'

export const metadata = {
  title: "Player's Guide | Everloop",
  description: "A player's view of a world that is failing to hold — mechanics, dangers, and what it means for you.",
}

export default function PlayersGuidePage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-parchment-muted/60 mb-4">
            <span className="w-8 h-px bg-purple-500/30" />
            A World That Is Failing to Hold
            <span className="w-8 h-px bg-purple-500/30" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-parchment mb-4">
            Player&apos;s <span className="canon-text">Guide</span>
          </h1>
          <p className="text-parchment-muted text-lg max-w-2xl mx-auto">
            What you need to know before stepping into the Everloop.
          </p>
        </div>

        {/* ═══ What the World Is ═══ */}
        <CollapsibleSection
          icon={<div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-gold" /></div>}
          title="What the World Is"
          defaultOpen={true}
        >
          <div
            className="p-8 rounded-lg border border-gold/15"
            style={{ background: 'linear-gradient(135deg, rgba(20, 30, 30, 0.5) 0%, rgba(13, 20, 20, 0.4) 100%)' }}
          >
            <p className="text-lg text-parchment-muted leading-relaxed mb-4">
              The Everloop is a world that exists because <span className="text-parchment font-medium">something is holding it together</span>.
            </p>
            <p className="text-parchment-muted leading-relaxed mb-4">
              Beneath everything is a structure — the <span className="text-blue-300 font-medium">Pattern</span> — that allows time to move forward, matter to remain itself, and memory to persist. It was shaped long ago from the chaos of the Drift, given form through the First Map, and fixed in place by the <span className="text-gold font-medium">Anchors</span>, which were once living beings.
            </p>
            <p className="text-parchment-muted leading-relaxed mb-4">
              The Everloop is the surface of that structure.
            </p>
            <p className="text-lg text-parchment italic">
              It is where things last long enough to matter.
            </p>
          </div>
        </CollapsibleSection>

        {/* ═══ What Is Going Wrong ═══ */}
        <CollapsibleSection
          icon={<div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-400" /></div>}
          title="What Is Going Wrong"
        >
          <div className="mb-6 p-6 rounded-lg border border-red-500/15" style={{ background: 'linear-gradient(135deg, rgba(30, 15, 15, 0.3) 0%, rgba(20, 10, 10, 0.2) 100%)' }}>
            <p className="text-lg text-parchment-muted leading-relaxed mb-4">
              The Pattern is <span className="text-red-400 font-medium">weakening</span>.
            </p>
            <p className="text-parchment-muted leading-relaxed">
              Not breaking all at once — but thinning, unevenly, across the world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Hollows */}
            <div className="p-6 rounded-lg border border-parchment-muted/15" style={{ background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.4) 0%, rgba(15, 15, 15, 0.3) 100%)' }}>
              <h3 className="text-lg font-serif text-parchment mb-3">
                <span className="text-parchment-muted/50 mr-2">◌</span>
                Hollows
              </h3>
              <p className="text-xs uppercase tracking-wider text-parchment-muted/50 mb-3">Where Things Fail to Continue</p>
              <ul className="space-y-2 text-sm text-parchment-muted">
                <li className="flex items-start gap-2"><span className="text-parchment-muted/40 mt-1">–</span>Places where reality loses coherence</li>
                <li className="flex items-start gap-2"><span className="text-parchment-muted/40 mt-1">–</span>Sound dulls, color fades, memory slips</li>
                <li className="flex items-start gap-2"><span className="text-parchment-muted/40 mt-1">–</span>People and places may vanish</li>
                <li className="flex items-start gap-2"><span className="text-parchment-muted/40 mt-1">–</span>Time may skip, stall, or partially erase events</li>
              </ul>
            </div>

            {/* The Fray */}
            <div className="p-6 rounded-lg border border-red-500/15" style={{ background: 'linear-gradient(135deg, rgba(30, 15, 15, 0.3) 0%, rgba(25, 10, 10, 0.2) 100%)' }}>
              <h3 className="text-lg font-serif text-red-400 mb-3">
                <span className="text-red-400/50 mr-2">◈</span>
                The Fray
              </h3>
              <p className="text-xs uppercase tracking-wider text-red-400/50 mb-3">Where Too Much Happens at Once</p>
              <ul className="space-y-2 text-sm text-parchment-muted">
                <li className="flex items-start gap-2"><span className="text-red-400/40 mt-1">–</span>Overlapping moments, conflicting realities</li>
                <li className="flex items-start gap-2"><span className="text-red-400/40 mt-1">–</span>Cause and effect break down</li>
                <li className="flex items-start gap-2"><span className="text-red-400/40 mt-1">–</span>Time loops, doubles, or contradicts itself</li>
                <li className="flex items-start gap-2"><span className="text-red-400/40 mt-1">–</span>The world struggles to agree on what is happening</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-parchment-muted mt-6 italic">
            Most people don&apos;t understand this. They just know something feels wrong.
          </p>
        </CollapsibleSection>

        {/* ═══ What Comes Through ═══ */}
        <CollapsibleSection
          icon={<div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"><span className="text-red-400 text-lg">◈</span></div>}
          title="What Comes Through"
        >
          <div className="p-8 rounded-lg border border-red-500/15" style={{ background: 'linear-gradient(135deg, rgba(30, 15, 15, 0.3) 0%, rgba(20, 10, 10, 0.2) 100%)' }}>
            <p className="text-lg text-parchment-muted leading-relaxed mb-4">
              Where the Fray cuts deepest, the boundary between the Everloop and the Drift <span className="text-red-400 font-medium">breaks open</span>.
            </p>
            <p className="text-parchment-muted leading-relaxed mb-6">
              Things enter that were never meant to exist here. The Everloop originally had no monsters. They appeared only after the breaking — chaotic manifestations of the Drift forcing itself into form without rules.
            </p>

            <div className="pl-6 border-l-2 border-red-500/20 mb-6">
              <p className="text-sm uppercase tracking-wider text-red-400/60 mb-3">What Monsters Are</p>
              <ul className="space-y-2 text-parchment-muted">
                <li className="flex items-start gap-2"><span className="text-red-400/40 mt-1">–</span>Not native to the Everloop — they are leaks from the Drift</li>
                <li className="flex items-start gap-2"><span className="text-red-400/40 mt-1">–</span>Not shaped by the First Map or stabilized by the Pattern</li>
                <li className="flex items-start gap-2"><span className="text-red-400/40 mt-1">–</span>Incomplete, unstable, overlapping forms — raw existence given shape by accident</li>
                <li className="flex items-start gap-2"><span className="text-red-400/40 mt-1">–</span>No consistent biology, no predictable behavior, no stable identity</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <div className="p-4 rounded-lg border border-purple-500/15" style={{ background: 'linear-gradient(135deg, rgba(20, 13, 30, 0.4) 0%, rgba(15, 10, 20, 0.3) 100%)' }}>
                <p className="text-sm font-serif text-purple-300 font-semibold mb-2">Drift Intrusions</p>
                <p className="text-xs text-parchment-muted/70">Completely alien. No recognizable biology. Exist in unstable states.</p>
              </div>
              <div className="p-4 rounded-lg border border-amber-500/15" style={{ background: 'linear-gradient(135deg, rgba(25, 20, 13, 0.4) 0%, rgba(18, 15, 10, 0.3) 100%)' }}>
                <p className="text-sm font-serif text-amber-300 font-semibold mb-2">Corrupted Reality</p>
                <p className="text-xs text-parchment-muted/70">Animals, people, or objects warped by Drift exposure. Part Everloop, part not.</p>
              </div>
              <div className="p-4 rounded-lg border border-teal-500/15" style={{ background: 'linear-gradient(135deg, rgba(13, 25, 25, 0.4) 0%, rgba(10, 18, 18, 0.3) 100%)' }}>
                <p className="text-sm font-serif text-teal-300 font-semibold mb-2">Echo Constructs</p>
                <p className="text-xs text-parchment-muted/70">Formed from memory and repetition. Not fully alive, not fully gone.</p>
              </div>
            </div>

            <p className="text-parchment italic text-center">
              If you encounter a monster, something broke here. That is never a coincidence.
            </p>
          </div>
        </CollapsibleSection>

        {/* ═══ What Caused It ═══ */}
        <CollapsibleSection
          icon={<div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center"><Zap className="w-5 h-5 text-gold" /></div>}
          title="What Caused It"
        >
          <div className="p-8 rounded-lg border border-gold/15" style={{ background: 'linear-gradient(135deg, rgba(25, 20, 15, 0.4) 0%, rgba(15, 12, 8, 0.3) 100%)' }}>
            <p className="text-parchment-muted leading-relaxed mb-4">
              When the Pattern began to thin, some tried to fix it. These were the <span className="text-gold font-medium">Rogue Architects</span> — Vaultkeepers and Dreamers who believed they could restore what was failing.
            </p>
            <p className="text-parchment-muted leading-relaxed mb-4">
              They reached into the foundation of the world —
            </p>
            <p className="text-lg text-red-400 font-serif italic mb-4">
              And broke it.
            </p>
            <p className="text-parchment-muted leading-relaxed">
              The Anchors, which once held everything stable, were shattered. What remains are the <span className="text-gold font-medium">Shards</span>.
            </p>
          </div>
        </CollapsibleSection>

        {/* ═══ The Shards ═══ */}
        <CollapsibleSection
          icon={<div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center"><span className="text-gold text-lg">◇</span></div>}
          title="The Shards"
        >
          <div className="p-8 rounded-lg border border-gold/20" style={{ background: 'linear-gradient(135deg, rgba(25, 20, 15, 0.4) 0%, rgba(15, 12, 8, 0.3) 100%)' }}>
            <p className="text-lg text-parchment-muted leading-relaxed mb-6">
              Shards are fragments of what once held the world together. They still carry that weight. Each region holds an unknown number of them — and they pull toward one another.
            </p>

            <div className="pl-6 border-l-2 border-gold/20 mb-6">
              <p className="text-sm uppercase tracking-wider text-gold/60 mb-3">Where a Shard is present:</p>
              <ul className="space-y-2 text-parchment-muted">
                <li className="flex items-start gap-2"><span className="text-gold/40 mt-1">◦</span>Reality stabilizes — but unnaturally</li>
                <li className="flex items-start gap-2"><span className="text-gold/40 mt-1">◦</span>Time, memory, and matter may bend to match it</li>
                <li className="flex items-start gap-2"><span className="text-gold/40 mt-1">◦</span>The surrounding area becomes volatile or distorted</li>
                <li className="flex items-start gap-2"><span className="text-gold/40 mt-1">◦</span>Other Shards nearby grow restless, as if responding</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-gold/30 mb-6">
              <p className="text-sm uppercase tracking-wider text-gold/60 mb-3">What is known:</p>
              <ul className="space-y-2 text-parchment-muted">
                <li className="flex items-start gap-2"><span className="text-gold/40 mt-1">◦</span>Each region contains an unknown number of Shards</li>
                <li className="flex items-start gap-2"><span className="text-gold/40 mt-1">◦</span>They naturally pull toward one another — slowly, inevitably</li>
                <li className="flex items-start gap-2"><span className="text-gold/40 mt-1">◦</span>No one knows what happens when all Shards of a region converge</li>
                <li className="flex items-start gap-2"><span className="text-gold/40 mt-1">◦</span>No one knows what happens if every Shard, from every region, is brought together</li>
              </ul>
            </div>

            <p className="text-parchment-muted leading-relaxed mb-2">
              Shards can be found, collected, guarded, or stolen. Every quest, every campaign, every story in the Everloop bends toward them — whether the characters know it or not.
            </p>
            <p className="text-parchment italic leading-relaxed">
              Something is pulling everything together. You are part of that pull.
            </p>
          </div>
        </CollapsibleSection>

        {/* ═══ What Lies Beneath ═══ */}
        <CollapsibleSection
          icon={<div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"><span className="text-purple-400 text-lg">◎</span></div>}
          title="What Lies Beneath"
        >
          <p className="text-parchment-muted mb-6">
            Players don&apos;t interact with this directly — but it matters:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'The Drift', desc: 'Underlying chaos', color: 'purple-400', bg: 'purple-500/10' },
              { name: 'The Fold', desc: 'Where structure began', color: 'blue-400', bg: 'blue-500/10' },
              { name: 'The First Map', desc: 'Rules of existence', color: 'teal-400', bg: 'teal-500/10' },
              { name: 'The Pattern', desc: 'What keeps things continuous', color: 'blue-300', bg: 'blue-400/10' },
            ].map((layer) => (
              <div
                key={layer.name}
                className={`p-4 rounded-lg border border-${layer.color}/20 bg-${layer.bg} text-center`}
                style={{ background: 'linear-gradient(135deg, rgba(13, 26, 26, 0.5) 0%, rgba(20, 36, 36, 0.3) 100%)' }}
              >
                <p className={`text-sm font-serif font-semibold text-${layer.color} mb-1`}>{layer.name}</p>
                <p className="text-xs text-parchment-muted/60">{layer.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-parchment-muted/50 mt-4 text-center italic">
            These are not places you travel to in a normal sense. They are what the world is made from.
          </p>
        </CollapsibleSection>

        {/* ═══ Who Can See It ═══ */}
        <CollapsibleSection
          icon={<div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center"><Eye className="w-5 h-5 text-teal-400" /></div>}
          title="Who Can See It"
        >

          <p className="text-parchment-muted mb-6">
            Most people are <span className="text-parchment font-medium">Pattern-blind</span>. They live normal lives, even as the world begins to fail around them. But some can perceive more:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 rounded-lg border border-teal-500/15" style={{ background: 'linear-gradient(135deg, rgba(13, 30, 30, 0.5) 0%, rgba(10, 25, 25, 0.3) 100%)' }}>
              <h3 className="text-lg font-serif text-teal-400 mb-3">Vaultkeepers</h3>
              <ul className="space-y-2 text-sm text-parchment-muted">
                <li className="flex items-start gap-2"><span className="text-teal-400/40 mt-1">◦</span>Sense the underlying structure of the world</li>
                <li className="flex items-start gap-2"><span className="text-teal-400/40 mt-1">◦</span>Read echoes of what has happened or could happen</li>
                <li className="flex items-start gap-2"><span className="text-teal-400/40 mt-1">◦</span>Often interpret, not control</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-purple-500/15" style={{ background: 'linear-gradient(135deg, rgba(20, 13, 30, 0.5) 0%, rgba(15, 10, 25, 0.3) 100%)' }}>
              <h3 className="text-lg font-serif text-purple-300 mb-3">Dreamers</h3>
              <ul className="space-y-2 text-sm text-parchment-muted">
                <li className="flex items-start gap-2"><span className="text-purple-400/40 mt-1">◦</span>Can subtly influence reality</li>
                <li className="flex items-start gap-2"><span className="text-purple-400/40 mt-1">◦</span>Nudge outcomes, shift probability, alter small moments</li>
                <li className="flex items-start gap-2"><span className="text-purple-400/40 mt-1">◦</span>Every action creates strain elsewhere</li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-parchment-muted/60 mt-4 text-center italic">
            Neither group fully understands what they&apos;re dealing with.
          </p>
        </CollapsibleSection>

        {/* ═══ What This Means for You ═══ */}
        <CollapsibleSection
          icon={<div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center"><Swords className="w-5 h-5 text-gold" /></div>}
          title="What This Means for You"
        >

          <div className="p-8 rounded-lg border border-gold/20" style={{ background: 'linear-gradient(135deg, rgba(20, 25, 20, 0.4) 0%, rgba(13, 18, 13, 0.3) 100%)' }}>
            <p className="text-lg text-parchment-muted leading-relaxed mb-6">
              You are not in a stable world. You are in a world that is:
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { label: 'Uneven', desc: 'Some places are normal, others are not' },
                { label: 'Unreliable', desc: 'Time, memory, and cause may fail' },
                { label: 'Connected', desc: 'Actions in one place can affect another' },
                { label: 'Decaying', desc: 'Not collapsing yet, but getting there' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded border border-gold/10 bg-gold/5">
                  <p className="text-sm font-serif text-gold font-semibold">{item.label}</p>
                  <p className="text-xs text-parchment-muted/70 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center border-t border-gold/10 pt-6">
              <p className="text-lg font-serif text-parchment italic">
                There are no clean solutions.
              </p>
              <p className="text-parchment-muted mt-2">
                Fixing something may break something else. Saving one place may doom another.
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* ═══ What People Believe ═══ */}
        <CollapsibleSection
          icon={<div className="w-10 h-10 rounded-full bg-parchment-muted/10 border border-parchment-muted/20 flex items-center justify-center"><HelpCircle className="w-5 h-5 text-parchment-muted" /></div>}
          title="What People Believe"
        >

          <div className="p-6 rounded-lg border border-gold/10" style={{ background: 'linear-gradient(135deg, rgba(13, 26, 26, 0.4) 0%, rgba(20, 36, 36, 0.3) 100%)' }}>
            <p className="text-parchment-muted mb-4">No one agrees on what should be done.</p>
            <div className="space-y-3">
              {[
                'Some believe gathering the Shards will restore the world',
                'Some believe bringing them together will finish its destruction',
                'Some seek Shards for power, others hide them out of fear',
                'Some worship the Fray as liberation from the Pattern\'s design',
                'Most ignore it and hope it never reaches them',
              ].map((belief, i) => (
                <div key={i} className="flex items-start gap-3 text-parchment-muted">
                  <span className="text-gold/30 mt-0.5">◦</span>
                  <span>{belief}</span>
                </div>
              ))}
            </div>
            <p className="text-parchment-muted/50 mt-6 text-sm italic text-center">
              No one knows the truth.
            </p>
          </div>
        </CollapsibleSection>

        {/* ═══ Final Statement ═══ */}
        <section className="mb-16">
          <div className="text-center py-12">
            <p className="text-xl text-parchment-muted leading-relaxed mb-4">
              The world is not ending.
            </p>
            <p className="text-xl text-parchment leading-relaxed mb-6">
              It is pulling itself back together.
            </p>
            <div className="w-16 h-px bg-gold/30 mx-auto my-8" />
            <p className="text-lg text-parchment-muted leading-relaxed">
              And for the first time —
            </p>
            <p className="text-2xl font-serif text-parchment mt-4 leading-relaxed">
              What is found, what is gathered, what is brought together,
            </p>
            <p className="text-2xl font-serif mt-2">
              <span className="text-parchment">may determine </span>
              <span className="canon-text font-semibold">what comes next</span>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-gold/10">
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/player-deck">
              <Button variant="canon" className="gap-2">
                <Swords className="w-4 h-4" />
                Build a Character
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                Join a Campaign
              </Button>
            </Link>
            <Link href="/readers-guide">
              <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                Reader&apos;s Guide
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
