import React from 'react';
import { Clock } from 'lucide-react';

interface LiveCheckInLogsProps {
  recentCheckedIn: any[];
}

export function LiveCheckInLogs({ recentCheckedIn }: LiveCheckInLogsProps) {
  const formatIndoTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-500" /> Tamu Baru Saja Hadir (Check-In)
      </h3>
      
      <div className="divide-y divide-gray-100 max-h-[220px] overflow-y-auto pr-2 space-y-1">
        {recentCheckedIn.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xs text-gray-400 font-semibold">Belum ada tamu yang masuk. Menunggu scan...</p>
          </div>
        ) : (
          recentCheckedIn.map((log) => (
            <div key={log.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  {log.guests?.name?.charAt(0) || 'G'}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-xs">{log.guests?.name || 'Tamu Tanpa nama'}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                    <span className="font-mono font-bold text-primary-600 bg-primary-50 px-1 py-0.5 rounded text-[9px]">{log.guests?.guest_code}</span>
                    <span>•</span>
                    <span>RSVP: {log.guests?.rsvp_status === 'attending' ? '😇 Hadir' : log.guests?.rsvp_status === 'declined' ? '😔 Absen' : '🤔 Ragu'}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                  {formatIndoTime(log.checked_in_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
