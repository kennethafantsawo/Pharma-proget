'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';

const FeedbackSchema = z.object({
  type: z.enum(['avis', 'suggestion']),
  content: z.string().min(10).max(500),
});

export async function submitFeedbackAction(
  data: z.infer<typeof FeedbackSchema>
): Promise<{ success: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: "Configuration Supabase (côté serveur) manquante. Veuillez ajouter NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY à votre fichier .env." };
  }

  const validatedData = FeedbackSchema.safeParse(data);
  if (!validatedData.success) {
    return { success: false, error: 'Données invalides.' };
  }

  const { error } = await supabaseAdmin.from('user_feedback').insert({
    type: validatedData.data.type,
    content: validatedData.data.content,
  });

  if (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: 'Impossible de soumettre votre message.' };
  }

  return { success: true };
}
