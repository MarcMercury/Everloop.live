'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { runLoreAgent } from '@/lib/agents/lore-agent'

export async function triggerLoreAgentManually(): Promise<{
  success: boolean
  error?: string
  runId?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin_check')
  if (adminErr || isAdmin !== true) {
    return { success: false, error: 'Admin access required' }
  }

  const result = await runLoreAgent({ trigger: 'manual', triggerRef: user.id })
  revalidatePath('/admin/lore-agent')
  if (!result.ok) {
    return { success: false, error: result.error ?? 'One or more passes failed', runId: result.runId }
  }
  return { success: true, runId: result.runId }
}
