import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateNickname } from '@/lib/italianNicknames';

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  anonymous_nickname: string;
  display_name: string;
  is_premium: boolean;
  created_at: string;
}

export function useCommunityPosts() {
  const { user, isAdmin, isCollaborator, isSuperAdmin } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const isStaff = isAdmin || isCollaborator || isSuperAdmin;

  const resolvePosts = useCallback(async (rawPosts: any[]): Promise<CommunityPost[]> => {
    if (rawPosts.length === 0) return [];

    const userIds = [...new Set(rawPosts.map(p => p.user_id))];

    // Fetch profiles for display names
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    const profileMap = new Map<string, string>();
    (profiles || []).forEach((p: any) => {
      profileMap.set(p.id, p.full_name || p.email?.split('@')[0] || 'Utente');
    });

    // Fetch subscription status for premium badges
    const { data: subs } = await supabase
      .from('user_subscriptions' as any)
      .select('user_id, plan')
      .in('user_id', userIds);

    const premiumSet = new Set<string>();
    (subs as any[] || []).forEach((s: any) => {
      if (s.plan === 'premium') premiumSet.add(s.user_id);
    });

    // Staff/admin roles are always premium
    const { data: staffRoles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds)
      .in('role', ['admin', 'collaborator']);

    (staffRoles || []).forEach((r: any) => {
      premiumSet.add(r.user_id);
    });

    return rawPosts.map(p => ({
      id: p.id,
      user_id: p.user_id,
      content: p.content,
      is_anonymous: p.is_anonymous,
      anonymous_nickname: p.anonymous_nickname || generateNickname(p.user_id),
      display_name: p.is_anonymous
        ? (p.anonymous_nickname || generateNickname(p.user_id))
        : (profileMap.get(p.user_id) || 'Utente'),
      is_premium: premiumSet.has(p.user_id),
      created_at: p.created_at,
    }));
  }, []);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await (supabase.from as any)('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      console.error('community_posts fetch error:', error);
      setPosts([]);
      setLoading(false);
      return;
    }

    const resolved = await resolvePosts(data as any[]);
    setPosts(resolved);
    setLoading(false);
  }, [resolvePosts]);

  const createPost = useCallback(async (content: string, isAnonymous: boolean) => {
    if (!user || !content.trim()) return { error: 'Contenuto vuoto' };

    const nickname = isAnonymous ? generateNickname(user.id) : null;

    const { error } = await (supabase.from as any)('community_posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        is_anonymous: isAnonymous,
        anonymous_nickname: nickname,
      });

    if (error) {
      console.error('community_posts insert error:', error);
      return { error: error.message };
    }

    await fetchPosts();
    return { error: null };
  }, [user, fetchPosts]);

  const deletePost = useCallback(async (postId: string) => {
    if (!user) return;

    const { error } = await (supabase.from as any)('community_posts')
      .delete()
      .eq('id', postId);
    if (error) {
      console.error('community_posts delete error:', error);
    }

    setPosts(prev => prev.filter(p => p.id !== postId));
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('community-posts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        () => {
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_posts' },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchPosts]);

  return {
    posts,
    loading,
    isStaff,
    createPost,
    deletePost,
    refetch: fetchPosts,
  };
}
