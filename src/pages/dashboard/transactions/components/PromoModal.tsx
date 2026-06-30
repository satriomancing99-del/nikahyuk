import React from 'react';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  actionLoading: boolean;
  code: string;
  setCode: (code: string) => void;
  discountType: 'percentage' | 'fixed';
  setDiscountType: (type: 'percentage' | 'fixed') => void;
  discountValue: number;
  setDiscountValue: (val: number) => void;
  minTx: number;
  setMinTx: (val: number) => void;
  usageLimit: string;
  setUsageLimit: (val: string) => void;
  expiry: string;
  setExpiry: (val: string) => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  actionLoading,
  code,
  setCode,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  minTx,
  setMinTx,
  usageLimit,
  setUsageLimit,
  expiry,
  setExpiry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <form 
        onSubmit={onSubmit}
        className="relative bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border p-6 space-y-4 text-left animate-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-center border-b pb-3">
          <h4 className="font-extrabold text-gray-900 text-sm">Buat Kode Promo Baru</h4>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition font-sans"
          >
            Tutup
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Kode Voucher (Kapital, Tanpa Spasi)</label>
            <input 
              type="text"
              required
              placeholder="Contoh: PROMOBAHAGIA"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold tracking-wider"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tipe Potongan</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold bg-white"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Rupiah Tetap (Rp)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Jumlah Potongan</label>
              <input 
                type="number"
                required
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Min. Belanja (Rp)</label>
              <input 
                type="number"
                required
                min={0}
                value={minTx}
                onChange={(e) => setMinTx(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-gray-800"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Batas Kuota (Kosongkan = ∞)</label>
              <input 
                type="number"
                placeholder="Unlimited"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Tanggal Kedaluwarsa (Opsional)</label>
            <input 
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-800"
            />
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
            type="submit"
            disabled={actionLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-primary-50 disabled:opacity-50"
          >
            {actionLoading ? 'Memproses...' : 'Buat Kupon Promo'}
          </button>
        </div>
      </form>
    </div>
  );
};
