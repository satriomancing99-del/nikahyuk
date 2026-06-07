import React from 'react';
import { CheckCircle, XCircle, AlertCircle, MessageSquare, Phone, Trash2, Calendar } from 'lucide-react';
import { Rsvp as DBRsvp } from '../../../../types/database.types';

interface RsvpTableProps {
  filteredRsvps: DBRsvp[];
  associatedGuests: Record<string, { phone?: string }>;
  actionLoading: boolean;
  handleContactGuest: (guestId: string | null, name: string) => void;
  handleDeleteRsvp: (id: string, guestId: string | null, name: string) => Promise<void>;
}

export function RsvpTable({
  filteredRsvps,
  associatedGuests,
  actionLoading,
  handleContactGuest,
  handleDeleteRsvp
}: RsvpTableProps) {
  if (filteredRsvps.length === 0) {
    return (
      <div className="p-16 text-center border-dashed border-2 border-gray-150 rounded-b-2xl m-5">
        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2.5" />
        <p className="text-sm font-bold text-gray-700">Belum ada respon RSVP ditemukan</p>
        <p className="text-xs text-gray-400 mt-0.5">Ketika tamu menekan konfirmasi kehadiran di undangan digital, data akan tampil otomatis di sini.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50/50 text-gray-400 border-b border-gray-150 font-bold uppercase text-[9px] tracking-wider">
            <th className="p-4 pl-6">Nama Tamu</th>
            <th className="p-4">Status RSVP</th>
            <th className="p-4">Jumlah Orang</th>
            <th className="p-4 max-w-xs">Pesan Ucapan</th>
            <th className="p-4">Waktu Konfirmasi</th>
            <th className="p-4 pr-6 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredRsvps.map((rsvp) => {
            const hasPhone = rsvp.guest_id ? !!associatedGuests[rsvp.guest_id]?.phone : false;
            
            return (
              <tr key={rsvp.id} className="hover:bg-gray-50/50 transition">
                {/* Guest Name */}
                <td className="p-4 pl-6 font-bold text-gray-900 text-sm">
                  {rsvp.guest_name}
                </td>

                {/* Attendance Status Badge */}
                <td className="p-4">
                  {rsvp.attendance_status === 'attending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-150">
                      <CheckCircle className="w-3 h-3" /> Hadir
                    </span>
                  )}
                  {rsvp.attendance_status === 'declined' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-150">
                      <XCircle className="w-3 h-3" /> Tidak Hadir
                    </span>
                  )}
                  {rsvp.attendance_status === 'uncertain' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-150">
                      <AlertCircle className="w-3 h-3" /> Ragu-Ragu
                    </span>
                  )}
                </td>

                {/* total guest pax count */}
                <td className="p-4 font-semibold text-gray-600">
                  {rsvp.attendance_status === 'attending' ? (
                    <span className="bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-100 text-emerald-800 font-bold">
                      {rsvp.total_guest || 1} Orang
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                {/* lovely Message/wish */}
                <td className="p-4 max-w-xs text-gray-500 leading-normal font-medium truncate" title={rsvp.message}>
                  {rsvp.message ? (
                    <span className="flex items-center gap-1 text-gray-700">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {rsvp.message}
                    </span>
                  ) : (
                    <span className="text-gray-350 italic font-normal">Tanpa pesan ucapan</span>
                  )}
                </td>

                {/* Created at date */}
                <td className="p-4 text-gray-400 font-medium">
                  {new Date(rsvp.created_at).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })} WIB
                </td>

                {/* Action triggers */}
                <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                  <button
                    onClick={() => handleContactGuest(rsvp.guest_id, rsvp.guest_name)}
                    disabled={!hasPhone}
                    className={`p-2 rounded-xl transition inline-flex items-center justify-center ${
                      hasPhone 
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200' 
                        : 'bg-gray-50 text-gray-300 border border-gray-150 cursor-not-allowed'
                    }`}
                    title={hasPhone ? "Hubungi via WhatsApp" : "Kontak tidak tertaut nomor HP"}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRsvp(rsvp.id, rsvp.guest_id, rsvp.guest_name)}
                    disabled={actionLoading}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition inline-flex items-center justify-center disabled:opacity-50"
                    title="Hapus Respon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
