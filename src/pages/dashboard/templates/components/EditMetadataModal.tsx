import React from 'react';
import { Edit3, X, Loader2 } from 'lucide-react';
import { Template } from '../../../../types/database.types';

interface EditMetadataModalProps {
  editingTemplate: Template | null;
  editingName: string;
  setEditingName: (val: string) => void;
  editingPrice: number;
  setEditingPrice: (val: number) => void;
  editingCategory: string;
  setEditingCategory: (val: string) => void;
  editingStatus: string;
  setEditingStatus: (val: string) => void;
  saving: boolean;
  categories: string[];
  closeEditModal: () => void;
  handleUpdateTemplate: () => void;
}

export const EditMetadataModal: React.FC<EditMetadataModalProps> = ({
  editingTemplate,
  editingName,
  setEditingName,
  editingPrice,
  setEditingPrice,
  editingCategory,
  setEditingCategory,
  editingStatus,
  setEditingStatus,
  saving,
  categories,
  closeEditModal,
  handleUpdateTemplate,
}) => {
  if (!editingTemplate) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary-500" />
            Ubah Metadata Template
          </h3>
          <button
            onClick={closeEditModal}
            className="p-1 rounded-full hover:bg-gray-150 text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Template</label>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none bg-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Kategori</label>
            <select
              value={editingCategory}
              onChange={(e) => setEditingCategory(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:border-primary-500 focus:outline-none bg-white font-semibold"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Harga (IDR)</label>
            <input
              type="number"
              value={editingPrice}
              onChange={(e) => setEditingPrice(Number(e.target.value))}
              className="w-full text-xs border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none bg-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status Keaktifan</label>
            <select
              value={editingStatus}
              onChange={(e) => setEditingStatus(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:border-primary-500 focus:outline-none bg-white font-semibold"
            >
              <option value="active">Aktif (Dapat dipilih customer)</option>
              <option value="draft">Draf (Hanya Admin)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={closeEditModal}
            className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2.5 px-4 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleUpdateTemplate}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-350 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
