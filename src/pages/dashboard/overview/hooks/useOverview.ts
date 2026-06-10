import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/authStore';
import { invitationService, guestService } from '../../../../services';
import { Invitation, Guest } from '../../../../types/database.types';
import { supabase } from '../../../../lib/supabase';
import { handleExportExcel as exportExcelFn } from '../utils/exportHelper';

export function useOverview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuthStore();
  
  const [adminStats, setAdminStats] = useState<{
    totalUsers: number;
    totalInvitations: number;
    totalTransactions: number;
    pendingTransactions: number;
  } | null>(null);
  const [loadingAdminStats, setLoadingAdminStats] = useState(false);

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [recentRsvps, setRecentRsvps] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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
        console.error('Error fetching invitations in dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvitations();
  }, [user, profile?.role]);

  useEffect(() => {
    if (profile?.role !== 'super_admin' || !user) return;
    async function loadAdminStats() {
      try {
        setLoadingAdminStats(true);
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: invsCount } = await supabase
          .from('invitations')
          .select('*', { count: 'exact', head: true });

        const { data: txs } = await supabase
          .from('transactions')
          .select('payment_status');

        const totalTransactions = txs?.length || 0;
        const pendingTransactions = txs?.filter((t: any) => t.payment_status === 'pending').length || 0;

        setAdminStats({
          totalUsers: usersCount || 0,
          totalInvitations: invsCount || 0,
          totalTransactions,
          pendingTransactions
        });
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoadingAdminStats(false);
      }
    }
    loadAdminStats();
  }, [profile, user]);

  const fetchStats = async () => {
    if (!selectedInvitation) return;
    try {
      const list = await guestService.getByInvitationId(selectedInvitation.id);
      setGuests(list);

      const { data: rsvps, error } = await supabase
        .from('rsvps')
        .select('*')
        .eq('invitation_id', selectedInvitation.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && rsvps) {
        setRecentRsvps(rsvps);
      }
    } catch (e) {
      console.error('Error fetching dashboard statistics:', e);
    }
  };

  useEffect(() => {
    if (!selectedInvitation) return;
    fetchStats();
  }, [selectedInvitation]);

  const handleSelectInvitation = (id: string) => {
    const found = invitations.find(i => i.id === id);
    if (found) {
      setSelectedInvitation(found);
      setSearchParams({ invitation: id });
    }
  };

  const totalGuests = guests.length;
  const totalCheckedIn = guests.filter(g => g.checkin_status === 'checked_in').length;
  const totalNotCheckedIn = totalGuests - totalCheckedIn;

  const rsvpHadir = guests.filter(g => g.rsvp_status === 'attending').length;
  const rsvpAbsen = guests.filter(g => g.rsvp_status === 'declined').length;
  const rsvpRagu = guests.filter(g => g.rsvp_status === 'uncertain').length;

  const percentCheckedIn = totalGuests > 0 ? Math.round((totalCheckedIn / totalGuests) * 100) : 0;
  const percentRsvpHadir = totalGuests > 0 ? Math.round((rsvpHadir / totalGuests) * 100) : 0;
  const percentRsvpAbsen = totalGuests > 0 ? Math.round((rsvpAbsen / totalGuests) * 100) : 0;
  const percentRsvpRagu = totalGuests > 0 ? Math.round((rsvpRagu / totalGuests) * 100) : 0;

  const handleExportExcel = () => {
    if (!selectedInvitation) return;
    exportExcelFn(selectedInvitation, guests, setExporting);
  };

  return {
    profile,
    adminStats,
    loadingAdminStats,
    invitations,
    selectedInvitation,
    guests,
    recentRsvps,
    loading,
    exporting,
    totalGuests,
    totalCheckedIn,
    totalNotCheckedIn,
    rsvpHadir,
    rsvpAbsen,
    rsvpRagu,
    percentCheckedIn,
    percentRsvpHadir,
    percentRsvpAbsen,
    percentRsvpRagu,
    handleSelectInvitation,
    handleExportExcel
  };
}
