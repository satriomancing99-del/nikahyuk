import React from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';

export const ContributorInstructions: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100 rounded-3xl p-6 space-y-4">
      <h3 className="text-sm font-bold text-primary-900 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-primary-500 fill-current" />
        Petunjuk Pembuatan Mandiri via ChatGPT
      </h3>

      <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
        <div className="flex gap-2">
          <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">1</span>
          <p>
            Pilih kategori paket template di sidebar kanan (Silver, Gold, Platinum, atau Tipografi) lalu klik Salin Prompt Pembuatan.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">2</span>
          <p>
            Buka <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-bold inline-flex items-center gap-0.5">ChatGPT <ExternalLink className="w-3.5 h-3.5" /></a>, paste seluruh prompt tersebut, lalu minta ChatGPT membuat komponen react premium.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">3</span>
          <p>
            Unduh file `template.jsx` dan `config.json` hasil ChatGPT. Kompres kedua file tersebut beserta gambar `thumbnail.jpg` menjadi satu berkas .zip, atau unggah langsung file `.jsx` tersebut di sini.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">4</span>
          <p>
            Kamu bisa menambahkan jenis kategori, warna, animasi, gambar, bentuk, atau tulisan secara spesifik pada template. Cukup tambahkan catatan instruksi Anda di ChatGPT.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">5</span>
          <p>
            Klik tombol Ajukan untuk Review agar Admin dapat menyetujui kontribusi template Anda!
          </p>
        </div>
      </div>
    </div>
  );
};
