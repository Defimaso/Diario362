import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserCheck {
  id: string;
  user_id: string;
  check_number: number;
  weight: number | null;
  photo_front_url: string | null;
  photo_side_url: string | null;
  photo_back_url: string | null;
  notes: string | null;
  check_date: string;
  created_at: string;
  updated_at: string;
}

const TOTAL_CHECKS = 100;

export const useUserChecks = (clientId?: string) => {
  const { user } = useAuth();
  const [checks, setChecks] = useState<UserCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const targetUserId = clientId || user?.id;

  const fetchChecks = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase
      .from('user_checks')
      .select('*')
      .eq('user_id', targetUserId)
      .order('check_number', { ascending: true });

    if (error) {
      console.error('Error fetching user checks:', error);
    } else {
      setChecks(data || []);
    }
    
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  // Get all check slots (1-100) with their data or placeholder
  const getCheckSlots = useCallback(() => {
    const slots = [];
    for (let i = 1; i <= TOTAL_CHECKS; i++) {
      const existingCheck = checks.find(c => c.check_number === i);
      slots.push({
        checkNumber: i,
        data: existingCheck || null,
        isCompleted: !!existingCheck,
      });
    }
    return slots;
  }, [checks]);

  // Get first and last completed checks for comparison
  const getComparisonData = useCallback(() => {
    const completedChecks = checks.filter(c => 
      c.photo_front_url || c.photo_side_url || c.photo_back_url || c.weight
    ).sort((a, b) => a.check_number - b.check_number);

    if (completedChecks.length < 2) {
      return null;
    }

    return {
      first: completedChecks[0],
      last: completedChecks[completedChecks.length - 1],
      weightDifference: completedChecks[completedChecks.length - 1].weight && completedChecks[0].weight
        ? (completedChecks[completedChecks.length - 1].weight! - completedChecks[0].weight!)
        : null,
    };
  }, [checks]);

  // Get weight data for chart
  const getWeightChartData = useCallback(() => {
    return checks
      .filter(c => c.weight !== null)
      .sort((a, b) => new Date(a.check_date).getTime() - new Date(b.check_date).getTime())
      .map(c => ({
        date: c.check_date,
        weight: c.weight!,
        checkNumber: c.check_number,
      }));
  }, [checks]);

  // Upload photo to storage (file is already compressed by ImageCropperModal)
  const uploadPhoto = async (file: File, checkNumber: number, type: 'front' | 'side' | 'back'): Promise<string | null> => {
    if (!targetUserId) return null;

    try {
      const fileName = `${targetUserId}/check_${checkNumber}_${type}_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file, {
          contentType: 'image/jpeg',
          upsert: true, // Prevent "already exists" errors on retry/race conditions
        });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError.message, uploadError);
        // Show specific error message to help debug
        const msg = uploadError.message?.includes('security')
          ? 'Permesso negato. Riprova il login.'
          : uploadError.message?.includes('size')
          ? 'Foto troppo grande.'
          : `Errore upload foto ${type}`;
        toast.error(msg);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Upload photo failed:', err);
      toast.error(`Errore upload foto ${type}. Controlla la connessione.`);
      return null;
    }
  };

  // Save or update a check
  const saveCheck = async (data: {
    checkNumber: number;
    weight?: number;
    photoFront?: File;
    photoSide?: File;
    photoBack?: File;
    notes?: string;
    checkDate: string;
  }) => {
    if (!targetUserId) return { error: new Error('Not authenticated') };

    setUploading(true);

    try {
      // Upload photos in parallel if provided
      const [frontUrl, sideUrl, backUrl] = await Promise.all([
        data.photoFront ? uploadPhoto(data.photoFront, data.checkNumber, 'front') : Promise.resolve(null),
        data.photoSide ? uploadPhoto(data.photoSide, data.checkNumber, 'side') : Promise.resolve(null),
        data.photoBack ? uploadPhoto(data.photoBack, data.checkNumber, 'back') : Promise.resolve(null),
      ]);

      // Check if this check already exists
      const existing = checks.find(c => c.check_number === data.checkNumber);

      const checkData = {
        weight: data.weight || null,
        photo_front_url: frontUrl || existing?.photo_front_url || null,
        photo_side_url: sideUrl || existing?.photo_side_url || null,
        photo_back_url: backUrl || existing?.photo_back_url || null,
        notes: data.notes || null,
        check_date: data.checkDate,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from('user_checks')
          .update(checkData)
          .eq('id', existing.id);

        if (error) {
          toast.error('Errore nel salvataggio del check');
        } else {
          await fetchChecks();
        }
        return { error };
      } else {
        const { error } = await supabase
          .from('user_checks')
          .insert({
            user_id: targetUserId,
            check_number: data.checkNumber,
            ...checkData,
          });

        if (error) {
          toast.error('Errore nel salvataggio del check');
        } else {
          // Notify coaches about new check submission (fire and forget)
          supabase.functions.invoke('notify-interaction', {
            body: {
              type: 'check_submitted',
              clientId: targetUserId,
              authorId: targetUserId,
              metadata: { checkNumber: data.checkNumber },
            }
          }).catch(err => console.error('Notify error:', err));

          await fetchChecks();
        }
        return { error };
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Errore sconosciuto');
      toast.error('Errore nel salvataggio del check');
      return { error };
    } finally {
      setUploading(false);
    }
  };

  // Delete a check by id
  const deleteCheck = async (checkId: string) => {
    try {
      const { error } = await supabase
        .from('user_checks')
        .delete()
        .eq('id', checkId);

      if (error) {
        toast.error('Errore nella cancellazione del check');
      } else {
        toast.success('Check eliminato');
        await fetchChecks();
      }
      return { error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Errore sconosciuto');
      toast.error('Errore nella cancellazione del check');
      return { error };
    }
  };

  // Get signed URL for photos
  const getSignedPhotoUrl = async (url: string): Promise<string | null> => {
    if (!url) return null;
    
    // If it's already a public URL, return as-is
    if (url.includes('public')) {
      return url;
    }

    // Extract path from URL
    const pathMatch = url.match(/progress-photos\/(.+)/);
    if (!pathMatch) return url;

    const { data, error } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(pathMatch[1], 3600);

    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }

    return data.signedUrl;
  };

  // Get first check with photos for ghost overlay reference
  const getFirstCheckWithPhotos = useCallback(() => {
    return checks.find(c => 
      c.check_number === 1 && 
      (c.photo_front_url || c.photo_side_url || c.photo_back_url)
    ) || null;
  }, [checks]);

  return {
    checks,
    loading,
    uploading,
    getCheckSlots,
    getComparisonData,
    getWeightChartData,
    saveCheck,
    deleteCheck,
    getSignedPhotoUrl,
    getFirstCheckWithPhotos,
    refetch: fetchChecks,
    totalChecks: TOTAL_CHECKS,
    completedChecksCount: checks.length,
  };
};
