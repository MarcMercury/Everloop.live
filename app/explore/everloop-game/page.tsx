import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Everloop: The Game | Everloop',
  description: 'The definitive rules for Everloop — the legendary board game of the Broken World. Learn how to play with 4 players using strategy, deception, and timing.',
}

const SIGIL_VALUES = [
  { value: 1, name: 'Rat', icon: '🐀', image: '/game/sigil-rat.png' },
  { value: 2, name: 'Snake', icon: '🐍', image: '/game/sigil-snake.png' },
  { value: 3, name: 'Fang', icon: '🦷', image: '/game/sigil-fang.png' },
  { value: 4, name: 'Tail', icon: '🦎', image: '/game/sigil-tail.png' },
  { value: 5, name: 'Crown', icon: '👑', image: '/game/sigil-crown.png' },
  { value: 6, name: 'Boar', icon: '🐗', image: '/game/sigil-boar.png' },
  { value: 7, name: 'Eye', icon: '👁️', image: '/game/sigil-eye.png' },
  { value: 8, name: 'Wolf', icon: '🐺', image: '/game/sigil-wolf.png' },
]

const MODIFIERS = [
  {
    name: 'Split',
    count: 2,
    timing: 'Active Turn',
    description: 'Divide your Sigil value between any players. The Totem only moves by the portion you keep for yourself.',
    color: 'blue-400',
  },
  {
    name: 'Inverse',
    count: 2,
    timing: 'Active Turn',
    description: 'Subtract your Sigil value from an opponent\'s Personal Score. The Totem moves backward by that value.',
    color: 'purple-400',
  },
  {
    name: 'Loop',
    count: 2,
    timing: 'Active Turn',
    description: 'Tether your score to another player for the round. Whatever they score, you score too.',
    color: 'teal-400',
  },
]

const REACTIONS = [
  {
    name: 'Shield',
    count: 1,
    timing: 'Out-of-Turn',
    description: 'Prevents the full Fray reset. You only subtract your most recent scored points — you do not fall back to the Fray number.',
    color: 'gold',
  },
  {
    name: 'Compass',
    count: 1,
    timing: 'Out-of-Turn',
    description: 'Calculate your total Fray penalty (Reset + Last Score + Dead Loop if applicable) and cut it in half.',
    color: 'green-400',
  },
]

