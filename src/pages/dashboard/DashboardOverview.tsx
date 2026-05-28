import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Users, CheckCircle2, Clock, Calendar, Sparkles, LogIn, ArrowDownToLine, 
  Loader2, Radio, Heart, HelpCircle, FileSpreadsheet, Smile, AlertCircle,
  Copy, Check, ExternalLink, CreditCard
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { invitationService, guestService } from '../../services';
import { Invitation, Guest } from '../../types/database.types';
import { supabase } from '../../lib/supabase';

export default function DashboardOverview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuthStore();
  
  // Super Admin Stats State
  const [adminStats, setAdminStats] = useState<{
    totalUsers: number;
    totalInvitations: number;
    totalTransactions: number;
    pendingTransactions: number;
  } | null>(null);
  const [loadingAdminStats, setLoadingAdminStats] = useState(false);

  // Selections
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [recentRsvps, setRecentRsvps] = useState<any[]>([]);
  
  // Preview State
  const [copiedLink, setCopiedLink] = useState(false);
  
  // UX state
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Load Invitations on start
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
  }, [user]);

  // Load Super Admin Platform Statistics
  useEffect(() => {
    if (profile?.role !== 'super_admin' || !user) return;
    
    async function loadAdminStats() {
      try {
        setLoadingAdminStats(true);
        // Fetch users count
        const { count: usersCount, error: usersErr } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch invitations count  
        const { count: invsCount, error: invsErr } = await supabase
          .from('invitations')
          .select('*', { count: 'exact', head: true });

        // Fetch transactions info
        const { data: txs, error: txsErr } = await supabase
          .from('transactions')
          .select('status');

        const totalTransactions = txs?.length || 0;
        const pendingTransactions = txs?.filter((t: any) => t.status === 'pending').length || 0;

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

  // Load selected invitation's statistics
  const fetchStats = async () => {
    if (!selectedInvitation) return;
    try {
      // 1. Fetch guest list for selected invitation
      const list = await guestService.getByInvitationId(selectedInvitation.id);
      setGuests(list);

      // 2. Fetch fresh RSVP feed logs (including responses written)
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

  // KPI Calculations
  const totalGuests = guests.length;
  const totalCheckedIn = guests.filter(g => g.checkin_status === 'checked_in').length;
  const totalNotCheckedIn = totalGuests - totalCheckedIn;

  const rsvpHadir = guests.filter(g => g.rsvp_status === 'attending').length;
  const rsvpAbsen = guests.filter(g => g.rsvp_status === 'declined').length;
  const rsvpRagu = guests.filter(g => g.rsvp_status === 'uncertain').length;
  const rsvpUnresponsive = totalGuests - (rsvpHadir + rsvpAbsen + rsvpRagu);

  // Percentages with safety NaN checks
  const percentCheckedIn = totalGuests > 0 ? Math.round((totalCheckedIn / totalGuests) * 100) : 0;
  const percentRsvpHadir = totalGuests > 0 ? Math.round((rsvpHadir / totalGuests) * 100) : 0;
  const percentRsvpAbsen = totalGuests > 0 ? Math.round((rsvpAbsen / totalGuests) * 100) : 0;
  const percentRsvpRagu = totalGuests > 0 ? Math.round((rsvpRagu / totalGuests) * 100) : 0;

  // Handle Export RSVP and Check-in logs to CSV compatible with Microsoft Excel
  const handleExportExcel = async () => {
    if (!selectedInvitation || guests.length === 0) {
      alert('Tidak ada data tamu diundang untuk di-export.');
      return;
    }

    try {
      setExporting(true);

      // Fetch precise checkin timestamps to enrich the excel export file
      const { data: checkins, error } = await supabase
        .from('checkins')
        .select('*')
        .eq('invitation_id', selectedInvitation.id);

      const checkInMap = new Map();
      if (!error && checkins) {
        checkins.forEach((c: any) => {
          checkInMap.set(c.guest_id, c.checked_in_at);
        });
      }

      // Build CSV String with standard Excel UTF-8 BOM flag
      const csvHeader = 'No,Nama Tamu,WhatsApp,Kode Tiket,Status RSVP,Kehadiran Check-In,Waktu Registrasi Masuk,Link Undangan\n';
      
      const csvRows = guests.map((gst, idx) => {
        const checkinTime = checkInMap.get(gst.id);
        const formatRsvp = gst.rsvp_status === 'attending' 
          ? 'Hadir' 
          : gst.rsvp_status === 'declined' 
          ? 'Absen (Tidak Hadir)' 
          : gst.rsvp_status === 'uncertain'
          ? 'Ragu-ragu'
          : 'Belum Merespon';
        
        const formatCheckin = gst.checkin_status === 'checked_in' ? 'SUDAH HADIR' : 'BELUM HADIR';
        const formattedTime = checkinTime ? new Date(checkinTime).toLocaleString('id-ID') : '-';
        
        // Escape commas for standard CSV safety
        const safeName = gst.name.replace(/,/g, ' ');
        const safePhone = gst.phone ? `'${gst.phone}` : '-'; // Single quote forces string type in excel to prevent scientific notation

        return `${idx + 1},"${safeName}",${safePhone},${gst.guest_code},${formatRsvp},${formatCheckin},${formattedTime},${gst.personal_link || '-'}`;
      }).join('\n');

      const csvContent = '\uFEFF' + csvHeader + csvRows; // UTF-8 BOM indicator \uFEFF for seamless Excel encoding
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const fileName = `RSVP_Checkin_${selectedInvitation.groom_name}_${selectedInvitation.bride_name}_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      console.error('Error exporting sheet:', err);
      alert('Gagal mengexport file ke Excel.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header & Active Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Smile className="w-7 h-7 text-primary-600" /> {profile?.role === 'super_admin' ? 'Dasbor Pemantauan Sistem (Super Admin)' : 'Ringkasan Acara Anda'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {profile?.role === 'super_admin' 
              ? 'Pemantauan real-time pertumbuhan pengguna, jumlah undangan dibuat, dan status transaksi platform.' 
              : `Selamat datang kembali, ${profile?.name || 'Admin'}! Statistik terbaru pernikahan Anda secara real-time.`}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {invitations.length > 0 ? (
            <div className="flex flex-col">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-mono">Pilih Undangan Aktif</label>
              <select
                value={selectedInvitation?.id || ''}
                onChange={(e) => handleSelectInvitation(e.target.value)}
                className="bg-gray-50 border border-gray-250 rounded-xl px-4 py-2 text-xs text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[210px]"
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
              Belum ada undangan
            </p>
          )}

          {/* Action Row containing Buttons */}
          {selectedInvitation && (
            <div className="flex items-center gap-2">

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exporting || totalGuests === 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 animate-in fade-in"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Export Excel (.csv)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Super Admin Platform Overview Panel */}
      {profile?.role === 'super_admin' && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest font-mono">
            Platform Metrics (Super Admin)
          </h2>
          
          {loadingAdminStats ? (
            <div className="bg-white border border-gray-150 rounded-3xl p-8 flex items-center justify-center text-xs text-gray-400 font-bold gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-primary-500" /> Memuat metrik sistem...
            </div>
          ) : adminStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {/* Metrik 1: Total Pengguna Terdaftar */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/20 rounded-2xl p-5 border border-indigo-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono">Pengguna Terdaftar</p>
                    <h3 className="text-3xl font-extrabold text-indigo-950 mt-1">{adminStats.totalUsers}</h3>
                  </div>
                  <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-indigo-500 font-bold uppercase mt-3">Kustomer Terdaftar</p>
              </div>

              {/* Metrik 2: Total Undangan Dibuat */}
              <div className="bg-gradient-to-br from-pink-50/70 to-rose-50/20 rounded-2xl p-5 border border-pink-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-pink-400 uppercase tracking-widest font-mono">Undangan Dibuat</p>
                    <h3 className="text-3xl font-extrabold text-pink-950 mt-1">{adminStats.totalInvitations}</h3>
                  </div>
                  <div className="p-2.5 bg-pink-500 text-white rounded-xl shadow-sm">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                </div>
                <p className="text-[10px] text-pink-500 font-bold uppercase mt-3">Desain Undangan Terbit</p>
              </div>

              {/* Metrik 3: Total Transaksi Pembelian */}
              <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/20 rounded-2xl p-5 border border-emerald-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-mono">Total Transaksi</p>
                    <h3 className="text-3xl font-extrabold text-emerald-950 mt-1">{adminStats.totalTransactions}</h3>
                  </div>
                  <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-sm">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-emerald-600 font-bold uppercase mt-3">Pembelian Layanan Terdata</p>
              </div>

              {/* Metrik 4: Transaksi Pending (Menunggu Verifikasi) */}
              <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/20 rounded-2xl p-5 border border-amber-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest font-mono">Transaksi Pending</p>
                    <h3 className="text-3xl font-extrabold text-amber-950 mt-1">{adminStats.pendingTransactions}</h3>
                  </div>
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block w-max mt-3 ${
                  adminStats.pendingTransactions > 0 
                    ? 'bg-amber-100 text-amber-800 animate-pulse font-sans' 
                    : 'bg-white/80 text-gray-500 font-sans'
                }`}>
                  {adminStats.pendingTransactions > 0 ? '⚠️ Butuh Verifikasi Admin' : '✅ Semua Transaksi Lunas'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 font-medium">Gagal memuat metrik sistem.</div>
          )}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-20 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Menghubungkan ke server database Supabase...</p>
        </div>
      ) : !selectedInvitation ? (
        <div className="bg-white rounded-3xl p-16 border border-gray-200 shadow-sm text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Buat Undangan Digital Pertama Anda</h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            Rangkai janji suci pernikahan Anda dengan template desain pilihan eksklusif dan mulailah menyebarkan kebahagiaan kepada kerabat dekat Anda.
          </p>
          <Link
            to="/dashboard/invitations/create"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition shadow-md"
          >
            <Heart className="w-4 h-4 fill-current" /> Mulai Rancang Undangan
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* 2. KPI Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Total Tamu */}
            <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Total Tamu</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{totalGuests}</h3>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-3">Kerabat Tercinta</p>
            </div>

            {/* Total RSVP HADIR */}
            <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono font-sans">RSVP Konfirmasi Hadir</p>
                  <h3 className="text-3xl font-extrabold text-primary-600 mt-1">{rsvpHadir}</h3>
                </div>
                <div className="p-2.5 bg-rose-50 text-pink-500 rounded-xl">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
              </div>
              <span className="text-[10px] text-primary-600 bg-pink-50 px-2 py-0.5 rounded-full inline-block font-extrabold w-max mt-3.5">
                😇 {percentRsvpHadir}% Berencana Datang
              </span>
            </div>

            {/* Total RSVP ABSEN */}
            <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">RSVP Absen (Tidak)</p>
                  <h3 className="text-3xl font-extrabold text-gray-500 mt-1">{rsvpAbsen}</h3>
                </div>
                <div className="p-2.5 bg-gray-100 text-gray-500 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-bold font-mono uppercase mt-3">{rsvpAbsen} Orang Berhalangan</p>
            </div>

          </div>

          {/* 3. Detailed Distribution Bento Box Row */}
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Visual Distribution block (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-gray-150 shadow-sm rounded-3xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Analisis Respons & Kehadiran</h3>
                <p className="text-xs text-gray-400 mt-0.5">Visual persentase status kesiapan kuota katering hidangan.</p>
              </div>

              <div className="space-y-5">
                
                {/* RSVP Distribution bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-500 flex items-center gap-1.5">😇 Berencana Hadir</span>
                    <span className="text-gray-900">{rsvpHadir} Tamu • {percentRsvpHadir}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${percentRsvpHadir}%` }}
                    />
                  </div>
                </div>

                {/* RSVP Ragu bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-500 flex items-center gap-1.5">🤔 Ragu-Ragu Kehadiran</span>
                    <span className="text-gray-900">{rsvpRagu} Tamu • {percentRsvpRagu}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${percentRsvpRagu}%` }}
                    />
                  </div>
                </div>

                {/* RSVP Absen bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-500 flex items-center gap-1.5">😔 Tidak Bisa Hadir (Absen)</span>
                    <span className="text-gray-900">{rsvpAbsen} Tamu • {percentRsvpAbsen}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-400 rounded-full transition-all duration-1000" 
                      style={{ width: `${percentRsvpAbsen}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Recent RSVPs Feed logs (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-gray-150 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                  <div>
                    <h3 className="text-sm font-bold text-gray-950">Konfirmasi RSVP & Pesan Baru</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Buku Ucapan virtual tamu di web undangan.</p>
                  </div>
                  <Link to="/dashboard/guests" className="text-xs text-primary-600 font-bold hover:underline">
                    Lihat Tamu
                  </Link>
                </div>

                <div className="divide-y divide-gray-100 overflow-y-auto max-h-[260px] pr-1 space-y-1">
                  {recentRsvps.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-xs text-gray-400">Belum ada respon RSVP tertulis dari para tamu.</p>
                    </div>
                  ) : (
                    recentRsvps.map((rsvp) => (
                      <div key={rsvp.id} className="py-3 font-medium first:pt-0 last:pb-0">
                        <div className="flex justify-between text-xs items-center">
                          <span className="font-bold text-gray-900">{rsvp.guest_name}</span>
                          
                          {rsvp.attendance_status === 'attending' ? (
                            <span className="bg-emerald-50 text-emerald-700 font-bold text-[9px] px-1.5 py-0.5 rounded">Hadir</span>
                          ) : rsvp.attendance_status === 'declined' ? (
                            <span className="bg-rose-50 text-rose-700 font-bold text-[9px] px-1.5 py-0.5 rounded">Absen</span>
                          ) : (
                            <span className="bg-yellow-50 text-yellow-700 font-bold text-[9px] px-1.5 py-0.5 rounded">Ragu</span>
                          )}
                        </div>
                        {rsvp.message && (
                          <p className="text-[11px] text-gray-500 italic mt-1 leading-normal">
                             "{rsvp.message}"
                          </p>
                        )}
                        <span className="text-[9px] text-gray-400 block mt-1 tracking-wider font-mono">
                           {new Date(rsvp.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
