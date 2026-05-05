'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  freezeUser,
  unfreezeUser,
  deleteUser,
  resetUserPassword,
  toggleUserAdmin,
} from '@/lib/actions/admin'
import {
  Search,
  Loader2,
  Trash2,
  ShieldOff,
  Shield,
  KeyRound,
  UserX,
  UserCheck,
  RefreshCw,
  Copy,
  Check,
  Crown,
  CrownIcon,
  Wrench,
} from 'lucide-react'

interface UserRow {
  id: string
  email: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  role: string
  is_admin: boolean
  created_at: string
  last_sign_in_at: string | null
  is_banned: boolean
  banned_until: string | null
  email_confirmed_at: string | null
  has_profile: boolean
}

export function UsersClient() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen'>('all')
  const [isPending, startTransition] = useTransition()
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [reconciling, setReconciling] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch users')
      }
      const data = await res.json()
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const handleFreeze = (userId: string) => {
    setActioningId(userId)
    setActionType('freeze')
    startTransition(async () => {
      const result = await freezeUser(userId)
      if (result.success) {
        showSuccess('User account frozen')
        await fetchUsers()
      } else {
        setError(result.error || 'Failed to freeze user')
      }
      setActioningId(null)
      setActionType(null)
    })
  }

  const handleUnfreeze = (userId: string) => {
    setActioningId(userId)
    setActionType('unfreeze')
    startTransition(async () => {
      const result = await unfreezeUser(userId)
      if (result.success) {
        showSuccess('User account unfrozen')
        await fetchUsers()
      } else {
        setError(result.error || 'Failed to unfreeze user')
      }
      setActioningId(null)
      setActionType(null)
    })
  }

  const handleDelete = (userId: string) => {
    if (confirmDelete !== userId) {
      setConfirmDelete(userId)
      return
    }
    setActioningId(userId)
    setActionType('delete')
    setConfirmDelete(null)
    startTransition(async () => {
      const result = await deleteUser(userId)
      if (result.success) {
        showSuccess('User account deleted')
        await fetchUsers()
      } else {
        setError(result.error || 'Failed to delete user')
      }
      setActioningId(null)
      setActionType(null)
    })
  }

  const handleResetPassword = (userId: string, email: string) => {
    setActioningId(userId)
    setActionType('reset')
    setResetLink(null)
    startTransition(async () => {
      const result = await resetUserPassword(userId, email)
      if (result.success) {
        if (result.resetLink) {
          setResetLink(result.resetLink)
        }
        showSuccess('Password reset link generated')
      } else {
        setError(result.error || 'Failed to generate reset link')
      }
      setActioningId(null)
      setActionType(null)
    })
  }

  const handleToggleAdmin = (userId: string, currentlyAdmin: boolean) => {
    setActioningId(userId)
    setActionType('admin')
    startTransition(async () => {
      const result = await toggleUserAdmin(userId, !currentlyAdmin)
      if (result.success) {
        showSuccess(currentlyAdmin ? 'Admin privileges removed' : 'Admin privileges granted')
        await fetchUsers()
      } else {
        setError(result.error || 'Failed to update admin status')
      }
      setActioningId(null)
      setActionType(null)
    })
  }

  const copyResetLink = async () => {
    if (resetLink) {
      await navigator.clipboard.writeText(resetLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleReconcile = async () => {
    setReconciling(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users/reconcile', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reconcile failed')
      showSuccess(
        data.fixed > 0
          ? `Reconciled ${data.fixed} orphan profile${data.fixed === 1 ? '' : 's'}`
          : 'No orphan profiles found',
      )
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reconcile failed')
    } finally {
      setReconciling(false)
    }
  }

  // Filter users
  const filtered = users.filter(u => {
    const matchesSearch =
      !searchQuery ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !u.is_banned) ||
      (statusFilter === 'frozen' && u.is_banned)

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: users.length,
    active: users.filter(u => !u.is_banned).length,
    frozen: users.filter(u => u.is_banned).length,
    admins: users.filter(u => u.is_admin).length,
    orphans: users.filter(u => !u.has_profile).length,
  }

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const relativeTime = (d: string | null) => {
    if (!d) return 'Never'
    const now = Date.now()
    const then = new Date(d).getTime()
    const diff = now - then
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-parchment mb-2">User Management</h1>
        <p className="text-parchment-muted text-sm">
          View and manage all user accounts. All new signups are auto-approved.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-parchment' },
          { label: 'Active', value: stats.active, color: 'text-emerald-400' },
          { label: 'Frozen', value: stats.frozen, color: 'text-red-400' },
          { label: 'Admins', value: stats.admins, color: 'text-gold' },
        ].map(s => (
          <div key={s.label} className="glass rounded-lg p-4 border border-gold/10">
            <p className="text-xs text-parchment-muted">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-red-200">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          {successMsg}
        </div>
      )}
      {resetLink && (
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">Password Reset Link Generated</span>
            <button onClick={() => setResetLink(null)} className="text-blue-300 hover:text-blue-200">✕</button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 text-xs bg-black/30 rounded px-2 py-1 overflow-x-auto break-all">{resetLink}</code>
            <Button size="sm" variant="outline" onClick={copyResetLink} className="shrink-0">
              {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
          <Input
            placeholder="Search by email, username, or display name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-ink/50 border-gold/20 text-parchment"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'frozen'] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={statusFilter === f ? 'default' : 'outline'}
              onClick={() => setStatusFilter(f)}
              className={statusFilter === f ? 'bg-gold/20 text-gold border-gold/30' : 'text-parchment-muted'}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchUsers}
          disabled={loading}
          className="text-parchment-muted"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReconcile}
          disabled={reconciling}
          className="text-parchment-muted"
          title={
            stats.orphans > 0
              ? `Backfill ${stats.orphans} missing profile${stats.orphans === 1 ? '' : 's'}`
              : 'Backfill any auth users that are missing profiles'
          }
        >
          {reconciling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wrench className="w-4 h-4" />
          )}
          <span className="ml-1 hidden sm:inline">
            Reconcile{stats.orphans > 0 ? ` (${stats.orphans})` : ''}
          </span>
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-parchment-muted">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading users...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-parchment-muted">
          {searchQuery || statusFilter !== 'all' ? 'No users match your filters.' : 'No users found.'}
        </div>
      ) : (
        <div className="glass rounded-lg border border-gold/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left p-4 text-xs text-parchment-muted font-medium uppercase tracking-wider">User</th>
                  <th className="text-left p-4 text-xs text-parchment-muted font-medium uppercase tracking-wider">Role</th>
                  <th className="text-left p-4 text-xs text-parchment-muted font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs text-parchment-muted font-medium uppercase tracking-wider">Last Sign In</th>
                  <th className="text-left p-4 text-xs text-parchment-muted font-medium uppercase tracking-wider">Joined</th>
                  <th className="text-right p-4 text-xs text-parchment-muted font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => {
                  const isActioning = actioningId === user.id
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-gold/5 hover:bg-gold/5 transition-colors"
                    >
                      {/* User info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xs font-bold shrink-0 overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              (user.username?.[0] || user.email[0]).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-parchment font-medium truncate">
                                {user.display_name || user.username || 'No profile'}
                              </span>
                              {user.is_admin && (
                                <Crown className="w-3.5 h-3.5 text-gold shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-parchment-muted truncate">{user.email}</p>
                            {user.username && (
                              <p className="text-xs text-parchment-muted/60">@{user.username}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs capitalize border-gold/20 text-parchment-muted">
                          {user.role}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {user.is_banned ? (
                          <Badge className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs">
                            Frozen
                          </Badge>
                        ) : !user.has_profile ? (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs">
                            No Profile
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                            Active
                          </Badge>
                        )}
                      </td>

                      {/* Last Sign In */}
                      <td className="p-4">
                        <span className="text-parchment-muted text-xs" title={formatDate(user.last_sign_in_at)}>
                          {relativeTime(user.last_sign_in_at)}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="p-4">
                        <span className="text-parchment-muted text-xs">
                          {formatDate(user.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Reset Password */}
                          <button
                            onClick={() => handleResetPassword(user.id, user.email)}
                            disabled={isActioning}
                            className="p-1.5 rounded hover:bg-gold/10 text-parchment-muted hover:text-blue-300 transition-colors disabled:opacity-50"
                            title="Reset password"
                          >
                            {isActioning && actionType === 'reset' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <KeyRound className="w-4 h-4" />
                            )}
                          </button>

                          {/* Toggle Admin */}
                          <button
                            onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                            disabled={isActioning}
                            className={`p-1.5 rounded hover:bg-gold/10 transition-colors disabled:opacity-50 ${
                              user.is_admin ? 'text-gold hover:text-gold/70' : 'text-parchment-muted hover:text-gold'
                            }`}
                            title={user.is_admin ? 'Remove admin' : 'Make admin'}
                          >
                            {isActioning && actionType === 'admin' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CrownIcon className="w-4 h-4" />
                            )}
                          </button>

                          {/* Freeze / Unfreeze */}
                          {user.is_banned ? (
                            <button
                              onClick={() => handleUnfreeze(user.id)}
                              disabled={isActioning}
                              className="p-1.5 rounded hover:bg-gold/10 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                              title="Unfreeze account"
                            >
                              {isActioning && actionType === 'unfreeze' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFreeze(user.id)}
                              disabled={isActioning}
                              className="p-1.5 rounded hover:bg-gold/10 text-parchment-muted hover:text-orange-300 transition-colors disabled:opacity-50"
                              title="Freeze account"
                            >
                              {isActioning && actionType === 'freeze' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <ShieldOff className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={isActioning}
                            className={`p-1.5 rounded hover:bg-gold/10 transition-colors disabled:opacity-50 ${
                              confirmDelete === user.id
                                ? 'text-red-400 bg-red-500/10'
                                : 'text-parchment-muted hover:text-red-400'
                            }`}
                            title={confirmDelete === user.id ? 'Click again to confirm delete' : 'Delete user'}
                          >
                            {isActioning && actionType === 'delete' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {confirmDelete === user.id && (
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-xs text-red-400">Confirm delete?</span>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-parchment-muted hover:text-parchment"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gold/10 text-xs text-parchment-muted">
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  )
}
