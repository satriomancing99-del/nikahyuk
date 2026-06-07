import React from 'react';
import { ExternalLink } from 'lucide-react';

interface ReceiptModalProps {
  viewingProofUrl: string | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  viewingProofUrl,
  onClose,
}) => {
  if (!viewingProofUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border p-4 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h4 className="font-bold text-gray-900 text-sm">Pratinjau Bukti Transfer Pembayaran</h4>
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-gray-650 transition cursor-pointer font-sans"
          >
            Tutup
          </button>
        </div>
        <div className="aspect-[4/3] bg-stone-100 rounded-2xl overflow-hidden border border-gray-150 relative">
          <img
            src={viewingProofUrl}
            alt="Bukti Transfer Pembayaran"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => window.open(viewingProofUrl, '_blank')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-4 py-2 rounded-xl border flex items-center gap-1 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Buka Tab Baru
          </button>
          <button
            onClick={onClose}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
