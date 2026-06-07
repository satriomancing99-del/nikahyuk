import React from 'react';
import { Link } from 'react-router-dom';

interface RsvpFeedListProps {
  recentRsvps: any[];
}

export function RsvpFeedList({ recentRsvps }: RsvpFeedListProps) {
  return (
    <div className="lg:col-span-5 bg-white border border-gray-150 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-3 border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-950">Konfirmasi RSVP & Pesan Baru</h3>
            <p className="text-[10px] text-gray-400 font-medium">Buku Ucapan virtual tamu di web undangan.</p>
          </div>
          <Link to="/dashboard/guests" className="text-xs text-primary-600 font-bold hover:underline">
            Lihat Tamu
          </Link>
        </div>

        <div className="divide-y divide-gray-100 overflow-y-auto max-h-[260px] pr-1 space-y-1">
          {recentRsvps.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-gray-400">Belum ada respon RSVP tertulis dari para tamu.</p>
            </div>
          ) : (
            recentRsvps.map((rsvp) => (
              <div key={rsvp.id} className="py-3 font-medium first:pt-0 last:pb-0">
                <div className="flex justify-between text-xs items-center">
                  <span className="font-bold text-gray-900">{rsvp.guest_name}</span>
                  
                  {rsvp.attendance_status === 'attending' ? (
                    <span className="bg-emerald-50 text-emerald-700 font-bold text-[9px] px-1.5 py-0.5 rounded">Hadir</span>
                  ) : rsvp.attendance_status === 'declined' ? (
                    <span className="bg-rose-50 text-rose-700 font-bold text-[9px] px-1.5 py-0.5 rounded">Absen</span>
                  ) : (
                    <span className="bg-yellow-50 text-yellow-700 font-bold text-[9px] px-1.5 py-0.5 rounded">Ragu</span>
                  )}
                </div>
                {rsvp.message && (
                  <p className="text-[11px] text-gray-500 italic mt-1 leading-normal">
                     "{rsvp.message}"
                  </p>
                )}
                <span className="text-[9px] text-gray-400 block mt-1 tracking-wider font-mono">
                   {new Date(rsvp.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
