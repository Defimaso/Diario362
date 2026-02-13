import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Send, Eye, EyeOff, Crown, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { cn } from '@/lib/utils';

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

export default function CommunityFeed() {
  const { user } = useAuth();
  const { posts, loading, isStaff, createPost, deletePost } = useCommunityPosts();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return null;

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const result = await createPost(content, isAnonymous);
    if (!result.error) {
      setContent('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="card-elegant p-5 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Community</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {posts.length} {posts.length === 1 ? 'post' : 'post'}
        </span>
      </div>

      {/* Compose Area */}
      <div className="mb-4 p-3 rounded-xl bg-muted/50 space-y-3">
        <Textarea
          placeholder="Condividi un pensiero con la community..."
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 500))}
          className="min-h-[60px] resize-none bg-background/50"
          rows={2}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-xs">Anonimo</span>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{content.length}/500</span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className="gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              Pubblica
            </Button>
          </div>
        </div>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-6">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">Nessun post ancora</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Sii il primo a condividere un pensiero!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-3 p-3 rounded-xl bg-muted/30"
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                  post.is_anonymous
                    ? "bg-muted-foreground/20 text-muted-foreground"
                    : "bg-primary/15 text-primary"
                )}>
                  {post.is_anonymous ? '?' : post.display_name.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">
                      {post.display_name}
                    </span>
                    {/* Premium badge - only visible to coaches */}
                    {isStaff && (
                      post.is_premium ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                          <Crown className="w-2.5 h-2.5" />
                          PRO
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          FREE
                        </span>
                      )
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                      {timeAgo(post.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                </div>

                {/* Delete button - author or admin */}
                {(post.user_id === user?.id || isStaff) && (
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-muted-foreground/40 hover:text-red-500 transition-colors shrink-0 self-start mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
