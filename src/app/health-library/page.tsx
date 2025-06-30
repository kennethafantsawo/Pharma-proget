
import { supabase } from '@/lib/supabase/client';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, AlertCircle, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import Image from 'next/image';
import { type HealthPost } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    return { posts: null, error: "Impossible de charger les fiches santé. La table 'health_posts' existe-t-elle ?" };
  }
  return { posts: data, error: null };
}

const PostActions = () => (
  <CardFooter className="flex justify-start gap-4">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
            <ThumbsUp className="mr-2 h-4 w-4" /> J'aime
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Prochainement disponible</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
            <MessageCircle className="mr-2 h-4 w-4" /> Commenter
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Prochainement disponible</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
            <Share2 className="mr-2 h-4 w-4" /> Partager
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Prochainement disponible</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </CardFooter>
);

export default async function HealthLibraryPage() {
  const { posts, error } = await getHealthPosts();

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-primary mb-2" />
            <h1 className="text-3xl font-bold font-headline text-primary">Fiches Santé</h1>
            <p className="text-muted-foreground mt-2">
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

          <div className="space-y-6">
            {posts && posts.length > 0 ? (
              posts.map(post => (
                <Card key={post.id} className="w-full">
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      Publié le {new Date(post.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {post.image_url && (
                      <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden">
                        <Image 
                            src={post.image_url} 
                            alt={post.title} 
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <p className="text-base text-foreground/90 whitespace-pre-wrap">{post.content}</p>
                  </CardContent>
                  <PostActions />
                </Card>
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
