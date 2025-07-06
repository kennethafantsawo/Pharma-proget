'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function MapDisplay() {
  // Bounding box for Lomé, Togo
  const loméBbox = '1.1601,6.1213,1.2644,6.1534';
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${loméBbox}&layer=mapnik`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-primary">
          <MapPin />
          Carte de Lomé
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
            referrerPolicy="no-referrer-when-downgrade"
            src={mapSrc}
            title="Carte des pharmacies - OpenStreetMap"
          ></iframe>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Pour localiser une pharmacie, cliquez sur l'icône <MapPin className="inline-block h-3 w-3" /> sur sa carte.
        </p>
      </CardContent>
    </Card>
  );
}
