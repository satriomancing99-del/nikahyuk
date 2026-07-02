import React from 'react';
import { Music, Upload, Loader2, Plus, RefreshCw, Play, Pause, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { MusicLibrary } from '../../../../types/database.types';
import { StagedBgm } from '../hooks/useBgmManager';

interface BgmManagerCardProps {
  bgmList: MusicLibrary[];
  bgmLoading: boolean;
  stagedBgms: StagedBgm[];
  isBgmUploading: boolean;
  playingBgmId: string | null;
  addStagedBgms: (files: FileList | File[]) => Promise<void>;
  updateStagedBgm: (id: string, updates: Partial<Pick<StagedBgm, 'title' | 'artist'>>) => void;
  removeStagedBgm: (id: string) => void;
  clearStagedBgms: () => void;
  loadBgmList: () => void;
  handleUploadBgm: (e: React.FormEvent) => void;
  handleDeleteBgm: (id: string, fileUrl: string) => void;
  togglePlayBgm: (id: string, url: string) => void;
}

export const BgmManagerCard: React.FC<BgmManagerCardProps> = ({
  bgmList,
  bgmLoading,
  stagedBgms,
  isBgmUploading,
  playingBgmId,
  addStagedBgms,
  updateStagedBgm,
  removeStagedBgm,
  clearStagedBgms,
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

      <form onSubmit={handleUploadBgm} className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-250">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Unggah BGM</h3>

        {stagedBgms.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-primary-500 hover:bg-primary-50/10 transition cursor-pointer select-none relative group bg-white">
            <input
              type="file"
              multiple
              accept="audio/mp3, audio/mpeg"
              onChange={async (e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  await addStagedBgms(files);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-700">Pilih Berkas MP3</p>
                <p className="text-[10px] text-gray-400">Seret & lepas atau klik untuk memilih satu atau beberapa MP3 (Maks 10MB per file)</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {stagedBgms.map((item) => (
                <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2 relative group transition hover:border-gray-300">
                  {/* Top row with filename and remove button */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-semibold text-gray-400 truncate max-w-[80%] flex items-center gap-1" title={item.file.name}>
                      <Music className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      {item.file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStagedBgm(item.id)}
                      disabled={isBgmUploading}
                      className="text-gray-400 hover:text-red-500 p-0.5 rounded-md hover:bg-gray-50 transition"
                      title="Hapus dari antrean"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Inputs for Title and Artist */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">Judul Lagu *</label>
                      <input
                        type="text"
                        required
                        disabled={isBgmUploading}
                        value={item.title}
                        onChange={(e) => updateStagedBgm(item.id, { title: e.target.value })}
                        placeholder="Judul"
                        className="w-full px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-gray-400 uppercase mb-0.5">Artis / Penyanyi</label>
                      <input
                        type="text"
                        disabled={isBgmUploading}
                        value={item.artist}
                        onChange={(e) => updateStagedBgm(item.id, { artist: e.target.value })}
                        placeholder="Penyanyi (opsional)"
                        className="w-full px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {item.status !== 'idle' && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 text-[9px] font-medium">
                      {item.status === 'uploading' && (
                        <span className="text-primary-600 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Sedang mengunggah...
                        </span>
                      )}
                      {item.status === 'success' && (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Berhasil diunggah!
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-red-600 flex items-center gap-1" title={item.errorMessage}>
                          <AlertCircle className="w-3 h-3" /> {item.errorMessage || 'Gagal'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearStagedBgms}
                disabled={isBgmUploading}
                className="flex-1 border border-gray-200 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 text-gray-700 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer select-none"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isBgmUploading}
                className="flex-[2] bg-primary-600 hover:bg-primary-700 disabled:bg-primary-350 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer select-none"
              >
                {isBgmUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Unggah {stagedBgms.length} Lagu
                  </>
                )}
              </button>
            </div>
          </div>
        )}
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
