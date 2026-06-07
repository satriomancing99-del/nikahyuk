import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Info, ExternalLink } from 'lucide-react';
import { Template } from '../../../../../types/database.types';

interface SlugConfigStepProps {
  customSlug: string;
  setCustomSlug: (slug: string) => void;
  checkingSlug: boolean;
  slugExists: boolean | null;
  selectedTemplate: Template | null;
  mempelai: any;
  eventAkad: any;
  eventResepsi: any;
  handlePreviewNewTab: () => void;
}

export const SlugConfigStep: React.FC<SlugConfigStepProps> = ({
  customSlug,
  setCustomSlug,
  checkingSlug,
  slugExists,
  selectedTemplate,
  mempelai,
  eventAkad,
  eventResepsi,
  handlePreviewNewTab,
}) => {
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Ulasan & Kustomisasi URL</h2>
        <p className="text-sm text-gray-500 mt-1">Periksa kembali detail undangan cinta Anda sebelum dikirimkan ke dunia luar secara resmi.</p>
      </div>

      <div className="bg-primary-50/50 p-6 rounded-2xl border border-primary-100 flex flex-col gap-4">
        <label className="block text-sm font-bold text-gray-900 mb-1">Tentukan Link URL Undangan (Slug)</label>
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-inner">
          <span className="text-xs font-bold text-gray-400 select-none">nikahyuk.id/</span>
          <input 
            type="text" required placeholder="fulan-fulanah"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, ''))}
            className="flex-1 bg-transparent text-xs font-extrabold text-primary-700 focus:outline-none"
          />
          
          {customSlug && (
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {checkingSlug ? (
                <span className="text-gray-400 flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> cek...</span>
              ) : slugExists ? (
                <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Sudah Dipakai</span>
              ) : (
                <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Tersedia</span>
              )}
            </div>
          )}
        </div>
        
        <div className="text-[11px] text-gray-550 flex items-start gap-1">
          <Info className="w-4 h-4 text-gray-405 flex-shrink-0" />
          <span>Link di atas akan menjadi alamat utama bagi para tamu undangan untuk melihat rincian undangan digital Anda.</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-amber-50/55 border border-amber-200 rounded-2xl p-4 shadow-sm">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pratinjau Undangan Terlebih Dahulu</h4>
          <p className="text-[11px] text-gray-500">Lihat hasil akhir rancangan Anda di tab baru sebelum resmi diterbitkan.</p>
        </div>
        <button
          type="button" onClick={handlePreviewNewTab}
          className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer select-none"
        >
          <ExternalLink className="w-3.5 h-3.5 text-primary-500" /> Pratinjau di Tab Baru
        </button>
      </div>

      <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 divide-y divide-gray-205 max-h-[190px] overflow-y-auto space-y-4">
        <div className="flex justify-between items-center pb-3">
          <div>
            <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Tema Terpilih</span>
            <p className="text-xs font-bold text-gray-900">{selectedTemplate?.name || 'Klasik'}</p>
          </div>
          <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold">Published</span>
        </div>
        
        <div className="pt-3 grid grid-cols-2 gap-4 pb-3">
          <div>
            <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Mempelai Pria & Orang Tua</span>
            <p className="text-xs font-bold text-gray-900 truncate">{mempelai.groom_name}</p>
            <p className="text-[10px] text-gray-500 truncate">{mempelai.groom_parent}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Mempelai Wanita & Orang Tua</span>
            <p className="text-xs font-bold text-gray-900 truncate">{mempelai.bride_name}</p>
            <p className="text-[10px] text-gray-500 truncate">{mempelai.bride_parent}</p>
          </div>
        </div>

        <div className="pt-3 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Jadwal Akad</span>
            <p className="text-xs font-bold text-gray-900 truncate">{eventAkad.date} • {eventAkad.start_time} WIB</p>
            <p className="text-[10px] text-gray-500 truncate">{eventAkad.location_name}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wide text-gray-400 font-bold">Jadwal Resepsi</span>
            <p className="text-xs font-bold text-gray-900 truncate">{eventResepsi.date} • {eventResepsi.start_time} WIB</p>
            <p className="text-[10px] text-gray-500 truncate">{eventResepsi.location_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
