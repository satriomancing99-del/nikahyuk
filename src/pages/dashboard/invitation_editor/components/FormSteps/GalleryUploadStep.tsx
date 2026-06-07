import React from 'react';
import { Upload, Play, Pause, Trash2, Plus, Lock, Sparkles, Loader2 } from 'lucide-react';
import { useMusicSelector } from '../../hooks/useMusicSelector';
import { fileToOptimizedBase64 } from '../../utils/editorHelpers';

interface GalleryUploadStepProps {
  user: any;
  profile: any;
  activePackage: 'silver' | 'gold' | 'platinum';
  mempelai: any;
  setMempelai: React.Dispatch<React.SetStateAction<any>>;
  waThumbnailUrl: string;
  triggerCropper: (file: File, type: 'cover') => void;
  galleryItems: Array<{ file: File; preview: string; caption: string }>;
  setGalleryItems: React.Dispatch<React.SetStateAction<any[]>>;
  setLoading: (loading: boolean) => void;
}

export const GalleryUploadStep: React.FC<GalleryUploadStepProps> = ({
  user,
  profile,
  activePackage,
  mempelai,
  setMempelai,
  waThumbnailUrl,
  triggerCropper,
  galleryItems,
  setGalleryItems,
  setLoading,
}) => {
  const {
    libraryBgms, bgmsLoading, playingTrackId, isUploadingPrivateBgm,
    togglePlayTrack, handleUploadPrivateBgm
  } = useMusicSelector(
    user?.id, profile?.name, profile?.role, activePackage, mempelai.music_url,
    (url, title) => {
      setMempelai((prev: any) => ({ ...prev, music_url: url }));
    }
  );

  const handleWaThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) triggerCropper(file, 'cover');
  };

  const handleAddGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const validFiles: File[] = [];
    const maxPhotos = (activePackage === 'platinum' || profile?.role === 'super_admin') ? 12 : activePackage === 'gold' ? 8 : 3;
    
    for (const file of Array.from(files) as File[]) {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        validFiles.push(file);
      }
    }
    if (galleryItems.length + validFiles.length > maxPhotos) {
      alert(`Batas maksimal foto untuk Paket ${activePackage.toUpperCase()} adalah ${maxPhotos} foto.`);
      return;
    }
    try {
      setLoading(true);
      const items = [];
      for (const file of validFiles) {
        const optimizedBase64 = await fileToOptimizedBase64(file);
        items.push({ file, preview: optimizedBase64 || URL.createObjectURL(file), caption: '' });
      }
      setGalleryItems(prev => [...prev, ...items]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Media Galeri & Musik</h2>
        <p className="text-sm text-gray-500 mt-1">Unggah foto sampul utama/preview WhatsApp, galeri dokumentasi prewedding, dan musik latar romantis Anda.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-55 p-6 rounded-2xl border border-primary-100 ring-2 ring-primary-500/5">
            <label className="block text-sm font-extrabold text-gray-900 mb-1">✨ Foto Sampul Utama & WhatsApp Preview</label>
            <p className="text-[11px] text-gray-500 mb-4 leading-normal">Gambar ini akan dipasang megah sebagai cover hero undangan digital Anda.</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {waThumbnailUrl ? <img src={waThumbnailUrl} alt="WA Preview" className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-gray-405" />}
              </div>
              <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                <Upload className="w-3.5 h-3.5" /> Pilih Gambar
                <input type="file" accept="image/*" className="hidden" onChange={handleWaThumbnailChange} />
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-6">
            <label className="block text-sm font-extrabold text-gray-900">🎵 Musik Latar Undangan (BGM)</label>
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {bgmsLoading ? (
                <div className="py-6 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
                  <p className="text-[10px] text-gray-450">Memuat koleksi lagu...</p>
                </div>
              ) : libraryBgms.map((track) => {
                const isSelected = mempelai.music_url === track.url;
                const isPlaying = playingTrackId === track.id;
                return (
                  <div key={track.id} className={`flex items-center justify-between p-2.5 rounded-xl border transition ${isSelected ? 'bg-primary-50/50 border-primary-300' : 'bg-white border-gray-150'}`}>
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button type="button" onClick={() => togglePlayTrack(track.id, track.url)} className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition ${isPlaying ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white text-gray-600 border'}`}>
                        {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate flex items-center gap-1">{track.title} {track.is_private && <span className="text-[8px] bg-amber-100 text-amber-800 px-1 rounded">Privat</span>}</p>
                        <p className="text-[10px] text-gray-500 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setMempelai((prev: any) => ({ ...prev, music_url: track.url }))} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${isSelected ? 'bg-primary-600 text-white' : 'bg-white border text-gray-700'}`}>{isSelected ? 'Terpilih' : 'Pilih'}</button>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100">
              {(activePackage === 'platinum' || profile?.role === 'super_admin') ? (
                <div className="bg-gradient-to-br from-primary-50 to-indigo-55 border border-primary-100 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-primary-900 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-primary-500" /> Platinum: Unggah MP3 Kustom</h4>
                  <label className="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 select-none">
                    {isUploadingPrivateBgm ? 'Mengunggah...' : 'Unggah Lagu MP3'}
                    <input type="file" accept="audio/mp3, audio/mpeg" className="hidden" disabled={isUploadingPrivateBgm} onChange={(e) => e.target.files?.[0] && handleUploadPrivateBgm(e.target.files[0])} />
                  </label>
                </div>
              ) : (
                <div onClick={() => alert('Eksklusif Platinum')} className="bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-250 p-4 rounded-2xl cursor-pointer flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-800">Unggah Lagu MP3 Kustom (Platinum Only)</p>
                  <span className="text-xs text-primary-600 font-bold">Upgrade</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-900">Galeri Foto Pernikahan</label>
              <span className="text-[10px] text-gray-500 font-bold bg-white border px-2 py-0.5 rounded-full">
                {galleryItems.length} / {(activePackage === 'platinum' || profile?.role === 'super_admin') ? '12' : activePackage === 'gold' ? '8' : '3'} Foto
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[220px] overflow-y-auto mb-4 pr-1">
              {galleryItems.map((item, index) => (
                <div key={index} className="aspect-square rounded-xl border bg-white relative group overflow-hidden shadow-sm">
                  <img src={item.preview} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-2 text-[10px]">
                    <input type="text" placeholder="Caption..." value={item.caption} onChange={(e) => setGalleryItems(prev => prev.map((g, i) => i === index ? { ...g, caption: e.target.value } : g))} className="bg-transparent border-b border-white text-white text-center w-full focus:outline-none mb-2 placeholder-gray-300" />
                    <button type="button" onClick={() => setGalleryItems(prev => prev.filter((_, i) => i !== index))} className="text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 transition cursor-pointer flex flex-col items-center justify-center bg-white">
                <Plus className="w-6 h-6 text-gray-400" />
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddGalleryImage} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
