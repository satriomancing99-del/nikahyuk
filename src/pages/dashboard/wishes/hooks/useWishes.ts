import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/authStore';
import { invitationService, wishService } from '../../../../services';
import { Invitation, Wish } from '../../../../types/database.types';
import { supabase } from '../../../../lib/supabase';

export function useWishes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuthStore();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    async function loadInvitations() {
      if (!user) return;
      try {
        setLoading(true);
        const list = profile?.role === 'super_admin'
          ? await invitationService.getAll()
          : await invitationService.getByUserId(user.id);
        setInvitations(list);

        const queryId = searchParams.get('invitation');
        if (queryId) {
          const found = list.find(inv => inv.id === queryId);
          if (found) {
            setSelectedInvitation(found);
            return;
          }
        }

        if (list.length > 0) {
          setSelectedInvitation(list[0]);
          setSearchParams({ invitation: list[0].id });
        }
      } catch (err) {
        console.error('Error fetching invitations in wishes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvitations();
  }, [user, profile?.role]);

  const loadWishes = async () => {
    if (!selectedInvitation) {
      setWishes([]);
      return;
    }
    
    try {
      setLoading(true);
      if (import.meta.env.VITE_USE_D1_AUTH === 'true') {
        const { cloudflareApi } = await import('../../../../lib/cloudflare-api');
        const list = await cloudflareApi.getTableRows<Wish>('wishes', { invitation_id: selectedInvitation.id });
        setWishes(list || []);
      } else {
        const { data, error } = await supabase
          .from('wishes')
          .select('*')
          .eq('invitation_id', selectedInvitation.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWishes(data || []);
      }
    } catch (err) {
      console.error('Error loading wishes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishes();
  }, [selectedInvitation]);

  const handleDeleteWish = async (id: string, senderName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ucapan dari "${senderName}"? Tindakan moderasi ini permanen.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await wishService.delete(id);
      setWishes(prev => prev.filter(w => w.id !== id));
      alert('Ucapan berhasil dihapus dari dinding undangan.');
    } catch (err: any) {
      console.error('Error deleting wish:', err);
      alert(`Gagal menghapus ucapan: ${err.message || 'Database error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyWish = (wish: Wish) => {
    const text = `"${wish.message}"\n\n— Dari: ${wish.guest_name}`;
    navigator.clipboard.writeText(text);
    setCopiedId(wish.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredWishes = wishes
    .filter(w => {
      const matchesSearch = w.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            w.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const countToday = wishes.filter(w => {
    const time = new Date(w.created_at).getTime();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return time > oneDayAgo;
  }).length;

  const averageLength = wishes.length > 0 
    ? Math.round(wishes.reduce((sum, w) => sum + (w.message?.length || 0), 0) / wishes.length)
    : 0;

  return {
    invitations,
    selectedInvitation,
    setSelectedInvitation,
    wishes,
    loading,
    actionLoading,
    copiedId,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    loadWishes,
    handleDeleteWish,
    handleCopyWish,
    filteredWishes,
    countToday,
    averageLength,
    setSearchParams
  };
}
