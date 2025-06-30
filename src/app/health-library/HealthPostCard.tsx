'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThumbsUp, MessageCircle, Share2, LoaderCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { HealthPost } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { incrementLikeAction } from './actions'

interface HealthPostCardProps {
  post: HealthPost
}

export function HealthPostCard({ post }: HealthPostCardProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [likes, setLikes] = useState(post.likes)
  const [isLiked, setIsLiked] = useState(false)

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
    if (isLiked || isPending) return

    startTransition(async () => {
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
    <Card id={`post-${post.id}`} className="w-full scroll-mt-20">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>
          Publié le {new Date(post.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {post.image_url && (
          <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <p className="text-base text-foreground/90 whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-start gap-1 sm:gap-4">
        <Button variant="ghost" size="sm" onClick={handleLike} disabled={isLiked || isPending} className="text-muted-foreground">
          {isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? 'text-primary fill-primary' : ''}`} />}
          {likes} J'aime
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
                <MessageCircle className="mr-2 h-4 w-4" /> Commenter
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Prochainement disponible</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Partager
        </Button>
      </CardFooter>
    </Card>
  )
}
