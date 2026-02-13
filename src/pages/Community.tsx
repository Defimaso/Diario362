import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Send, Eye, EyeOff, Crown, Trash2, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import BottomDock from '@/components/BottomDock';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'ora';
  if (diffMin < 60) return `${diffMin} min fa`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
  if (diffDays === 1) return 'ieri';
  if (diffDays < 7) return `${diffDays} giorni fa`;
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

export default function Community() {
  const { user } = useAuth();
  const { posts, loading, isStaff, createPost, deletePost } = useCommunityPosts();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new posts arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [posts.length]);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const result = await createPost(content, isAnonymous);
    if (result.error) {
      console.error('Community post error:', result.error);
      toast({
        title: 'Errore',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setContent('');
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Posts in chronological order (oldest first) for chat feel
  const chronologicalPosts = [...posts].reverse();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold">Community</h1>
            <p className="text-xs text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'messaggio' : 'messaggi'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pb-48 pt-4"
      >
        <div className="max-w-lg mx-auto px-4 space-y-3">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : chronologicalPosts.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Benvenuto nella Community!</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Scrivi il primo messaggio per iniziare la conversazione
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {chronologicalPosts.map((post) => {
                const isOwn = post.user_id === user?.id;

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "flex gap-2.5",
                      isOwn ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                      post.is_anonymous
                        ? "bg-muted-foreground/20 text-muted-foreground"
                        : isOwn
                          ? "bg-primary/20 text-primary"
                          : "bg-accent/20 text-accent"
                    )}>
                      {post.is_anonymous ? '?' : post.display_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Message Bubble */}
                    <div className={cn(
                      "max-w-[75%] min-w-[120px]",
                    )}>
                      {/* Name + Badge */}
                      <div className={cn(
                        "flex items-center gap-1.5 mb-1 px-1",
                        isOwn ? "flex-row-reverse" : "flex-row"
                      )}>
                        <span className="text-xs font-semibold text-foreground/80">
                          {isOwn ? 'Tu' : post.display_name}
                        </span>
                        {/* Premium badge - coach only */}
                        {isStaff && !isOwn && (
                          post.is_premium ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded-full">
                              <Crown className="w-2 h-2" />
                              PRO
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium text-muted-foreground bg-muted px-1 py-0.5 rounded-full">
                              FREE
                            </span>
                          )
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={cn(
                        "rounded-2xl px-3.5 py-2.5 relative group",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-card border border-border/50 rounded-tl-sm"
                      )}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {post.content}
                        </p>
                        <div className={cn(
                          "flex items-center gap-2 mt-1",
                          isOwn ? "justify-end" : "justify-start"
                        )}>
                          <span className={cn(
                            "text-[10px]",
                            isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            {timeAgo(post.created_at)}
                          </span>
                        </div>

                        {/* Delete */}
                        {(isOwn || isStaff) && (
                          <button
                            onClick={() => deletePost(post.id)}
                            className={cn(
                              "absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity",
                              "bg-destructive text-destructive-foreground rounded-full p-1",
                              isOwn ? "-left-2" : "-right-2"
                            )}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Compose Bar */}
      <div className="fixed bottom-[72px] left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3">
          {/* Anonymous toggle */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors",
                isAnonymous
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isAnonymous ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {isAnonymous ? 'Anonimo' : 'Con nome'}
            </button>
            <span className="text-[10px] text-muted-foreground ml-auto">{content.length}/500</span>
          </div>

          {/* Input + Send */}
          <div className="flex items-end gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un messaggio..."
              rows={1}
              className={cn(
                "flex-1 resize-none rounded-2xl border border-border/50 bg-background/50 px-4 py-2.5",
                "text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30",
                "max-h-[100px] min-h-[40px]"
              )}
              style={{ height: 'auto', overflow: 'hidden' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 100) + 'px';
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="rounded-full w-10 h-10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <BottomDock />
    </div>
  );
}
