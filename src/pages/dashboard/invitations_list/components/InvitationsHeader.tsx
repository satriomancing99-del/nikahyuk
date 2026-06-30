import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface InvitationsHeaderProps {
  handleCreateNewClick: (e: React.MouseEvent) => void;
}

export function InvitationsHeader({ handleCreateNewClick }: InvitationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Undangan Saya</h1>
        <p className="text-gray-500 text-sm mt-0.5">Kelola, sunting, dan bagikan semua undangan pernikahan digital terbitan Anda.</p>
      </div>
      <Link 
        to="/dashboard/invitations/create"
        onClick={handleCreateNewClick}
        className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-md w-max"
      >
        <Plus className="w-5 h-5" /> Buat Undangan Baru
      </Link>
    </div>
  );
}
