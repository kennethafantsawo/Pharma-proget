
import { PageWrapper } from '@/components/shared/page-wrapper';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Pill, BookOpen } from 'lucide-react';

const healthTopics = [
  {
    title: 'Rhume et Grippe',
    content: 'Le rhume et la grippe sont des infections virales des voies respiratoires. Reposez-vous, hydratez-vous bien et utilisez des décongestionnants ou des analgésiques si nécessaire. Consultez un médecin si les symptômes persistent ou s\'aggravent.',
  },
  {
    title: 'Maux de Tête',
    content: 'Les maux de tête peuvent être causés par le stress, la fatigue ou la déshydratation. Les analgésiques comme le paracétamol ou l\'ibuprofène peuvent aider. Si les maux de tête sont sévères ou fréquents, une consultation médicale est recommandée.',
  },
  {
    title: 'Allergies Saisonnières',
    content: 'Les allergies saisonnières sont une réaction à des allergènes comme le pollen. Les antihistaminiques peuvent soulager les symptômes tels que les éternuements, le nez qui coule et les démangeaisons. Évitez l\'exposition aux allergènes si possible.',
  },
  {
    title: 'Problèmes Digestifs',
    content: 'Pour les brûlures d\'estomac, les antiacides peuvent neutraliser l\'acidité. Pour la constipation, augmentez votre consommation de fibres et d\'eau. Les probiotiques peuvent aider à maintenir une bonne santé digestive.',
  },
];

export default function HealthLibraryPage() {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-primary mb-2" />
            <h1 className="text-3xl font-bold font-headline text-primary">Fiches Santé</h1>
            <p className="text-muted-foreground mt-2">
              Informations et conseils sur des affections courantes.
            </p>
          </header>

          <Accordion type="single" collapsible className="w-full">
            {healthTopics.map((topic, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Pill className="h-5 w-5 text-primary" />
                    <span>{topic.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed px-2">
                  {topic.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </PageWrapper>
  );
}
