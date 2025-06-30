'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { WeekSchedule } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function updatePharmaciesAction(password: string, newSchedules: WeekSchedule[]): Promise<{ success: boolean; message: string }> {
  // Check for Supabase admin client initialization first
  if (!supabaseAdmin) {
    return { 
      success: false, 
      message: "Échec de la connexion : La configuration côté serveur est manquante. Assurez-vous que les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont correctement configurées." 
    }
  }

  // This is a basic password check and is not secure for production.
  // In a real application, you should use a proper authentication system like Supabase Auth.
  if (password !== 'kenneth18') {
    return { success: false, message: 'Mot de passe incorrect.' }
  }

  try {
    // For robust production use, this entire operation should be a single transaction.
    // The easiest way to do this in Supabase is with an RPC (database function).
    
    // 1. Delete all existing data from tables.
    const { error: deletePharmaciesError } = await supabaseAdmin.from('pharmacies').delete().gt('id', -1);
    if (deletePharmaciesError) throw new Error(`Erreur lors de la suppression des pharmacies: ${deletePharmaciesError.message}`);

    const { error: deleteWeeksError } = await supabaseAdmin.from('weeks').delete().gt('id', -1);
    if (deleteWeeksError) throw new Error(`Erreur lors de la suppression des semaines: ${deleteWeeksError.message}`);

    // 2. Insert the new data.
    for (const schedule of newSchedules) {
      // Insert the week and get its new ID
      const { data: weekData, error: weekError } = await supabaseAdmin
        .from('weeks')
        .insert({ semaine: schedule.semaine })
        .select('id')
        .single()

      if (weekError) throw new Error(`Erreur lors de l'insertion de la semaine '${schedule.semaine}': ${weekError.message}`);
      
      const weekId = weekData.id;

      if (schedule.pharmacies && schedule.pharmacies.length > 0) {
        // Prepare all pharmacies for this week for insertion.
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
    
    // Invalidate the cache for the home page so it shows the new data.
    revalidatePath('/')

    return { success: true, message: 'Les données des pharmacies ont été mises à jour avec succès.' }
  } catch (error) {
    console.error('Error in updatePharmaciesAction:', error)
    let errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.'
    // Provide a more helpful error message if a table is missing.
    if (errorMessage.includes('does not exist')) {
        errorMessage = `La table requise n'existe pas dans la base de données. Veuillez vérifier que vous avez bien exécuté le script SQL de création des tables. [Message original: ${errorMessage}]`
    }
    return { success: false, message: `Échec de la mise à jour : ${errorMessage}` }
  }
}
