import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GuestAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    phone: string,
    sentStatus: string,
    rsvpStatus: string,
    checkinStatus: string
  ) => Promise<boolean>;
  actionLoading: boolean;
}

export const GuestAddModal: React.FC<GuestAddModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  actionLoading,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sentStatus, setSentStatus] = useState('unsent');
  const [rsvpStatus, setRsvpStatus] = useState('pending');
  const [checkinStatus, setCheckinStatus] = useState('pending');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama tamu wajib diisi.');
      return;
    }
    const success = await onSubmit(name, phone, sentStatus, rsvpStatus, checkinStatus);
    if (success) {
      setName('');
      setPhone('');
      setSentStatus('unsent');
      setRsvpStatus('pending');
      setCheckinStatus('pending');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-150 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">Tambah Tamu Baru</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nama Tamu</label>
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
              placeholder="Contoh: 08123456789 atau +628..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-[10px] text-gray-400 font-medium block mt-1">
              Nomor akan dinormalisasi otomatis ke format standar internasional (628...).
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status Kirim</label>
              <select
                value={sentStatus}
                onChange={(e) => setSentStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="attending">Hadir</option>
                <option value="declined">Tidak Hadir</option>
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
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Tamu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
