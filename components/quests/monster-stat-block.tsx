/**
 * MonsterStatBlock — renders a D&D 5e stat block for a campaign monster.
 *
 * Used by:
 *   • `app/explore/[slug]/page.tsx` (public entity page)
 *   • `components/editor/monster-quest-wizard.tsx` (live preview)
 *   • Quest detail views
 *
 * Layout follows the SRD stat block convention so DMs can run encounters
 * directly from the page — no transcription required.
 */

import {
  ABILITY_ORDER,
  ABILITY_LABELS,
  abilityMod,
  crEntry,
  formatMod,
  type Ability,
  type MonsterAction,
  type MonsterStats,
} from '@/lib/dnd-rules/monsters'

interface Props {
  stats: MonsterStats
  name: string
}

function ActionLine({ action }: { action: MonsterAction }) {
  const parts: string[] = []
  if (action.attackBonus !== undefined) {
    const reach = action.reach !== undefined ? `reach ${action.reach} ft.` : ''
    const range =
      action.rangeNormal !== undefined
        ? `range ${action.rangeNormal}${action.rangeLong ? `/${action.rangeLong}` : ''} ft.`
        : ''
    const tail = [reach, range].filter(Boolean).join(' or ')
    parts.push(
      `Melee or Ranged Weapon Attack: ${formatMod(action.attackBonus)} to hit${tail ? `, ${tail}` : ''}${action.targets ? `, ${action.targets}` : ''}.`
    )
  } else if (action.saveDC !== undefined) {
    parts.push(
      `Each target must make a DC ${action.saveDC}${action.saveAbility ? ` ${ABILITY_LABELS[action.saveAbility]}` : ''} saving throw${action.targets ? ` (${action.targets})` : ''}.${action.saveEffect ? ` ${action.saveEffect}` : ''}`
    )
  }
  if (action.damage) parts.push(`Hit: ${action.damage}.`)
  return (
    <p className="text-sm text-parchment leading-relaxed">
      <span className="italic font-medium text-gold">
        {action.name}
        {action.recharge && (
          <span className="not-italic text-parchment-muted"> (Recharge {action.recharge})</span>
        )}
        {action.legendaryCost && action.legendaryCost > 1 && (
          <span className="not-italic text-parchment-muted"> (Costs {action.legendaryCost} Actions)</span>
        )}
        .
      </span>{' '}
      {parts.length > 0 && <span className="text-parchment-muted">{parts.join(' ')}</span>}{' '}
      {action.description && <span>{action.description}</span>}
    </p>
  )
}

function joinList(values: string[]): string {
  return values.length === 0 ? '—' : values.join(', ')
}

function formatSenses(s: MonsterStats['senses']): string {
  const parts: string[] = []
  if (s.darkvision) parts.push(`darkvision ${s.darkvision} ft.`)
  if (s.blindsight)
    parts.push(`blindsight ${s.blindsight} ft.${s.blindsightBlindBeyond ? ' (blind beyond)' : ''}`)
  if (s.tremorsense) parts.push(`tremorsense ${s.tremorsense} ft.`)
  if (s.truesight) parts.push(`truesight ${s.truesight} ft.`)
  parts.push(`passive Perception ${s.passivePerception}`)
  return parts.join(', ')
}

