'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function MapDisplay() {
  // Coordinates for Lomé, Togo
  const lat = 6.1375;
  const lon = 1.2222;
  const zoom = 13;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.1}%2C${lat-0.1}%2C${lon+0.1}%2C${lat+0.1}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-primary">
          <MapPin />
          Carte de la région
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full rounded-lg bg-muted overflow-hidden border">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapSrc}
            title="Carte OpenStreetMap"
          ></iframe>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Cliquez sur l'adresse d'une pharmacie pour la localiser sur OpenStreetMap.
        </p>
      </CardContent>
    </Card>
  );
}
