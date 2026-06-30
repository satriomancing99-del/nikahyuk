import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/authStore';
import { invitationService, rsvpService } from '../../../../services';
import { Invitation, Rsvp as DBRsvp } from '../../../../types/database.types';
import { supabase } from '../../../../lib/supabase';

export function useRsvp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuthStore();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [rsvps, setRsvps] = useState<DBRsvp[]>([]);
  const [associatedGuests, setAssociatedGuests] = useState<Record<string, { phone?: string }>>({});
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
        console.error('Error fetching invitations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvitations();
  }, [user, profile?.role]);

  const loadRsvps = async () => {
    if (!selectedInvitation) {
      setRsvps([]);
      return;
    }
    
    try {
      setLoading(true);
      const list = await rsvpService.getByInvitationId(selectedInvitation.id);
      setRsvps(list);

      const guestIds = list.map(r => r.guest_id).filter((id): id is string => !!id);
      if (guestIds.length > 0) {
        const { data: guestsData } = await supabase
          .from('guests')
          .select('id, phone')
          .in('id', guestIds);
        
        if (guestsData) {
          const mapping: Record<string, { phone?: string }> = {};
          guestsData.forEach(g => {
            mapping[g.id] = { phone: g.phone };
          });
          setAssociatedGuests(mapping);
        }
      }
    } catch (err) {
      console.error('Error loading RSVPs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRsvps();
  }, [selectedInvitation]);

  const handleDeleteRsvp = async (id: string, guestId: string | null, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus respon RSVP dari "${name}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await rsvpService.delete(id);

      if (guestId) {
        await supabase
          .from('guests')
          .update({ rsvp_status: 'pending' })
          .eq('id', guestId);
      }

      setRsvps(prev => prev.filter(r => r.id !== id));
      alert('Berhasil menghapus respon RSVP.');
    } catch (err: any) {
      console.error('Error deleting RSVP:', err);
      alert(`Gagal menghapus RSVP: ${err.message || 'Database error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleContactGuest = (guestId: string | null, name: string) => {
    const phone = guestId ? associatedGuests[guestId]?.phone : null;
    if (!phone) {
      alert('Nomor telepon kustomer tidak tertaut dengan daftar tamu personal.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Halo ${name}, terima kasih telah mengisi konfirmasi kehadiran (RSVP) di undangan kami.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const filteredRsvps = rsvps.filter(r => {
    const matchesSearch = r.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.message && r.message.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || r.attendance_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attendance_status === 'attending').length,
    declined: rsvps.filter(r => r.attendance_status === 'declined').length,
    uncertain: rsvps.filter(r => r.attendance_status === 'uncertain').length,
    totalGuests: rsvps
      .filter(r => r.attendance_status === 'attending')
      .reduce((sum, r) => sum + (Number(r.total_guest) || 1), 0)
  };

  return {
    invitations,
    selectedInvitation,
    setSelectedInvitation,
    rsvps,
    associatedGuests,
    loading,
    actionLoading,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    loadRsvps,
    handleDeleteRsvp,
    handleContactGuest,
    filteredRsvps,
    stats,
    setSearchParams
  };
}
