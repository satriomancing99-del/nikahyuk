import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, User, Lock, Info, Check, 
  Loader2, Smartphone, Mail, ShieldAlert, CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { normalizeWhatsApp } from './Guests';

export default function Settings() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'about'>('profile');
  const [actionLoading, setActionLoading] = useState(false);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
  });

  // Password Change States
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Save profile updates
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!profileForm.name.trim()) {
      alert('Nama lengkap tidak boleh kosong.');
      return;
    }

    try {
      setActionLoading(true);
      const normalizedPhone = profileForm.phone ? normalizeWhatsApp(profileForm.phone) : null;

      // Update profiles table in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileForm.name.trim(),
          phone: normalizedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Sync the local Zustand store state dynamically to update topbar instantly!
      useAuthStore.setState({
        profile: {
          ...profile,
          name: profileForm.name.trim(),
          phone: normalizedPhone,
        }
      });

      alert('Profil Anda berhasil diperbarui!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert(`Gagal memperbarui profil: ${err.message || 'Database error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);

    if (passwordForm.newPassword.length < 6) {
      alert('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    try {
      setActionLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      setPasswordSuccess(true);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      alert('Kata sandi Anda berhasil diperbarui!');
    } catch (err: any) {
      console.error('Password update error:', err);
      alert(`Gagal memperbarui kata sandi: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Panel */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-primary-500" />
          Pengaturan Akun & Profil
        </h1>
        <p className="text-gray-500 text-sm">Kelola informasi pribadi Anda, sesuaikan keamanan akun, dan lihat detail langganan platform digital Anda.</p>
      </div>

      {/* Tabs navigation & content layout */}
      <div className="grid md:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="bg-white rounded-2xl border border-gray-250 p-3 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'profile'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" /> Edit Profil
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'security'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4" /> Keamanan & Sandi
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'about'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Info className="w-4 h-4" /> Informasi Aplikasi
          </button>
        </div>

        {/* Content Box */}
        <div className="md:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
          
          {/* TAB 1: PROFILE FORM */}
          {activeTab === 'profile' && profile && (
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
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-5">
              <h3 className="text-base font-extrabold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-500" /> Perbarui Kata Sandi
              </h3>

              {passwordSuccess && (
                <div className="bg-green-50 border border-green-150 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-green-800">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Berhasil!</span>
                    <p className="text-[11px] leading-normal font-medium mt-0.5">Kata sandi akun Anda telah diperbarui. Silakan gunakan sandi baru untuk login berikutnya.</p>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Kata Sandi Baru</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none transition font-semibold"
                  placeholder="Min. 6 karakter"
                  required
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none transition font-semibold"
                  placeholder="Ketik ulang kata sandi baru"
                  required
                />
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Ubah Kata Sandi
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ABOUT INFORMATION */}
          {activeTab === 'about' && (
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
                  NikahYuk! adalah platform pembuatan undangan digital berbasis AI tercanggih di Indonesia. Dilengkapi generator desain dinamis, compiler sandbox modular, pengelolaan tamu berbasis CSV/VCF, RSVP terotomatisasi, serta manajemen kado e-gifts terintegrasi.
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
          )}

        </div>
      </div>
    </div>
  );
}
