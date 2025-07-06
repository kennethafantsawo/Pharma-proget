'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import type { Pharmacy } from '@/lib/types';

interface MapDisplayProps {
  pharmacy?: Pharmacy | null;
}

export function MapDisplay({ pharmacy }: MapDisplayProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // This is a way to access process.env on the client-side
    // without causing a server/client mismatch hydration error.
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null);
  }, []);

  const getMapUrl = () => {
    if (!apiKey) {
      return '';
    }
    
    const base = `https://www.google.com/maps/embed/v1/place?key=${apiKey}`;
    if (pharmacy) {
      const query = encodeURIComponent(`${pharmacy.nom}, ${pharmacy.localisation}, Lomé, Togo`);
      return `${base}&q=${query}&zoom=17`;
    }
    
    return `${base}&q=Lomé, Togo&zoom=13`;
  };

  const mapSrc = getMapUrl();
  
  const ErrorDisplay = () => (
    <div className="text-sm text-destructive p-4 bg-destructive/10 rounded-md h-full flex flex-col justify-center">
      <p className="font-bold mb-2">Erreur : La carte ne peut pas s'afficher.</p>
      <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Assurez-vous que la clé API Google Maps est bien ajoutée dans le fichier <code>.env</code> sous le nom <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.</li>
          <li>Vérifiez que l'API "Maps Embed" est activée dans votre console Google Cloud.</li>
          <li>Confirmez que les restrictions de votre clé (HTTP, IP) autorisent bien ce site.</li>
          <li>Si vous venez d'ajouter la clé, redémarrez votre serveur de développement.</li>
      </ul>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-primary">
          <MapPin />
          Carte
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
              src={mapSrc}
              title="Carte Google Maps"
            ></iframe>
          ) : (
             <ErrorDisplay />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
            Survolez une pharmacie pour la localiser sur la carte.
        </p>
      </CardContent>
    </Card>
  );
}
