import React from 'react';
import { MessageSquare, RefreshCw, Quote, Search, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { useWishes } from './hooks/useWishes';
import { WishesStats } from './components/WishesStats';
import { WishCard } from './components/WishCard';

export default function Wishes() {
  const {
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
  } = useWishes();

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
          <WishesStats
            totalWishes={wishes.length}
            countToday={countToday}
            averageLength={averageLength}
          />

          {/* Filtering and Sorting control */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              {filteredWishes.map((wish) => (
                <WishCard
                  key={wish.id}
                  wish={wish}
                  isCopied={copiedId === wish.id}
                  actionLoading={actionLoading}
                  handleCopyWish={handleCopyWish}
                  handleDeleteWish={handleDeleteWish}
                />
              ))}
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
