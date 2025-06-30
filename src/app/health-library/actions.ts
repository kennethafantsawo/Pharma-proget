'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod';
import type { HealthPostComment } from '@/lib/types'

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

export async function getCommentsAction(postId: number): Promise<{ success: boolean; data?: HealthPostComment[], error?: string }> {
    if (!supabaseAdmin) {
        return { success: false, error: "Configuration serveur manquante." }
    }

    const { data, error } = await supabaseAdmin
        .from('health_post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
    
    if (error) {
        console.error('Error fetching comments:', error);
        return { success: false, error: "Impossible de charger les commentaires." };
    }

    return { success: true, data };
}

const AddCommentSchema = z.object({
    postId: z.number(),
    content: z.string().min(1, "Le commentaire ne peut pas être vide.").max(300, "Le commentaire est trop long."),
});

export async function addCommentAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
    if (!supabaseAdmin) {
        return { success: false, error: "Configuration serveur manquante." }
    }

    const validatedFields = AddCommentSchema.safeParse({
        postId: Number(formData.get('postId')),
        content: formData.get('content'),
    });

    if (!validatedFields.success) {
        return { success: false, error: validatedFields.error.flatten().fieldErrors.content?.[0] || 'Données invalides.' };
    }
    
    const { postId, content } = validatedFields.data;

    const { error } = await supabaseAdmin
        .from('health_post_comments')
        .insert({ post_id: postId, content });

    if (error) {
        console.error('Error adding comment:', error);
        return { success: false, error: "Impossible d'ajouter le commentaire." };
    }

    revalidatePath('/health-library');
    return { success: true };
}
