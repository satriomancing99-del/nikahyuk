import React from 'react';
import { Heart } from 'lucide-react';
import { RELIGION_PRESETS } from '../../utils/editorHelpers';

interface BrideGroomStepProps {
  mempelai: {
    groom_name: string; groom_parent: string; bride_name: string; bride_parent: string;
    quote: string; greeting: string; love_story: string;
  };
  setMempelai: React.Dispatch<React.SetStateAction<any>>;
  selectedReligion: string;
  setSelectedReligion: (religion: string) => void;
  groomPhotoPreview: string;
  bridePhotoPreview: string;
  triggerCropper: (file: File, type: 'groom' | 'bride') => void;
}

export const BrideGroomStep: React.FC<BrideGroomStepProps> = ({
  mempelai,
  setMempelai,
  selectedReligion,
  setSelectedReligion,
  groomPhotoPreview,
  bridePhotoPreview,
  triggerCropper,
}) => {
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'groom' | 'bride') => {
    if (e.target.files && e.target.files[0]) {
      triggerCropper(e.target.files[0], type);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Informasi Mempelai</h2>
        <p className="text-sm text-gray-500 mt-1">Lengkapi nama lengkap dan kutipan suci Anda.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Mempelai Pria */}
        <div className="space-y-4 bg-gray-55/50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-base border-b border-gray-200 pb-2">
            <Heart className="w-4 h-4 fill-current" /> Mempelai Pria (Groom)
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap Pria</label>
            <input 
              type="text" required placeholder="Contoh: Muhammad Yusuf, S.T."
              value={mempelai.groom_name}
              onChange={(e) => setMempelai((prev: any) => ({ ...prev, groom_name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nama Orang Tua (Ayah & Ibu)</label>
            <input 
              type="text" required placeholder="Contoh: Putra dari Bpk. Bambang & Ibu Aminah"
              value={mempelai.groom_parent}
              onChange={(e) => setMempelai((prev: any) => ({ ...prev, groom_parent: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Foto Profil Mempelai Pria</label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border border-gray-300 bg-white overflow-hidden flex items-center justify-center text-xs text-gray-400 font-bold flex-shrink-0 shadow-inner">
                {groomPhotoPreview ? <img src={groomPhotoPreview} className="w-full h-full object-cover" /> : 'Tanpa Foto'}
              </div>
              <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition select-none">
                Pilih Foto Pria
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, 'groom')} />
              </label>
            </div>
          </div>
        </div>

        {/* Mempelai Wanita */}
        <div className="space-y-4 bg-gray-55/50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-base border-b border-gray-200 pb-2">
            <Heart className="w-4 h-4 fill-current" /> Mempelai Wanita (Bride)
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap Wanita</label>
            <input 
              type="text" required placeholder="Contoh: Siti Aisyah, S.Kom."
              value={mempelai.bride_name}
              onChange={(e) => setMempelai((prev: any) => ({ ...prev, bride_name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nama Orang Tua (Ayah & Ibu)</label>
            <input 
              type="text" required placeholder="Contoh: Putri dari Bpk. Hartono & Ibu Fatimah"
              value={mempelai.bride_parent}
              onChange={(e) => setMempelai((prev: any) => ({ ...prev, bride_parent: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Foto Profil Mempelai Wanita</label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border border-gray-300 bg-white overflow-hidden flex items-center justify-center text-xs text-gray-400 font-bold flex-shrink-0 shadow-inner">
                {bridePhotoPreview ? <img src={bridePhotoPreview} className="w-full h-full object-cover" /> : 'Tanpa Foto'}
              </div>
              <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition select-none">
                Pilih Foto Wanita
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, 'bride')} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Agama / Tradisi Undangan</label>
          <select
            value={selectedReligion}
            onChange={(e) => {
              const religion = e.target.value;
              setSelectedReligion(religion);
              const preset = (RELIGION_PRESETS as any)[religion];
              if (preset) {
                setMempelai((prev: any) => ({ ...prev, greeting: preset.greeting, quote: preset.quote }));
              }
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white font-semibold text-gray-700"
          >
            <option value="Islam">Islam (Default)</option>
            <option value="Kristen">Kristen / Protestan</option>
            <option value="Katolik">Katolik</option>
            <option value="Hindu">Hindu</option>
            <option value="Buddha">Buddha</option>
            <option value="Nasional">Nasional / Universal</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Salam Pembuka Undangan</label>
          <input
            type="text" required value={mempelai.greeting}
            onChange={(e) => setMempelai((prev: any) => ({ ...prev, greeting: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white font-medium text-gray-800"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150">
        <label className="block text-xs font-bold text-gray-700 mb-1.5">Kutipan / Ayat Suci Pembuka</label>
        <textarea 
          rows={3} required value={mempelai.quote}
          onChange={(e) => setMempelai((prev: any) => ({ ...prev, quote: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-gray-800"
        />
      </div>

      <div className="bg-gradient-to-br from-rose-50/40 to-pink-50/30 p-6 rounded-2xl border border-rose-100">
        <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> Kisah Cinta Kami <span className="text-[10px] text-gray-400 font-normal">(opsional)</span>
        </label>
        <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">Ceritakan perjalanan cinta kalian berdua. Kolom ini opsional.</p>
        <textarea 
          rows={4} value={mempelai.love_story}
          onChange={(e) => setMempelai((prev: any) => ({ ...prev, love_story: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white/80 text-gray-800"
        />
      </div>
    </div>
  );
};
