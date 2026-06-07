import React from 'react';
import { Users, CheckCircle2, Check, XCircle, AlertCircle } from 'lucide-react';

interface RsvpStatsCardsProps {
  stats: {
    total: number;
    attending: number;
    declined: number;
    uncertain: number;
    totalGuests: number;
  };
}

export function RsvpStatsCards({ stats }: RsvpStatsCardsProps) {
  return (
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
  );
}
