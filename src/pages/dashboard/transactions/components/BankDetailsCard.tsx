import React, { useState } from 'react';
import { Clock, CreditCard, Copy, Check, Upload } from 'lucide-react';
import { Transaction } from '../../../../types/database.types';

interface BankDetailsCardProps {
  pendingUnpaidTx: Transaction;
  getPackageName: (packageId: string) => string;
  triggerUploadProof: (id: string) => void;
  actionLoading: boolean;
}

export const BankDetailsCard: React.FC<BankDetailsCardProps> = ({
  pendingUnpaidTx,
  getPackageName,
  triggerUploadProof,
  actionLoading,
}) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopyAccount = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedAccount(number);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-250 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-stretch animate-in fade-in duration-300 text-left">
      {/* Left panel: Info & Amount */}
      <div className="flex-1 space-y-4 flex flex-col justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-605" /> Menunggu Pembayaran
          </span>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Selesaikan Pembayaran Anda</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            Anda memiliki pesanan paket <strong className="text-gray-805">{getPackageName(pendingUnpaidTx.package_id)}</strong> yang belum dibayar. Silakan lakukan transfer sebelum halaman ini kedaluwarsa.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xs border border-amber-150 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Tagihan</span>
          <span className="text-3xl font-black text-amber-700 block mt-1">
            Rp {pendingUnpaidTx.amount?.toLocaleString('id-ID')}
          </span>
          <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400 font-mono">
            <span>ID Transaksi:</span>
            <span className="font-bold text-gray-655">{pendingUnpaidTx.id}</span>
          </div>
        </div>
      </div>

      {/* Middle panel: Bank Transfer Accounts */}
      <div className="flex-1 space-y-4">
        <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-amber-600" /> Pilihan Rekening Tujuan Transfer:
        </h4>

        <div className="grid gap-3.5">
          {/* BCA Account */}
          <div className="bg-white border border-gray-150 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-amber-300 transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-xs shrink-0 select-none border border-blue-150 shadow-inner">
                BCA
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Bank BCA</span>
                <span className="text-sm font-extrabold text-gray-800 block mt-0.5">8012345678</span>
                <span className="text-[10px] text-gray-400 block font-medium">a.n. PT NikahYuk Indonesia</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyAccount('8012345678')}
              className={`p-2 rounded-xl border transition flex items-center justify-center ${
                copiedAccount === '8012345678'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 group-hover:scale-105 active:scale-95'
              }`}
              title="Salin Rekening"
            >
              {copiedAccount === '8012345678' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* GoPay/Dana */}
          <div className="bg-white border border-gray-150 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:border-amber-300 transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black flex items-center justify-center text-xs shrink-0 select-none border border-emerald-150 shadow-inner">
                GoPay
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">E-Wallet GoPay/Dana</span>
                <span className="text-sm font-extrabold text-gray-805 block mt-0.5">081234567890</span>
                <span className="text-[10px] text-gray-400 block font-medium">a.n. NikahYuk Payment</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyAccount('081234567890')}
              className={`p-2 rounded-xl border transition flex items-center justify-center ${
                copiedAccount === '081234567890'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 group-hover:scale-105 active:scale-95'
              }`}
              title="Salin Nomor HP"
            >
              {copiedAccount === '081234567890' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: Upload box */}
      <div className="flex-1 bg-white border border-amber-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-100 shadow-inner">
          <Upload className="w-6 h-6" />
        </div>
        <h5 className="font-bold text-gray-850 text-sm">Sudah Melakukan Transfer?</h5>
        <p className="text-[11px] text-gray-400 mt-1 max-w-xs leading-relaxed font-medium">
          Unggah file pratinjau struk transfer (JPG, JPEG, atau PNG) untuk divalidasi langsung oleh Admin kami dalam waktu 5-10 menit.
        </p>
        <button
          type="button"
          onClick={() => triggerUploadProof(pendingUnpaidTx.id)}
          disabled={actionLoading}
          className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md shadow-amber-100 flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" /> Unggah Bukti Sekarang
        </button>
      </div>
    </div>
  );
};
