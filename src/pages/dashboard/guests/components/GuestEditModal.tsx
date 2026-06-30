import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Guest } from '../../../../types/database.types';

interface GuestEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  onSubmit: (
    id: string,
    name: string,
    phone: string,
    sentStatus: string,
    rsvpStatus: string,
    checkinStatus: string
  ) => Promise<boolean>;
  actionLoading: boolean;
}

export const GuestEditModal: React.FC<GuestEditModalProps> = ({
  isOpen,
  onClose,
  guest,
  onSubmit,
  actionLoading,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sentStatus, setSentStatus] = useState('unsent');
  const [rsvpStatus, setRsvpStatus] = useState('pending');
  const [checkinStatus, setCheckinStatus] = useState('pending');

  useEffect(() => {
    if (guest) {
      setName(guest.name || '');
      setPhone(guest.phone || '');
      setSentStatus(guest.sent_status || 'unsent');
      setRsvpStatus(guest.rsvp_status || 'pending');
      setCheckinStatus(guest.checkin_status || 'pending');
    }
  }, [guest]);

  if (!isOpen || !guest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama tamu tidak boleh kosong.');
      return;
    }
    const success = await onSubmit(guest.id, name, phone, sentStatus, rsvpStatus, checkinStatus);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">Sunting Tamu Undangan</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nama Penerima</label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nomor WhatsApp / HP</label>
            <input
              type="text"
              placeholder="Contoh: 0812345..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-[10px] text-gray-400 font-medium block mt-1">
              Nomor akan dinormalisasi ke format standar internasional saat disimpan.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status Kirim</label>
              <select
                value={sentStatus}
                onChange={(e) => setSentStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 font-semibold"
              >
                <option value="unsent">Belum Kirim</option>
                <option value="sent">Sudah Kirim</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status RSVP</label>
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 font-semibold"
              >
                <option value="pending">Pending</option>
                <option value="attending">Hadir</option>
                <option value="declined">Tidak Hadir</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Check-in</label>
              <select
                value={checkinStatus}
                onChange={(e) => setCheckinStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 font-semibold"
              >
                <option value="pending">Pending</option>
                <option value="checked_in">Berhasil</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
