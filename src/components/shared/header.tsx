'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, PlusSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Pharmacies de Garde' },
  { href: '/health-library', label: 'Fiches Santé' },
  { href: '/admin', label: 'Options' },
];

export function Header() {
  const pathname = usePathname();

  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    navLinks.map(({ href, label }) => (
      <Button
        key={href}
        variant="ghost"
        asChild
        className={cn(
          'font-semibold tracking-wide',
          pathname === href
            ? 'text-primary hover:text-primary'
            : 'text-foreground/70 hover:text-foreground',
          inSheet && 'w-full justify-start'
        )}
      >
        <Link href={href}>{label}</Link>
      </Button>
    ))
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <PlusSquare className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary font-headline">
            PharmaGuard
          </span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <NavLinks />
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-4 py-6">
                <NavLinks inSheet />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
