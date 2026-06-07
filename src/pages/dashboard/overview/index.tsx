import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Smile, FileSpreadsheet, Heart } from 'lucide-react';
import { useOverview } from './hooks/useOverview';
import { AdminStatsGrid } from './components/AdminStatsGrid';
import { KpiGrid } from './components/KpiGrid';
import { ResponseAnalysisCard } from './components/ResponseAnalysisCard';
import { RsvpFeedList } from './components/RsvpFeedList';

export default function DashboardOverview() {
  const {
    profile,
    adminStats,
    loadingAdminStats,
    invitations,
    selectedInvitation,
    recentRsvps,
    loading,
    exporting,
    totalGuests,
    rsvpHadir,
    rsvpAbsen,
    rsvpRagu,
    percentRsvpHadir,
    percentRsvpAbsen,
    percentRsvpRagu,
    handleSelectInvitation,
    handleExportExcel
  } = useOverview();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header & Active Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Smile className="w-7 h-7 text-primary-600" /> {profile?.role === 'super_admin' ? 'Dasbor Pemantauan Sistem (Super Admin)' : 'Ringkasan Acara Anda'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {profile?.role === 'super_admin' 
              ? 'Pemantauan real-time pertumbuhan pengguna, jumlah undangan dibuat, dan status transaksi platform.' 
              : `Selamat datang kembali, ${profile?.name || 'Admin'}! Statistik terbaru pernikahan Anda secara real-time.`}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {invitations.length > 0 ? (
            <div className="flex flex-col">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-mono">Pilih Undangan Aktif</label>
              <select
                value={selectedInvitation?.id || ''}
                onChange={(e) => handleSelectInvitation(e.target.value)}
                className="bg-gray-50 border border-gray-250 rounded-xl px-4 py-2 text-xs text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[210px]"
              >
                {invitations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    💍 {inv.groom_name} & {inv.bride_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              Belum ada undangan
            </p>
          )}

          {selectedInvitation && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exporting || totalGuests === 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 animate-in fade-in"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                Export Excel (.csv)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Super Admin Platform Overview Panel */}
      {profile?.role === 'super_admin' && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest font-mono">
            Platform Metrics (Super Admin)
          </h2>
          <AdminStatsGrid 
            loadingAdminStats={loadingAdminStats} 
            adminStats={adminStats} 
          />
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-20 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Menghubungkan ke server database Supabase...</p>
        </div>
      ) : !selectedInvitation ? (
        <div className="bg-white rounded-3xl p-16 border border-gray-200 shadow-sm text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Buat Undangan Digital Pertama Anda</h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            Rangkai janji suci pernikahan Anda dengan template desain pilihan eksklusif dan mulailah menyebarkan kebahagiaan kepada kerabat dekat Anda.
          </p>
          <Link
            to="/dashboard/invitations/create"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition shadow-md"
          >
            <Heart className="w-4 h-4 fill-current" /> Mulai Rancang Undangan
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <KpiGrid 
            totalGuests={totalGuests} 
            rsvpHadir={rsvpHadir} 
            rsvpAbsen={rsvpAbsen} 
            percentRsvpHadir={percentRsvpHadir} 
          />

          <div className="grid lg:grid-cols-12 gap-8">
            <ResponseAnalysisCard 
              rsvpHadir={rsvpHadir}
              rsvpRagu={rsvpRagu}
              rsvpAbsen={rsvpAbsen}
              percentRsvpHadir={percentRsvpHadir}
              percentRsvpRagu={percentRsvpRagu}
              percentRsvpAbsen={percentRsvpAbsen}
            />

            <RsvpFeedList recentRsvps={recentRsvps} />
          </div>
        </div>
      )}
    </div>
  );
}
