
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import type { Pharmacy } from '@/lib/types';

interface MapDisplayProps {
  pharmacies: Pharmacy[];
  selectedPharmacyName?: string | null;
}

export function MapDisplay({ pharmacies, selectedPharmacyName }: MapDisplayProps) {
  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-primary">
          <MapPin />
          Carte des Pharmacies
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div 
            data-ai-hint="map background"
            className="relative flex-1 rounded-lg bg-muted/50 p-4 border-dashed border-2 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://placehold.co/600x400.png')" }}>
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center">
            <h3 className="font-semibold text-lg text-foreground">Vue Carte</h3>
            <p className="text-sm text-muted-foreground">
              La fonctionnalité de carte interactive sera disponible prochainement.
            </p>
          </div>
        </div>
        <div className="space-y-2">
            <h4 className="font-semibold">Emplacements cette semaine:</h4>
            <ul className="space-y-2">
            {pharmacies.map((pharmacy) => (
                <li key={pharmacy.nom} className="flex items-start justify-between gap-2 p-2 rounded-md bg-background hover:bg-accent/50">
                    <div className="flex items-center gap-2">
                        <MapPin className={`h-5 w-5 flex-shrink-0 ${pharmacy.nom === selectedPharmacyName ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                            <p className={`font-semibold ${pharmacy.nom === selectedPharmacyName ? 'text-primary' : ''}`}>{pharmacy.nom}</p>
                            <p className="text-sm text-muted-foreground">{pharmacy.localisation}</p>
                        </div>
                    </div>
                    <a
                        href={`https://www.openstreetmap.org/search?query=${encodeURIComponent('pharmacie ' + pharmacy.nom + ', ' + pharmacy.localisation)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        title="Rechercher sur OpenStreetMap"
                    >
                        <MapPin className="h-5 w-5"/>
                    </a>
                </li>
            ))}
            </ul>
        </div>
      </CardContent>
    </Card>
  );
}
