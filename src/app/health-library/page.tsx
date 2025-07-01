
import { supabase } from '@/lib/supabase/client';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, AlertCircle } from 'lucide-react';
import { type HealthPost } from '@/lib/types';
import { HealthPostCard } from './HealthPostCard';

async function getHealthPosts(): Promise<{ posts: HealthPost[] | null; error: string | null }> {
  if (!supabase) {
    return { posts: null, error: "La connexion à la base de données a échoué. Veuillez vérifier la configuration." };
  }
  const { data, error } = await supabase
    .from('health_posts')
    .select('*')
    // Ne récupérer que les fiches publiées (date de publication passée ou nulle)
    .or('publish_at.is.null,publish_at.lte.now()')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching health posts:", error.message);
    let userMessage = "Impossible de charger les fiches santé. La table 'health_posts' existe-t-elle bien avec toutes ses colonnes ?";
    if (error.message.includes('column "likes" does not exist')) {
        userMessage = "La colonne 'likes' est manquante dans la base de données. Veuillez exécuter le script SQL pour l'ajouter et réactualiser la page.";
    } else if (error.message.includes('column "publish_at" does not exist')) {
        userMessage = "La colonne 'publish_at' est manquante dans la base de données. Veuillez exécuter le script SQL pour l'ajouter et réactualiser la page.";
    }
    return { posts: null, error: userMessage };
  }
  return { posts: data, error: null };
}


export default async function HealthLibraryPage() {
  const { posts, error } = await getHealthPosts();

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold font-headline text-foreground">Accueil Fiches Santé</h1>
            <p className="text-muted-foreground mt-1">
              Conseils et actualités santé de nos experts.
            </p>
          </header>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4"/>
              <AlertTitle>Erreur de chargement</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border border-b-0 rounded-t-xl overflow-hidden">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <HealthPostCard key={post.id} post={post} />
              ))
            ) : !error && (
              <div className="p-4 border-b">
                <Alert>
                  <AlertCircle className="h-4 w-4"/>
                  <AlertTitle>Aucune Fiche Santé</AlertTitle>
                  <AlertDescription>
                    Aucune fiche n'a été publiée pour le moment. Revenez bientôt !
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
