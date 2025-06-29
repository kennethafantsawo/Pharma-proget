
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePharmacies } from '@/hooks/use-pharmacies';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { Lock, FileUp, Settings, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import type { WeekSchedule } from '@/lib/types';

// Schema for login form
const LoginSchema = z.object({
  password: z.string().min(1, 'Le mot de passe est requis.'),
});
type LoginValues = z.infer<typeof LoginSchema>;

// Admin Panel Component
const AdminPanel = ({ onLogout }: { onLogout: () => void }) => {
  const { updatePharmacies } = usePharmacies();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Erreur de lecture du fichier.");
        
        const jsonData = JSON.parse(text);

        // Basic validation
        if (!Array.isArray(jsonData) || !jsonData.every(item => 'semaine' in item && 'pharmacies' in item)) {
            throw new Error("Le fichier JSON n'a pas la structure attendue.");
        }
        
        updatePharmacies(jsonData as WeekSchedule[]);
        toast({
          title: "Succès",
          description: "Le fichier des pharmacies a été mis à jour.",
          variant: 'default',
        });
      } catch (error) {
        toast({
          title: "Erreur de Fichier",
          description: error instanceof Error ? error.message : "Un problème est survenu lors du traitement du fichier.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
        toast({
            title: "Erreur",
            description: "Impossible de lire le fichier.",
            variant: "destructive",
        });
        setIsUploading(false);
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
          Remplacez le fichier des pharmacies de garde. Le nouveau fichier sera utilisé immédiatement et mis en cache pour une utilisation hors ligne.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="pharmacy-file">Nouveau fichier pharmacies.json</Label>
          <Input id="pharmacy-file" type="file" accept=".json" onChange={handleFileChange} disabled={isUploading} />
          {isUploading && <p className="text-sm text-muted-foreground">Téléchargement en cours...</p>}
        </div>
        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4"/>
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Assurez-vous que le fichier JSON est valide et correctement formaté. Les modifications sont locales à votre appareil.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};


// Login Form Component
const LoginForm = ({ onLogin }: { onLogin: () => void }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema)
    });
    const { toast } = useToast();

    const onSubmit: SubmitHandler<LoginValues> = (data) => {
        if (data.password === 'kenneth18') {
            onLogin();
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

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {isLoggedIn ? (
            <AdminPanel onLogout={handleLogout} />
          ) : (
            <LoginForm onLogin={handleLogin} />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
