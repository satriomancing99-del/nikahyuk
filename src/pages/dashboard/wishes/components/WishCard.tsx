import React from 'react';
import { Quote, Check, Copy, Trash2 } from 'lucide-react';
import { Wish } from '../../../../types/database.types';

interface WishCardProps {
  wish: Wish;
  isCopied: boolean;
  actionLoading: boolean;
  handleCopyWish: (wish: Wish) => void;
  handleDeleteWish: (id: string, name: string) => Promise<void>;
}

export const WishCard: React.FC<WishCardProps> = ({ wish, isCopied, actionLoading, handleCopyWish, handleDeleteWish }) => {
  const getInitials = (name: string) => {
    return name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';
  };

  const bgColors = [
    'bg-rose-50 text-rose-700 border-rose-150',
    'bg-amber-50 text-amber-700 border-amber-150',
    'bg-teal-50 text-teal-700 border-teal-150',
    'bg-primary-50 text-primary-700 border-primary-150',
    'bg-indigo-50 text-indigo-700 border-indigo-150',
  ];

  const getAvatarColor = (name: string) => {
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return bgColors[sum % bgColors.length];
  };

  const avatarStyle = getAvatarColor(wish.guest_name);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between relative group overflow-hidden">
      {/* Decorative quote icon */}
      <Quote className="w-16 h-16 text-gray-50 absolute right-3 top-3 -z-0 opacity-40 group-hover:scale-105 transition" />

      <div className="space-y-4 z-10">
        {/* Guest info row */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs shadow-sm ${avatarStyle}`}>
            {getInitials(wish.guest_name)}
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-sm leading-snug truncate max-w-[150px]" title={wish.guest_name}>
              {wish.guest_name}
            </h4>
            <span className="text-[10px] text-gray-400 font-medium block">
              {new Date(wish.created_at).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })} WIB
            </span>
          </div>
        </div>

        {/* The wish message body */}
        <p className="text-xs text-gray-600 font-medium leading-relaxed italic border-l-2 border-primary-150 pl-3">
          "{wish.message}"
        </p>
      </div>

      {/* Footer tools row */}
      <div className="border-t border-gray-100 pt-3.5 mt-5 flex items-center justify-between z-10 bg-white/80">
        <button
          onClick={() => handleCopyWish(wish)}
          className="text-[10px] font-bold text-primary-600 hover:text-primary-700 transition flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100"
          title="Salin ucapan untuk dibagikan ke medsos"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              Tersalin!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Salin Ucapan
            </>
          )}
        </button>

        <button
          onClick={() => handleDeleteWish(wish.id, wish.guest_name)}
          disabled={actionLoading}
          className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition disabled:opacity-50"
          title="Hapus / Moderasi pesan ini"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
