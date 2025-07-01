
'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThumbsUp, MessageCircle, Share2, LoaderCircle } from 'lucide-react'
import type { HealthPost } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { incrementLikeAction } from './actions'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CommentSection } from './CommentSection'
import { cn } from '@/lib/utils'

interface HealthPostCardProps {
  post: HealthPost
}

export function HealthPostCard({ post }: HealthPostCardProps) {
  const { toast } = useToast()
  const [isLikePending, startLikeTransition] = useTransition()
  const [likes, setLikes] = useState(post.likes)
  const [isLiked, setIsLiked] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

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
    if (isLiked || isLikePending) return

    startLikeTransition(async () => {
      // Optimistic UI updates
      setIsLiked(true)
      setLikes(prev => prev + 1)
      
      try {
          const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]') as number[]
          localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, post.id]))
      } catch(error) {
          console.error('Failed to update liked posts in localStorage', error)
      }

      const result = await incrementLikeAction(post.id)

      if (!result.success) {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de mettre à jour le like.',
          variant: 'destructive',
        })
        // Rollback UI updates on failure
        setIsLiked(false)
        setLikes(prev => prev - 1)
        try {
            const updatedLikedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]') as number[]
            localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts.filter(id => id !== post.id)))
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
    <Card id={`post-${post.id}`} className="w-full scroll-mt-20 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <Collapsible onOpenChange={setIsCommentsOpen}>
        {post.image_url && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative aspect-video w-full cursor-pointer transition-transform duration-300 hover:scale-105">
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="p-0 border-0 max-w-4xl bg-transparent">
                  <div className="relative aspect-video w-full">
                     <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className="object-contain"
                    />
                  </div>
              </DialogContent>
            </Dialog>
        )}
        <CardHeader>
          <CardTitle className="font-headline text-2xl font-bold">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground pt-1">
            Publié le {new Date(post.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </CardHeader>
        
        <CardContent>
          <p className="text-base text-foreground/90 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </CardContent>

        <CardFooter className="flex justify-start gap-1 sm:gap-2 bg-muted/50 p-3 mt-4">
          <Button variant="ghost" size="sm" onClick={handleLike} disabled={isLikePending} className="text-muted-foreground rounded-full">
            {isLikePending 
              ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> 
              : <ThumbsUp className={cn('mr-2 h-4 w-4 transition-colors', isLiked ? 'text-accent fill-accent/20' : '')} />
            }
            {likes}
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground rounded-full">
              <MessageCircle className="mr-2 h-4 w-4" /> Commenter
            </Button>
          </CollapsibleTrigger>
          <Button variant="ghost" size="sm" className="text-muted-foreground rounded-full" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Partager
          </Button>
        </CardFooter>
        
        <CollapsibleContent>
           <CardContent className="pt-4">
             {isCommentsOpen && <CommentSection postId={post.id} />}
           </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
