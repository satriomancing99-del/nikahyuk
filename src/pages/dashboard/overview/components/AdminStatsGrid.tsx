import React from 'react';
import { Users, Heart, CreditCard, Clock, Loader2 } from 'lucide-react';

interface AdminStatsGridProps {
  loadingAdminStats: boolean;
  adminStats: {
    totalUsers: number;
    totalInvitations: number;
    totalTransactions: number;
    pendingTransactions: number;
  } | null;
}

export function AdminStatsGrid({ loadingAdminStats, adminStats }: AdminStatsGridProps) {
  if (loadingAdminStats) {
    return (
      <div className="bg-white border border-gray-150 rounded-3xl p-8 flex items-center justify-center text-xs text-gray-400 font-bold gap-2 shadow-xs">
        <Loader2 className="w-4 h-4 animate-spin text-primary-500" /> Memuat metrik sistem...
      </div>
    );
  }

  if (!adminStats) {
    return <div className="text-xs text-gray-400 font-medium">Gagal memuat metrik sistem.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
      {/* Metrik 1: Total Pengguna Terdaftar */}
      <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/20 rounded-2xl p-5 border border-indigo-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono">Pengguna Terdaftar</p>
            <h3 className="text-3xl font-extrabold text-indigo-955 mt-1">{adminStats.totalUsers}</h3>
          </div>
          <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-sm">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[10px] text-indigo-500 font-bold uppercase mt-3">Kustomer Terdaftar</p>
      </div>

      {/* Metrik 2: Total Undangan Dibuat */}
      <div className="bg-gradient-to-br from-pink-50/70 to-rose-50/20 rounded-2xl p-5 border border-pink-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-pink-400 uppercase tracking-widest font-mono">Undangan Dibuat</p>
            <h3 className="text-3xl font-extrabold text-pink-955 mt-1">{adminStats.totalInvitations}</h3>
          </div>
          <div className="p-2.5 bg-pink-500 text-white rounded-xl shadow-sm">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </div>
        <p className="text-[10px] text-pink-500 font-bold uppercase mt-3">Desain Undangan Terbit</p>
      </div>

      {/* Metrik 3: Total Transaksi Pembelian */}
      <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/20 rounded-2xl p-5 border border-emerald-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-mono">Total Transaksi</p>
            <h3 className="text-3xl font-extrabold text-emerald-955 mt-1">{adminStats.totalTransactions}</h3>
          </div>
          <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-sm">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[10px] text-emerald-600 font-bold uppercase mt-3">Pembelian Layanan Terdata</p>
      </div>

      {/* Metrik 4: Transaksi Pending (Menunggu Verifikasi) */}
      <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/20 rounded-2xl p-5 border border-amber-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest font-mono">Transaksi Pending</p>
            <h3 className="text-3xl font-extrabold text-amber-955 mt-1">{adminStats.pendingTransactions}</h3>
          </div>
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-block w-max mt-3 ${
          adminStats.pendingTransactions > 0 
            ? 'bg-amber-100 text-amber-800 animate-pulse font-sans' 
            : 'bg-white/80 text-gray-500 font-sans'
        }`}>
          {adminStats.pendingTransactions > 0 ? '⚠️ Butuh Verifikasi Admin' : '✅ Semua Transaksi Lunas'}
        </span>
      </div>
    </div>
  );
}
