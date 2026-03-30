'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { joinCampaign, selectCharacter, updateCampaign, updatePlayerStatus } from '@/lib/actions/campaigns'
import { Button } from '@/components/ui/button'
import type { CampaignPlayer } from '@/types/campaign'
import { UserPlus, Swords, Settings, Check, X, Shield, Copy } from 'lucide-react'

interface CampaignLobbyClientProps {
  campaignId: string
  campaignSlug: string
  campaignStatus: string
  campaignType: string
  characterEntryMode: string
  joinCode: string | null
  isDM: boolean
  isPlayer: boolean
  myPlayer?: CampaignPlayer
  myCharacters: { id: string; name: string; class: string; level: number; race: string }[]
  pendingPlayers?: CampaignPlayer[]
  userId?: string
}

export function CampaignLobbyClient({
  campaignId,
  campaignSlug,
  campaignStatus,
  campaignType,
  characterEntryMode,
  joinCode,
  isDM,
  isPlayer,
  myPlayer,
  myCharacters,
  pendingPlayers = [],
  userId,
}: CampaignLobbyClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleJoin() {
    setLoading(true)
    setError(null)
    const result = await joinCampaign(campaignId)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error ?? 'Failed to join')
    }
    setLoading(false)
  }

  async function handleSelectCharacter(characterId: string) {
    setLoading(true)
    const result = await selectCharacter(campaignId, characterId)
    if (!result.success) setError(result.error ?? 'Failed to select character')
    router.refresh()
    setLoading(false)
  }

  async function handleStatusChange(status: string) {
    setLoading(true)
    await updateCampaign(campaignId, { status: status as 'draft' | 'lobby' | 'ready' | 'active' })
    router.refresh()
    setLoading(false)
  }

  async function handleApprovePlayer(playerId: string) {
    setLoading(true)
    await updatePlayerStatus(campaignId, playerId, 'accepted')
    router.refresh()
    setLoading(false)
  }

  async function handleRejectPlayer(playerId: string) {
    setLoading(true)
    await updatePlayerStatus(campaignId, playerId, 'rejected')
    router.refresh()
    setLoading(false)
  }

  function copyJoinCode() {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!userId) {
    return (
      <div className="story-card p-4">
        <p className="text-parchment-muted text-sm text-center">
          <a href="/login" className="text-gold hover:text-gold/80">Sign in</a> to join this campaign
        </p>
      </div>
    )
  }

  // DM Controls
  if (isDM) {
    return (
      <div className="space-y-4">
        <div className="story-card p-4">
          <h3 className="text-lg font-serif text-parchment mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-gold" />
            DM Controls
          </h3>

          {/* Status Transitions */}
          <div className="space-y-2 mb-4">
            {campaignStatus === 'draft' && (
              <Button onClick={() => handleStatusChange('lobby')} disabled={loading} className="w-full btn-fantasy">
                Open Lobby (Accept Players)
              </Button>
            )}
            {campaignStatus === 'lobby' && (
              <Button onClick={() => handleStatusChange('ready')} disabled={loading} className="w-full btn-fantasy">
                Mark Ready
              </Button>
            )}
            {(campaignStatus === 'ready' || campaignStatus === 'lobby') && (
              <Button onClick={() => handleStatusChange('active')} disabled={loading} className="w-full btn-fantasy">
                Launch Campaign
              </Button>
            )}
            {campaignStatus === 'active' && (
              <Button onClick={() => handleStatusChange('paused')} disabled={loading} variant="ghost" className="w-full text-parchment-muted">
                Pause Campaign
              </Button>
            )}
            {campaignStatus === 'paused' && (
              <Button onClick={() => handleStatusChange('active')} disabled={loading} className="w-full btn-fantasy">
                Resume Campaign
              </Button>
            )}
            {/* Backward compat */}
            {campaignStatus === 'recruiting' && (
              <Button onClick={() => handleStatusChange('lobby')} disabled={loading} className="w-full btn-fantasy">
                Move to Lobby
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-parchment-muted">
            <span>Status: <span className="text-parchment capitalize">{campaignStatus}</span></span>
            <span>Entry: <span className="text-parchment capitalize">{characterEntryMode.replace('_', ' ')}</span></span>
          </div>

          {/* Join Code */}
          {joinCode && (campaignStatus === 'lobby' || campaignStatus === 'recruiting') && (
            <div className="mt-4 p-3 rounded-lg bg-teal-rich/50 border border-gold/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-parchment-muted">Join Code</span>
                  <div className="text-lg font-mono text-gold tracking-wider">{joinCode}</div>
                </div>
                <Button onClick={copyJoinCode} variant="ghost" size="sm" className="text-parchment-muted hover:text-gold">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Pending Approval Queue */}
        {pendingPlayers.length > 0 && (
          <div className="story-card p-4">
            <h3 className="text-lg font-serif text-parchment mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Awaiting Approval ({pendingPlayers.length})
            </h3>
            <div className="space-y-3">
              {pendingPlayers.map(player => (
                <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-teal-rich/30 border border-gold/5">
                  <div className="flex items-center gap-3">
                    {player.user?.avatar_url ? (
                      <img src={player.user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal-rich border border-gold/20" />
                    )}
                    <div>
                      <div className="text-sm text-parchment">
                        {player.user?.display_name || player.user?.username || 'Unknown'}
                      </div>
                      {player.character ? (
                        <div className="text-xs text-parchment-muted">
                          {player.character.name} — Lv{player.character.level} {player.character.race} {player.character.class}
                        </div>
                      ) : (
                        <div className="text-xs text-amber-400/70">No character selected</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleApprovePlayer(player.id)} disabled={loading} size="sm" className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleRejectPlayer(player.id)} disabled={loading} size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Player already joined
  if (myPlayer) {
    const approvalLabel = myPlayer.approval_state === 'approved'
      ? '✅ Character Approved'
      : myPlayer.approval_state === 'rejected'
        ? '❌ Character Rejected — select a different character or contact the DM'
        : myPlayer.approval_state === 'awaiting_approval'
          ? '⏳ Awaiting DM Approval...'
          : null

    return (
      <div className="story-card p-4">
        <h3 className="text-lg font-serif text-parchment mb-4 flex items-center gap-2">
          <Swords className="w-4 h-4 text-gold" />
          Your Character
        </h3>
        {myPlayer.status === 'pending' && (
          <p className="text-sm text-amber-400 mb-3">⏳ Waiting for DM approval...</p>
        )}
        {approvalLabel && myPlayer.status === 'accepted' && (
          <p className="text-sm text-parchment-muted mb-3">{approvalLabel}</p>
        )}
        {myCharacters.length > 0 ? (
          <div className="space-y-2">
            {myCharacters.map(char => (
              <button
                key={char.id}
                onClick={() => handleSelectCharacter(char.id)}
                disabled={loading}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  myPlayer.character_id === char.id
                    ? 'bg-gold/10 border border-gold/40'
                    : 'bg-teal-rich/30 border border-gold/5 hover:border-gold/20'
                }`}
              >
                <div className="text-sm text-parchment font-medium">{char.name}</div>
                <div className="text-xs text-parchment-muted">Level {char.level} {char.race} {char.class}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-parchment-muted mb-3">No characters yet.</p>
            <a href="/player-deck/create" className="text-sm text-gold hover:text-gold/80">
              Create a character →
            </a>
          </div>
        )}
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    )
  }

  // Not yet joined
  const canJoin = ['lobby', 'recruiting'].includes(campaignStatus)

  return (
    <div className="story-card p-4">
      <h3 className="text-lg font-serif text-parchment mb-4 flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-gold" />
        Join Campaign
      </h3>
      {canJoin ? (
        <>
          <p className="text-sm text-parchment-muted mb-4">
            Request to join this campaign.{' '}
            {characterEntryMode === 'dm_approval'
              ? 'The DM will review and approve your character.'
              : 'The DM will review your request.'}
          </p>
          <Button onClick={handleJoin} disabled={loading} className="w-full btn-fantasy">
            {loading ? 'Requesting...' : '✦ Request to Join'}
          </Button>
        </>
      ) : (
        <p className="text-sm text-parchment-muted">
          This campaign is not currently accepting new players.
        </p>
      )}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
