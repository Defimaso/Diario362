import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VideoCorrection {
  id: string;
  user_id: string;
  video_url: string;
  exercise_name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoFeedback {
  id: string;
  video_id: string;
  coach_id: string;
  feedback: string;
  is_read: boolean;
  created_at: string;
  coach_name?: string;
}

export const useVideoCorrections = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoCorrection[]>([]);
  const [feedback, setFeedback] = useState<Record<string, VideoFeedback[]>>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('video_corrections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);

      // Fetch feedback for all videos
      if (data && data.length > 0) {
        const videoIds = data.map(v => v.id);
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('video_correction_feedback')
          .select('*')
          .in('video_id', videoIds)
          .order('created_at', { ascending: true });

        if (!feedbackError && feedbackData) {
          const grouped: Record<string, VideoFeedback[]> = {};
          let unread = 0;
          
          feedbackData.forEach(f => {
            if (!grouped[f.video_id]) grouped[f.video_id] = [];
            grouped[f.video_id].push(f);
            if (!f.is_read) unread++;
          });
          
          setFeedback(grouped);
          setUnreadCount(unread);
        }
      }
    } catch (error) {
      console.error('Error fetching video corrections:', error);
    }
    
    setLoading(false);
  };

  const uploadVideo = async (file: File, exerciseName: string, notes?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${timestamp}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('exercise-corrections')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get signed URL (private bucket)
      const { data: urlData } = await supabase.storage
        .from('exercise-corrections')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

      if (!urlData?.signedUrl) throw new Error('Failed to get video URL');

      // Insert record
      const { data: insertData, error: insertError } = await supabase
        .from('video_corrections')
        .insert({
          user_id: user.id,
          video_url: urlData.signedUrl,
          exercise_name: exerciseName,
          notes: notes || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Send push notification to coaches
      try {
        await supabase.functions.invoke('notify-video-correction', {
          body: {
            type: 'video_uploaded',
            videoId: insertData.id,
            clientId: user.id,
            clientName: profile?.full_name || user.email,
            exerciseName,
          }
        });
      } catch (notifyError) {
        console.warn('Failed to send notification:', notifyError);
        // Don't fail the upload if notification fails
      }

      await fetchVideos();
      return { error: null };
    } catch (error) {
      console.error('Error uploading video:', error);
      return { error };
    }
  };

  const markFeedbackAsRead = async (feedbackId: string) => {
    const { error } = await supabase
      .from('video_correction_feedback')
      .update({ is_read: true })
      .eq('id', feedbackId);

    if (!error) {
      await fetchVideos();
    }
    return { error };
  };

  const markAllFeedbackAsRead = async () => {
    if (!user) return;

    // Get all unread feedback for user's videos
    const videoIds = videos.map(v => v.id);
    if (videoIds.length === 0) return;

    const { error } = await supabase
      .from('video_correction_feedback')
      .update({ is_read: true })
      .in('video_id', videoIds)
      .eq('is_read', false);

    if (!error) {
      await fetchVideos();
    }
  };

  const deleteVideo = async (videoId: string) => {
    const { error } = await supabase
      .from('video_corrections')
      .delete()
      .eq('id', videoId);

    if (!error) {
      await fetchVideos();
    }
    return { error };
  };

  // Subscribe to realtime feedback updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('video-feedback-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_correction_feedback',
        },
        () => {
          fetchVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchVideos();
  }, [user]);

  return {
    videos,
    feedback,
    unreadCount,
    loading,
    uploadVideo,
    markFeedbackAsRead,
    markAllFeedbackAsRead,
    deleteVideo,
    refetch: fetchVideos,
  };
};
