import React from 'react';
import { Music, Upload, Loader2, Plus, RefreshCw, Play, Pause, Trash2 } from 'lucide-react';
import { MusicLibrary } from '../../../../types/database.types';

interface BgmManagerCardProps {
  bgmList: MusicLibrary[];
  bgmLoading: boolean;
  newBgmFile: File | null;
  newBgmTitle: string;
  newBgmArtist: string;
  isBgmUploading: boolean;
  playingBgmId: string | null;
  setNewBgmFile: (file: File | null) => void;
  setNewBgmTitle: (title: string) => void;
  setNewBgmArtist: (artist: string) => void;
  loadBgmList: () => void;
  handleUploadBgm: (e: React.FormEvent) => void;
  handleDeleteBgm: (id: string, fileUrl: string) => void;
  togglePlayBgm: (id: string, url: string) => void;
}

export const BgmManagerCard: React.FC<BgmManagerCardProps> = ({
  bgmList,
  bgmLoading,
  newBgmFile,
  newBgmTitle,
  newBgmArtist,
  isBgmUploading,
  playingBgmId,
  setNewBgmFile,
  setNewBgmTitle,
  setNewBgmArtist,
  loadBgmList,
  handleUploadBgm,
  handleDeleteBgm,
  togglePlayBgm,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Music className="w-5 h-5 text-primary-500" />
          Kelola BGM Bersama
        </h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Kelola koleksi lagu latar belakang (BGM) format MP3 yang dapat dipilih langsung oleh semua kustomer.
        </p>
      </div>

      <form onSubmit={handleUploadBgm} className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Unggah BGM Baru</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Judul Lagu *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Janji Suci"
              value={newBgmTitle}
              onChange={(e) => setNewBgmTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Artis / Penyanyi</label>
            <input
              type="text"
              placeholder="Contoh: Yovie & Nuno (opsional)"
              value={newBgmArtist}
              onChange={(e) => setNewBgmArtist(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Berkas Audio (MP3) *</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs select-none">
                <Upload className="w-3.5 h-3.5" />
                {newBgmFile ? 'Ubah File' : 'Pilih MP3'}
                <input
                  type="file"
                  required
                  accept="audio/mp3, audio/mpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
                        alert('File harus berupa MP3!');
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        alert('Maksimal ukuran audio adalah 10MB!');
                        return;
                      }
                      setNewBgmFile(file);
                      if (!newBgmTitle) {
                        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                        setNewBgmTitle(nameWithoutExt);
                      }
                    }
                  }}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-gray-500 truncate max-w-[150px]">
                {newBgmFile ? newBgmFile.name : 'Belum memilih file'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isBgmUploading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-350 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
        >
          {isBgmUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Tambah ke Pustaka
            </>
          )}
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Koleksi BGM ({bgmList.length})</h3>
          <button type="button" onClick={loadBgmList} className="text-gray-400 hover:text-gray-650" title="Segarkan List BGM">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {bgmLoading ? (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
            <p className="text-[10px] text-gray-400">Memuat pustaka musik...</p>
          </div>
        ) : bgmList.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-gray-150 rounded-2xl bg-gray-50/50">
            <Music className="w-6 h-6 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Belum ada lagu BGM</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {bgmList.map((bgm) => (
              <div key={bgm.id} className="flex items-center justify-between p-2.5 bg-white border border-gray-150 rounded-xl hover:shadow-xs transition duration-200">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => togglePlayBgm(bgm.id, bgm.url)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                      playingBgmId === bgm.id ? 'bg-emerald-500 text-white animate-pulse' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                  >
                    {playingBgmId === bgm.id ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate leading-tight flex items-center gap-1.5">
                      {bgm.title}
                      {bgm.is_private && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded-sm font-bold uppercase">Privat</span>}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{bgm.artist}</p>
                  </div>
                </div>
                <button type="button" onClick={() => handleDeleteBgm(bgm.id, bgm.url)} className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-50 flex-shrink-0 transition" title="Hapus Lagu">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
