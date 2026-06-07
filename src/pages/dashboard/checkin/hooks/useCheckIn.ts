import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../../stores/authStore';
import { invitationService, guestService } from '../../../../services';
import { Invitation, Guest } from '../../../../types/database.types';
import { supabase } from '../../../../lib/supabase';
import { playBeep } from '../utils/soundHelper';

export function useCheckIn() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuthStore();
  
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [recentCheckedIn, setRecentCheckedIn] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guestCodeInput, setGuestCodeInput] = useState('');
  
  const scanInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRsvp, setFilterRsvp] = useState('all');
  const [filterCheckin, setFilterCheckin] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [feedback, setFeedback] = useState<{
    status: 'success' | 'error' | 'warning' | null;
    message: string;
    guestName?: string;
    guestCode?: string;
    timestamp?: string;
  }>({ status: null, message: '' });

  useEffect(() => {
    async function loadInvitations() {
      if (!user) return;
      try {
        setLoading(true);
        const list = profile?.role === 'super_admin'
          ? await invitationService.getAll()
          : await invitationService.getByUserId(user.id);
        setInvitations(list);

        const urlInvId = searchParams.get('invitation');
        if (urlInvId) {
          const found = list.find(inv => inv.id === urlInvId);
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
        console.error('Error fetching invitations for check-in:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvitations();
  }, [user, profile?.role]);

  const fetchGuestsAndLogs = async () => {
    if (!selectedInvitation) return;
    try {
      const list = await guestService.getByInvitationId(selectedInvitation.id);
      setGuests(list);

      const { data: logs, error } = await supabase
        .from('checkins')
        .select(`
          id,
          guest_id,
          checked_in_at,
          checked_in_by,
          status,
          guests:guest_id (
            name,
            guest_code,
            phone,
            rsvp_status
          )
        `)
        .eq('invitation_id', selectedInvitation.id)
        .order('checked_in_at', { ascending: false })
        .limit(10);

      if (!error && logs) {
        setRecentCheckedIn(logs);
      }
    } catch (e) {
      console.error('Error fetching guest logs:', e);
    }
  };

  useEffect(() => {
    if (!selectedInvitation) return;
    fetchGuestsAndLogs();
    
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [selectedInvitation]);

  const handleSelectInvitation = (id: string) => {
    const found = invitations.find(i => i.id === id);
    if (found) {
      setSelectedInvitation(found);
      setSearchParams({ invitation: id });
      setFeedback({ status: null, message: '' });
      setGuestCodeInput('');
    }
  };

  const executeCheckIn = async (code: string) => {
    if (!selectedInvitation) return;
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      setSubmitting(true);
      setFeedback({ status: null, message: '' });

      const { data: matchedGuest, error: guestErr } = await supabase
        .from('guests')
        .select('*')
        .eq('invitation_id', selectedInvitation.id)
        .eq('guest_code', cleanCode)
        .maybeSingle();

      if (guestErr || !matchedGuest) {
        if (soundEnabled) playBeep('error');
        setFeedback({
          status: 'error',
          message: `Kode tiket "${cleanCode}" tidak ditemukan untuk pernikahan ini.`
        });
        return;
      }

      if (matchedGuest.checkin_status === 'checked_in') {
        const { data: existingCheck } = await supabase
          .from('checkins')
          .select('*')
          .eq('guest_id', matchedGuest.id)
          .maybeSingle();

        if (soundEnabled) playBeep('error');
        setFeedback({
          status: 'warning',
          message: 'Tamu sudah melakukan check-in sebelumnya!',
          guestName: matchedGuest.name,
          guestCode: matchedGuest.guest_code,
          timestamp: existingCheck ? new Date(existingCheck.checked_in_at).toLocaleTimeString('id-ID') : 'Hari ini'
        });
        return;
      }

      const { error: chInErr } = await supabase
        .from('checkins')
        .insert({
          invitation_id: selectedInvitation.id,
          guest_id: matchedGuest.id,
          checked_in_at: new Date().toISOString(),
          checked_in_by: profile?.email || user?.email || 'admin_gate',
          status: 'success'
        });

      if (chInErr) throw chInErr;

      const { error: updateErr } = await supabase
        .from('guests')
        .update({ checkin_status: 'checked_in' })
        .eq('id', matchedGuest.id);

      if (updateErr) throw updateErr;

      if (soundEnabled) playBeep('success');
      setFeedback({
        status: 'success',
        message: 'Check-in berhasil! Selamat datang di hari bahagia kami.',
        guestName: matchedGuest.name,
        guestCode: matchedGuest.guest_code,
        timestamp: new Date().toLocaleTimeString('id-ID')
      });

      setGuestCodeInput('');
      await fetchGuestsAndLogs();
    } catch (err: any) {
      console.error('Error in check-in transaction:', err);
      if (soundEnabled) playBeep('error');
      setFeedback({
        status: 'error',
        message: `Gagal memproses check-in: ${err.message || 'Error jaringan.'}`
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        scanInputRef.current?.focus();
      }, 100);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCheckIn(guestCodeInput);
  };

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.guest_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.phone.includes(searchQuery);
    const matchesRsvp = filterRsvp === 'all' || g.rsvp_status === filterRsvp;
    const matchesCheckin = filterCheckin === 'all' || g.checkin_status === filterCheckin;
    return matchesSearch && matchesRsvp && matchesCheckin;
  });

  return {
    profile,
    invitations,
    selectedInvitation,
    guests,
    recentCheckedIn,
    loading,
    submitting,
    guestCodeInput,
    setGuestCodeInput,
    scanInputRef,
    searchQuery,
    setSearchQuery,
    filterRsvp,
    setFilterRsvp,
    filterCheckin,
    setFilterCheckin,
    soundEnabled,
    setSoundEnabled,
    feedback,
    setFeedback,
    executeCheckIn,
    handleFormSubmit,
    filteredGuests,
    handleSelectInvitation
  };
}
