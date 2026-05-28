import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, Search, Trash2, Copy, Check, RefreshCw, Loader2, 
  Heart, Calendar, AlertCircle, Quote, Smile, Clock
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { invitationService, wishService } from '../../services';
import { Invitation, Wish } from '../../types/database.types';
import { supabase } from '../../lib/supabase';

export default function Wishes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuthStore();

  // Core States
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Load Invitations on start (Secure Role Check)
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
        console.error('Error fetching invitations in wishes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvitations();
  }, [user, profile]);

  // Load Wishes when selected invitation changes
  const loadWishes = async () => {
    if (!selectedInvitation) {
      setWishes([]);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('invitation_id', selectedInvitation.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishes(data || []);
    } catch (err) {
      console.error('Error loading wishes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishes();
  }, [selectedInvitation]);

  // Handle Delete Wish (Moderation Action)
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

  // Copy Greeting to clipboard
  const handleCopyWish = (wish: Wish) => {
    const text = `"${wish.message}"\n\n— Dari: ${wish.guest_name}`;
    navigator.clipboard.writeText(text);
    setCopiedId(wish.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Sort Logic
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

  // Math Analytics helpers
  const countToday = wishes.filter(w => {
    const time = new Date(w.created_at).getTime();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return time > oneDayAgo;
  }).length;

  const averageLength = wishes.length > 0 
    ? Math.round(wishes.reduce((sum, w) => sum + (w.message?.length || 0), 0) / wishes.length)
    : 0;

  // Initials generator
  const getInitials = (name: string) => {
    return name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
  };

  // Avatar colors mapping
  const bgColors = [
    'bg-rose-50 text-rose-700 border-rose-150',
    'bg-amber-50 text-amber-700 border-amber-150',
    'bg-teal-50 text-teal-700 border-teal-150',
    'bg-primary-50 text-primary-700 border-primary-150',
    'bg-indigo-50 text-indigo-700 border-indigo-150',
  ];

  const getAvatarColor = (name: string) => {
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return bgColors[sum % bgColors.length];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary-500" />
            Moderasi Ucapan & Doa Restu
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola, tinjau, dan hapus pesan ucapan restu yang dikirimkan oleh para tamu undangan di web undangan digital.</p>
        </div>

        {selectedInvitation && (
          <button
            onClick={loadWishes}
            disabled={actionLoading}
            className="self-start md:self-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} /> Refresh Ucapan
          </button>
        )}
      </div>

      {/* Invitation Selector Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 flex-shrink-0">
            <Quote className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">Tampilkan Ucapan Untuk Undangan</label>
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
                className="text-sm font-extrabold text-gray-800 bg-transparent focus:outline-none cursor-pointer pr-8 border-none p-0 focus:ring-0"
              >
                {invitations.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    💍 {inv.groom_name} & {inv.bride_name} ({inv.slug})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {selectedInvitation ? (
        <>
          {/* Glassmorphic Analytics Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stat 1: Total wishes */}
            <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Ucapan Masuk</span>
                <span className="text-xl font-extrabold text-gray-800 block mt-0.5">
                  {wishes.length} <span className="text-xs font-semibold text-gray-400">pesan</span>
                </span>
              </div>
            </div>

            {/* Stat 2: New Today */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm flex items-center gap-3.5 bg-emerald-50/10">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Masuk 24 Jam Terakhir</span>
                <span className="text-xl font-extrabold text-emerald-800 block mt-0.5">
                  +{countToday} <span className="text-xs font-semibold text-emerald-500">ucapan baru</span>
                </span>
              </div>
            </div>

            {/* Stat 3: Enthusiasm character metric */}
            <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm flex items-center gap-3.5 bg-amber-50/10">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Smile className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Antusiasme Tamu (Rata-rata)</span>
                <span className="text-xl font-extrabold text-amber-800 block mt-0.5">
                  {averageLength} <span className="text-xs font-semibold text-amber-500">karakter / pesan</span>
                </span>
              </div>
            </div>
          </div>

          {/* Filtering and Sorting control */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama pengirim atau isi ucapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none w-full bg-white transition shadow-sm"
              />
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white font-medium shadow-sm cursor-pointer"
              >
                <option value="newest">📅 Terbaru Dahulu</option>
                <option value="oldest">📅 Terlama Dahulu</option>
              </select>
            </div>
          </div>

          {/* Core Content Grid */}
          {loading ? (
            <div className="bg-white rounded-2xl p-16 text-center space-y-2 border border-gray-200 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
              <p className="text-xs text-gray-400 font-semibold">Memuat dinding ucapan dan doa restu tamu...</p>
            </div>
          ) : filteredWishes.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border-dashed border-2 border-gray-150">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700">Belum ada ucapan terdeteksi</p>
              <p className="text-xs text-gray-400 mt-1 leading-normal">
                {searchQuery 
                  ? 'Tidak ada ucapan yang cocok dengan kata kunci pencarian Anda.' 
                  : 'Ucapan dan doa restu manis dari para tamu undangan di halaman publik akan tampil di sini secara realtime.'}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWishes.map((wish) => {
                const avatarStyle = getAvatarColor(wish.guest_name);
                
                return (
                  <div 
                    key={wish.id} 
                    className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative group overflow-hidden"
                  >
                    {/* Decorative quote icon */}
                    <Quote className="w-16 h-16 text-gray-50 absolute right-3 top-3 -z-0 opacity-40 group-hover:scale-105 transition" />

                    <div className="space-y-4 z-10">
                      {/* Guest info row */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs shadow-sm ${avatarStyle}`}>
                          {getInitials(wish.guest_name)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-sm leading-snug truncate max-w-[150px]" title={wish.guest_name}>
                            {wish.guest_name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-medium block">
                            {new Date(wish.created_at).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })} WIB
                          </span>
                        </div>
                      </div>

                      {/* The wish message body */}
                      <p className="text-xs text-gray-600 font-medium leading-relaxed italic border-l-2 border-primary-150 pl-3">
                        "{wish.message}"
                      </p>
                    </div>

                    {/* Footer tools row */}
                    <div className="border-t border-gray-100 pt-3.5 mt-5 flex items-center justify-between z-10 bg-white/80">
                      <button
                        onClick={() => handleCopyWish(wish)}
                        className="text-[10px] font-bold text-primary-600 hover:text-primary-700 transition flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100"
                        title="Salin ucapan untuk dibagikan ke medsos"
                      >
                        {copiedId === wish.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600" />
                            Tersalin!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Salin Ucapan
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteWish(wish.id, wish.guest_name)}
                        disabled={actionLoading}
                        className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition disabled:opacity-50"
                        title="Hapus / Moderasi pesan ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border shadow-sm">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-gray-800">Menunggu Pilihan Undangan</h3>
          <p className="text-xs text-gray-400 mt-0.5">Silakan buat undangan pernikahan kustomer terlebih dahulu di menu "Undangan".</p>
        </div>
      )}
    </div>
  );
}
