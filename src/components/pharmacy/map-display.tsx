'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertTriangle } from 'lucide-react';
import type { Pharmacy } from '@/lib/types';

interface MapDisplayProps {
  selectedPharmacy: Pharmacy | null;
}

export function MapDisplay({ selectedPharmacy }: MapDisplayProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const baseSrc = 'https://www.google.com/maps/embed/v1/place';

  const getQuery = () => {
    if (selectedPharmacy) {
      return `pharmacie ${selectedPharmacy.nom}, ${selectedPharmacy.localisation}`;
    }
    return 'Lomé, Togo';
  };

  const mapSrc = `${baseSrc}?key=${apiKey}&q=${encodeURIComponent(getQuery())}`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-primary">
          <MapPin />
          Carte des Pharmacies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full rounded-lg bg-muted overflow-hidden border">
          {apiKey ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
              title="Carte des pharmacies - Google Maps"
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
              <p className="font-semibold text-destructive">Clé API Google Maps manquante</p>
              <p className="text-xs text-muted-foreground mt-1">
                Veuillez ajouter votre clé à la variable <code className="font-mono text-xs bg-muted p-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> dans le fichier <code className="font-mono text-xs bg-muted p-1 rounded">.env</code>.
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
            Survolez une pharmacie dans la liste pour la localiser sur la carte.
        </p>
      </CardContent>
    </Card>
  );
}
