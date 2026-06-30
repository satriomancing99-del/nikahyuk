import React from 'react';
import { Users, Heart, AlertCircle } from 'lucide-react';

interface KpiGridProps {
  totalGuests: number;
  rsvpHadir: number;
  rsvpAbsen: number;
  percentRsvpHadir: number;
}

export function KpiGrid({ totalGuests, rsvpHadir, rsvpAbsen, percentRsvpHadir }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Total Tamu */}
      <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Total Tamu</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{totalGuests}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase mt-3">Kerabat Tercinta</p>
      </div>

      {/* Total RSVP HADIR */}
      <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">RSVP Konfirmasi Hadir</p>
            <h3 className="text-3xl font-extrabold text-primary-600 mt-1">{rsvpHadir}</h3>
          </div>
          <div className="p-2.5 bg-rose-50 text-pink-500 rounded-xl">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </div>
        <span className="text-[10px] text-primary-600 bg-pink-50 px-2 py-0.5 rounded-full inline-block font-extrabold w-max mt-3.5">
          😇 {percentRsvpHadir}% Berencana Datang
        </span>
      </div>

      {/* Total RSVP ABSEN */}
      <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">RSVP Absen (Tidak)</p>
            <h3 className="text-3xl font-extrabold text-gray-500 mt-1">{rsvpAbsen}</h3>
          </div>
          <div className="p-2.5 bg-gray-100 text-gray-500 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-bold font-mono uppercase mt-3">{rsvpAbsen} Orang Berhalangan</p>
      </div>
    </div>
  );
}
