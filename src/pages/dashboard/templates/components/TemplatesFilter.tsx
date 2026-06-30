import React from 'react';
import { Search } from 'lucide-react';

interface TemplatesFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedPackage: string;
  setSelectedPackage: (pkg: string) => void;
  categories: string[];
}

export const TemplatesFilter: React.FC<TemplatesFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPackage,
  setSelectedPackage,
  categories,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Database Template Aktif</h3>
        <p className="text-xs text-gray-400 mt-0.5">Semua template yang terbit dan dapat diakses kustomer.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end">
        <div className="relative w-full sm:w-auto">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari template..."
            className="pl-9 pr-4 py-1.5 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none w-full sm:w-40 md:w-48 transition bg-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-[calc(50%-4px)] sm:w-auto max-w-[160px] px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white font-medium truncate"
        >
          <option value="All">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={selectedPackage}
          onChange={(e) => setSelectedPackage(e.target.value)}
          className="w-[calc(50%-4px)] sm:w-auto max-w-[160px] px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white font-medium truncate"
        >
          <option value="All">Semua Paket</option>
          <option value="silver">🤍 Paket Silver</option>
          <option value="gold">👑 Paket Gold</option>
          <option value="platinum">✨ Paket Platinum</option>
        </select>
      </div>
    </div>
  );
};
