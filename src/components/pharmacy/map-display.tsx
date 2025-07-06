
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';
import type { Pharmacy } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MapDisplayProps {
  pharmacies: Pharmacy[];
  selectedPharmacyName?: string | null;
}

export function MapDisplay({ pharmacies, selectedPharmacyName }: MapDisplayProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const selectedPharmacy = pharmacies.find(p => p.nom === selectedPharmacyName);

  let mapSrc = '';
  // Check if apiKey is defined and not the placeholder value
  const isApiKeySet = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' && apiKey.trim() !== '';

  if (isApiKeySet) {
    const baseEmbedUrl = 'https://www.google.com/maps/embed/v1/';
    if (selectedPharmacy) {
      const query = `place?key=${apiKey}&q=${encodeURIComponent(`Pharmacie ${selectedPharmacy.nom}, ${selectedPharmacy.localisation}, Lomé, Togo`)}`;
      mapSrc = `${baseEmbedUrl}${query}`;
    } else {
      // Default view of Lomé
      const query = `view?key=${apiKey}&center=6.1374,1.2123&zoom=12`;
      mapSrc = `${baseEmbedUrl}${query}`;
    }
  }

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
          {isApiKeySet ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapSrc}
              title="Carte des pharmacies"
            ></iframe>
          ) : (
             <div className="flex items-center justify-center h-full p-4 text-center">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Requise</AlertTitle>
                    <AlertDescription>
                        Pour afficher la carte, ajoutez votre clé API Google Maps à la variable <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> dans le fichier <code>.env</code>.
                    </AlertDescription>
                </Alert>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
