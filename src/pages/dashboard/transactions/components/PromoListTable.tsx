import React from 'react';
import { FileText, Loader2, Trash2 } from 'lucide-react';

interface PromoListTableProps {
  promos: any[];
  loading: boolean;
  actionLoading: boolean;
  handleTogglePromoStatus: (promo: any) => void;
  handleDeletePromo: (id: string, code: string) => void;
}

export const PromoListTable: React.FC<PromoListTableProps> = ({
  promos,
  loading,
  actionLoading,
  handleTogglePromoStatus,
  handleDeletePromo,
}) => {
  if (loading) {
    return (
      <div className="p-16 text-center space-y-2 bg-white rounded-3xl border">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
        <p className="text-xs text-gray-400 font-semibold">Memuat daftar kode promo...</p>
      </div>
    );
  }

  if (promos.length === 0) {
    return (
      <div className="p-16 text-center border-dashed border-2 border-gray-150 rounded-2xl bg-white">
        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2.5" />
        <p className="text-sm font-bold text-gray-700">Belum ada kode promo ditemukan</p>
        <p className="text-xs text-gray-400 mt-0.5">Buat kode promo pertama Anda untuk dibagikan kepada kustomer.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-6 text-left">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50/50 text-gray-400 border-b border-gray-150 font-bold uppercase text-[9px] tracking-wider">
            <th className="p-4 pl-6">Kode Promo</th>
            <th className="p-4">Tipe Diskon</th>
            <th className="p-4">Nilai Potongan</th>
            <th className="p-4">Min. Belanja</th>
            <th className="p-4">Kuota / Pemakaian</th>
            <th className="p-4">Status</th>
            <th className="p-4">Kedaluwarsa</th>
            <th className="p-4 pr-6 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
          {promos.filter(p => p && p.id).map((p) => (
            <tr key={p.id} className="hover:bg-gray-50/50 transition">
              <td className="p-4 pl-6 font-bold text-sm text-gray-955 font-mono tracking-wider uppercase">
                {p.code}
              </td>
              <td className="p-4 capitalize">
                {p.discount_type === 'percentage' ? 'Persentase (%)' : 'Potongan Tetap (Rp)'}
              </td>
              <td className="p-4 font-bold text-gray-900">
                {p.discount_type === 'percentage' ? `${p.discount_value}%` : `Rp ${Number(p.discount_value).toLocaleString('id-ID')}`}
              </td>
              <td className="p-4 font-mono">
                Rp {Number(p.min_transaction).toLocaleString('id-ID')}
              </td>
              <td className="p-4 font-mono">
                <span>{p.usage_count}</span>
                <span className="text-gray-405"> / </span>
                <span>{p.usage_limit !== null ? p.usage_limit : '∞'}</span>
              </td>
              <td className="p-4">
                {p.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-150">
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-550 border border-gray-200">
                    Nonaktif
                  </span>
                )}
              </td>
              <td className="p-4 text-gray-400 font-medium font-mono">
                {p.expired_at ? (
                  new Date(p.expired_at) < new Date() ? (
                    <span className="text-red-500 font-semibold">Expired</span>
                  ) : (
                    new Date(p.expired_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                  )
                ) : (
                  <span className="text-gray-300 italic font-normal">No Limit</span>
                )}
              </td>
              <td className="p-4 pr-6 text-right space-x-2">
                <button
                  type="button"
                  onClick={() => handleTogglePromoStatus(p)}
                  disabled={actionLoading}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                    p.status === 'active'
                      ? 'bg-amber-50 border-amber-150 text-amber-700 hover:bg-amber-100'
                      : 'bg-green-50 border-green-150 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {p.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePromo(p.id, p.code)}
                  disabled={actionLoading}
                  className="text-red-600 hover:text-red-750 p-1.5 rounded-lg border border-transparent hover:border-red-150 hover:bg-red-50 transition inline-flex items-center justify-center align-middle"
                  title="Hapus Promo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
