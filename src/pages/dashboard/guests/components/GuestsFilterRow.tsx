import React from 'react';
import { Search } from 'lucide-react';

interface GuestsFilterRowProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterSentStatus: string;
  setFilterSentStatus: (val: string) => void;
  filterRsvpStatus: string;
  setFilterRsvpStatus: (val: string) => void;
  filterCheckinStatus: string;
  setFilterCheckinStatus: (val: string) => void;
}

export const GuestsFilterRow: React.FC<GuestsFilterRowProps> = ({
  searchQuery,
  setSearchQuery,
  filterSentStatus,
  setFilterSentStatus,
  filterRsvpStatus,
  setFilterRsvpStatus,
  filterCheckinStatus,
  setFilterCheckinStatus,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Search */}
      <div className="relative lg:col-span-2">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Cari nama, WhatsApp, atau kode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800"
        />
      </div>

      {/* Filter Status Kirim */}
      <div>
        <select
          value={filterSentStatus}
          onChange={(e) => setFilterSentStatus(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
        >
          <option value="all">Semua Status Kirim</option>
          <option value="unsent">Belum Dikirim</option>
          <option value="sent">Sudah Dikirim</option>
        </select>
      </div>

      {/* Filter RSVP */}
      <div>
        <select
          value={filterRsvpStatus}
          onChange={(e) => setFilterRsvpStatus(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
        >
          <option value="all">Semua RSVP</option>
          <option value="pending font-semibold">Menunggu Konfirmasi</option>
          <option value="attending">Hadir</option>
          <option value="declined">Tidak Hadir</option>
        </select>
      </div>

      {/* Filter Check-in */}
      <div>
        <select
          value={filterCheckinStatus}
          onChange={(e) => setFilterCheckinStatus(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
        >
          <option value="all">Semua Check-in</option>
          <option value="pending">Pending</option>
          <option value="checked_in">Sudah Check-in</option>
        </select>
      </div>
    </div>
  );
};
