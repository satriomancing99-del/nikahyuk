import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Mail, Calendar, Users, Settings, ArrowUpRight, Copy, Check, ExternalLink, Trash2, Loader2
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { invitationService } from '../../services';
import { Invitation } from '../../types/database.types';

export default function Invitations() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvitations() {
      if (!user) return;
      try {
        setLoading(true);
        // If super_admin, fetch all records, otherwise fetch only user specific ones
        const list = profile?.role === 'super_admin' 
          ? await invitationService.getAll() 
          : await invitationService.getByUserId(user.id);
        setInvitations(list);
      } catch (err) {
        console.error('Error fetching invitations list:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvitations();
  }, [user]);

  const handleCopyLink = (slug: string) => {
    const url = `https://nikahyuk.id/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleCreateNewClick = (e: React.MouseEvent) => {
    if (profile?.role === 'customer') {
      const activeCount = invitations.filter(inv => inv.status === 'published').length;
      if (activeCount >= 2) {
        e.preventDefault();
        alert('Batas Undangan Aktif Terlampaui!\n\nSebagai customer, Anda telah mencapai batas maksimal 2 undangan aktif/diterbitkan secara bersamaan.\n\nSilakan hapus atau ubah status undangan aktif Anda yang lain terlebih dahulu sebelum membuat undangan baru.');
        return;
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus undangan ini secara permanen? Semua data tamu, RSVP, & galeri terkait akan ikut terhapus.')) {
      return;
    }
    try {
      await invitationService.delete(id);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      alert('Undangan berhasil dihapus.');
    } catch (err: any) {
      console.error('Error deleting invitation:', err);
      alert(`Gagal menghapus undangan: ${err.message || 'Kesalahan sistem'}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header and Call to Actions */}
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

      {/* Grid List */}
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
          {invitations.map((inv) => {
            const isCopied = copiedSlug === inv.slug;
            return (
              <div key={inv.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden group flex flex-col justify-between">
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
                        <h3 className="font-bold text-white text-base truncate leading-tight mt-1">{inv.groom_name} & {inv.bride_name}</h3>
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
          })}
        </div>
      )}

    </div>
  );
}
