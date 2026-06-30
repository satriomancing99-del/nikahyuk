import React from 'react';
import { Edit } from 'lucide-react';
import { Transaction } from '../../../../types/database.types';

interface EditTxModalProps {
  editingTx: Transaction | null;
  onClose: () => void;
  status: string;
  setStatus: (val: string) => void;
  amount: number;
  setAmount: (val: number) => void;
  activatedAt: string;
  setActivatedAt: (val: string) => void;
  expiredAt: string;
  setExpiredAt: (val: string) => void;
  onSubmit: () => void;
  actionLoading: boolean;
  getPackageName: (packageId: string) => string;
}

export const EditTxModal: React.FC<EditTxModalProps> = ({
  editingTx,
  onClose,
  status,
  setStatus,
  amount,
  setAmount,
  activatedAt,
  setActivatedAt,
  expiredAt,
  setExpiredAt,
  onSubmit,
  actionLoading,
  getPackageName,
}) => {
  if (!editingTx) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border p-6 space-y-4 text-left animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b pb-3">
          <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
            <Edit className="w-4 h-4 text-primary-500" /> Sunting Transaksi Kustomer
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-gray-650 transition cursor-pointer font-sans"
          >
            Tutup
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-gray-50 p-3.5 rounded-2xl border text-stone-600 space-y-1.5 font-medium">
            <div><span className="font-bold text-gray-700">ID Transaksi:</span> <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border select-all">{editingTx.id}</span></div>
            <div><span className="font-bold text-gray-700">Pelanggan ID:</span> <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border select-all">{editingTx.user_id}</span></div>
            <div><span className="font-bold text-gray-700">Paket:</span> <span className="font-extrabold text-gray-900">{getPackageName(editingTx.package_id)}</span></div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Status Pembayaran</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold bg-white cursor-pointer text-gray-800"
            >
              <option value="pending">⏳ Pending (Menunggu Verifikasi/Belum Bayar)</option>
              <option value="success">✅ Success (Lunas & Aktifkan Paket)</option>
              <option value="failed">❌ Failed (Ditolak / Gagal)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Jumlah Pembayaran (Rp)</label>
            <input 
              type="number"
              required
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Waktu Aktivasi</label>
              <input 
                type="datetime-local"
                value={activatedAt}
                onChange={(e) => setActivatedAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-800"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Waktu Kedaluwarsa</label>
              <input 
                type="datetime-local"
                value={expiredAt}
                onChange={(e) => setExpiredAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-800"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={actionLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-primary-50 disabled:opacity-50 cursor-pointer"
          >
            {actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
};