export function MonsterStatBlock({ stats, name }: Props) {
  const entry = crEntry(stats.cr)
  const speedStr = stats.movements
    .map((m) => (m.type === 'walk' ? `${m.speed} ft.` : `${m.type} ${m.speed} ft.${m.note ? ` (${m.note})` : ''}`))
    .join(', ')

  const savesStr = ABILITY_ORDER.filter((ab) => stats.savingThrows[ab] !== undefined)
    .map((ab) => `${ab} ${formatMod(stats.savingThrows[ab] as number)}`)
    .join(', ')

  const skillsStr = stats.skills.map((s) => `${s.name} ${formatMod(s.bonus)}`).join(', ')

  return (
    <div className="rounded-lg border border-gold/30 bg-charcoal-900/70 backdrop-blur text-parchment shadow-lg p-5 font-serif">
      {/* Header */}
      <div className="border-b border-gold/30 pb-2 mb-3">
        <h2 className="text-2xl font-bold text-gold tracking-wide">{name}</h2>
        <p className="text-sm italic text-parchment-muted capitalize">
          {stats.size} {stats.creatureType}
          {stats.subtype ? ` (${stats.subtype})` : ''}, {stats.alignment}
        </p>
      </div>

      {/* Top stats */}
      <div className="space-y-0.5 text-sm border-b border-gold/15 pb-2 mb-3">
        <p>
          <span className="font-bold text-gold">Armor Class</span> {stats.ac}
          {stats.acSource ? ` (${stats.acSource})` : ''}
        </p>
        <p>
          <span className="font-bold text-gold">Hit Points</span> {stats.hp}
          {stats.hitDice ? ` (${stats.hitDice})` : ''}
        </p>
        <p>
          <span className="font-bold text-gold">Speed</span> {speedStr || '—'}
        </p>
      </div>

      {/* Ability grid */}
      <div className="grid grid-cols-6 gap-1 text-center border-b border-gold/15 pb-2 mb-3">
        {ABILITY_ORDER.map((ab) => (
          <div key={ab}>
            <div className="font-bold text-gold text-xs uppercase">{ab}</div>
            <div className="text-sm text-parchment">
              {stats.abilities[ab]} ({formatMod(abilityMod(stats.abilities[ab]))})
            </div>
          </div>
        ))}
      </div>

      {/* Proficiencies / defenses */}
      <div className="space-y-0.5 text-sm border-b border-gold/15 pb-2 mb-3">
        {savesStr && (
          <p>
            <span className="font-bold text-gold">Saving Throws</span> {savesStr}
          </p>
        )}
        {skillsStr && (
          <p>
            <span className="font-bold text-gold">Skills</span> {skillsStr}
          </p>
        )}
        {stats.damageVulnerabilities.length > 0 && (
          <p>
            <span className="font-bold text-gold">Damage Vulnerabilities</span>{' '}
            {joinList(stats.damageVulnerabilities)}
          </p>
        )}
        {stats.damageResistances.length > 0 && (
          <p>
            <span className="font-bold text-gold">Damage Resistances</span>{' '}
            {joinList(stats.damageResistances)}
          </p>
        )}
        {stats.damageImmunities.length > 0 && (
          <p>
            <span className="font-bold text-gold">Damage Immunities</span>{' '}
            {joinList(stats.damageImmunities)}
          </p>
        )}
        {stats.conditionImmunities.length > 0 && (
          <p>
            <span className="font-bold text-gold">Condition Immunities</span>{' '}
            {joinList(stats.conditionImmunities)}
          </p>
        )}
        <p>
          <span className="font-bold text-gold">Senses</span> {formatSenses(stats.senses)}
        </p>
        <p>
          <span className="font-bold text-gold">Languages</span> {joinList(stats.languages)}
          {stats.telepathy ? `, telepathy ${stats.telepathy} ft.` : ''}
        </p>
        <p>
          <span className="font-bold text-gold">Challenge</span> {entry.label} ({entry.xp.toLocaleString()} XP)
          <span className="ml-3 font-bold text-gold">Proficiency Bonus</span> +{stats.proficiencyBonus}
        </p>
      </div>

      {/* Traits */}
      {stats.traits.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {stats.traits.map((t, i) => (
            <p key={i} className="text-sm text-parchment leading-relaxed">
              <span className="italic font-bold text-gold">{t.name}.</span> {t.description}
            </p>
          ))}
        </div>
      )}

      {/* Actions */}
      {(stats.multiattack || stats.actions.length > 0) && (
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gold border-b border-gold/30 mb-2">Actions</h3>
          {stats.multiattack && (
            <p className="text-sm text-parchment leading-relaxed mb-1.5">
              <span className="italic font-bold text-gold">Multiattack.</span> {stats.multiattack}
            </p>
          )}
          <div className="space-y-1.5">
            {stats.actions.map((a, i) => (
              <ActionLine key={i} action={a} />
            ))}
          </div>
        </div>
      )}

      {/* Bonus actions */}
      {stats.bonusActions.length > 0 && (
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gold border-b border-gold/30 mb-2">Bonus Actions</h3>
          <div className="space-y-1.5">
            {stats.bonusActions.map((a, i) => (
              <ActionLine key={i} action={a} />
            ))}
          </div>
        </div>
      )}

      {/* Reactions */}
      {stats.reactions.length > 0 && (
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gold border-b border-gold/30 mb-2">Reactions</h3>
          <div className="space-y-1.5">
            {stats.reactions.map((a, i) => (
              <ActionLine key={i} action={a} />
            ))}
          </div>
        </div>
      )}

      {/* Legendary */}
      {stats.legendaryActions.count > 0 && stats.legendaryActions.actions.length > 0 && (
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gold border-b border-gold/30 mb-2">
            Legendary Actions
          </h3>
          <p className="text-sm text-parchment leading-relaxed mb-1.5">
            {stats.legendaryActions.description ||
              `The creature can take ${stats.legendaryActions.count} legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The creature regains spent legendary actions at the start of its turn.`}
          </p>
          <div className="space-y-1.5">
            {stats.legendaryActions.actions.map((a, i) => (
              <ActionLine key={i} action={a} />
            ))}
          </div>
        </div>
      )}

      {/* Lair Actions */}
      {stats.lairActions && stats.lairActions.actions.length > 0 && (
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gold border-b border-gold/30 mb-2">Lair Actions</h3>
          {stats.lairActions.description && (
            <p className="text-sm text-parchment leading-relaxed mb-1.5">{stats.lairActions.description}</p>
          )}
          <div className="space-y-1.5">
            {stats.lairActions.actions.map((a, i) => (
              <ActionLine key={i} action={a} />
            ))}
          </div>
        </div>
      )}

      {/* DM cues */}
      {(stats.tactics || stats.weaknesses.length > 0) && (
        <div className="mt-4 pt-3 border-t border-gold/30 space-y-2 text-sm bg-charcoal-950/40 -mx-5 -mb-5 px-5 pb-5 rounded-b-lg">
          <div className="text-xs uppercase tracking-wider text-gold/70 font-bold">DM Notes</div>
          {stats.tactics && (
            <p className="text-parchment">
              <span className="font-bold text-gold">Tactics.</span> {stats.tactics}
            </p>
          )}
          {stats.weaknesses.length > 0 && (
            <p className="text-parchment">
              <span className="font-bold text-gold">Counterplay.</span>{' '}
              {stats.weaknesses.join(' • ')}
            </p>
          )}
          <p className="text-xs text-parchment-muted italic">
            Designed for ~{stats.damagePerRound} damage / round • {stats.role}
          </p>
        </div>
      )}
    </div>
  )
}
