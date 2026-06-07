import React from 'react';
import { Lock, CheckCircle2, Loader2, Check } from 'lucide-react';

interface SecurityTabProps {
  passwordForm: {
    newPassword: string;
    confirmPassword: string;
  };
  setPasswordForm: React.Dispatch<React.SetStateAction<{ newPassword: string; confirmPassword: string }>>;
  passwordSuccess: boolean;
  actionLoading: boolean;
  handleChangePassword: (e: React.FormEvent) => Promise<void>;
}

export function SecurityTab({
  passwordForm,
  setPasswordForm,
  passwordSuccess,
  actionLoading,
  handleChangePassword
}: SecurityTabProps) {
  return (
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
  );
}
