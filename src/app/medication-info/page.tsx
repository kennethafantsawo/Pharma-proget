
'use client';

import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, LoaderCircle, Pill, AlertTriangle, ShieldAlert, HeartPulse } from 'lucide-react';
import { medicationInfo, type MedicationInfoOutput } from '@/ai/flows/medication-info';

const SearchSchema = z.object({
  medicationName: z.string().min(2, 'Veuillez entrer un nom de médicament.'),
});

type SearchValues = z.infer<typeof SearchSchema>;

export default function MedicationInfoPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<MedicationInfoOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SearchValues>({
    resolver: zodResolver(SearchSchema),
  });

  const onSubmit: SubmitHandler<SearchValues> = (data) => {
    setResult(null);
    setError(null);
    startTransition(async () => {
      try {
        const response = await medicationInfo({ medicationName: data.medicationName });
        setResult(response);
      } catch (e) {
        console.error(e);
        setError('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer les informations pour ce médicament.',
          variant: 'destructive',
        });
      }
    });
  };
  
  const InfoCard = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-accent">
                {icon}
                <span className="font-headline text-xl">{title}</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="whitespace-pre-wrap">{content}</p>
        </CardContent>
    </Card>
  );


  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <div className="inline-block p-4 bg-accent/10 rounded-xl">
              <Pill className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-4xl font-bold font-headline text-foreground mt-4">Informations Médicaments</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Recherchez des informations détaillées sur un médicament.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2 mb-8">
            <div className="flex-1">
              <div className="relative">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input
                    {...register('medicationName')}
                    placeholder="Entrez le nom d'un médicament (ex: Paracétamol)"
                    className="pl-11"
                    disabled={isPending}
                />
              </div>
              {errors.medicationName && <p className="text-destructive text-sm mt-1">{errors.medicationName.message}</p>}
            </div>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? <LoaderCircle className="animate-spin" /> : 'Rechercher'}
            </Button>
          </form>

          {isPending && (
             <div className="space-y-4">
                <Card><CardHeader><CardTitle><LoaderCircle className="animate-spin text-accent" /></CardTitle></CardHeader><CardContent>Recherche en cours...</CardContent></Card>
             </div>
          )}
          
          {error && <p className="text-destructive text-center">{error}</p>}

          {result && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
                <h2 className="text-3xl font-bold text-center font-headline">{result.name}</h2>
                <InfoCard icon={<Pill />} title="Description" content={result.description} />
                <InfoCard icon={<HeartPulse />} title="Posologie" content={result.dosage} />
                <InfoCard icon={<AlertTriangle />} title="Effets secondaires" content={result.sideEffects} />
                <InfoCard icon={<ShieldAlert />} title="Contre-indications" content={result.contraindications} />
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}

