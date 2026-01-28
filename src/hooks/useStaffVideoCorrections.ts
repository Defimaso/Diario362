import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClientVideo {
  id: string;
  user_id: string;
  video_url: string;
  exercise_name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_email?: string;
}

export interface StaffVideoFeedback {
  id: string;
  video_id: string;
  coach_id: string;
  feedback: string;
  is_read: boolean;
  created_at: string;
}

export const useStaffVideoCorrections = () => {
  const { user, isAdmin, isCollaborator, isSuperAdmin } = useAuth();
  const [clientVideos, setClientVideos] = useState<ClientVideo[]>([]);
  const [allFeedback, setAllFeedback] = useState<Record<string, StaffVideoFeedback[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchClientVideos = async () => {
    if (!user || (!isAdmin && !isCollaborator && !isSuperAdmin)) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all videos (RLS will filter based on role)
      const { data: videos, error } = await supabase
        .from('video_corrections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch client profiles to get names
      if (videos && videos.length > 0) {
        const userIds = [...new Set(videos.map(v => v.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const enrichedVideos = videos.map(v => ({
          ...v,
          client_name: profileMap.get(v.user_id)?.full_name || 'Cliente',
          client_email: profileMap.get(v.user_id)?.email || '',
        }));

        setClientVideos(enrichedVideos);

        // Fetch all feedback
        const videoIds = videos.map(v => v.id);
        const { data: feedbackData } = await supabase
          .from('video_correction_feedback')
          .select('*')
          .in('video_id', videoIds)
          .order('created_at', { ascending: true });

        if (feedbackData) {
          const grouped: Record<string, StaffVideoFeedback[]> = {};
          feedbackData.forEach(f => {
            if (!grouped[f.video_id]) grouped[f.video_id] = [];
            grouped[f.video_id].push(f);
          });
          setAllFeedback(grouped);
        }
      }
    } catch (error) {
      console.error('Error fetching client videos:', error);
    }

    setLoading(false);
  };

  const addFeedback = async (videoId: string, feedbackText: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('video_correction_feedback')
        .insert({
          video_id: videoId,
          coach_id: user.id,
          feedback: feedbackText,
        });

      if (error) throw error;

      await fetchClientVideos();
      return { error: null };
    } catch (error) {
      console.error('Error adding feedback:', error);
      return { error };
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    try {
      const { error } = await supabase
        .from('video_correction_feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;

      await fetchClientVideos();
      return { error: null };
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchClientVideos();
  }, [user, isAdmin, isCollaborator, isSuperAdmin]);

  // Subscribe to new video uploads
  useEffect(() => {
    if (!user || (!isAdmin && !isCollaborator && !isSuperAdmin)) return;

    const channel = supabase
      .channel('staff-video-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_corrections',
        },
        () => {
          fetchClientVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, isCollaborator, isSuperAdmin]);

  return {
    clientVideos,
    allFeedback,
    loading,
    addFeedback,
    deleteFeedback,
    refetch: fetchClientVideos,
  };
};
