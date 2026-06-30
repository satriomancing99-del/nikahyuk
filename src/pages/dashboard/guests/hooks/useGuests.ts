import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/authStore';
import { invitationService, guestService } from '../../../../services';
import { Invitation, Guest } from '../../../../types/database.types';
import { supabase } from '../../../../lib/supabase';
import { normalizeWhatsApp, generateGuestCode } from '../utils/guestNormalizer';

export const useGuests = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuthStore();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [invitationTier, setInvitationTier] = useState<'silver' | 'gold' | 'platinum'>('silver');
  const loadInvitations = async () => {
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
  };

  const loadGuestsAndTier = async () => {
    if (!selectedInvitation) {
      setGuests([]);
      return;
    }
    try {
      setLoading(true);
      const list = await guestService.getByInvitationId(selectedInvitation.id);
      setGuests(list);

      let price = 0;
      const isD1 = import.meta.env.VITE_USE_D1_AUTH === 'true';
      if (isD1) {
        const { templateService } = await import('../../../../services');
        const tpl = await templateService.getById(selectedInvitation.template_id);
        if (tpl) {
          price = Number(tpl.price);
        }
      } else {
        const { data, error } = await supabase
          .from('templates')
          .select('price')
          .eq('id', selectedInvitation.template_id)
          .single();
        
        if (!error && data) {
          price = Number(data.price);
        }
      }

      let tier: 'silver' | 'gold' | 'platinum' = 'silver';
      if (profile?.role === 'super_admin') {
        tier = 'platinum';
      } else if (price === 99000) {
        tier = 'gold';
      } else if (price === 149000) {
        tier = 'platinum';
      }
      setInvitationTier(tier);
    } catch (err) {
      console.error('Error loading guests & tier info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInvitation = (id: string) => {
    const found = invitations.find(i => i.id === id);
    if (found) {
      setSelectedInvitation(found);
      setSearchParams({ invitation: id });
    }
  };

  const handleAddGuest = async (name: string, phone: string, sent_status: string, rsvp_status: string, checkin_status: string) => {
    if (!selectedInvitation || !user) return false;
    const maxGuests = invitationTier === 'silver' ? 150 : invitationTier === 'gold' ? 500 : Infinity;
    if (guests.length >= maxGuests) {
      alert(`Batas kuota tamu tercapai untuk Paket ${invitationTier.toUpperCase()} (${maxGuests} tamu).`);
      return false;
    }

    try {
      setActionLoading(true);
      const normalized = normalizeWhatsApp(phone);
      if (phone && !normalized) {
        alert('Nomor HP tidak valid.');
        return false;
      }

      const existingCodes = new Set(guests.map(g => g.guest_code));
      let guestCode = generateGuestCode();
      while (existingCodes.has(guestCode)) {
        guestCode = generateGuestCode();
      }

      const personalLink = `https://nikahyuk.id/${selectedInvitation.slug}?guest=${guestCode}`;

      const newGuest = await guestService.create({
        invitation_id: selectedInvitation.id,
        name: name.trim(),
        phone: normalized,
        guest_code: guestCode,
        personal_link: personalLink,
        qr_code_value: guestCode,
        sent_status,
        rsvp_status,
        checkin_status
      });

      setGuests(prev => [...prev, newGuest]);
      return true;
    } catch (err: any) {
      console.error('Error creating guest:', err);
      alert(`Gagal menambah tamu: ${err.message}`);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateGuest = async (id: string, name: string, phone: string, sent_status: string, rsvp_status: string, checkin_status: string) => {
    try {
      setActionLoading(true);
      const normalized = normalizeWhatsApp(phone);
      const updated = await guestService.update(id, {
        name: name.trim(),
        phone: normalized,
        sent_status,
        rsvp_status,
        checkin_status
      });
      setGuests(prev => prev.map(g => g.id === id ? updated : g));
      return true;
    } catch (err: any) {
      console.error('Error updating guest:', err);
      alert(`Gagal menyunting tamu: ${err.message}`);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGuest = async (id: string, name: string) => {
    if (!window.confirm(`Konfirmasi hapus tamu "${name}"? Tindakan ini permanen.`)) return;
    try {
      setActionLoading(true);
      await guestService.delete(id);
      setGuests(prev => prev.filter(g => g.id !== id));
      alert('Tamu berhasil dihapus.');
    } catch (err: any) {
      console.error('Error deleting guest:', err);
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [user]);
  useEffect(() => {
    loadGuestsAndTier();
  }, [selectedInvitation, profile]);
  return {
    invitations,
    selectedInvitation,
    guests,
    setGuests,
    loading,
    actionLoading,
    invitationTier,
    handleSelectInvitation,
    handleAddGuest,
    handleUpdateGuest,
    handleDeleteGuest,
    loadGuestsAndTier,
    setActionLoading,
  };
};
