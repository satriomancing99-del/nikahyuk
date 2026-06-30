import React, { useState } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { supabase } from '../../../../lib/supabase';
import { normalizeWhatsApp } from '../../guests/utils/guestNormalizer';

export function useSettings() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'about'>('profile');
  const [actionLoading, setActionLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileForm.name.trim(),
          phone: normalizedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

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

  return {
    profile,
    activeTab,
    setActiveTab,
    actionLoading,
    profileForm,
    setProfileForm,
    passwordForm,
    setPasswordForm,
    passwordSuccess,
    handleUpdateProfile,
    handleChangePassword
  };
}
