'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function MapDisplay() {

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=1.15,6.1,1.3,6.25&layer=mapnik`;

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
              src={mapSrc}
              title="Carte OpenStreetMap de Lomé"
            ></iframe>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
            Pour voir une pharmacie, cliquez sur son adresse dans la liste.
        </p>
      </CardContent>
    </Card>
  );
}
