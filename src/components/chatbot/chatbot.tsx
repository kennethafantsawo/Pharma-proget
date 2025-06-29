
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, MessageSquare, Send, X, LoaderCircle, User, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { pharmacyChatbot, type PharmacyChatbotOutput } from '@/ai/flows/pharmacy-chatbot';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
};

const FormSchema = z.object({
  query: z.string().min(1, 'Veuillez entrer une question.'),
});

type FormValues = z.infer<typeof FormSchema>;

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Bonjour ! Je suis votre assistant pharmacien IA. Comment puis-je vous aider aujourd\'hui ? Posez-moi des questions sur les médicaments, la posologie ou les effets secondaires.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    const userMessage: Message = { id: Date.now(), role: 'user', text: data.query };
    setMessages((prev) => [...prev, userMessage]);
    reset();

    try {
      const result: PharmacyChatbotOutput = await pharmacyChatbot({ query: data.query });
      const assistantMessage: Message = { id: Date.now() + 1, role: 'assistant', text: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
        aria-label="Open chatbot"
      >
        <MessageSquare className="h-8 w-8" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Bot />
              Assistant Pharmacien
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                    </Avatar>
                  )}
                  <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <CardContent className="p-3 text-sm">{message.text}</CardContent>
                  </Card>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback><User size={20}/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                    </Avatar>
                    <Card className="bg-muted">
                        <CardContent className="p-3">
                            <LoaderCircle className="animate-spin" />
                        </CardContent>
                    </Card>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
              <Input
                {...register('query')}
                placeholder="Posez votre question..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {errors.query && <p className="text-destructive text-xs mt-1">{errors.query.message}</p>}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
