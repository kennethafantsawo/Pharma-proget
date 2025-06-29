
'use client';

import { useState } from 'react';
import { usePharmacies } from '@/hooks/use-pharmacies';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { PharmacyCard } from '@/components/pharmacy/pharmacy-card';
import { WeekNavigator } from '@/components/pharmacy/week-navigator';
import { MapDisplay } from '@/components/pharmacy/map-display';
import { Chatbot } from '@/components/chatbot/chatbot';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { type Pharmacy } from '@/lib/types';

export default function Home() {
  const {
    data,
    loading,
    error,
    currentSchedule,
    currentWeekIndex,
    goToWeek,
    goToNextWeek,
    goToPrevWeek,
    isFirstWeek,
    isLastWeek,
  } = usePharmacies();
  
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  const LoadingSkeleton = () => (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    </div>
  );

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8">
        {loading && <LoadingSkeleton />}
        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && currentSchedule && (
          <>
            <div className="mb-8">
              <WeekNavigator
                schedules={data}
                currentWeekIndex={currentWeekIndex}
                onWeekChange={goToWeek}
                onPrev={goToPrevWeek}
                onNext={goToNextWeek}
                isFirstWeek={isFirstWeek}
                isLastWeek={isLastWeek}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-6">
                 {currentSchedule.pharmacies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentSchedule.pharmacies.map((pharmacy) => (
                          <div key={pharmacy.nom} onMouseEnter={() => setSelectedPharmacy(pharmacy)} onMouseLeave={() => setSelectedPharmacy(null)}>
                            <PharmacyCard pharmacy={pharmacy} />
                          </div>
                        ))}
                    </div>
                 ) : (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Aucune pharmacie</AlertTitle>
                        <AlertDescription>
                            Aucune pharmacie de garde n'est enregistrée pour cette semaine.
                        </AlertDescription>
                    </Alert>
                 )}
              </div>
              <aside className="hidden lg:block sticky top-24">
                <MapDisplay pharmacies={currentSchedule.pharmacies} selectedPharmacyName={selectedPharmacy?.nom}/>
              </aside>
            </div>
          </>
        )}
      </div>
      <Chatbot />
    </PageWrapper>
  );
}
