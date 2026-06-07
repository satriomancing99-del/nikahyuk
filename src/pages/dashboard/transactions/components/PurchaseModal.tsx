import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Package } from '../../../../types/database.types';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: Package[];
  handleCreateTransaction: (pkg: Package) => void;
  actionLoading: boolean;
  promoCode: string;
  setPromoCode: (code: string) => void;
  checkingPromo: boolean;
  handleApplyPromo: () => void;
  appliedPromo: any | null;
  setAppliedPromo: (promo: any) => void;
  promoError: string | null;
  setPromoError: (err: string | null) => void;
  promoSuccess: string | null;
  setPromoSuccess: (msg: string | null) => void;
  getDiscountedPrice: (price: number) => number;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  packages,
  handleCreateTransaction,
  actionLoading,
  promoCode,
  setPromoCode,
  checkingPromo,
  handleApplyPromo,
  appliedPromo,
  setAppliedPromo,
  promoError,
  setPromoError,
  promoSuccess,
  setPromoSuccess,
  getDiscountedPrice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h4 className="font-extrabold text-gray-900 text-base">Pilih Paket Undangan Digital Baru</h4>
            <p className="text-xs text-gray-500">Pilih salah satu paket di bawah untuk langsung mengaktifkan fitur di dasbor Anda.</p>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition font-sans"
          >
            Tutup
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const hasValidPromo = appliedPromo && pkg.price >= Number(appliedPromo.min_transaction);
            return (
              <div key={pkg.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between hover:border-primary-400 hover:shadow-md transition shadow-sm text-left">
                <div className="space-y-3">
                  <h5 className="font-bold text-gray-800 text-sm">{pkg.name}</h5>
                  <div className="text-2xl font-extrabold text-gray-950 text-left">
                    {hasValidPromo ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through font-normal">
                          Rp {pkg.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-emerald-600">
                          Rp {getDiscountedPrice(pkg.price).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ) : (
                      <span>Rp {pkg.price.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                  <ul className="text-[11px] text-gray-500 space-y-1.5 font-medium border-t pt-3 border-gray-200">
                    <li>• Masa Aktif: {Math.round(pkg.active_period / 30)} Bulan</li>
                    <li>• Kuota Tamu: {pkg.price === 49000 ? '150 Kontak' : pkg.price === 99000 ? '500 Kontak' : 'Tanpa Batas (Unlimited)'}</li>
                    <li>• Galeri Foto: {pkg.price === 49000 ? 'Maks 3 Foto' : pkg.price === 99000 ? 'Maks 8 Foto' : 'Maks 12 Foto'}</li>
                    <li>• Lagu BGM: {pkg.price === 49000 ? 'BGM Standar' : 'BGM Kustom (Unggah MP3)'}</li>
                    <li>• E-Gift & Kado: {pkg.price === 49000 ? 'Terkunci' : 'Aktif Lengkap'}</li>
                  </ul>
                </div>
                
                <button
                  onClick={() => handleCreateTransaction(pkg)}
                  disabled={actionLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm mt-5 disabled:opacity-50"
                >
                  {actionLoading ? 'Memproses...' : (
                    hasValidPromo ? (
                      <span>Pesan Rp {getDiscountedPrice(pkg.price).toLocaleString('id-ID')}</span>
                    ) : (
                      <span>Pesan Paket Ini</span>
                    )
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Promo Code Input Block */}
        <div className="bg-slate-50 rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <span className="text-xs font-bold text-gray-700 block">🏷️ Punya Kode Promo / Voucher Diskon?</span>
            <span className="text-[10px] text-gray-400 block leading-normal font-medium">
              Masukkan kode diskon Anda di sini untuk langsung mendapatkan potongan harga spesial NikahYuk!
            </span>
          </div>
          <div className="flex gap-2 shrink-0 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="CONTOH: PROMO99"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={checkingPromo || !!appliedPromo}
                className="px-4 py-2 text-xs border border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none w-44 font-bold tracking-wider bg-white uppercase disabled:bg-gray-100 disabled:text-gray-500 text-gray-800"
              />
              {appliedPromo && (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedPromo(null);
                    setPromoSuccess(null);
                    setPromoCode('');
                  }}
                  className="absolute right-2.5 top-2.5 text-[10px] font-extrabold text-red-500 hover:text-red-750 font-sans"
                >
                  Batal
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={checkingPromo || !!appliedPromo || !promoCode}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50"
            >
              {checkingPromo ? 'Memeriksa...' : 'Terapkan'}
            </button>
          </div>
        </div>

        {promoError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 flex gap-2 text-xs text-left">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span className="font-semibold">{promoError}</span>
          </div>
        )}

        {promoSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex gap-2 text-xs text-left">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{promoSuccess}</span>
          </div>
        )}
        
        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
};
