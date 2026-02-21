import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, MessageCircle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMessages, Message } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ChatViewProps {
  otherUserId: string;
  otherUserName: string;
  onBack: () => void;
}

export function ChatView({ otherUserId, otherUserName, onBack }: ChatViewProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(otherUserId);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    const { error } = await sendMessage(otherUserId, newMessage);
    if (!error) setNewMessage('');
    setIsSending(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    return isToday ? time : `${d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} ${time}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold">{otherUserName}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground text-sm py-8">Caricamento...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            Nessun messaggio. Inizia la conversazione!
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5',
                  isMine
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={cn(
                    'text-[10px] mt-1',
                    isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  )}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Scrivi un messaggio..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface Coach {
  id: string;
  name: string;
}

interface CoachSelectorProps {
  onSelect: (userId: string, userName: string) => void;
  onClose: () => void;
}

function CoachSelector({ onSelect, onClose }: CoachSelectorProps) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoaches = async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'collaborator'] as any);

      if (!roles || roles.length === 0) { setLoading(false); return; }

      const ids = roles.map((r: any) => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', ids);

      const list: Coach[] = (profiles || []).map((p: any) => ({
        id: p.id,
        name: p.full_name || p.email,
      }));

      setCoaches(list);
      setLoading(false);
    };
    fetchCoaches();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-lg bg-card rounded-t-2xl p-5 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base">Scrivi al Coach</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Caricamento...</p>
        ) : coaches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nessun coach disponibile</p>
        ) : (
          <div className="space-y-2">
            {coaches.map((coach) => (
              <button
                key={coach.id}
                onClick={() => { onSelect(coach.id, coach.name); onClose(); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">{coach.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="font-medium text-sm">{coach.name}</span>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface ConversationListProps {
  onSelectConversation: (userId: string, userName: string) => void;
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const { conversations, loading } = useMessages();
  const [showCoachSelector, setShowCoachSelector] = useState(false);

  if (loading) {
    return <p className="text-center text-muted-foreground text-sm py-8">Caricamento...</p>;
  }

  return (
    <>
      {conversations.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">Nessuna conversazione</p>
          <p className="text-xs text-muted-foreground mt-1 mb-5">I messaggi con il tuo coach appariranno qui</p>
          <Button onClick={() => setShowCoachSelector(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Scrivi al Coach
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-3">
            <Button size="sm" variant="outline" onClick={() => setShowCoachSelector(true)} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Nuova conversazione
            </Button>
          </div>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <motion.button
                key={conv.userId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectConversation(conv.userId, conv.userName)}
                className="w-full text-left p-4 rounded-xl bg-card hover:bg-muted/50 transition-colors border border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {conv.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{conv.userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(conv.lastMessageAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}

      {showCoachSelector && (
        <CoachSelector
          onSelect={onSelectConversation}
          onClose={() => setShowCoachSelector(false)}
        />
      )}
    </>
  );
}
