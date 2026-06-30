import React from 'react';
import { MessageSquare, Clock, Smile } from 'lucide-react';

interface WishesStatsProps {
  totalWishes: number;
  countToday: number;
  averageLength: number;
}

export function WishesStats({ totalWishes, countToday, averageLength }: WishesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Stat 1: Total wishes */}
      <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-5.5 h-5.5" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Ucapan Masuk</span>
          <span className="text-xl font-extrabold text-gray-800 block mt-0.5">
            {totalWishes} <span className="text-xs font-semibold text-gray-400">pesan</span>
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
  );
}
