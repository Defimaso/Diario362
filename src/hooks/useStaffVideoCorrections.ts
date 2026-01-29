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
  video_url: string | null;
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

  const addFeedback = async (videoId: string, feedbackText: string, videoFile?: File) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      let videoUrl: string | null = null;

      // Upload video if provided
      if (videoFile) {
        const timestamp = Date.now();
        const fileExt = videoFile.name.split('.').pop();
        const filePath = `coach-feedback/${user.id}/${timestamp}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('exercise-corrections')
          .upload(filePath, videoFile);

        if (uploadError) throw uploadError;

        // Get signed URL
        const { data: urlData } = await supabase.storage
          .from('exercise-corrections')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

        if (urlData?.signedUrl) {
          videoUrl = urlData.signedUrl;
        }
      }

      const { error } = await supabase
        .from('video_correction_feedback')
        .insert({
          video_id: videoId,
          coach_id: user.id,
          feedback: feedbackText || '',
          video_url: videoUrl,
        });

      if (error) throw error;

      // Find the video to get client info
      const video = clientVideos.find(v => v.id === videoId);
      
      // Send push notification to client
      if (video) {
        try {
          await supabase.functions.invoke('notify-video-correction', {
            body: {
              type: 'feedback_added',
              videoId,
              clientId: video.user_id,
              exerciseName: video.exercise_name,
              coachId: user.id,
            }
          });
        } catch (notifyError) {
          console.warn('Failed to send notification:', notifyError);
        }
      }

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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_correction_feedback',
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
