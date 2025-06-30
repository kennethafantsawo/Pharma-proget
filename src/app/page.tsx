
'use client';

import { useState, useEffect } from 'react';
import { usePharmacies } from '@/hooks/use-pharmacies';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PharmacyCard } from '@/components/pharmacy/pharmacy-card';
import { WeekNavigator } from '@/components/pharmacy/week-navigator';
import { MapDisplay } from '@/components/pharmacy/map-display';
import { Chatbot } from '@/components/chatbot/chatbot';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { AlertCircle, CalendarX, Search, Frown, Pill, BookOpen } from 'lucide-react';
import { type Pharmacy, type HealthPost } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabase/client';
import { HealthPostCard } from '@/app/health-library/HealthPostCard';


export default function Home() {
  // Pharmacy logic
  const {
    data: pharmacySchedules,
    loading: pharmaciesLoading,
    error: pharmaciesError,
    currentSchedule,
    currentWeekIndex,
    goToWeek,
    goToNextWeek,
    goToPrevWeek,
    isFirstWeek,
    isLastWeek,
  } = usePharmacies();
  
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Health Posts logic
  const [healthPosts, setHealthPosts] = useState<HealthPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    const getHealthPosts = async () => {
      if (!supabase) {
        setPostsError("La connexion à la base de données a échoué. Veuillez vérifier la configuration.");
        setPostsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('health_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching health posts:", error);
        setPostsError("Impossible de charger les fiches santé.");
        setHealthPosts([]);
      } else {
        setHealthPosts(data || []);
      }
      setPostsLoading(false);
    };

    getHealthPosts();
  }, []);

  const PharmacyLoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-40 rounded-lg" />
            </div>
        </div>
        <div className="hidden lg:block">
            <Skeleton className="h-96 rounded-lg" />
        </div>
    </div>
  );

  const filteredPharmacies = currentSchedule?.pharmacies.filter(p =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.localisation.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <Tabs defaultValue="pharmacies" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                <TabsTrigger value="pharmacies"><Pill className="mr-2" />Pharmacies</TabsTrigger>
                <TabsTrigger value="health-posts"><BookOpen className="mr-2" />Fiches Santé</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pharmacies">
                {pharmaciesLoading && <PharmacyLoadingSkeleton />}
                {pharmaciesError && (
                  <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{pharmaciesError}</AlertDescription>
                  </Alert>
                )}
                {!pharmaciesLoading && !pharmaciesError && pharmacySchedules.length > 0 && (
                  <div className="flex flex-col gap-8">
                    <WeekNavigator
                      schedules={pharmacySchedules}
                      currentWeekIndex={currentWeekIndex}
                      onWeekChange={goToWeek}
                      onPrev={goToPrevWeek}
                      onNext={goToNextWeek}
                      isFirstWeek={isFirstWeek}
                      isLastWeek={isLastWeek}
                    />
                    {currentSchedule && (
                      <div className="relative max-w-lg mx-auto w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Rechercher une pharmacie par nom ou zone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    )}
                  </div>
                )}

                {!pharmaciesLoading && !pharmaciesError && (
                    currentSchedule ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-8">
                            <div className="lg:col-span-2 space-y-6">
                                {filteredPharmacies.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredPharmacies.map((pharmacy) => (
                                            <div key={pharmacy.nom} onMouseEnter={() => setSelectedPharmacy(pharmacy)} onMouseLeave={() => setSelectedPharmacy(null)}>
                                                <PharmacyCard pharmacy={pharmacy} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert>
                                        <Frown className="h-4 w-4" />
                                        <AlertTitle>Aucun résultat</AlertTitle>
                                        <AlertDescription>
                                            Aucune pharmacie ne correspond à votre recherche pour cette semaine.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                            <aside className="hidden lg:block sticky top-24">
                                <MapDisplay pharmacies={currentSchedule.pharmacies} selectedPharmacyName={selectedPharmacy?.nom}/>
                            </aside>
                        </div>
                    ) : (
                        pharmacySchedules.length > 0 && !pharmaciesLoading && (
                            <Alert className="max-w-2xl mx-auto mt-8">
                                <CalendarX className="h-4 w-4" />
                                <AlertTitle>Aucun planning pour aujourd'hui</AlertTitle>
                                <AlertDescription>
                                    La date actuelle ne correspond à aucune semaine de garde programmée. Veuillez utiliser le sélecteur ci-dessus pour choisir une autre semaine.
                                </AlertDescription>
                            </Alert>
                        )
                    )
                )}
                
                {!pharmaciesLoading && !pharmaciesError && pharmacySchedules.length === 0 && (
                     <Alert className="max-w-2xl mx-auto mt-8">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Aucune Donnée</AlertTitle>
                        <AlertDescription>Aucune donnée de pharmacie n'a été trouvée. L'administrateur doit en charger via la page 'Options'.</AlertDescription>
                    </Alert>
                )}
            </TabsContent>

            <TabsContent value="health-posts">
                <div className="max-w-2xl mx-auto">
                    {postsLoading && (
                        <div className="space-y-6">
                           <Skeleton className="h-64 w-full rounded-lg" />
                           <Skeleton className="h-64 w-full rounded-lg" />
                        </div>
                    )}
                    {postsError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertTitle>Erreur de chargement</AlertTitle>
                            <AlertDescription>{postsError}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-6">
                        {!postsLoading && !postsError && healthPosts.length > 0 ? (
                            healthPosts.map(post => (
                                <HealthPostCard key={post.id} post={post} />
                            ))
                        ) : !postsLoading && !postsError && (
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
            </TabsContent>
        </Tabs>

      </div>
      <Chatbot />
    </PageWrapper>
  );
}
