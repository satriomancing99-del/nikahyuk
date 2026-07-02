import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Template } from '../../../../../types/database.types';
import { getTemplateThumbnail } from '../../../../../utils/templateThumbnails';

interface ThemeSelectorStepProps {
  templates: Template[];
  fetchingTemplates: boolean;
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  activePackage: 'silver' | 'gold' | 'platinum';
  role: 'super_admin' | 'customer' | undefined;
}

export const ThemeSelectorStep: React.FC<ThemeSelectorStepProps> = ({
  templates,
  fetchingTemplates,
  selectedTemplate,
  setSelectedTemplate,
  selectedCategory,
  setSelectedCategory,
  activePackage,
  role,
}) => {
  const categories = [
    { key: 'All', label: 'Semua Tema' },
    { key: 'Typography', label: '📖 Tanpa Foto (Tipografi)' },
    { key: 'Classic', label: '👑 Classic' },
    { key: 'Rustic', label: '🌿 Rustic' },
    { key: 'Minimalist', label: '📐 Minimalist' },
    { key: 'Islamic', label: '🕌 Islamic' },
    { key: 'Floral', label: '💐 Floral' },
  ];

  const filteredTemplates = templates.filter(t => {
    const isTypography = t.category?.toLowerCase() === 'typography' || t.slug?.includes('typique');
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Typography') {
        if (!isTypography) return false;
      } else {
        if (t.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }
    }
    if (isTypography) return true;
    if (role === 'super_admin') return true;
    const price = Number(t.price);
    if (activePackage === 'silver') return price === 0 || price === 49000;
    if (activePackage === 'gold') return price <= 99000;
    return true;
  });

  if (fetchingTemplates) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-2" />
        <p className="text-sm text-gray-500">Mengambil daftar template eksklusif...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pilih Desain Template</h2>
        <p className="text-sm text-gray-500 mt-1">Sesuaikan tema undangan berdasarkan karakteristik sakral pernikahan Anda.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat.key
                ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-200'
                : 'bg-gray-100 text-gray-655 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => {
          const isSelected = selectedTemplate?.id === tpl.id;
          return (
            <div 
              key={tpl.id || tpl.slug}
              onClick={() => setSelectedTemplate(tpl)}
              className={`group cursor-pointer rounded-2xl border overflow-hidden bg-white transition relative ${
                isSelected 
                  ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                <img 
                  src={tpl.thumbnail_url || getTemplateThumbnail(tpl.slug, tpl.category, tpl.price) || getTemplateThumbnail('classic-silver')} 
                  alt={tpl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] px-2 py-0.5 rounded-full font-bold text-gray-700 tracking-wider uppercase">
                  {tpl.category}
                </span>
                
                <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1 select-none text-gray-750">
                  {Number(tpl.price) === 99000 ? '👑 Gold' : Number(tpl.price) === 149000 ? '✨ Platinum' : '🤍 Silver'}
                </span>

                {isSelected && (
                  <div className="absolute inset-0 bg-primary-500/10 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-primary-500 text-white rounded-full p-2 shadow-lg">
                      <Check className="w-5 h-5 font-bold" />
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition truncate">{tpl.name}</h4>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-gray-500">Premium</span>
                  <span className="font-bold text-gray-900">
                    {Number(tpl.price) === 0 || Number(tpl.price) === 49000 ? '🤍 Silver (Bawaan)' : `Rp ${Number(tpl.price).toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
