import React from 'react';
import { 
  Loader2, AlertCircle, Phone, CheckCircle, Clock, LogIn, 
  Smartphone, Check, Copy, ExternalLink, Edit2, Trash2 
} from 'lucide-react';
import { Guest } from '../../../../types/database.types';

interface GuestsTableProps {
  guests: Guest[];
  loading: boolean;
  actionLoading: boolean;
  copiedCode: string | null;
  copiedMessageId: string | null;
  copiedLinkId: string | null;
  handleOpenWhatsApp: (guest: Guest) => void;
  handleCopyMessage: (guest: Guest) => void;
  handleCopyLink: (link: string, code: string) => void;
  openEditModal: (guest: Guest) => void;
  handleDeleteGuest: (id: string, name: string) => void;
}

export const GuestsTable: React.FC<GuestsTableProps> = ({
  guests,
  loading,
  actionLoading,
  copiedCode,
  copiedMessageId,
  copiedLinkId,
  handleOpenWhatsApp,
  handleCopyMessage,
  handleCopyLink,
  openEditModal,
  handleDeleteGuest,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-2" />
          <p className="text-sm text-gray-400 font-medium">Memuat database tamu undangan...</p>
        </div>
      ) : guests.length === 0 ? (
        <div className="p-12 text-center text-gray-400 font-medium">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Tidak ada data tamu yang cocok dengan pencarian / filter Anda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                <th className="px-6 py-4">Nama Tamu</th>
                <th className="px-6 py-4">No WhatsApp</th>
                <th className="px-6 py-4">Guest Code</th>
                <th className="px-6 py-4">Status Kirim</th>
                <th className="px-6 py-4">Status Buka</th>
                <th className="px-6 py-4">Status RSVP</th>
                <th className="px-6 py-4">Check-in Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-xs text-gray-700">
              {guests.map((guest) => {
                const isCopied = copiedCode === guest.guest_code;
                const isMessageCopied = copiedMessageId === guest.id;
                const isLinkCopied = copiedLinkId === guest.id;
                return (
                  <tr key={guest.id} className="hover:bg-gray-50/50 transition">
                    {/* Nama */}
                    <td className="px-6 py-4 font-bold text-gray-900">{guest.name}</td>
                    
                    {/* WhatsApp */}
                    <td className="px-6 py-4 text-gray-600 font-medium font-mono">
                      {guest.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-green-500" /> +{guest.phone}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Kosong</span>
                      )}
                    </td>
                    
                    {/* Guest Code */}
                    <td className="px-6 py-4 font-mono font-bold text-gray-800">{guest.guest_code}</td>

                    {/* Status Kirim */}
                    <td className="px-6 py-4">
                      {guest.sent_status === 'sent' ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" /> Terkirim
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-[10px] font-bold">
                          <Clock className="w-3 h-3" /> Belum Kirim
                        </span>
                      )}
                    </td>

                    {/* Status Buka */}
                    <td className="px-6 py-4">
                      {guest.opened_at ? (
                        <span className="text-xs text-green-600 font-bold" title={new Date(guest.opened_at).toLocaleString()}>
                          Dibuka
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Belum dibuka</span>
                      )}
                    </td>

                    {/* Status RSVP */}
                    <td className="px-6 py-4">
                      {guest.rsvp_status === 'attending' && (
                        <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-[10px] font-bold">Hadir</span>
                      )}
                      {guest.rsvp_status === 'declined' && (
                        <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold">Tidak Hadir</span>
                      )}
                      {(!guest.rsvp_status || guest.rsvp_status === 'pending') && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-[10px] font-bold">Pending</span>
                      )}
                    </td>

                    {/* Status Check-in */}
                    <td className="px-6 py-4">
                      {guest.checkin_status === 'checked_in' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          <LogIn className="w-3 h-3" /> Berhasil
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">Pending</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(guest)}
                          className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg transition"
                          title="Kirim Undangan WhatsApp"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyMessage(guest)}
                          className="text-gray-550 hover:text-primary-600 bg-gray-100 p-1.5 rounded-lg transition"
                          title="Salin Pesan Undangan Lengkap"
                        >
                          {isMessageCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(guest.personal_link, guest.guest_code)}
                          className="text-gray-555 hover:text-primary-600 bg-gray-100 p-1.5 rounded-lg transition"
                          title="Salin Personal Link"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(guest)}
                          className="text-blue-500 hover:text-blue-600 bg-blue-50 p-1.5 rounded-lg transition"
                          title="Edit Detail Tamu"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleDeleteGuest(guest.id, guest.name)}
                          className="text-red-500 hover:text-red-600 bg-red-50 p-1.5 rounded-lg transition"
                          title="Hapus Tamu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
