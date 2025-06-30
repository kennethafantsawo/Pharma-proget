
'use client';

import { useState, useTransition, type ChangeEvent, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { PageWrapper } from '@/components/shared/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { Lock, Settings, LogOut, CheckCircle, AlertTriangle, LoaderCircle, Trash2, Newspaper, Upload, PlusCircle, Pencil, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

import type { WeekSchedule, HealthPost } from '@/lib/types';
import { createHealthPostAction, deleteHealthPostAction, updateHealthPostAction, updatePharmaciesAction } from './actions';
import { supabase } from '@/lib/supabase/client';

const LoginSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis.'),
});
type LoginValues = z.infer<typeof LoginSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const HealthPostSchema = z.object({
  title: z.string().min(3, 'Le titre est requis.'),
  content: z.string().min(10, 'Le contenu est requis.'),
  image: z
    .custom<FileList>()
    .optional()
    .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, `La taille maximale de l'image est de 5Mo.`)
    .refine((files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type), "Seuls les formats .jpg, .jpeg, .png et .webp sont acceptés."),
});
type HealthPostValues = z.infer<typeof HealthPostSchema>;

// Admin Panel Component
const AdminPanel = ({ onLogout, password }: { onLogout: () => void, password: string }) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [posts, setPosts] = useState<HealthPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [editingPost, setEditingPost] = useState<HealthPost | null>(null);

  const createForm = useForm<HealthPostValues>({ resolver: zodResolver(HealthPostSchema) });
  const editForm = useForm<HealthPostValues>({ resolver: zodResolver(HealthPostSchema) });

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
  
  useEffect(() => {
    if (editingPost) {
        editForm.reset({
            title: editingPost.title,
            content: editingPost.content,
        });
    }
  }, [editingPost, editForm]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Logic for updating pharmacies JSON
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
  
  const onCreatePostSubmit: SubmitHandler<HealthPostValues> = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    startTransition(async () => {
      const result = await createHealthPostAction(password, formData);
      if (result.success && result.newPost) {
        toast({ title: "Succès", description: result.message });
        setPosts(prev => [result.newPost!, ...prev]);
        createForm.reset();
      } else {
        toast({ title: "Erreur", description: result.message, variant: "destructive" });
      }
    });
  };

  const onEditPostSubmit: SubmitHandler<HealthPostValues> = (data) => {
    if (!editingPost) return;

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    startTransition(async () => {
      const result = await updateHealthPostAction(password, editingPost.id, formData);
      if (result.success && result.updatedPost) {
        toast({ title: "Succès", description: result.message });
        setPosts(prev => prev.map(p => p.id === editingPost.id ? result.updatedPost! : p));
        setEditingPost(null);
      } else {
        toast({ title: "Erreur", description: result.message, variant: "destructive" });
      }
    });
  }

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
                <form onSubmit={createForm.handleSubmit(onCreatePostSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input id="title" {...createForm.register('title')} disabled={isPending} />
                    {createForm.formState.errors.title && <p className="text-destructive text-sm mt-1">{createForm.formState.errors.title.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="content">Contenu</Label>
                    <Textarea id="content" {...createForm.register('content')} disabled={isPending} rows={5} />
                    {createForm.formState.errors.content && <p className="text-destructive text-sm mt-1">{createForm.formState.errors.content.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="image">Image (Optionnel, 5Mo max)</Label>
                    <Input id="image" type="file" accept="image/*" {...createForm.register('image')} disabled={isPending}/>
                    {createForm.formState.errors.image && <p className="text-destructive text-sm mt-1">{createForm.formState.errors.image.message}</p>}
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
                            <div className="flex items-center gap-3">
                                {post.image_url ? 
                                  <Image src={post.image_url} alt={post.title} width={40} height={40} className="rounded-md object-cover" /> 
                                  : <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center"><Newspaper className="h-5 w-5 text-muted-foreground"/></div>
                                }
                                <div>
                                   <p className="font-semibold">{post.title}</p>
                                   <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setEditingPost(post)} disabled={isPending}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" disabled={isPending}><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                            <AlertDialogDescription>Cette action est irréversible. La fiche santé "{post.title}" sera définitivement supprimée.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeletePost(post.id)}>Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
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

      <Dialog open={!!editingPost} onOpenChange={(isOpen) => !isOpen && setEditingPost(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Modifier la fiche santé</DialogTitle>
                <DialogDescription>
                    Modifiez les détails de la fiche "{editingPost?.title}". Laissez le champ image vide pour conserver l'actuelle.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(onEditPostSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor="edit-title">Titre</Label>
                    <Input id="edit-title" {...editForm.register('title')} disabled={isPending} />
                    {editForm.formState.errors.title && <p className="text-destructive text-sm mt-1">{editForm.formState.errors.title.message}</p>}
                </div>
                <div>
                    <Label htmlFor="edit-content">Contenu</Label>
                    <Textarea id="edit-content" {...editForm.register('content')} disabled={isPending} rows={5} />
                    {editForm.formState.errors.content && <p className="text-destructive text-sm mt-1">{editForm.formState.errors.content.message}</p>}
                </div>
                <div>
                    <Label htmlFor="edit-image">Nouvelle Image (Optionnel)</Label>
                    <Input id="edit-image" type="file" accept="image/*" {...editForm.register('image')} disabled={isPending}/>
                    {editForm.formState.errors.image && <p className="text-destructive text-sm mt-1">{editForm.formState.errors.image.message}</p>}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <LoaderCircle className="animate-spin" /> : 'Mettre à jour'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
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
