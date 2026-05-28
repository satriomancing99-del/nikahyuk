import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, Search, Filter, Loader2, Phone, Trash2, HelpCircle, 
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Calendar, MessageSquare,
  Check, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { invitationService, rsvpService } from '../../services';
import { Invitation, Rsvp as DBRsvp } from '../../types/database.types';
import { supabase } from '../../lib/supabase';

export default function Rsvp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuthStore();

  // Core States
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [rsvps, setRsvps] = useState<DBRsvp[]>([]);
  const [associatedGuests, setAssociatedGuests] = useState<Record<string, { phone?: string }>>({});
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

        // Determine which invitation to pick from URL params or default
        const queryId = searchParams.get('invitation');
        if (queryId) {
          const found = list.find(inv => inv.id === queryId);
          if (found) {
            setSelectedInvitation(found);
            return;
          }
        }

        // Default pick first
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
  }, [user]);

  // Load RSVPs when selected invitation changes
  const loadRsvps = async () => {
    if (!selectedInvitation) {
      setRsvps([]);
      return;
    }
    
    try {
      setLoading(true);
      const list = await rsvpService.getByInvitationId(selectedInvitation.id);
      setRsvps(list);

      // Fetch guest phone numbers for those with guest_id to allow WA contact
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

  // Handle Delete RSVP
  const handleDeleteRsvp = async (id: string, guestId: string | null, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus respon RSVP dari "${name}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      
      // 1. Delete from rsvps table
      await rsvpService.delete(id);

      // 2. If guest association exists, reset guest rsvp_status to 'pending'
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

  // Direct WhatsApp helper
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

  // Filter & Search Logic
  const filteredRsvps = rsvps.filter(r => {
    const matchesSearch = r.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.message && r.message.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || r.attendance_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Analytics helper math
  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attendance_status === 'attending').length,
    declined: rsvps.filter(r => r.attendance_status === 'declined').length,
    uncertain: rsvps.filter(r => r.attendance_status === 'uncertain').length,
    totalGuests: rsvps
      .filter(r => r.attendance_status === 'attending')
      .reduce((sum, r) => sum + (Number(r.total_guest) || 1), 0)
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Konfirmasi Kehadiran (RSVP)</h1>
          <p className="text-gray-500 text-sm">Lihat rangkuman kehadiran tamu undangan, jumlah pax tambahan, dan pesan ucapan restu kustomer.</p>
        </div>

        {selectedInvitation && (
          <button
            onClick={loadRsvps}
            className="self-start md:self-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        )}
      </div>

      {/* Invitation Selector Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">Tampilkan RSVP Untuk Undangan</label>
            {invitations.length === 0 ? (
              <p className="text-sm font-bold text-gray-700">Belum ada undangan yang dibuat</p>
            ) : (
              <select
                value={selectedInvitation?.id || ''}
                onChange={(e) => {
                  const found = invitations.find(inv => inv.id === e.target.value);
                  if (found) {
                    setSelectedInvitation(found);
                    setSearchParams({ invitation: found.id });
                  }
                }}
                className="text-sm font-extrabold text-gray-800 bg-transparent focus:outline-none cursor-pointer pr-8"
              >
                {invitations.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.groom_name?.split(' ')[0]} & {inv.bride_name?.split(' ')[0]} ({inv.slug})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {selectedInvitation ? (
        <>
          {/* Glassmorphic Analytics Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Stat 1: Total RSVP */}
            <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center flex-shrink-0">
                <Users className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tamu Merespon</span>
                <span className="text-xl font-extrabold text-gray-800 block mt-0.5">{stats.total} <span className="text-xs font-semibold text-gray-400">tamu</span></span>
              </div>
            </div>

            {/* Stat 2: Total Attending PAX */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm flex items-center gap-3.5 bg-emerald-50/20">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Hadir (Total Pax)</span>
                <span className="text-xl font-extrabold text-emerald-800 block mt-0.5">{stats.totalGuests} <span className="text-xs font-semibold text-emerald-500">orang</span></span>
              </div>
            </div>

            {/* Stat 3: Total Attending Families */}
            <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                <Check className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">Konfirmasi Hadir</span>
                <span className="text-xl font-extrabold text-teal-800 block mt-0.5">{stats.attending} <span className="text-xs font-semibold text-teal-500">keluarga</span></span>
              </div>
            </div>

            {/* Stat 4: Declined */}
            <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm flex items-center gap-3.5 bg-rose-50/20">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Tidak Hadir</span>
                <span className="text-xl font-extrabold text-rose-800 block mt-0.5">{stats.declined} <span className="text-xs font-semibold text-rose-400">keluarga</span></span>
              </div>
            </div>

            {/* Stat 5: Uncertain */}
            <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm flex items-center gap-3.5 bg-amber-50/20">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Ragu-Ragu</span>
                <span className="text-xl font-extrabold text-amber-800 block mt-0.5">{stats.uncertain} <span className="text-xs font-semibold text-amber-400">keluarga</span></span>
              </div>
            </div>
          </div>

          {/* Main List and Filters Area */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Filters bar */}
            <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama tamu atau isi pesan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none w-full bg-white transition shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white font-medium shadow-sm cursor-pointer"
                >
                  <option value="all">Semua Status Kehadiran</option>
                  <option value="attending">😇 Hadir</option>
                  <option value="declined">😔 Tidak Hadir</option>
                  <option value="uncertain">🤔 Ragu-Ragu</option>
                </select>
              </div>
            </div>

            {/* List Table */}
            {loading ? (
              <div className="p-16 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                <p className="text-xs text-gray-400 font-semibold">Memuat respon RSVP kustomer...</p>
              </div>
            ) : filteredRsvps.length === 0 ? (
              <div className="p-16 text-center border-dashed border-2 border-gray-150 rounded-b-2xl m-5">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2.5" />
                <p className="text-sm font-bold text-gray-700">Belum ada respon RSVP ditemukan</p>
                <p className="text-xs text-gray-400 mt-0.5">Ketika tamu menekan konfirmasi kehadiran di undangan digital, data akan tampil otomatis di sini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-400 border-b border-gray-150 font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-4 pl-6">Nama Tamu</th>
                      <th className="p-4">Status RSVP</th>
                      <th className="p-4">Jumlah Orang</th>
                      <th className="p-4 max-w-xs">Pesan Ucapan</th>
                      <th className="p-4">Waktu Konfirmasi</th>
                      <th className="p-4 pr-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRsvps.map((rsvp) => {
                      const hasPhone = rsvp.guest_id ? !!associatedGuests[rsvp.guest_id]?.phone : false;
                      
                      return (
                        <tr key={rsvp.id} className="hover:bg-gray-50/50 transition">
                          {/* Guest Name */}
                          <td className="p-4 pl-6 font-bold text-gray-900 text-sm">
                            {rsvp.guest_name}
                          </td>

                          {/* Attendance Status Badge */}
                          <td className="p-4">
                            {rsvp.attendance_status === 'attending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-150">
                                <CheckCircle className="w-3 h-3" /> Hadir
                              </span>
                            )}
                            {rsvp.attendance_status === 'declined' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-150">
                                <XCircle className="w-3 h-3" /> Tidak Hadir
                              </span>
                            )}
                            {rsvp.attendance_status === 'uncertain' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-150">
                                <AlertCircle className="w-3 h-3" /> Ragu-Ragu
                              </span>
                            )}
                          </td>

                          {/* total guest pax count */}
                          <td className="p-4 font-semibold text-gray-600">
                            {rsvp.attendance_status === 'attending' ? (
                              <span className="bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-100 text-emerald-800 font-bold">
                                {rsvp.total_guest || 1} Orang
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* lovely Message/wish */}
                          <td className="p-4 max-w-xs text-gray-500 leading-normal font-medium truncate" title={rsvp.message}>
                            {rsvp.message ? (
                              <span className="flex items-center gap-1 text-gray-700">
                                <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                {rsvp.message}
                              </span>
                            ) : (
                              <span className="text-gray-350 italic font-normal">Tanpa pesan ucapan</span>
                            )}
                          </td>

                          {/* Created at date */}
                          <td className="p-4 text-gray-400 font-medium">
                            {new Date(rsvp.created_at).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })} WIB
                          </td>

                          {/* Action triggers */}
                          <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleContactGuest(rsvp.guest_id, rsvp.guest_name)}
                              disabled={!hasPhone}
                              className={`p-2 rounded-xl transition inline-flex items-center justify-center ${
                                hasPhone 
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200' 
                                  : 'bg-gray-50 text-gray-300 border border-gray-150 cursor-not-allowed'
                              }`}
                              title={hasPhone ? "Hubungi via WhatsApp" : "Kontak tidak tertaut nomor HP"}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRsvp(rsvp.id, rsvp.guest_id, rsvp.guest_name)}
                              disabled={actionLoading}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition inline-flex items-center justify-center disabled:opacity-50"
                              title="Hapus Respon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border shadow-sm">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-pulse" />
          <h3 className="text-base font-extrabold text-gray-800">Menunggu Pilihan Undangan</h3>
          <p className="text-xs text-gray-400 mt-0.5">Silakan buat undangan pernikahan kustomer terlebih dahulu di menu "Undangan".</p>
        </div>
      )}
    </div>
  );
}
