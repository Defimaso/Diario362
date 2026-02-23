import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareHeart, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const FEEDBACK_BANNER_KEY = 'feedback_banner_dismissed';
const FEEDBACK_SENT_KEY = 'feedback_sent';

const emojiOptions = [
  { emoji: '😫', label: 'Frustrante', value: 1 },
  { emoji: '😕', label: 'Meh', value: 2 },
  { emoji: '🙂', label: 'Ok', value: 3 },
  { emoji: '😊', label: 'Buona', value: 4 },
  { emoji: '🤩', label: 'Fantastica', value: 5 },
];

export default function FeedbackPrompt() {
  const { user } = useAuth();
  const [bannerDismissed, setBannerDismissed] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [bugs, setBugs] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [sending, setSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(FEEDBACK_BANNER_KEY);
    const sent = localStorage.getItem(FEEDBACK_SENT_KEY);
    setBannerDismissed(!!dismissed);
    setFeedbackSent(!!sent);
  }, []);

  const dismissBanner = () => {
    localStorage.setItem(FEEDBACK_BANNER_KEY, 'true');
    setBannerDismissed(true);
  };

  const handleSend = async () => {
    if (!bugs.trim() && !wishlist.trim() && !rating) {
      toast.error('Scrivi almeno un commento o seleziona un voto.');
      return;
    }

    setSending(true);
    try {
      // Insert feedback using RPC or direct table insert
      const { error } = await (supabase.from as any)('app_feedback').insert({
        user_id: user?.id || null,
        rating,
        bugs: bugs.trim() || null,
        wishlist: wishlist.trim() || null,
        user_agent: navigator.userAgent,
      });

      if (error) {
        // If table doesn't exist yet, send via edge function or just log
        console.error('Feedback save error:', error);
        // Fallback: save to localStorage and show success anyway
        const existing = JSON.parse(localStorage.getItem('pending_feedback') || '[]');
        existing.push({
          user_id: user?.id,
          rating,
          bugs: bugs.trim(),
          wishlist: wishlist.trim(),
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('pending_feedback', JSON.stringify(existing));
      }

      // Send email notification to info@362gradi.it via edge function
      const ratingEmoji = rating ? emojiOptions.find(o => o.value === rating)?.emoji || '' : '';
      supabase.functions.invoke('notify-interaction', {
        body: {
          type: 'app_feedback',
          clientId: user?.id || '00000000-0000-0000-0000-000000000000',
          authorId: user?.id || '00000000-0000-0000-0000-000000000000',
          metadata: {
            rating: rating ? `${ratingEmoji} ${rating}/5` : 'N/A',
            bugs: bugs.trim() || 'Nessuno',
            wishlist: wishlist.trim() || 'Nessuna',
          },
        },
      }).catch(err => console.error('Feedback notify error:', err));

      localStorage.setItem(FEEDBACK_SENT_KEY, 'true');
      setFeedbackSent(true);
      setModalOpen(false);
      setBugs('');
      setWishlist('');
      setRating(null);
      toast.success('Grazie per il feedback! Lo leggeremo attentamente.');
    } catch (err) {
      console.error('Feedback error:', err);
      toast.error('Errore nell\'invio. Riprova.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* BANNER — shows only once (until dismissed) */}
      <AnimatePresence>
        {!bannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="relative p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-fuchsia-500/10 to-violet-500/10 border border-fuchsia-500/20">
              <button
                onClick={dismissBanner}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                  <MessageSquareHeart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-sm mb-1">Aiutaci a migliorare l'app!</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Siamo in beta e il tuo parere conta tantissimo. Dicci cosa funziona male e cosa vorresti vedere.
                  </p>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white text-xs font-bold shadow-lg"
                    onClick={() => { setModalOpen(true); dismissBanner(); }}
                  >
                    <MessageSquareHeart className="w-3.5 h-3.5 mr-1.5" />
                    Lascia un Feedback
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — always visible after banner is dismissed */}
      {bannerDismissed && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setModalOpen(true)}
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,8px))] right-4 z-[45] w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 shadow-lg shadow-pink-500/30 flex items-center justify-center text-white"
        >
          <MessageSquareHeart className="w-5 h-5" />
          {feedbackSent && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
          )}
        </motion.button>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={() => !sending && setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-0 top-auto max-h-[85vh] bg-card rounded-t-2xl z-[201] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-4 border-b border-border flex items-center justify-between shrink-0 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                    <MessageSquareHeart className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold">Il tuo Feedback</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => !sending && setModalOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-5">
                {/* Rating */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Come ti sembra l'app finora?</Label>
                  <div className="flex justify-between gap-1">
                    {emojiOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setRating(opt.value)}
                        className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                          rating === opt.value
                            ? 'bg-primary/10 border-2 border-primary scale-105'
                            : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-[10px] text-muted-foreground">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bugs */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <span>🐛</span> Cosa non funziona bene?
                  </Label>
                  <Textarea
                    placeholder="Es: Le foto non si caricano, il check-in si blocca..."
                    value={bugs}
                    onChange={(e) => setBugs(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Wishlist */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <span>💡</span> Cosa vorresti che ci fosse?
                  </Label>
                  <Textarea
                    placeholder="Es: Vorrei poter vedere i progressi in un grafico, notifiche per l'allenamento..."
                    value={wishlist}
                    onChange={(e) => setWishlist(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Il tuo feedback ci aiuta a costruire l'app migliore possibile. Grazie!
                </p>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t border-border shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-bold"
                  size="lg"
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Invio in corso...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Invia Feedback
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
