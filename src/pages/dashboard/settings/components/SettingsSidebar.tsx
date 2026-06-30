import React from 'react';
import { User, Lock, Info } from 'lucide-react';

interface SettingsSidebarProps {
  activeTab: 'profile' | 'security' | 'about';
  setActiveTab: (tab: 'profile' | 'security' | 'about') => void;
}

export function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-250 p-3 shadow-sm space-y-1">
      <button
        onClick={() => setActiveTab('profile')}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
          activeTab === 'profile'
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-905'
        }`}
      >
        <User className="w-4 h-4" /> Edit Profil
      </button>
      <button
        onClick={() => setActiveTab('security')}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
          activeTab === 'security'
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-905'
        }`}
      >
        <Lock className="w-4 h-4" /> Keamanan & Sandi
      </button>
      <button
        onClick={() => setActiveTab('about')}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
          activeTab === 'about'
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-905'
        }`}
      >
        <Info className="w-4 h-4" /> Informasi Aplikasi
      </button>
    </div>
  );
}
