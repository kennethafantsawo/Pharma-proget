'use client';

import { useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageWrapper } from '@/components/shared/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Star, Lightbulb, LoaderCircle } from 'lucide-react';
import { submitFeedbackAction } from './actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const FeedbackSchema = z.object({
  type: z.enum(['avis', 'suggestion'], {
    required_error: 'Veuillez sélectionner un type.',
  }),
  content: z.string().min(10, 'Votre message doit contenir au moins 10 caractères.').max(500, 'Le message ne peut pas dépasser 500 caractères.'),
});

type FeedbackValues = z.infer<typeof FeedbackSchema>;

export default function FeedbackPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FeedbackValues>({
    resolver: zodResolver(FeedbackSchema),
  });

  const onSubmit: SubmitHandler<FeedbackValues> = (data) => {
    startTransition(async () => {
      const result = await submitFeedbackAction(data);
      if (result.success) {
        toast({
          title: 'Merci !',
          description: 'Votre message a bien été envoyé.',
        });
        form.reset({ content: '', type: undefined });
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Une erreur est survenue.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="text-primary" />
                Donnez votre avis
              </CardTitle>
              <CardDescription>
                Votre opinion est importante. Partagez vos suggestions ou laissez un avis pour nous aider à améliorer l'application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Type de message</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="avis" id="avis" className="peer sr-only" />
                              </FormControl>
                              <Label
                                htmlFor="avis"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <Star className="mb-3 h-6 w-6" />
                                Avis
                              </Label>
                            </FormItem>
                             <FormItem>
                              <FormControl>
                                <RadioGroupItem value="suggestion" id="suggestion" className="peer sr-only" />
                              </FormControl>
                              <Label
                                htmlFor="suggestion"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                <Lightbulb className="mb-3 h-6 w-6" />
                                Suggestion
                              </Label>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="content">Votre message</FormLabel>
                        <FormControl>
                          <Textarea
                            id="content"
                            rows={6}
                            placeholder="Écrivez votre message ici..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? <LoaderCircle className="animate-spin" /> : 'Envoyer mon message'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
