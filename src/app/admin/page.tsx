
'use client';

import { useState, useTransition, type ChangeEvent, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { PageWrapper } from '@/components/shared/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { Lock, Settings, LogOut, CheckCircle, AlertTriangle, LoaderCircle, Trash2, Newspaper, Upload, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

import type { WeekSchedule, HealthPost } from '@/lib/types';
import { updatePharmaciesAction, createHealthPostAction, deleteHealthPostAction } from './actions';
import { supabase } from '@/lib/supabase/client';

const LoginSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis.'),
});
type LoginValues = z.infer<typeof LoginSchema>;

const HealthPostSchema = z.object({
  title: z.string().min(3, 'Le titre est requis.'),
  content: z.string().min(10, 'Le contenu est requis.'),
  image_url: z.string().url('Veuillez entrer une URL valide.').optional().or(z.literal('')),
});
type HealthPostValues = z.infer<typeof HealthPostSchema>;

// Admin Panel Component
const AdminPanel = ({ onLogout, password }: { onLogout: () => void, password: string }) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [posts, setPosts] = useState<HealthPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HealthPostValues>({
      resolver: zodResolver(HealthPostSchema)
  });

  useEffect(() => {
    const fetchPosts = async () => {
      if (!supabase) return;
      setIsLoadingPosts(true);
      const { data, error } = await supabase.from('health_posts').select('*').order('created_at', { ascending: false });
      if (data) setPosts(data);
      if (error) toast({ title: "Erreur", description: "Impossible de charger les fiches santé.", variant: "destructive" });
      setIsLoadingPosts(false);
    };
    fetchPosts();
  }, [toast]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Erreur de lecture du fichier.");
        
        const jsonData = JSON.parse(text);

        if (!Array.isArray(jsonData) || !jsonData.every(item => 'semaine' in item && 'pharmacies' in item)) {
            throw new Error("Le fichier JSON n'a pas la structure attendue.");
        }
        
        startTransition(async () => {
          const result = await updatePharmaciesAction(password, jsonData as WeekSchedule[]);
          if (result.success) {
            toast({ title: "Succès", description: result.message });
          } else {
            toast({ title: "Erreur", description: result.message, variant: "destructive" });
          }
        });
      } catch (error) {
        toast({ title: "Erreur de Fichier", description: error instanceof Error ? error.message : "Un problème est survenu.", variant: "destructive" });
      }
    };
    reader.onerror = () => toast({ title: "Erreur", description: "Impossible de lire le fichier.", variant: "destructive" });
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };
  
  const onPostSubmit: SubmitHandler<HealthPostValues> = (data) => {
    startTransition(async () => {
      const result = await createHealthPostAction(password, data);
      if (result.success && result.newPost) {
        toast({ title: "Succès", description: result.message });
        setPosts(prev => [result.newPost!, ...prev]);
        reset();
      } else {
        toast({ title: "Erreur", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleDeletePost = (postId: number) => {
    startTransition(async () => {
      const result = await deleteHealthPostAction(password, postId);
      if (result.success) {
        toast({ title: "Succès", description: result.message });
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        toast({ title: "Erreur", description: result.message, variant: "destructive" });
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Settings/>Panneau d'Administration</span>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="mr-2 h-4 w-4"/>Se déconnecter</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pharmacies">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pharmacies"><Upload className="mr-2" />Pharmacies</TabsTrigger>
            <TabsTrigger value="health-posts"><Newspaper className="mr-2" />Fiches Santé</TabsTrigger>
          </TabsList>
          <TabsContent value="pharmacies" className="mt-4">
            <CardDescription className="mb-4">
              Remplacez les données des pharmacies de garde en chargeant un nouveau fichier JSON.
            </CardDescription>
            <div className="space-y-2">
              <Label htmlFor="pharmacy-file">Nouveau fichier pharmacies.json</Label>
              <Input id="pharmacy-file" type="file" accept=".json" onChange={handleFileChange} disabled={isPending} />
              {isPending && <p className="text-sm text-muted-foreground flex items-center gap-2"><LoaderCircle className="animate-spin h-4 w-4" /> Mise à jour en cours...</p>}
            </div>
          </TabsContent>
          <TabsContent value="health-posts" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><PlusCircle />Créer une Fiche Santé</h3>
                <form onSubmit={handleSubmit(onPostSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input id="title" {...register('title')} disabled={isPending} />
                    {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="content">Contenu</Label>
                    <Textarea id="content" {...register('content')} disabled={isPending} rows={5} />
                    {errors.content && <p className="text-destructive text-sm mt-1">{errors.content.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="image_url">URL de l'image (Optionnel)</Label>
                    <Input id="image_url" {...register('image_url')} placeholder="https://..." disabled={isPending}/>
                    {errors.image_url && <p className="text-destructive text-sm mt-1">{errors.image_url.message}</p>}
                  </div>
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? <LoaderCircle className="animate-spin" /> : 'Publier la fiche'}
                  </Button>
                </form>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Fiches Existantes</h3>
                <ScrollArea className="h-96 rounded-md border p-4">
                  {isLoadingPosts ? <p>Chargement...</p> : 
                    posts.length > 0 ? (
                      <div className="space-y-4">
                        {posts.map(post => (
                          <Card key={post.id} className="flex items-center justify-between p-3">
                            <div>
                               <p className="font-semibold">{post.title}</p>
                               <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                            </div>
                            <Button variant="destructive" size="icon" onClick={() => handleDeletePost(post.id)} disabled={isPending}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Aucune fiche santé trouvée.</p>
                    )
                  }
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const LoginForm = ({ onLogin }: { onLogin: (password: string) => void }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema)
    });
    const { toast } = useToast();

    const onSubmit: SubmitHandler<LoginValues> = (data) => {
        if (data.password === 'kenneth18') {
            onLogin(data.password);
            toast({ title: "Connexion réussie", description: "Bienvenue dans le panneau d'administration." });
        } else {
            toast({ title: "Erreur d'authentification", description: "Mot de passe incorrect.", variant: "destructive" });
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock/>Accès Administrateur</CardTitle>
                <CardDescription>Veuillez entrer le mot de passe pour accéder aux options.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full">Se Connecter</Button>
                </form>
            </CardContent>
        </Card>
    )
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (pass: string) => {
    setPassword(pass);
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setPassword('');
    setIsLoggedIn(false);
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoggedIn ? (
            <AdminPanel onLogout={handleLogout} password={password} />
          ) : (
            <LoginForm onLogin={handleLogin} />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
