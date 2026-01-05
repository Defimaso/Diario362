import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CoachNote {
  id: string;
  client_id: string;
  author_id: string;
  content: string;
  read_by: string[];
  created_at: string;
  author_name?: string;
}

export const useCoachNotes = () => {
  const [notes, setNotes] = useState<Record<string, CoachNote[]>>({});
  const [loading, setLoading] = useState(true);
  const { user, isSuperAdmin, isCollaborator } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!user || (!isSuperAdmin && !isCollaborator)) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('coach_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coach notes:', error);
        return;
      }

      // Group notes by client_id
      const groupedNotes: Record<string, CoachNote[]> = {};
      (data || []).forEach((note: CoachNote) => {
        if (!groupedNotes[note.client_id]) {
          groupedNotes[note.client_id] = [];
        }
        groupedNotes[note.client_id].push(note);
      });

      setNotes(groupedNotes);
    } catch (err) {
      console.error('Error in fetchNotes:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin, isCollaborator]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (clientId: string, content: string): Promise<boolean> => {
    if (!user || !isSuperAdmin) return false;

    try {
      const { error } = await supabase
        .from('coach_notes')
        .insert({
          client_id: clientId,
          author_id: user.id,
          content: content.trim(),
          read_by: []
        });

      if (error) {
        console.error('Error adding note:', error);
        return false;
      }

      await fetchNotes();
      return true;
    } catch (err) {
      console.error('Error in addNote:', err);
      return false;
    }
  };

  const markAsRead = async (noteId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get current note
      const { data: note, error: fetchError } = await supabase
        .from('coach_notes')
        .select('read_by')
        .eq('id', noteId)
        .single();

      if (fetchError || !note) return false;

      // Check if already read
      const currentReadBy = (note.read_by as string[]) || [];
      if (currentReadBy.includes(user.id)) return true;

      // Update with new reader
      const { error } = await supabase
        .from('coach_notes')
        .update({ read_by: [...currentReadBy, user.id] })
        .eq('id', noteId);

      if (error) {
        console.error('Error marking note as read:', error);
        return false;
      }

      await fetchNotes();
      return true;
    } catch (err) {
      console.error('Error in markAsRead:', err);
      return false;
    }
  };

  const getUnreadCount = (clientId: string): number => {
    if (!user || !notes[clientId]) return 0;
    return notes[clientId].filter(note => 
      !note.read_by.includes(user.id) && note.author_id !== user.id
    ).length;
  };

  const hasUnreadNotes = (clientId: string): boolean => {
    return getUnreadCount(clientId) > 0;
  };

  return {
    notes,
    loading,
    addNote,
    markAsRead,
    getUnreadCount,
    hasUnreadNotes,
    refetch: fetchNotes
  };
};
