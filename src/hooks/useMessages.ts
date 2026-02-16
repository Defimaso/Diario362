import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function useMessages(otherUserId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages' as any)
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error || !data) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Group by conversation partner
    const convMap = new Map<string, { messages: any[]; unread: number }>();

    for (const msg of (data as any[])) {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, { messages: [], unread: 0 });
      }
      const conv = convMap.get(partnerId)!;
      conv.messages.push(msg);
      if (msg.receiver_id === user.id && !msg.read_at) {
        conv.unread++;
      }
    }

    // Get partner names from profiles
    const partnerIds = Array.from(convMap.keys());
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', partnerIds);

    const profileMap = new Map<string, string>();
    (profiles || []).forEach((p: any) => {
      profileMap.set(p.id, p.full_name || p.email);
    });

    let totalUnread = 0;
    const convList: Conversation[] = [];

    convMap.forEach((conv, partnerId) => {
      const lastMsg = conv.messages[0];
      totalUnread += conv.unread;
      convList.push({
        userId: partnerId,
        userName: profileMap.get(partnerId) || 'Utente',
        lastMessage: lastMsg.content,
        lastMessageAt: lastMsg.created_at,
        unreadCount: conv.unread,
      });
    });

    // Sort by last message
    convList.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    setConversations(convList);
    setUnreadTotal(totalUnread);
    setLoading(false);
  }, [user]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async () => {
    if (!user || !otherUserId) return;

    const { data, error } = await supabase
      .from('messages' as any)
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as unknown as Message[]);

      // Mark unread messages as read
      const unreadIds = (data as any[])
        .filter(m => m.receiver_id === user.id && !m.read_at)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages' as any)
          .update({ read_at: new Date().toISOString() } as any)
          .in('id', unreadIds);
      }
    }

    setLoading(false);
  }, [user, otherUserId]);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user || !content.trim()) return { error: 'Messaggio vuoto' };

    const { data, error } = await supabase
      .from('messages' as any)
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
      } as any)
      .select()
      .single();

    if (error) return { error: error.message };

    setMessages(prev => [...prev, data as unknown as Message]);
    return { error: null };
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (otherUserId) {
      fetchMessages();
    } else {
      fetchConversations();
    }
  }, [otherUserId, fetchMessages, fetchConversations]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            if (otherUserId) {
              // In conversation view - add message
              if (msg.sender_id === otherUserId || msg.receiver_id === otherUserId) {
                setMessages(prev => [...prev, msg]);
                // Auto-mark as read
                if (msg.receiver_id === user.id) {
                  supabase
                    .from('messages' as any)
                    .update({ read_at: new Date().toISOString() } as any)
                    .eq('id', msg.id);
                }
              }
            } else {
              // In conversation list - refresh
              fetchConversations();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherUserId, fetchConversations]);

  return {
    messages,
    conversations,
    unreadTotal,
    loading,
    sendMessage,
    refetch: otherUserId ? fetchMessages : fetchConversations,
  };
}
