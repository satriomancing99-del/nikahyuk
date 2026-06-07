import React from 'react';
import { Loader2, FileText, CheckCircle, XCircle, Clock, AlertCircle, Eye, Check, Edit, Trash2, Upload, Copy } from 'lucide-react';
import { Transaction, Package } from '../../../../types/database.types';

interface TransactionsTableProps {
  transactions: Transaction[];
  loading: boolean;
  actionLoading: boolean;
  packages: Package[];
  role: 'super_admin' | 'customer';
  copiedId: string | null;
  handleCopyId: (id: string) => void;
  setViewingProofUrl: (url: string | null) => void;
  handleApproveTransaction: (id: string) => void;
  handleRejectTransaction: (id: string) => void;
  openEditTxModal: (tx: Transaction) => void;
  handleDeleteTransaction: (id: string) => void;
  triggerUploadProof: (id: string) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  loading,
  actionLoading,
  packages,
  role,
  copiedId,
  handleCopyId,
  setViewingProofUrl,
  handleApproveTransaction,
  handleRejectTransaction,
  openEditTxModal,
  handleDeleteTransaction,
  triggerUploadProof,
}) => {
  const getPackageName = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.name : 'Tema Kustom Premium';
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-2 bg-white rounded-2xl border">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
        <p className="text-xs text-gray-400 font-semibold">Memuat riwayat transaksi digital...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-16 text-center border-dashed border-2 border-gray-150 rounded-b-2xl m-5 bg-white">
        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2.5" />
        <p className="text-sm font-bold text-gray-700">Belum ada transaksi ditemukan</p>
        <p className="text-xs text-gray-400 mt-0.5">Seluruh pemesanan dan langganan paket undangan kustomer akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50/50 text-gray-400 border-b border-gray-150 font-bold uppercase text-[9px] tracking-wider">
            <th className="p-4 pl-6">ID Transaksi</th>
            <th className="p-4">Paket Desain</th>
            <th className="p-4">Jumlah Pembayaran</th>
            <th className="p-4">Status</th>
            <th className="p-4">Bukti Bayar</th>
            <th className="p-4">Tanggal Pesan</th>
            <th className="p-4 pr-6 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => {
            const hasProof = !!tx.proof_url;
            return (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                <td className="p-4 pl-6 font-mono text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-700">{tx.id.substring(0, 8)}...</span>
                    <button onClick={() => handleCopyId(tx.id)} className="text-gray-300 hover:text-primary-500 transition p-0.5 rounded" title="Salin ID Lengkap">
                      {copiedId === tx.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </td>

                <td className="p-4 font-bold text-gray-955 text-sm">
                  <div>{getPackageName(tx.package_id)}</div>
                  {tx.promo_code && (
                    <div className="mt-1 border-t border-transparent">
                      <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-750 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-blue-150 uppercase tracking-wide">
                        🎟️ {tx.promo_code}
                      </span>
                    </div>
                  )}
                </td>

                <td className="p-4 font-extrabold text-gray-850">
                  <div>Rp {tx.amount?.toLocaleString('id-ID')}</div>
                  {tx.discount_amount && tx.discount_amount > 0 ? (
                    <div className="text-[10px] text-gray-400 line-through font-normal mt-0.5">
                      Rp {tx.original_amount?.toLocaleString('id-ID')}
                    </div>
                  ) : null}
                </td>

                <td className="p-4">
                  {tx.payment_status === 'success' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-150">
                      <CheckCircle className="w-3 h-3" /> Lunas
                    </span>
                  )}
                  {tx.payment_status === 'failed' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-150">
                      <XCircle className="w-3 h-3" /> Gagal / Ditolak
                    </span>
                  )}
                  {tx.payment_status === 'pending' && (
                    hasProof ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-150">
                        <Clock className="w-3 h-3 animate-pulse" /> Verifikasi Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">
                        <AlertCircle className="w-3 h-3" /> Belum Bayar
                      </span>
                    )
                  )}
                </td>

                <td className="p-4">
                  {hasProof ? (
                    <button onClick={() => setViewingProofUrl(tx.proof_url)} className="text-xs font-bold text-primary-600 hover:text-primary-700 transition flex items-center gap-1 bg-primary-50 px-2 py-1 rounded-lg border border-primary-100">
                      <Eye className="w-3.5 h-3.5" /> Lihat Bukti
                    </button>
                  ) : (
                    <span className="text-gray-350 italic">Belum diunggah</span>
                  )}
                </td>

                <td className="p-4 text-gray-400 font-medium font-mono">
                  {new Date(tx.created_at).toLocaleString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })} WIB
                </td>

                <td className="p-4 pr-6 text-right whitespace-nowrap">
                  {role === 'super_admin' ? (
                    <div className="flex justify-end gap-1.5">
                      {tx.payment_status === 'pending' && hasProof && (
                        <>
                          <button onClick={() => handleApproveTransaction(tx.id)} disabled={actionLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-sm transition flex items-center gap-1 disabled:opacity-50">
                            {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Setujui</span>
                          </button>
                          <button onClick={() => handleRejectTransaction(tx.id)} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-sm transition flex items-center gap-1 disabled:opacity-50">
                            {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>Tolak</span>
                          </button>
                        </>
                      )}
                      <button onClick={() => openEditTxModal(tx)} disabled={actionLoading} className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg border border-blue-200 transition flex items-center gap-1">
                        <Edit className="w-3.5 h-3.5" /> <span>Sunting</span>
                      </button>
                      <button onClick={() => handleDeleteTransaction(tx.id)} disabled={actionLoading} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg border border-red-200 transition flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> <span>Hapus</span>
                      </button>
                    </div>
                  ) : (
                    tx.payment_status === 'pending' ? (
                      <button onClick={() => triggerUploadProof(tx.id)} disabled={actionLoading} className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1 disabled:opacity-50">
                        <Upload className="w-3 h-3" /> Unggah Bukti
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs font-medium">-</span>
                    )
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
