import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProgressCheck {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  photo_front_url: string | null;
  photo_side_url: string | null;
  photo_back_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TimeFilter = '3months' | '6months' | 'all';

export const useProgressChecks = (clientId?: string) => {
  const { user } = useAuth();
  const [progressChecks, setProgressChecks] = useState<ProgressCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const targetUserId = clientId || user?.id;

  const fetchProgressChecks = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Optimized query - fetch all at once, ordered by date DESC
    const { data, error } = await supabase
      .from('progress_checks')
      .select('*')
      .eq('user_id', targetUserId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching progress checks:', error);
    } else {
      setProgressChecks(data || []);
    }
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchProgressChecks();
  }, [fetchProgressChecks]);

  // Filter data by time period (client-side for instant filtering)
  const getFilteredData = useCallback((filter: TimeFilter): ProgressCheck[] => {
    if (filter === 'all') return progressChecks;

    const now = new Date();
    const monthsBack = filter === '3months' ? 3 : 6;
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, now.getDate());

    return progressChecks.filter(check => new Date(check.date) >= cutoffDate);
  }, [progressChecks]);

  // Get dates that have photos for comparison selector
  const getDatesWithPhotos = useCallback((): ProgressCheck[] => {
    return progressChecks.filter(
      check => check.photo_front_url || check.photo_side_url || check.photo_back_url
    );
  }, [progressChecks]);

  // Get first and latest check for "Inizio vs Oggi" comparison
  const getComparisonDefaults = useCallback(() => {
    const withPhotos = getDatesWithPhotos();
    if (withPhotos.length < 2) return { start: null, end: null };
    
    return {
      start: withPhotos[withPhotos.length - 1], // Oldest
      end: withPhotos[0], // Most recent
    };
  }, [getDatesWithPhotos]);

  // Upload photo to storage
  const uploadPhoto = async (file: File, type: 'front' | 'side' | 'back'): Promise<string | null> => {
    if (!targetUserId) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${targetUserId}/${Date.now()}_${type}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Save progress check
  const saveProgressCheck = async (data: {
    date: string;
    weight?: number;
    photoFront?: File;
    photoSide?: File;
    photoBack?: File;
    notes?: string;
  }) => {
    if (!targetUserId) return { error: new Error('Not authenticated') };

    setUploading(true);

    try {
      // Upload photos in parallel if provided
      const [frontUrl, sideUrl, backUrl] = await Promise.all([
        data.photoFront ? uploadPhoto(data.photoFront, 'front') : Promise.resolve(null),
        data.photoSide ? uploadPhoto(data.photoSide, 'side') : Promise.resolve(null),
        data.photoBack ? uploadPhoto(data.photoBack, 'back') : Promise.resolve(null),
      ]);

      // Check if a check exists for this date
      const existing = progressChecks.find(c => c.date === data.date);

      const checkData = {
        weight: data.weight || null,
        photo_front_url: frontUrl || existing?.photo_front_url || null,
        photo_side_url: sideUrl || existing?.photo_side_url || null,
        photo_back_url: backUrl || existing?.photo_back_url || null,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from('progress_checks')
          .update(checkData)
          .eq('id', existing.id);

        if (!error) await fetchProgressChecks();
        return { error };
      } else {
        const { error } = await supabase
          .from('progress_checks')
          .insert({
            user_id: targetUserId,
            date: data.date,
            ...checkData,
          });

        if (!error) await fetchProgressChecks();
        return { error };
      }
    } finally {
      setUploading(false);
    }
  };

  // Get signed URL for private photos
  const getSignedPhotoUrl = async (path: string): Promise<string | null> => {
    // Extract just the file path from the full URL if needed
    const pathOnly = path.includes('progress-photos/') 
      ? path.split('progress-photos/')[1] 
      : path;

    const { data, error } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(pathOnly, 3600); // 1 hour expiry

    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }

    return data.signedUrl;
  };

  return {
    progressChecks,
    loading,
    uploading,
    getFilteredData,
    getDatesWithPhotos,
    getComparisonDefaults,
    saveProgressCheck,
    getSignedPhotoUrl,
    refetch: fetchProgressChecks,
  };
};
