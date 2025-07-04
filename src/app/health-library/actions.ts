
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
    // Étape 1 : Récupérer la fiche pour s'assurer qu'elle existe et obtenir le nombre de "J'aime".
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('health_posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      console.error('Like Action - Erreur de récupération:', fetchError);
      return { success: false, error: "Impossible de trouver la fiche santé. A-t-elle été supprimée ?" };
    }

    // Étape 2 : Calculer le nouveau nombre de "J'aime".
    const currentLikes = post.likes || 0;
    const newLikes = unlike ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    // Étape 3 : Mettre à jour la fiche avec le nouveau décompte.
    const { error: updateError } = await supabaseAdmin
      .from('health_posts')
      .update({ likes: newLikes })
      .eq('id', postId);

    if (updateError) {
      console.error('Like Action - Erreur de mise à jour:', updateError);
      return { success: false, error: `Erreur de base de données : ${updateError.message}` };
    }

    revalidatePath('/health-library');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur inattendue est survenue.";
    console.error('Like Action - Erreur inattendue:', error);
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
