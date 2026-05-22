'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Heart, Shield, EyeOff, Plus, X, Loader2 } from 'lucide-react'
import { submitSessionZero, getSessionZero } from '@/lib/actions/quests'
import type { TonePreference, HeartAnchor } from '@/types/quest'

interface Props {
  questId: string
  questTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompleted?: () => void
}

const TONE_OPTIONS: { value: TonePreference; label: string; description: string }[] = [
  { value: 'light',  label: 'Light',  description: 'Heroic, hopeful. Loss is rare and earned.' },
  { value: 'mixed',  label: 'Mixed',  description: 'Real stakes, balanced with humor and hope.' },
  { value: 'dark',   label: 'Dark',   description: 'Grim, costly. Tragedy is on the table.' },
]

const MAX_ANCHORS = 3

/**
 * Session Zero Modal — Safety floor + heart anchors.
 *
 * Establishes player-defined narrative boundaries (lines / veils),
 * a tone preference, and 1–3 "heart anchors" — what their character
 * cares about most. Saved per-player, surfaced to the DM dashboard.
 */
export function SessionZeroModal({ questId, questTitle, open, onOpenChange, onCompleted }: Props) {
  const [lines, setLines] = useState('')
  const [veils, setVeils] = useState('')
  const [tone, setTone] = useState<TonePreference>('mixed')
  const [anchors, setAnchors] = useState<HeartAnchor[]>([{ label: '' }])
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Load existing answers (if any) when modal opens
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoadingExisting(true)
    setError(null)
    getSessionZero(questId).then((res) => {
      if (cancelled) return
      if (res.success && res.data) {
        setLines(res.data.lines_text || '')
        setVeils(res.data.veils_text || '')
        setTone((res.data.tone_preference as TonePreference) || 'mixed')
        const existing = res.data.heart_anchors
        setAnchors(existing.length > 0 ? existing : [{ label: '' }])
      }
      setLoadingExisting(false)
    })
    return () => { cancelled = true }
  }, [open, questId])

  const updateAnchor = (i: number, patch: Partial<HeartAnchor>) => {
    setAnchors(prev => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)))
  }
  const addAnchor = () => {
    if (anchors.length >= MAX_ANCHORS) return
    setAnchors(prev => [...prev, { label: '' }])
  }
  const removeAnchor = (i: number) => {
    setAnchors(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = () => {
    const cleanedAnchors = anchors
      .map(a => ({ label: a.label.trim(), note: a.note?.trim() }))
      .filter(a => a.label.length > 0)

    setError(null)
    startTransition(async () => {
      const result = await submitSessionZero({
        questId,
        lines,
        veils,
        tonePreference: tone,
        heartAnchors: cleanedAnchors,
      })
      if (!result.success) {
        setError(result.error || 'Could not save your Session Zero.')
        return
      }
      onCompleted?.()
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-slate-100">
            Session Zero
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Before we begin <span className="text-slate-200">{questTitle}</span>, set
            the floor of safety and tell the DM what your character holds dear. Private to you and the DM.
          </DialogDescription>
        </DialogHeader>

        {loadingExisting ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* LINES */}
            <section>
              <label className="flex items-center gap-2 text-sm font-medium text-rose-300 mb-2">
                <Shield className="w-4 h-4" />
                Lines — never in our story
              </label>
              <textarea
                value={lines}
                onChange={(e) => setLines(e.target.value.slice(0, 1000))}
                rows={3}
                placeholder="Topics that must not appear at the table. E.g. harm to children, graphic torture, real-world hate."
                className="w-full bg-slate-900 border border-rose-900/40 rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500/40 resize-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Hard limit. The DM will keep these out of the quest. {lines.length}/1000
              </p>
            </section>

            {/* VEILS */}
            <section>
              <label className="flex items-center gap-2 text-sm font-medium text-amber-300 mb-2">
                <EyeOff className="w-4 h-4" />
                Veils — fade to black if they appear
              </label>
              <textarea
                value={veils}
                onChange={(e) => setVeils(e.target.value.slice(0, 1000))}
                rows={3}
                placeholder="Topics that may exist off-screen but should not be played out in detail."
                className="w-full bg-slate-900 border border-amber-900/40 rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40 resize-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Soft limit. The DM will narrate around these. {veils.length}/1000
              </p>
            </section>

            {/* TONE */}
            <section>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tone preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {TONE_OPTIONS.map((opt) => {
                  const selected = tone === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTone(opt.value)}
                      className={[
                        'text-left rounded-md border px-3 py-2 transition',
                        selected
                          ? 'border-indigo-400 bg-indigo-500/10'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700',
                      ].join(' ')}
                    >
                      <div className={selected ? 'text-indigo-200 font-medium' : 'text-slate-200 font-medium'}>
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {opt.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* HEART ANCHORS */}
            <section>
              <label className="flex items-center gap-2 text-sm font-medium text-pink-300 mb-2">
                <Heart className="w-4 h-4" />
                Heart anchors — what your character holds dear
              </label>
              <p className="text-[11px] text-slate-500 mb-3">
                Up to {MAX_ANCHORS}. The DM will see these and may weave them in. Examples: <span className="text-slate-400">"My sister in Vale"</span>, <span className="text-slate-400">"The owl, Cob"</span>, <span className="text-slate-400">"Restoring my house's honor"</span>.
              </p>
              <div className="space-y-2">
                {anchors.map((a, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <input
                        value={a.label}
                        onChange={(e) => updateAnchor(i, { label: e.target.value.slice(0, 80) })}
                        placeholder={`Anchor ${i + 1}`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500/40"
                      />
                      <input
                        value={a.note || ''}
                        onChange={(e) => updateAnchor(i, { note: e.target.value.slice(0, 200) })}
                        placeholder="Why it matters (optional)"
                        className="w-full bg-slate-900/60 border border-slate-800/60 rounded-md px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500/30"
                      />
                    </div>
                    {anchors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAnchor(i)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition"
                        aria-label="Remove anchor"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {anchors.length < MAX_ANCHORS && (
                  <button
                    type="button"
                    onClick={addAnchor}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add another anchor
                  </button>
                )}
              </div>
            </section>

            {error && (
              <div className="text-sm text-rose-300 bg-rose-950/30 border border-rose-900/40 rounded-md px-3 py-2">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-slate-400"
          >
            Later
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || loadingExisting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving</>
            ) : (
              'Confirm & enter the quest'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
