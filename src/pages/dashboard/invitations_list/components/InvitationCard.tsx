import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, ExternalLink, Users, Calendar, Trash2 } from 'lucide-react';
import { Invitation } from '../../../../types/database.types';

interface InvitationCardProps {
  inv: Invitation;
  isCopied: boolean;
  handleCopyLink: (slug: string) => void;
  handleDelete: (id: string) => Promise<void> | void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({ inv, isCopied, handleCopyLink, handleDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden group flex flex-col justify-between">
      <div>
        {/* Photo Thumbnail card */}
        <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
          <img 
            src={inv.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400'} 
            alt="Thumbnail Undangan" 
            className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-4">
            <div>
              <span className="bg-primary-500 text-white text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full mb-1 inline-block">
                {inv.status || 'Draft'}
              </span>
              <h3 className="font-bold text-white text-base truncate leading-tight mt-1">
                {inv.groom_name} & {inv.bride_name}
              </h3>
            </div>
          </div>
        </div>

        {/* Body Info */}
        <div className="p-6 space-y-4">
          {/* Shareable Link row */}
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50 px-3 py-2 rounded-xl border border-gray-150">
            <span className="truncate pr-2">nikahyuk.id/{inv.slug}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button 
                type="button"
                onClick={() => handleCopyLink(inv.slug)}
                className="hover:text-primary-600 transition p-1"
                title="Salin Link"
              >
                {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <a 
                href={`/${inv.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-primary-600 transition p-1"
                title="Buka Undangan"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Stats mini badges */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tamu</p>
                <p className="text-xs font-bold text-gray-800">Undang</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Acara</p>
                <p className="text-xs font-bold text-gray-800">Terjadwal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button 
            type="button" 
            onClick={() => navigate(`/dashboard/guests?invitation=${inv.id}`)}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-2 rounded-lg transition"
          >
            Kelola Tamu
          </button>
          <button 
            type="button" 
            onClick={() => navigate(`/dashboard/rsvp?invitation=${inv.id}`)}
            className="text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
          >
            Lihat RSVP
          </button>
          <button 
            type="button" 
            onClick={() => {
              const price = (inv as any).templates?.price || 0;
              const tier = price === 149000 ? 'platinum' : price === 99000 ? 'gold' : 'silver';
              navigate(`/dashboard/invitations/create?id=${inv.id}&package=${tier}`);
            }}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-3 py-2 rounded-lg transition"
          >
            Sunting
          </button>
        </div>

        <button 
          type="button" 
          onClick={() => handleDelete(inv.id)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
          title="Hapus Undangan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
