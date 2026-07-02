import React from 'react';
import { FileArchive, Palette, FileJson, X, Eye, Check, Loader2 } from 'lucide-react';
import { Template } from '../../../../types/database.types';
import { getTemplateThumbnail } from '../../../../utils/templateThumbnails';

interface SandboxDraftCardProps {
  draftTemplate: Partial<Template> | null;
  draftFiles: Array<{ name: string; size: number; isFolder: boolean }>;
  importType: 'zip' | 'json' | 'jsx' | null;
  saving: boolean;
  categories: string[];
  clearDraft: () => void;
  handleDraftFieldChange: (field: keyof Template, value: any) => void;
  handleCustomThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPreviewTemplate: (tpl: Template | Partial<Template> | null) => void;
  handleSaveDraftToDatabase: () => void;
}

export const SandboxDraftCard: React.FC<SandboxDraftCardProps> = ({
  draftTemplate,
  draftFiles,
  importType,
  saving,
  categories,
  clearDraft,
  handleDraftFieldChange,
  handleCustomThumbnailChange,
  setPreviewTemplate,
  handleSaveDraftToDatabase,
}) => {
  if (!draftTemplate) return null;

  return (
    <div className="bg-white rounded-3xl border border-primary-100 shadow-md p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-450 via-primary-550 to-pink-500" />

      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg uppercase tracking-wider">
            Draf Sandbox (Staging)
          </span>
          <h3 className="text-xl font-bold text-gray-900 mt-1.5 flex items-center gap-2 font-sans tracking-tight">
            {importType === 'zip' ? (
              <FileArchive className="w-5 h-5 text-pink-500" />
            ) : importType === 'jsx' ? (
              <Palette className="w-5 h-5 text-primary-500" />
            ) : (
              <FileJson className="w-5 h-5 text-amber-500" />
            )}
            Pratinjau Impor ({importType?.toUpperCase()}): {draftTemplate.name}
          </h3>
        </div>
        <button
          onClick={clearDraft}
          className="p-1 rounded-full hover:bg-gray-150 text-gray-400 hover:text-gray-600 transition"
          title="Batalkan Impor"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Nama Template</label>
            <input
              type="text"
              value={draftTemplate.name || ''}
              onChange={(e) => handleDraftFieldChange('name', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none transition font-medium bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Kategori</label>
              <select
                value={draftTemplate.category || 'Classic'}
                onChange={(e) => handleDraftFieldChange('category', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:border-primary-500 focus:outline-none bg-white font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Harga (IDR)</label>
              <input
                type="number"
                value={draftTemplate.price || 0}
                onChange={(e) => handleDraftFieldChange('price', Number(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none transition font-semibold bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Custom Slug</label>
              <input
                type="text"
                value={draftTemplate.slug || ''}
                onChange={(e) => handleDraftFieldChange('slug', e.target.value)}
                className="w-full text-xs font-mono border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none transition bg-white"
                placeholder="e.g., modern-indigo"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Status Publikasi</label>
              <select
                value={draftTemplate.status || 'active'}
                onChange={(e) => handleDraftFieldChange('status', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:border-primary-500 focus:outline-none bg-white font-medium"
              >
                <option value="active">Aktif (Langsung Diunggah)</option>
                <option value="draft">Draf (Hanya Admin)</option>
              </select>
            </div>
          </div>

          {(importType === 'json' || importType === 'jsx') && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Lengkapi Gambar Thumbnail</label>
              <p className="text-[11px] text-gray-500 mb-2">Unggah berkas ini tidak memiliki berkas thumbnail bawaan. Silakan pilih gambar pratinjau kustom:</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomThumbnailChange}
                className="text-xs text-gray-500 w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Visual card preview */}
        <div className="bg-gray-55 rounded-2xl p-4 border border-gray-150 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Visual Kartu Pemilihan
            </span>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow transition-shadow group">
              <div
                onClick={() => setPreviewTemplate(draftTemplate)}
                className="relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer group/img block"
                title="Klik untuk Pratinjau (Preview)"
              >
                <img
                  src={draftTemplate.thumbnail_url || getTemplateThumbnail(draftTemplate.slug || '', draftTemplate.category, draftTemplate.price, draftTemplate.name) || getTemplateThumbnail('classic-silver')}
                  alt="Template Preview Sketch"
                  className="w-full h-full object-cover group-hover/img:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition duration-200 flex items-center justify-center">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md">
                    <Eye className="w-3 h-3" /> Preview
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm shadow-sm font-semibold rounded-lg text-[10px] text-gray-800">
                    {draftTemplate.category || 'Classic'}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{draftTemplate.name || 'Menunggu input nama...'}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary-600">
                    Rp {draftTemplate.price?.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] font-semibold font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {draftTemplate.slug || 'slug'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => setPreviewTemplate(draftTemplate)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveDraftToDatabase}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Unggah Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
