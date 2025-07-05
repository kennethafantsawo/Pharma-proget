
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, X, LoaderCircle, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { pharmacyChatbot, type PharmacyChatbotOutput } from '@/ai/flows/pharmacy-chatbot';

const CustomSparkleIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 59 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M29.5 0L36.0858 22.9142L59 29L36.0858 35.0858L29.5 58L22.9142 35.0858L0 29L22.9142 22.9142L29.5 0Z"
        fill="#00C1F3"
      />
      <path
        d="M50.5 13L53.4423 21.7157L62 24.5L53.4423 27.2843L50.5 36L47.5577 27.2843L39 24.5L47.5577 21.7157L50.5 13Z"
        fill="#98E6FF"
      />
      <path
        d="M50.5 45L52.3212 50.1788L57 52L52.3212 53.8212L50.5 59L48.6788 53.8212L44 52L48.6788 50.1788L50.5 45Z"
        fill="#51D7C7"
      />
      <path d="M11 15.5H23" stroke="#40B5E6" strokeWidth="5" />
      <path d="M17 21.5L17 9.5" stroke="#40B5E6" strokeWidth="5" />
    </svg>
  );
};

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
    if (isOpen) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [messages, isOpen]);

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
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le chatbot"
        className="fixed bottom-16 right-5 z-50 cursor-pointer transition-transform hover:scale-110 drop-shadow-xl"
      >
        <CustomSparkleIcon className="h-10 w-10" />
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2 font-headline text-accent">
              <CustomSparkleIcon className="h-5 w-5" />
              Assistant Pharmacien
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-end gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border bg-accent/20">
                      <AvatarFallback className="bg-transparent text-accent"><CustomSparkleIcon className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-4 py-2 ${message.role === 'user' ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback><User size={20}/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border bg-accent/20">
                      <AvatarFallback className="bg-transparent text-accent"><CustomSparkleIcon className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-xl px-4 py-3">
                        <LoaderCircle className="animate-spin h-5 w-5" />
                    </div>
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
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            {errors.query && <p className="text-destructive text-xs mt-1">{errors.query.message}</p>}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
