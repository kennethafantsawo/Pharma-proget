'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { HealthPostComment } from '@/lib/types';
import { getCommentsAction, addCommentAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare, Send, LoaderCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const CommentSchema = z.object({
  content: z.string().min(1, 'Le commentaire est requis.').max(300),
});

type CommentValues = z.infer<typeof CommentSchema>;

interface CommentSectionProps {
  postId: number;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<HealthPostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentValues>({
    resolver: zodResolver(CommentSchema),
  });

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      const result = await getCommentsAction(postId);
      if (result.success && result.data) {
        setComments(result.data);
      } else {
        toast({ title: "Erreur", description: "Impossible de charger les commentaires.", variant: "destructive" });
      }
      setIsLoading(false);
    };
    fetchComments();
  }, [postId, toast]);

  const onAddComment = async (data: CommentValues) => {
    const formData = new FormData();
    formData.append('postId', String(postId));
    formData.append('content', data.content);

    startTransition(async () => {
      // Optimistic update
      const newComment: HealthPostComment = {
          id: Math.random(), // temp id
          post_id: postId,
          content: data.content,
          created_at: new Date().toISOString()
      };
      setComments(prev => [...prev, newComment]);
      reset();

      const result = await addCommentAction(formData);
      if (!result.success) {
        toast({ title: 'Erreur', description: result.error || 'Impossible d\'ajouter le commentaire.', variant: 'destructive' });
        // Rollback optimistic update
        setComments(prev => prev.filter(c => c.id !== newComment.id));
      }
    });
  };

  return (
    <div className="pt-4 mt-4 border-t">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Commentaires ({comments.length})
      </h3>
      <ScrollArea className="h-48 pr-4">
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <p className="p-3 rounded-lg bg-muted">{comment.content}</p>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Aucun commentaire pour l'instant.</p>
          )}
        </div>
      </ScrollArea>
      
      <form ref={formRef} onSubmit={handleSubmit(onAddComment)} className="mt-4 flex items-start gap-2">
        <Textarea
          {...register('content')}
          placeholder="Ajouter un commentaire..."
          rows={1}
          className="flex-1"
          disabled={isPending}
        />
        <Button type="submit" size="icon" disabled={isPending}>
            {isPending ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
      {errors.content && <p className="text-destructive text-sm mt-1">{errors.content.message}</p>}
    </div>
  );
}
