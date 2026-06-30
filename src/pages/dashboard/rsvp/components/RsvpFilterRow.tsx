import React from 'react';
import { Search, Filter } from 'lucide-react';

interface RsvpFilterRowProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
}

export function RsvpFilterRow({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus
}: RsvpFilterRowProps) {
  return (
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
  );
}
