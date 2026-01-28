import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ExerciseVideo {
  id: string;
  title: string;
  category: string;
  trainer: 'maso' | 'martina';
  video_url: string;
  video_type: 'shorts' | 'standard';
  sort_order: number;
  created_at: string;
}

export interface CategoryGroup {
  category: string;
  displayName: string;
  videos: ExerciseVideo[];
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  kettlebell: 'Kettlebell',
  manubri: 'Manubri',
  bilanciere: 'Bilanciere',
  corpo_libero: 'Corpo Libero',
  macchinari: 'Macchinari',
  elastici: 'Elastici / Loop Band',
  trx: 'TRX / Anelli',
  mobilita: 'Mobilità e Stretching',
};

const CATEGORY_ORDER = [
  'corpo_libero',
  'manubri',
  'kettlebell',
  'bilanciere',
  'macchinari',
  'elastici',
  'trx',
  'mobilita',
];

export const useExerciseVideos = () => {
  const [videos, setVideos] = useState<ExerciseVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercise_videos')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching exercise videos:', error);
      } else {
        setVideos((data as ExerciseVideo[]) || []);
      }
      setLoading(false);
    };

    fetchVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    
    const query = searchQuery.toLowerCase();
    return videos.filter(
      video =>
        video.title.toLowerCase().includes(query) ||
        video.trainer.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);

  const groupedByCategory = useMemo((): CategoryGroup[] => {
    const groups: Record<string, ExerciseVideo[]> = {};

    filteredVideos.forEach(video => {
      if (!groups[video.category]) {
        groups[video.category] = [];
      }
      groups[video.category].push(video);
    });

    return CATEGORY_ORDER
      .filter(cat => groups[cat]?.length > 0)
      .map(category => ({
        category,
        displayName: CATEGORY_DISPLAY_NAMES[category] || category,
        videos: groups[category],
      }));
  }, [filteredVideos]);

  const extractVideoId = (url: string): string | null => {
    // YouTube Shorts: youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return shortsMatch[1];

    // Standard YouTube: youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) return watchMatch[1];

    // Short URL: youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) return shortMatch[1];

    return null;
  };

  return {
    videos,
    filteredVideos,
    groupedByCategory,
    loading,
    searchQuery,
    setSearchQuery,
    extractVideoId,
  };
};
