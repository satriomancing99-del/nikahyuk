import React from 'react';
import { Palette, Eye, Edit3, Trash2 } from 'lucide-react';
import { Template } from '../../../../types/database.types';
import { getTemplateThumbnail } from '../../../../utils/templateThumbnails';

interface TemplatesGridProps {
  filteredTemplates: Template[];
  handleToggleStatus: (tpl: Template) => void;
  openEditModal: (tpl: Template) => void;
  handleDeleteTemplate: (id: string, name: string) => void;
  setPreviewTemplate: (tpl: Template | Partial<Template> | null) => void;
}

export const TemplatesGrid: React.FC<TemplatesGridProps> = ({
  filteredTemplates,
  handleToggleStatus,
  openEditModal,
  handleDeleteTemplate,
  setPreviewTemplate,
}) => {
  if (filteredTemplates.length === 0) {
    return (
      <div className="p-16 text-center border-2 border-dashed border-gray-150 rounded-2xl">
        <Palette className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-700">Tidak ada template ditemukan</p>
        <p className="text-xs text-gray-400 mt-0.5">Gunakan panel kiri untuk mengunggah template pertama Anda!</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTemplates.map((tpl) => (
        <div
          key={tpl.id}
          className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition duration-250 flex flex-col justify-between relative"
        >
          <div
            onClick={() => setPreviewTemplate(tpl)}
            className="relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer group/img block"
            title="Klik untuk Pratinjau (Preview)"
          >
            <img
              src={tpl.thumbnail_url || getTemplateThumbnail(tpl.slug, tpl.category, tpl.price, tpl.name) || getTemplateThumbnail('classic-silver')}
              alt={tpl.name}
              className="w-full h-full object-cover group-hover/img:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition duration-200 flex items-center justify-center">
              <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md">
                <Eye className="w-3.5 h-3.5" /> Preview
              </span>
            </div>
          </div>

          <div className="absolute top-3 left-3 flex gap-1 items-center z-10">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 backdrop-blur-sm shadow-sm text-gray-850">
              {tpl.category}
            </span>
            <button
              onClick={() => handleToggleStatus(tpl)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                tpl.status === 'active'
                  ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                  : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
              }`}
            >
              {tpl.status === 'active' ? 'Aktif' : 'Draf'}
            </button>
          </div>

          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition duration-200 flex gap-1 z-10">
            <button
              onClick={() => openEditModal(tpl)}
              className="p-1.5 bg-white/95 hover:bg-white text-blue-600 rounded-lg hover:text-blue-700 shadow transition"
              title="Ubah Metadata"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
              className="p-1.5 bg-white/95 hover:bg-white text-rose-600 rounded-lg hover:text-rose-700 shadow transition"
              title="Hapus Dari Sistem"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{tpl.name}</h4>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">slug: {tpl.slug}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-primary-600">
                Rp {tpl.price?.toLocaleString('id-ID')}
              </span>

              <button
                onClick={() => setPreviewTemplate(tpl)}
                className="text-xs font-bold bg-gray-55 hover:bg-primary-50 text-gray-750 hover:text-primary-600 transition px-3 py-1.5 rounded-lg border border-gray-150 hover:border-primary-100 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
