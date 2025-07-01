
'use client';

import { useEffect, useState, useTransition, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { HealthPostComment } from '@/lib/types';
import { getCommentsAction, addCommentAction } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, LoaderCircle } from 'lucide-react';
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
  onCountChange?: (count: number) => void;
}

export function CommentSection({ postId, onCountChange }: CommentSectionProps) {
  const [comments, setComments] = useState<HealthPostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentValues>({
    resolver: zodResolver(CommentSchema),
  });

  const updateCommentCount = useCallback((newComments: HealthPostComment[]) => {
    if (onCountChange) {
      onCountChange(newComments.length);
    }
  }, [onCountChange]);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      const result = await getCommentsAction(postId);
      if (result.success && result.data) {
        setComments(result.data);
        if (onCountChange) {
            onCountChange(result.data.length);
        }
      } else {
        toast({ title: "Erreur", description: "Impossible de charger les commentaires.", variant: "destructive" });
      }
      setIsLoading(false);
    };
    fetchComments();
  }, [postId, toast, onCountChange]);

  const onAddComment = async (data: CommentValues) => {
    const formData = new FormData();
    formData.append('postId', String(postId));
    formData.append('content', data.content);

    startTransition(async () => {
      const tempId = Math.random();
      const newComment: HealthPostComment = {
          id: tempId,
          post_id: postId,
          content: data.content,
          created_at: new Date().toISOString()
      };
      
      const newComments = [...comments, newComment];
      setComments(newComments);
      updateCommentCount(newComments);
      reset();

      const result = await addCommentAction(formData);
      if (!result.success) {
        toast({ title: 'Erreur', description: result.error || 'Impossible d\'ajouter le commentaire.', variant: 'destructive' });
        const rolledBackComments = comments.filter(c => c.id !== tempId);
        setComments(rolledBackComments);
        updateCommentCount(rolledBackComments);
      } else {
        // If successful, we might want to refresh comments to get the real one from DB
        // For now, optimistic is fine.
      }
    });
  };

  return (
    <div className="pt-2">
      <form ref={formRef} onSubmit={handleSubmit(onAddComment)} className="flex items-start gap-2 mb-4">
        <Textarea
          {...register('content')}
          placeholder="Ajouter un commentaire..."
          rows={1}
          className="flex-1 bg-muted border-0 focus-visible:ring-1"
          disabled={isPending}
        />
        <Button type="submit" size="icon" disabled={isPending}>
            {isPending ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
      {errors.content && <p className="text-destructive text-sm mt-1">{errors.content.message}</p>}
      
      <div className="space-y-4">
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
          [...comments].reverse().map((comment) => (
            <div key={comment.id} className="text-sm">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-semibold mb-1">Anonyme</p>
                <p>{comment.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-muted-foreground py-4">Aucun commentaire pour l'instant. Soyez le premier !</p>
        )}
      </div>
    </div>
  );
}
