import React from 'react';
import { Info, CheckCircle2 } from 'lucide-react';

export function AboutTab() {
  return (
    <div className="space-y-5">
      <h3 className="text-base font-extrabold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-primary-500" /> Informasi Aplikasi NikahYuk!
      </h3>

      <div className="bg-primary-50/50 border border-primary-100 p-5 rounded-3xl space-y-3.5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-extrabold text-primary-850">NikahYuk! Invitation Premium Standard v1.2</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed font-medium">
          NikahYuk! adalah platform pembuatan undangan digital berbasis AI terkanggih di Indonesia. Dilengkapi generator desain dinamis, compiler sandbox modular, pengelolaan tamu berbasis CSV/VCF, RSVP terotomatisasi, serta manajemen kado e-gifts terintegrasi.
        </p>
      </div>

      <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse font-medium">
          <tbody>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <td className="p-3.5 pl-5 font-bold text-gray-400 uppercase tracking-wide text-[10px]">Versi Sistem</td>
              <td className="p-3.5 font-bold text-gray-800">Build v1.2.0 (Stable Production)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3.5 pl-5 font-bold text-gray-400 uppercase tracking-wide text-[10px]">Kerangka Kerja (Framework)</td>
              <td className="p-3.5 text-gray-600">React + TypeScript + Vite + TailwindCSS</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <td className="p-3.5 pl-5 font-bold text-gray-400 uppercase tracking-wide text-[10px]">Penyimpanan Awan (Cloud DB)</td>
              <td className="p-3.5 text-gray-600">Supabase Storage, Auth, & PostgreSQL RLS</td>
            </tr>
            <tr>
              <td className="p-3.5 pl-5 font-bold text-gray-400 uppercase tracking-wide text-[10px]">Lisensi Hak Cipta</td>
              <td className="p-3.5 text-gray-500">© 2026 NikahYuk! All Rights Reserved.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
