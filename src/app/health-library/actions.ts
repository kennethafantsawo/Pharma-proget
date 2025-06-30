'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function incrementLikeAction(postId: number): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: "Configuration serveur manquante." }
  }

  // We use an RPC call to a database function for an atomic increment.
  const { error } = await supabaseAdmin.rpc('increment_likes', {
    post_id_to_inc: postId,
  })

  if (error) {
    console.error('Error incrementing like:', error)
    return { success: false, error: "Erreur lors de la mise à jour du like." }
  }

  // Revalidate the path to show the updated like count to all users.
  revalidatePath('/health-library')
  return { success: true }
}
