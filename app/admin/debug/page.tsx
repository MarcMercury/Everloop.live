import { createClient } from '@/lib/supabase/server'
import { getAdminQueueDebug } from '@/lib/actions/debug'

interface ProfileCheck {
  is_admin: boolean | null
  username: string | null
}

export default async function AdminDebug() {
  const supabase = await createClient()

  // 1. Get the User
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // 2. Run the Admin Check (RPC)
  const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin_check')

  // 3. Manual Table Check (Backup verification)
  let profile: ProfileCheck | null = null
  let profileError: { message: string; code: string } | null = null
  
  if (user) {
    const result = await supabase
      .from('profiles')
      .select('is_admin, username')
      .eq('id', user.id)
      .single()
    
    profile = result.data as ProfileCheck | null
    if (result.error) {
      profileError = { message: result.error.message, code: result.error.code }
    }
  }

  // 4. Run the full debug action
  const debugResults = await getAdminQueueDebug()

  return (
    <div className="p-10 bg-teal-deep text-parchment min-h-screen font-mono">
      <h1 className="text-3xl text-gold mb-6 border-b border-gold pb-2">Admin Diagnostic</h1>
      
      <div className="space-y-4">
        <div className="p-4 border border-gold/30 rounded bg-teal-rich">
          <h2 className="text-xl font-bold text-gold">1. Authentication</h2>
          <p>User ID: <span className="text-green-400">{user?.id || 'NO USER FOUND'}</span></p>
          <p>Email: <span className="text-green-400">{user?.email || 'N/A'}</span></p>
          {userError && <p className="text-red-500">Auth Error: {userError.message}</p>}
        </div>

        <div className="p-4 border border-gold/30 rounded bg-teal-rich">
          <h2 className="text-xl font-bold text-gold">2. RPC Function Check (is_admin_check)</h2>
          <p>Result: <span className={isAdmin ? "text-green-400" : "text-red-500"}>{String(isAdmin)}</span></p>
          {rpcError && <p className="text-red-500">RPC Error: {rpcError.message}</p>}
          {!rpcError && isAdmin === null && <p className="text-yellow-400">Function may not exist in database - run complete_rls_fix.sql</p>}
        </div>

        <div className="p-4 border border-gold/30 rounded bg-teal-rich">
          <h2 className="text-xl font-bold text-gold">3. Direct Table Check (profiles.is_admin)</h2>
          <p>Username: <span className="text-blue-400">{profile?.username || 'N/A'}</span></p>
          <p>is_admin value: <span className={profile?.is_admin ? "text-green-400" : "text-red-500"}>{String(profile?.is_admin)}</span></p>
          {profileError && <p className="text-red-500">Profile Error: {profileError.message} ({profileError.code})</p>}
        </div>

        <div className="p-4 border border-gold/30 rounded bg-teal-rich">
          <h2 className="text-xl font-bold text-gold">4. Summary</h2>
          {isAdmin === true ? (
            <p className="text-green-400 text-lg">✓ Admin access GRANTED via RPC</p>
          ) : rpcError ? (
            <p className="text-yellow-400 text-lg">⚠ RPC function not working - run complete_rls_fix.sql</p>
          ) : (
            <p className="text-red-400 text-lg">✗ Admin access DENIED</p>
          )}
        </div>

        <div className="p-4 border border-gold/30 rounded bg-teal-rich">
          <h2 className="text-xl font-bold text-gold mb-4">5. Full Queue Debug</h2>
          <div className="space-y-3">
            {debugResults.map((result, i) => (
              <div key={i} className={`p-3 rounded ${result.success ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                <p className="font-bold">{result.step}</p>
                {result.data && (
                  <pre className="text-sm mt-1 text-parchment/80 overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
                {result.error && (
                  <p className="text-red-400 mt-1">Error: {result.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
