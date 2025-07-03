
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
    const rpcName = unlike ? 'decrement_likes' : 'increment_likes';
    const params = unlike ? { post_id_to_dec: postId } : { post_id_to_inc: postId };
    
    const { error } = await supabaseAdmin.rpc(rpcName, params);

    if (error) {
      console.error(`Error calling RPC ${rpcName}:`, error);
       if (error.message.includes('function') && error.message.includes('does not exist')) {
        return { success: false, error: `La fonction '${rpcName}' est manquante dans la base de données. Veuillez exécuter le script SQL pour l'ajouter.` };
      }
      return { success: false, error: "Erreur lors de la mise à jour du like. Assurez-vous d'avoir exécuté le script SQL nécessaire." };
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
