
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching health posts:", error);
    return { posts: null, error: "Impossible de charger les fiches santé. La table 'health_posts' existe-t-elle bien avec toutes ses colonnes (dont 'likes') ?" };
  }
  return { posts: data, error: null };
}


export default async function HealthLibraryPage() {
  const { posts, error } = await getHealthPosts();

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 text-center">
            <div className="inline-block p-4 bg-accent/10 rounded-xl">
              <BookOpen className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-4xl font-bold font-headline text-foreground mt-4">Fiches Santé</h1>
            <p className="text-muted-foreground mt-2 text-lg">
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

          <div className="space-y-8">
            {posts && posts.length > 0 ? (
              posts.map((post, index) => (
                <div key={post.id} style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                  <HealthPostCard post={post} />
                </div>
              ))
            ) : !error && (
              <Alert>
                <AlertCircle className="h-4 w-4"/>
                <AlertTitle>Aucune Fiche Santé</AlertTitle>
                <AlertDescription>
                  Aucune fiche n'a été publiée pour le moment. Revenez bientôt !
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
