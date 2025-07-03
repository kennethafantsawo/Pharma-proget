
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { HealthPost } from '@/lib/types'
import { revalidatePath } from 'next/cache'

const BUCKET_NAME = 'health-posts-images';

// Helper to extract file path from a public URL
function getPathFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const urlObject = new URL(url);
    // Path is something like /storage/v1/object/public/bucket-name/file-name.png
    // We want to extract "file-name.png"
    const parts = urlObject.pathname.split(`/${BUCKET_NAME}/`);
    return parts[1] || null;
  } catch (error) {
    console.error('Invalid URL for storage object:', error);
    return null;
  }
}


export async function updatePharmaciesAction(password: string, newSchedules: any[]): Promise<{ success: boolean; message: string }> {
  if (!supabaseAdmin) {
    return { 
      success: false, 
      message: "Échec de la connexion : La configuration côté serveur est manquante. Assurez-vous que les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont correctement configurées." 
    }
  }

  if (password !== 'kenneth18') {
    return { success: false, message: 'Mot de passe incorrect.' }
  }

  try {
    // ... (pharmacy update logic remains the same)
    const { error: deletePharmaciesError } = await supabaseAdmin.from('pharmacies').delete().gt('id', -1);
    if (deletePharmaciesError) throw new Error(`Erreur lors de la suppression des pharmacies: ${deletePharmaciesError.message}`);

    const { error: deleteWeeksError } = await supabaseAdmin.from('weeks').delete().gt('id', -1);
    if (deleteWeeksError) throw new Error(`Erreur lors de la suppression des semaines: ${deleteWeeksError.message}`);

    for (const schedule of newSchedules) {
      const { data: weekData, error: weekError } = await supabaseAdmin
        .from('weeks')
        .insert({ semaine: schedule.semaine })
        .select('id')
        .single()

      if (weekError) throw new Error(`Erreur lors de l'insertion de la semaine '${schedule.semaine}': ${weekError.message}`);
      
      const weekId = weekData.id;

      if (schedule.pharmacies && schedule.pharmacies.length > 0) {
        const pharmaciesToInsert = schedule.pharmacies.map(p => ({
          nom: p.nom,
          localisation: p.localisation,
          contact1: p.contact1,
          contact2: p.contact2,
          week_id: weekId,
        }));

        const { error: pharmacyError } = await supabaseAdmin.from('pharmacies').insert(pharmaciesToInsert);
        if (pharmacyError) throw new Error(`Erreur lors de l'insertion des pharmacies pour la semaine '${schedule.semaine}': ${pharmacyError.message}`);
      }
    }
    
    revalidatePath('/')
    return { success: true, message: 'Les données des pharmacies ont été mises à jour avec succès.' }
  } catch (error) {
    console.error('Error in updatePharmaciesAction:', error)
    let errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
    if (errorMessage.includes('does not exist')) {
        errorMessage = `La table requise n'existe pas. Veuillez exécuter le script SQL de création. [Message original: ${errorMessage}]`
    }
    return { success: false, message: `Échec de la mise à jour : ${errorMessage}` }
  }
}

// --- Health Posts Actions ---

export async function createHealthPostAction(
  password: string, 
  formData: FormData
): Promise<{ success: boolean; message: string; newPost?: HealthPost }> {
  if (!supabaseAdmin) return { success: false, message: "Configuration serveur manquante." };
  if (password !== 'kenneth18') return { success: false, message: 'Mot de passe incorrect.' };

  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const imageFile = formData.get('image') as File | null;
    const publishAt = formData.get('publish_at') as string | null;
    let imageUrl: string | null = null;

    if (!title || !content) {
      return { success: false, message: "Le titre et le contenu sont requis." };
    }

    if (imageFile && imageFile.size > 0) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(fileName, imageFile);
      if (uploadError) throw new Error(`Échec du téléversement de l'image : ${uploadError.message}`);
      
      const { data: urlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('health_posts')
      .insert({ title, content, image_url: imageUrl, publish_at: publishAt })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/health-library');
    return { success: true, message: 'Fiche santé créée avec succès.', newPost: data as HealthPost };

  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    return { success: false, message: `Échec de la création : ${message}` };
  }
}

export async function updateHealthPostAction(
  password: string, 
  postId: number,
  formData: FormData
): Promise<{ success: boolean; message: string; updatedPost?: HealthPost }> {
  if (!supabaseAdmin) return { success: false, message: "Configuration serveur manquante." };
  if (password !== 'kenneth18') return { success: false, message: 'Mot de passe incorrect.' };

  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const imageFile = formData.get('image') as File | null;
    const publishAt = formData.get('publish_at') as string; // 'null' if not sent, '' if cleared, or ISO string

    if (!title || !content) {
      return { success: false, message: "Le titre et le contenu sont requis." };
    }

    const { data: currentPost, error: fetchError } = await supabaseAdmin
      .from('health_posts').select('image_url').eq('id', postId).single();
    if (fetchError) throw new Error("Impossible de trouver la fiche à mettre à jour.");

    let imageUrl = currentPost.image_url;

    if (imageFile && imageFile.size > 0) {
      if (currentPost.image_url) {
        const oldPath = getPathFromUrl(currentPost.image_url);
        if (oldPath) await supabaseAdmin.storage.from(BUCKET_NAME).remove([oldPath]);
      }
      
      const newFileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET_NAME).upload(newFileName, imageFile);
      if (uploadError) throw new Error(`Échec du téléversement de la nouvelle image : ${uploadError.message}`);
      
      imageUrl = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(newFileName).data.publicUrl;
    }

    const updatePayload: {
      title: string;
      content: string;
      image_url: string | null;
      publish_at?: string | null;
    } = { title, content, image_url: imageUrl };

    // Only update publish_at if it was part of the form data
    if (publishAt !== null) {
        updatePayload.publish_at = publishAt ? publishAt : null;
    }

    const { data, error } = await supabaseAdmin
      .from('health_posts')
      .update(updatePayload)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/health-library');
    return { success: true, message: 'Fiche santé mise à jour.', updatedPost: data as HealthPost };

  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    return { success: false, message: `Échec de la mise à jour : ${message}` };
  }
}


export async function deleteHealthPostAction(
  password: string, 
  postId: number
): Promise<{ success: boolean; message: string }> {
  if (!supabaseAdmin) return { success: false, message: "Configuration serveur manquante." };
  if (password !== 'kenneth18') return { success: false, message: 'Mot de passe incorrect.' };

  try {
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('health_posts').select('image_url').eq('id', postId).single();
    
    if (fetchError) {
      // If it's already deleted, that's fine.
      if (fetchError.code === 'PGRST116') {
        revalidatePath('/health-library');
        return { success: true, message: 'Fiche santé déjà supprimée.' };
      }
      throw fetchError;
    }

    // Delete image from storage if it exists
    if (post.image_url) {
      const imagePath = getPathFromUrl(post.image_url);
      if (imagePath) {
        const { error: storageError } = await supabaseAdmin.storage.from(BUCKET_NAME).remove([imagePath]);
        if (storageError) console.error(`Could not delete image from storage: ${storageError.message}`);
      }
    }

    const { error: deleteError } = await supabaseAdmin.from('health_posts').delete().eq('id', postId);
    if (deleteError) throw deleteError;

    revalidatePath('/health-library');
    return { success: true, message: 'Fiche santé supprimée.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    return { success: false, message: `Échec de la suppression : ${message}` };
  }
}
