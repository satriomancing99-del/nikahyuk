import React from 'react';
import { Users, RefreshCw, Calendar, Loader2 } from 'lucide-react';
import { useRsvp } from './hooks/useRsvp';
import { RsvpStatsCards } from './components/RsvpStatsCards';
import { RsvpFilterRow } from './components/RsvpFilterRow';
import { RsvpTable } from './components/RsvpTable';

export default function Rsvp() {
  const {
    invitations,
    selectedInvitation,
    setSelectedInvitation,
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
  } = useRsvp();

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
          <RsvpStatsCards stats={stats} />

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <RsvpFilterRow
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />

            {loading ? (
              <div className="p-16 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                <p className="text-xs text-gray-400 font-semibold">Memuat respon RSVP kustomer...</p>
              </div>
            ) : (
              <RsvpTable
                filteredRsvps={filteredRsvps}
                associatedGuests={associatedGuests}
                actionLoading={actionLoading}
                handleContactGuest={handleContactGuest}
                handleDeleteRsvp={handleDeleteRsvp}
              />
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
