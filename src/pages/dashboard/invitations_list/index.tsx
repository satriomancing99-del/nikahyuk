import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { useInvitationsList } from './hooks/useInvitationsList';
import { InvitationsHeader } from './components/InvitationsHeader';
import { InvitationCard } from './components/InvitationCard';

export default function Invitations() {
  const {
    invitations,
    loading,
    copiedSlug,
    handleCopyLink,
    handleCreateNewClick,
    handleDelete
  } = useInvitationsList();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <InvitationsHeader handleCreateNewClick={handleCreateNewClick} />

      {loading ? (
        <div className="bg-white border rounded-3xl p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-2" />
          <p className="text-sm text-gray-400 font-medium">Memuat data undangan sakral Anda...</p>
        </div>
      ) : invitations.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Undangan</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Anda belum pernah merilis undangan digital apa pun saat ini. Klik tombol di bawah untuk membuat undangan impian pertamamu sekarang!
          </p>
          <Link 
            to="/dashboard/invitations/create"
            onClick={handleCreateNewClick}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition shadow-sm"
          >
            Mulai Buat Undangan
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((inv) => (
            <InvitationCard
              key={inv.id}
              inv={inv}
              isCopied={copiedSlug === inv.slug}
              handleCopyLink={handleCopyLink}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
