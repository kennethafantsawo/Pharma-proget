
import { Facebook, Instagram, Mail } from 'lucide-react';

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
      className="h-6 w-6"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Powered by{' '}
          <span className="font-semibold text-foreground">Kenneth AFANTSAWO</span>
        </p>
        <div className="flex items-center gap-4">
          <a
            href="mailto:kennethafantsawo@gmail.com"
            aria-label="Email"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Mail className="h-6 w-6" />
          </a>
          <a
            href="http://wa.me/22896417270"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <WhatsAppIcon />
          </a>
          <a
            href="https://www.instagram.com/kennethafantsawo?igsh=MWRhNTU5MHN2cHp0OA=="
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Instagram className="h-6 w-6" />
          </a>
          <a
            href="https://www.facebook.com/kennethafantsawo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-muted-foreground hover:text-accent transition-colors"
          >
            <Facebook className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}
