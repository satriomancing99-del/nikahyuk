import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, Check, X, AlertTriangle, Loader2, QrCode, Search, 
  MapPin, Clock, ArrowRight, RefreshCw, Volume2, Sparkles, Filter
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { invitationService, guestService } from '../../services';
import { Invitation, Guest } from '../../types/database.types';
import { supabase } from '../../lib/supabase';

// Helper to play synthesized chimes using Web Audio API
function playBeep(type: 'success' | 'error') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      // Nice high double-tone beep
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1); // E6
      gain.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Low buzz warning tone
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.warn('Web Audio Playback failed/blocked:', e);
  }
}

export default function CheckIn() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuthStore();
  
  // Core Selection
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [recentCheckedIn, setRecentCheckedIn] = useState<any[]>([]);
  
  // UX states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guestCodeInput, setGuestCodeInput] = useState('');
  
  // Scanner Manual Input Ref for continuous focus
  const scanInputRef = useRef<HTMLInputElement>(null);
  
  // Search & Filter for Guest List
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRsvp, setFilterRsvp] = useState('all');
  const [filterCheckin, setFilterCheckin] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Feedback notification
  const [feedback, setFeedback] = useState<{
    status: 'success' | 'error' | 'warning' | null;
    message: string;
    guestName?: string;
    guestCode?: string;
    timestamp?: string;
  }>({ status: null, message: '' });

  // Load Invitations initially
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
  }, [user]);

  // Load Guest roster and recent check-ins
  const fetchGuestsAndLogs = async () => {
    if (!selectedInvitation) return;
    try {
      // Fetch all guests
      const list = await guestService.getByInvitationId(selectedInvitation.id);
      setGuests(list);

      // Fetch recent check-ins table joins
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
    
    // Auto-focus physical input so gatekeepers are immediately ready!
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

  // Perform core check-in logic
  const executeCheckIn = async (code: string) => {
    if (!selectedInvitation) return;
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      setSubmitting(true);
      setFeedback({ status: null, message: '' });

      // 1. Validate if guest exists for this invitation
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
          message: `Kode tiket "${cleanCode}" tidak ditemukan untuk pernikahan ini. Harap periksa kembali penulisan kode.`
        });
        return;
      }

      // 2. Prevent double check-in
      if (matchedGuest.checkin_status === 'checked_in') {
        // Find existing check-in details to display
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
          timestamp: existingCheck ? new Date(existingCheck.checked_in_at).toLocaleTimeString('id-ID') : 'Sore / Pagi ini'
        });
        return;
      }

      // 3. Insert Audit log into checkins table
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

      // 4. Update guest checkin_status in database
      const { error: updateErr } = await supabase
        .from('guests')
        .update({ checkin_status: 'checked_in' })
        .eq('id', matchedGuest.id);

      if (updateErr) throw updateErr;

      // Happy Success path
      if (soundEnabled) playBeep('success');
      setFeedback({
        status: 'success',
        message: 'Check-in berhasil! Selamat datang di hari bahagia kami.',
        guestName: matchedGuest.name,
        guestCode: matchedGuest.guest_code,
        timestamp: new Date().toLocaleTimeString('id-ID')
      });

      // Clear input
      setGuestCodeInput('');
      
      // Refresh list
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
      // Autofocus scan field back index
      setTimeout(() => {
        scanInputRef.current?.focus();
      }, 100);
    }
  };

  // Handle Form Submit from input
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCheckIn(guestCodeInput);
  };

  // Helper formatting Indonesian
  const formatIndoTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    } catch {
      return '';
    }
  };

  // Filtered Guests list
  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.guest_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.phone.includes(searchQuery);
    
    const matchesRsvp = filterRsvp === 'all' || g.rsvp_status === filterRsvp;
    const matchesCheckin = filterCheckin === 'all' || g.checkin_status === filterCheckin;
    
    return matchesSearch && matchesRsvp && matchesCheckin;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Top Banner & Invitation Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-7 h-7 text-primary-600" /> QR Check-In Desk
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pindai QR Code atau verifikasi kode personal tamu untuk kehadiran undangan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {invitations.length > 0 ? (
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Undangan Aktif</label>
              <select
                value={selectedInvitation?.id || ''}
                onChange={(e) => handleSelectInvitation(e.target.value)}
                className="bg-gray-50 border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
              >
                {invitations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    💍 {inv.groom_name} & {inv.bride_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              Belum ada undangan dibuat
            </p>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-xl border transition flex items-center justify-center ${
              soundEnabled ? 'bg-primary-50 text-primary-600 border-primary-200' : 'bg-gray-50 text-gray-400 border-gray-200'
            }`}
            title={soundEnabled ? 'Suara Aktif' : 'Suara Senyap'}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-20 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Menyiapkan konsol gatekeeper pernikahan...</p>
        </div>
      ) : !selectedInvitation ? (
        <div className="bg-white rounded-3xl p-20 border border-gray-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto">
            <QrCode className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Belum Ada Undangan Digital</h3>
          <p className="text-gray-500 text-xs">
            Harap buat undangan digital terlebih dahulu di menu "Undangan" sebelum mengelola registrasi barcode check-in meja tamu.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Live Scanning Command Center (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Scanner Container Box */}
            <div className="bg-white border border-gray-200 shadow-md rounded-3xl overflow-hidden relative">
              <div className="bg-gray-900 p-4 text-white flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-extrabold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" /> Laser Barcode Active
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                  Continuous Focus
                </span>
              </div>

              {/* Holographic scanning target area */}
              <div className="bg-gray-950 aspect-video relative flex flex-col items-center justify-center p-8 overflow-hidden group">
                <div className="absolute inset-0 bg-radial-gradient opacity-10" />
                
                {/* Horizontal Neon scanning laser line */}
                <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] animate-[bounce_3s_infinite]" />

                {/* Simulated bracket borders */}
                <div className="w-48 h-28 border-2 border-dashed border-gray-600 rounded-xl relative flex flex-col items-center justify-center bg-gray-900/35 z-10">
                  <QrCode className="w-12 h-12 text-gray-500" />
                  <p className="text-[9px] text-gray-400 mt-2 font-bold tracking-widest uppercase">Pindai Barcode</p>
                </div>

                <div className="absolute bottom-3 text-center z-10 w-full px-6">
                  <p className="text-[10px] text-gray-400 font-medium">
                    Arahkan scanner genggam Anda, atau ketikkan kode tamu manual di bawah.
                  </p>
                </div>
              </div>

              {/* Form Input Box */}
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Input Kode Tamu / Hasil Scan
                    </label>
                    <div className="relative">
                      <input
                        ref={scanInputRef}
                        type="text"
                        required
                        placeholder="Masukkan 6 digit Kode Tamu (cth: AB73FC)..."
                        value={guestCodeInput}
                        onChange={(e) => setGuestCodeInput(e.target.value.toUpperCase())}
                        disabled={submitting}
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-extrabold uppercase tracking-widest bg-white"
                      />
                      <button
                        type="submit"
                        disabled={submitting || !guestCodeInput.trim()}
                        className="absolute right-1.5 top-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Scan Feedback Screen Overlay / Notification Panel */}
            {feedback.status && (
              <div className={`p-6 rounded-3xl border transition-all duration-300 ${
                feedback.status === 'success' 
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
                  : feedback.status === 'warning'
                  ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                  : 'bg-rose-50/90 border-rose-200 text-rose-900'
              }`}>
                <div className="flex gap-4 items-start">
                  <div className={`p-2.5 rounded-2xl ${
                    feedback.status === 'success' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : feedback.status === 'warning'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-rose-100 text-rose-500'
                  }`}>
                    {feedback.status === 'success' ? (
                      <Check className="w-6 h-6" />
                    ) : feedback.status === 'warning' ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : (
                      <X className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-extrabold opacity-60">Status Registrasi</p>
                      <h4 className="font-bold text-sm mt-0.5 leading-snug">{feedback.message}</h4>
                    </div>

                    {feedback.guestName && (
                      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/40 space-y-2">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-extrabold opacity-50">Nama Tamu</p>
                          <p className="font-serif font-bold text-gray-800 text-lg leading-snug">{feedback.guestName}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <p className="font-bold opacity-50 uppercase">Kode Tiket</p>
                            <p className="font-mono font-bold text-gray-700">{feedback.guestCode}</p>
                          </div>
                          <div>
                            <p className="font-bold opacity-50 uppercase">Pukul Masuk</p>
                            <p className="font-mono font-semibold text-gray-700">{feedback.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Helper */}
            <div className="bg-[#fcfbf9] border border-dashed border-gray-200 p-6 rounded-3xl">
              <span className="text-[10px] font-extrabold text-primary-600 tracking-wider uppercase block mb-1">Gatekeeper Tips:</span>
              <p className="text-[11px] text-gray-500 leading-normal">
                Gunakan scanner barcode tipe keyboard-emulation USB/Bluetooth. Tempatkan kursor fokus di kolom input Kode Tamu. Saat scanner beroperasi, data check-in otomatis disubmit secara real-time.
              </p>
            </div>

          </div>

          {/* RIGHT: Directory list and Logs Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live History Feed */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" /> Tamu Baru Saja Hadir (Check-In)
              </h3>
              
              <div className="divide-y divide-gray-100 max-h-[220px] overflow-y-auto pr-2 space-y-1">
                {recentCheckedIn.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-xs text-gray-400 font-semibold">Belum ada tamu yang masuk. Menunggu scan...</p>
                  </div>
                ) : (
                  recentCheckedIn.map((log) => (
                    <div key={log.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          {log.guests?.name?.charAt(0) || 'G'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-xs">{log.guests?.name || 'Tamu Tanpa nama'}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                            <span className="font-mono font-bold text-primary-600 bg-primary-50 px-1 py-0.5 rounded text-[9px]">{log.guests?.guest_code}</span>
                            <span>•</span>
                            <span>RSVP: {log.guests?.rsvp_status === 'attending' ? '😇 Hadir' : log.guests?.rsvp_status === 'declined' ? '😔 Absen' : '🤔 Ragu'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          {formatIndoTime(log.checked_in_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Manual Check-in Directory Directory Panel */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" /> Pencarian & Check-In Manual
                </h3>
                
                {/* Micro search input */}
                <div className="relative max-w-xs">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama / detail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl border border-gray-250 text-xs w-full focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap gap-2 items-center text-[11px] bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px] mr-1">Filter:</span>
                
                <select
                  value={filterRsvp}
                  onChange={(e) => setFilterRsvp(e.target.value)}
                  className="bg-white border border-gray-250 rounded-lg px-2.2 py-1 select-none font-medium text-gray-600 focus:outline-none"
                >
                  <option value="all">Semua RSVP</option>
                  <option value="attending">😇 Hadir</option>
                  <option value="declined">😔 Absen</option>
                  <option value="uncertain">🤔 Ragu-ragu</option>
                  <option value="pending">⏳ Pending</option>
                </select>

                <select
                  value={filterCheckin}
                  onChange={(e) => setFilterCheckin(e.target.value)}
                  className="bg-white border border-gray-250 rounded-lg px-2.2 py-1 select-none font-medium text-gray-600 focus:outline-none"
                >
                  <option value="all">Semua Kehadiran</option>
                  <option value="checked_in">🟢 Sudah Masuk</option>
                  <option value="pending">🔴 Belum Hadir</option>
                </select>

                {(searchQuery || filterRsvp !== 'all' || filterCheckin !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterRsvp('all');
                      setFilterCheckin('all');
                    }}
                    className="text-primary-600 hover:underline font-bold text-[10px]"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* List grid */}
              <div className="border border-gray-150 rounded-2xl overflow-hidden max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 font-extrabold uppercase tracking-widest text-[9px] border-b border-gray-150">
                    <tr>
                      <th className="px-4 py-3">Nama Tamu</th>
                      <th className="px-4 py-3">Kode Tiket</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 font-medium">
                    {filteredGuests.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                          Tidak ada daftar tamu memenuhi kriteria pencarian Anda.
                        </td>
                      </tr>
                    ) : (
                      filteredGuests.map((gst) => (
                        <tr key={gst.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {gst.name}
                            <span className="block text-[10px] text-gray-400 font-normal">{gst.phone || 'Tanpa telepon'}</span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-gray-600 text-[11px]">{gst.guest_code}</td>
                          <td className="px-4 py-3 space-y-1">
                            {gst.rsvp_status === 'attending' ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold">Hadir</span>
                            ) : gst.rsvp_status === 'declined' ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 text-[9px] font-bold">Absen</span>
                            ) : gst.rsvp_status === 'uncertain' ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-105 text-[9px] font-bold">Ragu</span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-150 text-[9px] font-bold">Pending</span>
                            )}

                            <span className="block">
                              {gst.checkin_status === 'checked_in' ? (
                                <span className="text-emerald-600 text-[10px] font-bold">🟢 Sudah Hadir</span>
                              ) : (
                                <span className="text-gray-400 text-[10px] font-bold">🔴 Belum Datang</span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {gst.checkin_status === 'checked_in' ? (
                              <span className="text-[10px] text-gray-400 font-bold px-3 py-1.5">Selesai</span>
                            ) : (
                              <button
                                onClick={() => executeCheckIn(gst.guest_code)}
                                disabled={submitting}
                                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"
                              >
                                Check-In
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
