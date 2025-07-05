
'use client';

import { useState, useMemo } from 'react';
import { usePharmacies } from '@/hooks/use-pharmacies';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PharmacyCard } from '@/components/pharmacy/pharmacy-card';
import { WeekNavigator } from '@/components/pharmacy/week-navigator';
import { MapDisplay } from '@/components/pharmacy/map-display';
import { Chatbot } from '@/components/chatbot/chatbot';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { AlertCircle, CalendarX, Search, Frown, LocateFixed, LoaderCircle } from 'lucide-react';
import { type Pharmacy } from '@/lib/types';
import { Button } from '@/components/ui/button';

// Haversine distance function to calculate distance between two coordinates
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}


export default function Home() {
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
  
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'loading' | 'granted' | 'denied'>('prompt');

  const handleRequestLocation = () => {
    setLocationStatus('loading');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('granted');
        },
        () => {
          setLocationStatus('denied');
        }
      );
    } else {
      setLocationStatus('denied');
    }
  };
  
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

  const sortedAndFilteredPharmacies = useMemo(() => {
    let pharmacies = currentSchedule?.pharmacies.filter(p =>
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.localisation.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? [];

    if (locationStatus === 'granted' && userLocation) {
      return pharmacies
        .map(pharmacy => ({
          ...pharmacy,
          distance: (pharmacy.latitude && pharmacy.longitude)
            ? getDistance(userLocation.latitude, userLocation.longitude, pharmacy.latitude, pharmacy.longitude)
            : Infinity,
        }))
        .sort((a, b) => a.distance - b.distance);
    }
    
    // Fallback to alphabetical sort
    return pharmacies.sort((a, b) => a.nom.localeCompare(b.nom));
  }, [currentSchedule, searchTerm, userLocation, locationStatus]);


  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-500">
        {pharmaciesLoading && <PharmacyLoadingSkeleton />}
        {pharmaciesError && (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{pharmaciesError}</AlertDescription>
          </Alert>
        )}
        {!pharmaciesLoading && !pharmaciesError && pharmacySchedules.length > 0 && (
          <div className="flex flex-col gap-8 mb-8">
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
              <>
                <div className="relative max-w-lg mx-auto w-full flex items-center gap-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher par nom ou zone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11"
                    />
                  </div>
                  <Button onClick={handleRequestLocation} variant="outline" size="icon" disabled={locationStatus === 'loading' || locationStatus === 'granted'} title="Trier par proximité">
                    {locationStatus === 'loading' ? <LoaderCircle className="animate-spin" /> : <LocateFixed />}
                    <span className="sr-only">Trier par proximité</span>
                  </Button>
                </div>
                {locationStatus === 'denied' && (
                  <Alert variant="default" className="max-w-lg mx-auto text-sm bg-amber-50 border-amber-200 text-amber-800">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle>Localisation refusée</AlertTitle>
                      <AlertDescription>Le tri par distance est désactivé. Activez la localisation dans les paramètres de votre navigateur pour utiliser cette fonction.</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        )}

        {!pharmaciesLoading && !pharmaciesError && (
            currentSchedule ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        {sortedAndFilteredPharmacies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sortedAndFilteredPharmacies.map((pharmacy: any) => (
                                    <div key={pharmacy.nom} onMouseEnter={() => setSelectedPharmacy(pharmacy)} onMouseLeave={() => setSelectedPharmacy(null)}>
                                        <PharmacyCard pharmacy={pharmacy} distance={pharmacy.distance} />
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
                    <Alert className="max-w-2xl mx-auto">
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
             <Alert className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Aucune Donnée</AlertTitle>
                <AlertDescription>Aucune donnée de pharmacie n'a été trouvée. L'administrateur doit en charger via la page 'Options'.</AlertDescription>
            </Alert>
        )}
      </div>
      <Chatbot />
    </PageWrapper>
  );
}
