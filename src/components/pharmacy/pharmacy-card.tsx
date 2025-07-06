import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MapPin } from 'lucide-react';
import type { Pharmacy } from '@/lib/types';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


export function PharmacyCard({ pharmacy }: PharmacyCardProps) {
  const whatsAppNumber = pharmacy.contact2.startsWith('+') ? pharmacy.contact2.substring(1) : pharmacy.contact2;
  const mapQuery = encodeURIComponent(`pharmacie ${pharmacy.nom} ${pharmacy.localisation}`);
  const mapUrl = `https://www.openstreetmap.org/search?query=${mapQuery}`;

  return (
    <Card 
        className="w-full h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <CardHeader>
        <CardTitle className="font-headline text-xl text-accent">
          {pharmacy.nom}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <a 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 text-muted-foreground transition-colors hover:text-primary group"
        >
          <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary/70 transition-colors group-hover:text-primary" />
          <span className="font-body group-hover:underline">{pharmacy.localisation}</span>
        </a>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild size="sm">
            <a href={`tel:${pharmacy.contact1}`}>
              <Phone />
              Appeler
            </a>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href={`https://wa.me/${whatsAppNumber}`} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              WhatsApp
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
