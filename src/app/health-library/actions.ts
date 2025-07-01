
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod';
import type { HealthPostComment } from '@/lib/types'

export async function incrementLikeAction(postId: number, unlike: boolean = false): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: "Configuration serveur manquante." };
  }

  try {
    // 1. Fetch the current post to get the current likes count
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('health_posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      console.error('Error fetching post for like update:', fetchError);
      return { success: false, error: "Le post est introuvable." };
    }

    // 2. Calculate the new likes count
    const currentLikes = post.likes || 0;
    // Ensure likes don't go below zero
    const newLikes = unlike ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    // 3. Update the post with the new count
    const { error: updateError } = await supabaseAdmin
      .from('health_posts')
      .update({ likes: newLikes })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating likes:', updateError);
      return { success: false, error: "Erreur lors de la mise à jour du like." };
    }

    revalidatePath('/health-library');
    return { success: true };

  } catch (error) {
    console.error('Unexpected error in incrementLikeAction:', error);
    const message = error instanceof Error ? error.message : "Une erreur inattendue est survenue.";
    return { success: false, error: message };
  }
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
