
'use client';

import { useState, useTransition, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { Lock, Settings, LogOut, CheckCircle, AlertTriangle, LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { WeekSchedule } from '@/lib/types';
import { updatePharmaciesAction } from './actions';

// Schema for login form
const LoginSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis.'),
});
type LoginValues = z.infer<typeof LoginSchema>;

// Admin Panel Component
const AdminPanel = ({ onLogout, password }: { onLogout: () => void, password: string }) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

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
            toast({
              title: "Succès",
              description: result.message,
            });
          } else {
            toast({
              title: "Erreur",
              description: result.message,
              variant: "destructive",
            });
          }
        });

      } catch (error) {
        toast({
          title: "Erreur de Fichier",
          description: error instanceof Error ? error.message : "Un problème est survenu lors du traitement du fichier.",
          variant: "destructive",
        });
      }
    };
    reader.onerror = () => {
        toast({
            title: "Erreur",
            description: "Impossible de lire le fichier.",
            variant: "destructive",
        });
    }
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Settings/>Panneau d'Administration</span>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="mr-2 h-4 w-4"/>Se déconnecter</Button>
        </CardTitle>
        <CardDescription>
          Remplacez les données des pharmacies de garde en chargeant un nouveau fichier. Les modifications seront visibles par tous les utilisateurs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="pharmacy-file">Nouveau fichier pharmacies.json</Label>
          <Input id="pharmacy-file" type="file" accept=".json" onChange={handleFileChange} disabled={isPending} />
          {isPending && 
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <LoaderCircle className="animate-spin h-4 w-4" /> 
              Mise à jour en cours...
            </p>
          }
        </div>
        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4"/>
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Assurez-vous que le fichier JSON est valide. Le chargement peut prendre quelques secondes. La page d'accueil sera mise à jour automatiquement.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};


// Login Form Component
const LoginForm = ({ onLogin }: { onLogin: (password: string) => void }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema)
    });
    const { toast } = useToast();

    const onSubmit: SubmitHandler<LoginValues> = (data) => {
        // This is not secure. In a real app, you would not handle passwords this way.
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


// Main Page Component
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
        <div className="max-w-2xl mx-auto">
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
