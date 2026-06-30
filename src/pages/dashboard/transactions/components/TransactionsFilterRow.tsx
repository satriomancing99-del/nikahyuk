import React from 'react';
import { Search, Filter } from 'lucide-react';

interface TransactionsFilterRowProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export const TransactionsFilterRow: React.FC<TransactionsFilterRowProps> = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
}) => {
  return (
    <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Cari berdasarkan ID Transaksi atau nama paket..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none w-full bg-white transition shadow-sm text-gray-800"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-gray-400" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white font-medium shadow-sm cursor-pointer text-gray-750"
        >
          <option value="all">Semua Status Transaksi</option>
          <option value="success">✅ Lunas / Sukses</option>
          <option value="verifying">⏳ Menunggu Verifikasi</option>
          <option value="unpaid">🪙 Belum Dibayar</option>
          <option value="failed">❌ Gagal / Ditolak</option>
        </select>
      </div>
    </div>
  );
};
