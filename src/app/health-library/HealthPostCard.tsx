
'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share2, LoaderCircle, BookOpen } from 'lucide-react'
import type { HealthPost } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { incrementLikeAction } from './actions'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CommentSection } from './CommentSection'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface HealthPostCardProps {
  post: HealthPost
}

export function HealthPostCard({ post }: HealthPostCardProps) {
  const { toast } = useToast()
  const [isLikePending, startLikeTransition] = useTransition()
  const [likes, setLikes] = useState(post.likes)
  const [isLiked, setIsLiked] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [commentCount, setCommentCount] = useState<number | null>(null);

  useEffect(() => {
    try {
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]') as number[]
      if (likedPosts.includes(post.id)) {
        setIsLiked(true)
      }
    } catch (error) {
        console.error('Failed to parse liked posts from localStorage', error)
        localStorage.setItem('likedPosts', '[]')
    }
  }, [post.id])

  const handleLike = () => {
    if (isLikePending) return;

    startLikeTransition(async () => {
      const wasLiked = isLiked;
      // Optimistic UI updates
      setIsLiked(!wasLiked)
      setLikes(prev => wasLiked ? prev - 1 : prev + 1);
      
      try {
          const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]') as number[]
          if (wasLiked) {
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts.filter(id => id !== post.id)))
          } else {
            localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, post.id]))
          }
      } catch(error) {
          console.error('Failed to update liked posts in localStorage', error)
      }

      const result = await incrementLikeAction(post.id, wasLiked)

      if (!result.success) {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de mettre à jour le like.',
          variant: 'destructive',
        })
        // Rollback UI updates on failure
        setIsLiked(wasLiked)
        setLikes(prev => wasLiked ? prev + 1 : prev - 1);
        try {
            const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]') as number[]
            if(wasLiked) {
                localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, post.id]))
            } else {
                localStorage.setItem('likedPosts', JSON.stringify(likedPosts.filter(id => id !== post.id)))
            }
        } catch(error) {
            console.error('Failed to rollback liked posts in localStorage', error)
        }
      }
    })
  }

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: `Découvrez cet article sur PharmaGuard : ${post.title}`,
      url: window.location.href.split('#')[0] + `#post-${post.id}`,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast({ title: 'Copié !', description: 'Le lien vers l\'article a été copié.' })
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast({ title: 'Erreur', description: 'Impossible de partager cet article.', variant: 'destructive' })
    }
  }

  return (
    <div id={`post-${post.id}`} className="w-full scroll-mt-20 p-4 border-b transition-colors hover:bg-muted/50">
      <Collapsible onOpenChange={setIsCommentsOpen}>
        <div className="flex gap-3">
          <div className="flex-shrink-0 pt-1">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-accent-foreground" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-foreground">PharmaGuard Santé</span>
              <span className="text-muted-foreground text-sm">· {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</span>
            </div>
            
            <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
            <p className="text-base text-foreground/90 whitespace-pre-wrap leading-relaxed mb-3">{post.content}</p>

            {post.image_url && (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 border cursor-pointer">
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="p-0 border-0 max-w-4xl bg-transparent">
                  <div className="relative aspect-video w-full">
                    <Image src={post.image_url} alt={post.title} fill className="object-contain" />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <div className="flex items-center justify-start gap-12 text-muted-foreground -ml-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-blue-500/10 hover:text-blue-500 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{commentCount !== null ? commentCount : ''}</span>
                </Button>
              </CollapsibleTrigger>
              <Button variant="ghost" size="sm" onClick={handleLike} disabled={isLikePending} className={cn("rounded-full hover:bg-pink-500/10 hover:text-pink-500 flex items-center gap-2", isLiked && "text-pink-500")}>
                {isLikePending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Heart className={cn('h-5 w-5', isLiked ? 'fill-current' : '')} />}
                <span className="text-sm font-medium">{likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full hover:bg-green-500/10 hover:text-green-500" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <CollapsibleContent>
          <div className="pt-4 pl-12">
            {isCommentsOpen && <CommentSection postId={post.id} onCountChange={setCommentCount} />}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
