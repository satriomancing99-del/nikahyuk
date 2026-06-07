import React from 'react';
import { User, Mail, Smartphone, ShieldAlert, Loader2, Check } from 'lucide-react';
import { Profile } from '../../../../types/database.types';

interface ProfileTabProps {
  profile: Profile;
  profileForm: {
    name: string;
    phone: string;
  };
  setProfileForm: React.Dispatch<React.SetStateAction<{ name: string; phone: string }>>;
  actionLoading: boolean;
  handleUpdateProfile: (e: React.FormEvent) => Promise<void>;
}

export function ProfileTab({
  profile,
  profileForm,
  setProfileForm,
  actionLoading,
  handleUpdateProfile
}: ProfileTabProps) {
  return (
    <form onSubmit={handleUpdateProfile} className="space-y-5">
      <h3 className="text-base font-extrabold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-primary-500" /> Informasi Profil Anda
      </h3>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
        <div className="relative">
          <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={profileForm.name}
            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:border-primary-500 focus:outline-none transition font-semibold"
            placeholder="Masukkan nama lengkap Anda"
          />
        </div>
      </div>

      {/* Email (Readonly) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Alamat Email (Akun)</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full text-sm border border-gray-200 bg-gray-50/50 text-gray-500 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none transition font-medium cursor-not-allowed"
            title="Alamat email akun tidak dapat dirubah"
          />
        </div>
      </div>

      {/* Phone / WhatsApp */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Nomor WhatsApp / HP</label>
        <div className="relative">
          <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="tel"
            value={profileForm.phone}
            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:border-primary-500 focus:outline-none transition font-semibold"
            placeholder="e.g., 08123456789"
          />
        </div>
        <span className="text-[10px] text-gray-400 mt-1 block">Nomor handphone Anda akan dinormalisasi ke format internasional (`+62...`) secara otomatis.</span>
      </div>

      {/* Role badge */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Hak Akses Sistem</label>
        <div className="flex">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold capitalize border ${
            profile.role === 'super_admin'
              ? 'bg-rose-50 text-rose-700 border-rose-150'
              : 'bg-primary-50 text-primary-750 border-primary-150'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            {profile.role.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end">
        <button
          type="submit"
          disabled={actionLoading}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
        >
          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Simpan Perubahan Profil
        </button>
      </div>
    </form>
  );
}