export default function EverloopGamePage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">

          {/* Back Button */}
          <div className="mb-8">
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="gap-2 text-parchment-muted hover:text-parchment">
                <ArrowLeft className="w-4 h-4" />
                Back to Archive
              </Button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-12 border border-gold/20">
            <Image
              src="/game/full-set.png"
              alt="The complete Everloop game set laid out on a dark stone table"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-8 text-center">
              <h1 className="text-3xl md:text-5xl font-serif mb-2">
                <span className="text-gold">EVERLOOP</span>
              </h1>
              <p className="text-xl md:text-2xl font-serif text-parchment">
                The Game of the Broken World
              </p>
            </div>
          </div>

          {/* Intro */}
          <div className="text-center mb-12">
            <p className="text-parchment-muted max-w-2xl mx-auto leading-relaxed text-lg">
              In taverns, courtyards, and hollowed ruins across the Everloop, this game is played
              wherever four souls gather with nerve enough to test each other. It is the chess of the
              Broken World — a contest of timing, deception, and the willingness to break what you&apos;ve built.
            </p>
          </div>

          {/* Rules Content */}
          <div className="space-y-12 text-parchment-muted">

            {/* Overview */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                Overview
              </h2>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  Everloop is a <span className="text-parchment font-medium">4-player</span> strategy card game
                  played on a spiral track numbered <span className="text-gold">1 to 100</span>. Players accumulate
                  Personal Scores by playing Sigil cards while collectively advancing a shared Totem along the track.
                </p>
                <p>
                  The tension: every player holds a secret <span className="text-red-400">Fray card</span> — a hidden
                  number that, once reached by the Totem, arms a devastating reset that can shatter the scores of
                  everyone above it.
                </p>
                <p>
                  The game ends when the Totem reaches <span className="text-gold">100</span>. The player with the highest
                  Personal Score wins — but the player who pushed the Totem past 100 doesn&apos;t get another turn. Timing is everything.
                </p>
              </div>
            </section>

            {/* I. Components */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                I. Components
              </h2>
              <div className="space-y-6">
                {/* Board & Totem images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-lg bg-teal-rich/50 border border-gold/10 overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src="/game/spiral-board.png"
                        alt="The Spiral Board — a circular obsidian slab with 100 glowing spaces"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-serif text-parchment mb-2">◈ The Board</h3>
                      <p>A large circular slab of matte obsidian, 20 inches across. A spiral track of <span className="text-gold">100 spaces</span> curls inward toward a central Void, each number etched and glowing with dying-ember light.</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-teal-rich/50 border border-gold/10 overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src="/game/loop-totem.png"
                        alt="The Loop Totem — a jagged obsidian spire game piece"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-serif text-parchment mb-2">◈ The Totem</h3>
                      <p>A heavy, seamless spire carved from black stone. It tracks the collective <span className="text-gold">Table Score</span> and casts no shadow — even under direct light.</p>
                    </div>
                  </div>
                </div>

                {/* Deck & Fray images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-lg bg-teal-rich/50 border border-gold/10 overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src="/game/sigil-deck.png"
                        alt="The Sigil Deck — tattered parchment cards with creature illustrations"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-serif text-parchment mb-2">◈ The Deck</h3>
                      <p><span className="text-gold">64 Sigil cards</span> — tattered parchment with frayed edges. 8 sets of values 1 through 8, each bearing the stark black ink mark of a different creature.</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-teal-rich/50 border border-gold/10 overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src="/game/fray-card.png"
                        alt="Fray Cards and Vaults — crimson-backed cards and weathered leather pouches"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-serif text-parchment mb-2">◈ Fray Cards &amp; Vaults</h3>
                      <p><span className="text-red-400">4 cards</span> with a fractured crown spiral back — one per player. Each hides a secret trigger number (<span className="text-gold">1–99</span>) inside a weathered leather Vault pouch.</p>
                    </div>
                  </div>
                </div>

                {/* Sigil Values with images */}
                <div>
                  <h3 className="text-xl font-serif text-parchment mb-4">The Eight Sigils</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {SIGIL_VALUES.map((sigil) => (
                      <div
                        key={sigil.value}
                        className="rounded-lg bg-teal-deep/50 border border-gold/10 overflow-hidden group hover:border-gold/30 transition-colors"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={sigil.image}
                            alt={`${sigil.name} Sigil card — value ${sigil.value}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3 text-center">
                          <span className="text-gold font-serif font-semibold">{sigil.value}</span>
                          <span className="text-parchment-muted text-sm ml-2">{sigil.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* II. Player Stash */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                II. Player Stash
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                Each player begins with <span className="text-gold">8 unique tactical cards</span> — one-time use
                resources that shape the flow of the game. Once played, they are gone.
              </p>

              {/* Modifier & Reaction cards image */}
              <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden mb-8 border border-gold/10">
                <Image
                  src="/game/modifier-cards.png"
                  alt="Modifier and Reaction cards — Split, Inverse, Loop, Shield, and Compass"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Modifiers */}
              <div className="mb-8">
                <h3 className="text-xl font-serif text-parchment mb-4 flex items-center gap-2">
                  <span className="text-blue-400">⚡</span> Modifier Stash
                  <span className="text-sm text-parchment-muted font-normal">(Active Turn only)</span>
                </h3>
                <div className="space-y-4">
                  {MODIFIERS.map((mod) => (
                    <div
                      key={mod.name}
                      className={`p-5 rounded-lg bg-teal-rich/50 border border-${mod.color}/20`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-${mod.color} font-serif font-semibold text-lg`}>{mod.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-deep/70 text-parchment-muted">
                          ×{mod.count}
                        </span>
                      </div>
                      <p>{mod.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reactions */}
              <div>
                <h3 className="text-xl font-serif text-parchment mb-4 flex items-center gap-2">
                  <span className="text-gold">🛡️</span> Reaction Stash
                  <span className="text-sm text-parchment-muted font-normal">(Out-of-Turn only)</span>
                </h3>
                <div className="space-y-4">
                  {REACTIONS.map((react) => (
                    <div
                      key={react.name}
                      className={`p-5 rounded-lg bg-teal-rich/50 border border-${react.color}/20`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-${react.color} font-serif font-semibold text-lg`}>{react.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-deep/70 text-parchment-muted">
                          ×{react.count}
                        </span>
                      </div>
                      <p>{react.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* III. Standard Turn Sequence */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                III. Standard Turn Sequence
              </h2>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Play a Sigil',
                    desc: 'You must play one Sigil card (value 1–8) from your hand face-up on the table.',
                  },
                  {
                    step: 2,
                    title: 'Use a Modifier (Optional)',
                    desc: 'You may play one Modifier from your Stash. Split, Inverse, or Loop — each changes how points are distributed.',
                  },
                  {
                    step: 3,
                    title: 'Update Scores',
                    desc: 'Add points to your Personal Score and move the Totem forward on the track by the same amount.',
                  },
                  {
                    step: 4,
                    title: 'Draw',
                    desc: 'Always end your turn with 5 cards in hand. Draw from the Sigil deck to replenish.',
                  },
                ].map((step) => (
                  <div key={step.step} className="flex gap-4 p-4 rounded-lg bg-teal-rich/50 border border-gold/10">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
                      <span className="text-gold font-serif font-semibold">{step.step}</span>
                    </div>
                    <div>
                      <h4 className="text-parchment font-serif font-semibold mb-1">{step.title}</h4>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* IV. The Fray & Reaction Phase */}
            <section className="glass-subtle p-8 rounded-lg border border-red-500/20">
              <h2 className="text-2xl md:text-3xl font-serif text-red-400 mb-6">
                IV. The Fray &amp; Reaction Phase
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                The Fray is the heart of Everloop&apos;s danger. Every player carries a secret number — their personal
                point of no return. When the Totem crosses it, reality breaks.
              </p>

              <div className="space-y-6">
                <div className="p-5 rounded-lg bg-teal-rich/50 border border-red-500/10">
                  <h3 className="text-lg font-serif text-red-400 mb-2">Activation</h3>
                  <p>A player&apos;s Fray becomes <span className="text-red-400 font-medium">active</span> once the
                    Totem reaches or passes their secret number. They do not reveal this to the table — the trap is set
                    silently.</p>
                </div>

                <div className="p-5 rounded-lg bg-teal-rich/50 border border-red-500/10">
                  <h3 className="text-lg font-serif text-red-400 mb-2">Deployment</h3>
                  <p>On their turn, an active player may choose to <span className="text-red-400 font-medium">flip their
                    Fray card</span> instead of playing a Sigil. This triggers the Fray for the entire table.</p>
                </div>

                <div className="p-5 rounded-lg bg-teal-rich/50 border border-gold/10">
                  <h3 className="text-lg font-serif text-gold mb-2">Reaction Window</h3>
                  <p>Once a Fray is triggered, play pauses. All other players may respond by playing a
                    <span className="text-gold font-medium"> Shield</span> or <span className="text-gold font-medium">Compass</span> from
                    their Reaction Stash to mitigate the incoming damage.</p>
                </div>

                <div className="border-t border-red-500/20 pt-6">
                  <h3 className="text-xl font-serif text-parchment mb-4">The Penalties</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-teal-deep/50 border border-red-500/10">
                      <h4 className="text-parchment font-serif font-semibold mb-1">Standard Hit</h4>
                      <p>All affected players (those at or above the Fray number) <span className="text-red-400">reset
                        to the Fray Number</span>, then subtract their <span className="text-red-400">last scored points</span>.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-teal-deep/50 border border-red-500/20">
                      <h4 className="text-red-400 font-serif font-semibold mb-1">☠️ The Dead Loop</h4>
                      <p>If a player is <span className="text-red-400 font-medium">exactly</span> on the Fray number
                        when it is deployed, they lose an <span className="text-red-400 font-medium">additional 15 points</span>.
                        A precise and devastating punishment.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-teal-deep/50 border border-gold/10">
                      <h4 className="text-gold font-serif font-semibold mb-1">🛡️ Shield Reaction</h4>
                      <p>You do <span className="text-gold">not</span> reset to the Fray number. You only subtract
                        your <span className="text-gold">last scored points</span>.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-teal-deep/50 border border-green-500/10">
                      <h4 className="text-green-400 font-serif font-semibold mb-1">🧭 Compass Reaction</h4>
                      <p>Calculate your total penalty (Reset + Last Score + Dead Loop if applicable) and
                        <span className="text-green-400"> cut it in half</span>.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* V. The Final Round — The Collapse */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/30">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                V. The Collapse — Final Round
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                The endgame is not a race to 100 — it is a trap. The player who pushes the Totem past the
                threshold becomes the <span className="text-gold font-medium">Ender</span>, and by doing so,
                surrenders their final turn.
              </p>

              <div className="space-y-4">
                <div className="p-5 rounded-lg bg-gold/5 border border-gold/20">
                  <h3 className="text-lg font-serif text-gold mb-2">The Trigger</h3>
                  <p>The game enters its final phase when any player pushes the
                    <span className="text-gold font-medium"> Totem to 100 or higher</span>.</p>
                </div>

                <div className="p-5 rounded-lg bg-gold/5 border border-gold/20">
                  <h3 className="text-lg font-serif text-gold mb-2">The Fair Play Window</h3>
                  <p>The player who moved the Totem to 100+ is the <span className="text-gold font-medium">Ender</span>.
                    They do <span className="text-parchment font-medium">not</span> get another turn. Every other player
                    (moving clockwise) receives exactly <span className="text-gold font-medium">one more turn</span> to
                    play a Sigil and any remaining Modifiers to adjust the final standings.</p>
                </div>

                <div className="p-5 rounded-lg bg-gold/10 border border-gold/30">
                  <h3 className="text-lg font-serif text-gold mb-2">The Winner</h3>
                  <p>Once the rotation returns to the Ender, the game is over. The player with the
                    highest <span className="text-gold font-semibold">Personal Score</span> wins.</p>
                </div>
              </div>
            </section>

            {/* Score Trackers */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                VI. Personal Score Trackers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gold/10">
                  <Image
                    src="/game/score-trackers.png"
                    alt="Personal Score Trackers — bone-chimes and notched wooden sticks with sliding rings"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4 text-lg leading-relaxed">
                  <p>
                    Each player receives a small vertical tracker — a <span className="text-parchment font-medium">notched stick</span> made
                    from scavenged bone, driftwood, and steel wire.
                  </p>
                  <p>
                    A sliding ring marks your <span className="text-gold">Personal Score</span> from 1 to 100.
                    These are separate from the Totem — while the Totem tracks the collective pace,
                    your tracker is yours alone.
                  </p>
                  <p className="text-parchment-muted text-base">
                    They should look handmade, weathered, and scavenged — assembled from whatever the
                    Broken World left behind.
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Reference */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                Quick Reference
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gold/20">
                      <th className="py-3 pr-4 text-gold font-serif">Element</th>
                      <th className="py-3 text-gold font-serif">Details</th>
                    </tr>
                  </thead>
                  <tbody className="text-parchment-muted">
                    <tr className="border-b border-charcoal-700/50">
                      <td className="py-3 pr-4 text-parchment font-medium">Players</td>
                      <td className="py-3">4</td>
                    </tr>
                    <tr className="border-b border-charcoal-700/50">
                      <td className="py-3 pr-4 text-parchment font-medium">Sigil Deck</td>
                      <td className="py-3">64 cards (8 values × 8 sets)</td>
                    </tr>
                    <tr className="border-b border-charcoal-700/50">
                      <td className="py-3 pr-4 text-parchment font-medium">Hand Size</td>
                      <td className="py-3">5 cards (replenish at end of turn)</td>
                    </tr>
                    <tr className="border-b border-charcoal-700/50">
                      <td className="py-3 pr-4 text-parchment font-medium">Stash Cards</td>
                      <td className="py-3">8 per player (6 Modifiers + 2 Reactions)</td>
                    </tr>
                    <tr className="border-b border-charcoal-700/50">
                      <td className="py-3 pr-4 text-parchment font-medium">Fray Range</td>
                      <td className="py-3">1–99 (secret, chosen at start)</td>
                    </tr>
                    <tr className="border-b border-charcoal-700/50">
                      <td className="py-3 pr-4 text-parchment font-medium">Dead Loop Penalty</td>
                      <td className="py-3">−15 additional points</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-parchment font-medium">Game End</td>
                      <td className="py-3">Totem reaches 100 → Ender sits out → one final rotation → highest Personal Score wins</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Lore Note */}
            <section className="text-center py-8">
              <p className="text-parchment-muted italic text-lg leading-relaxed max-w-2xl mx-auto">
                &ldquo;They say the game was old before the Fray. That the First Architects played it
                in the Fold, wagering not points but realities. That every time a Totem crosses a
                threshold, somewhere in the Pattern, something shifts.&rdquo;
              </p>
              <p className="text-gold/50 text-sm mt-4 uppercase tracking-widest">
                — Unattributed, recovered from the Hollows of Ashenmere
              </p>
            </section>

          </div>
        </div>
      </section>
    </div>
  )
}
