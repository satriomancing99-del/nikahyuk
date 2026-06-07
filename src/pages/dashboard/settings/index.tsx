import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import { SettingsSidebar } from './components/SettingsSidebar';
import { ProfileTab } from './components/ProfileTab';
import { SecurityTab } from './components/SecurityTab';
import { AboutTab } from './components/AboutTab';

export default function Settings() {
  const {
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
  } = useSettings();

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
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Box */}
        <div className="md:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
          {activeTab === 'profile' && profile && (
            <ProfileTab
              profile={profile}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              actionLoading={actionLoading}
              handleUpdateProfile={handleUpdateProfile}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              passwordSuccess={passwordSuccess}
              actionLoading={actionLoading}
              handleChangePassword={handleChangePassword}
            />
          )}

          {activeTab === 'about' && <AboutTab />}
        </div>
      </div>
    </div>
  );
}
