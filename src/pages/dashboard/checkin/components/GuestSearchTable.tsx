import React from 'react';
import { Search, Users } from 'lucide-react';
import { Guest } from '../../../../types/database.types';

interface GuestSearchTableProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterRsvp: string;
  setFilterRsvp: (val: string) => void;
  filterCheckin: string;
  setFilterCheckin: (val: string) => void;
  filteredGuests: Guest[];
  submitting: boolean;
  executeCheckIn: (code: string) => Promise<void>;
}

export function GuestSearchTable({
  searchQuery,
  setSearchQuery,
  filterRsvp,
  setFilterRsvp,
  filterCheckin,
  setFilterCheckin,
  filteredGuests,
  submitting,
  executeCheckIn
}: GuestSearchTableProps) {
  return (
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
          className="bg-white border border-gray-250 rounded-lg px-2 py-1 select-none font-medium text-gray-600 focus:outline-none"
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
          className="bg-white border border-gray-250 rounded-lg px-2 py-1 select-none font-medium text-gray-600 focus:outline-none"
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

      {/* List table */}
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
  );
}
