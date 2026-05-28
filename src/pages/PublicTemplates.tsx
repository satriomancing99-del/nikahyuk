import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, Palette, Search, Eye, Loader2, ArrowRight, CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Template } from '../types/database.types';

const FALLBACK_TEMPLATES: Template[] = [
  // 1. Classic Category Tiers
  {
    id: 'c-silver',
    name: 'Klasik Elegant Royal',
    slug: 'classic-silver',
    category: 'Classic',
    price: 0, // Silver
    thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/classic',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'c-gold',
    name: 'Classic Royal Gold',
    slug: 'classic-gold',
    category: 'Classic',
    price: 99000, // Gold
    thumbnail_url: 'https://images.unsplash.com/photo-1507504038482-7621c37c2b62?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/classic',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'c-platinum',
    name: 'Classic Obsidian Velvet',
    slug: 'classic-platinum',
    category: 'Classic',
    price: 149000, // Platinum
    thumbnail_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/classic',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // 2. Rustic Category Tiers
  {
    id: 'r-silver',
    name: 'Rustic Warm Autumn',
    slug: 'rustic-silver',
    category: 'Rustic',
    price: 0, // Silver
    thumbnail_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/rustic',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'r-gold',
    name: 'Rustic Modern Botanical',
    slug: 'rustic',
    category: 'Rustic',
    price: 99000, // Gold
    thumbnail_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/rustic',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'r-platinum',
    name: 'Rustic Whispering Pines',
    slug: 'rustic-platinum',
    category: 'Rustic',
    price: 149000, // Platinum
    thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/rustic',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // 3. Minimalist Category Tiers
  {
    id: 'm-silver',
    name: 'Minimalist Clean Slate',
    slug: 'minimalist-silver',
    category: 'Minimalist',
    price: 0, // Silver
    thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/minimalist',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'm-gold',
    name: 'Minimalist Bento Grid',
    slug: 'minimalist-gold',
    category: 'Minimalist',
    price: 99000, // Gold
    thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/minimalist',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'm-platinum',
    name: 'Minimalist Premium Gold',
    slug: 'minimalist',
    category: 'Minimalist',
    price: 149000, // Platinum
    thumbnail_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/minimalist',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // 4. Islamic Category Tiers
  {
    id: 'i-silver',
    name: 'Islamic White Jasmine',
    slug: 'islamic-silver',
    category: 'Islamic',
    price: 0, // Silver
    thumbnail_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/islamic',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i-gold',
    name: 'Islamic Sakura Rahmat',
    slug: 'islamic',
    category: 'Islamic',
    price: 99000, // Gold
    thumbnail_url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/islamic',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'i-platinum',
    name: 'Islamic Emerald Arch',
    slug: 'islamic-platinum',
    category: 'Islamic',
    price: 149000, // Platinum
    thumbnail_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/islamic',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // 5. Floral Category Tiers
  {
    id: 'f-silver',
    name: 'Floral Sweet Lavender',
    slug: 'floral-silver',
    category: 'Floral',
    price: 0, // Silver
    thumbnail_url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/floral',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'f-gold',
    name: 'Floral Garden Rose',
    slug: 'floral-gold',
    category: 'Floral',
    price: 99000, // Gold
    thumbnail_url: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/floral',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'f-platinum',
    name: 'Floral Watercolor Blossom',
    slug: 'floral',
    category: 'Floral',
    price: 149000, // Platinum
    thumbnail_url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=600',
    preview_url: '/preview/floral',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function PublicTemplates() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Database States
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');

  // Load active templates from Supabase & set document title for SEO
  useEffect(() => {
    document.title = 'Katalog Template Undangan Pernikahan Premium | NikahYuk!';
    async function fetchTemplates() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setTemplates(data);
        } else {
          setTemplates(FALLBACK_TEMPLATES);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setTemplates(FALLBACK_TEMPLATES);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  // Filter templates by category and package tier
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    let templateTier = 'Silver';
    if (Number(t.price) === 99000) templateTier = 'Gold';
    else if (Number(t.price) === 149000) templateTier = 'Platinum';

    const matchesTier = selectedTier === 'All' || templateTier === selectedTier;
    
    return matchesSearch && matchesCategory && matchesTier;
  });

  const categories = ['All', 'Minimalist', 'Rustic', 'Islamic', 'Floral', 'Classic'];
  const packageTiers = ['All', 'Silver', 'Gold', 'Platinum'];

  const handleUseTemplate = (slug: string, price: number) => {
    let tier = 'silver';
    if (Number(price) === 99000) tier = 'gold';
    else if (Number(price) === 149000) tier = 'platinum';

    if (user) {
      navigate(`/dashboard/invitations/create?template=${slug}&package=${tier}`);
    } else {
      navigate(`/register?template=${slug}&package=${tier}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* 1. Glassmorphic Public Navbar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-primary-500" fill="currentColor" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">NikahYuk!</span>
            </Link>

            {/* Middle nav */}
            <div className="hidden md:flex items-center space-x-8 text-sm">
              <Link to="/" className="text-gray-500 hover:text-gray-900 font-medium transition">Beranda</Link>
              <Link to="/templates" className="text-primary-600 font-bold transition">Katalog Template</Link>
              <Link to="/pricing" className="text-gray-500 hover:text-gray-900 font-medium transition">Daftar Harga</Link>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-5 py-2.5 rounded-full font-bold shadow-md transition"
                >
                  Dashboard Saya
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-500 hover:text-gray-900 text-sm font-bold transition">Masuk</Link>
                  <Link 
                    to="/register" 
                    className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-5 py-2.5 rounded-full font-bold shadow-md transition"
                  >
                    Daftar Akun
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Page Content & Header */}
      <main className="flex-grow pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        
        {/* Hero Banner Area */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-500/10 via-primary-500/5 to-indigo-500/10 border border-primary-100 p-8 sm:p-12 shadow-sm text-center max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 font-bold text-xs ring-1 ring-primary-100 mx-auto">
            <span>Katalog Tema Eksklusif 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Pilih Desain Impian <span className="text-primary-600 italic">Pernikahan Sakral</span> Anda
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Semua template dirancang secara interaktif, responsif seluler, dan mendukung galeri organik, buku tamu digital, serta e-gifts.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full lg:max-w-xs flex-shrink-0">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari tema undangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none w-full bg-slate-50/50 transition font-medium"
              />
            </div>

            {/* Combined Filters Grid */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-end w-full lg:w-auto">
              
              {/* Package Tiers Filter */}
              <div className="flex flex-wrap gap-1.5 justify-center items-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">Paket:</span>
                {packageTiers.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition ${
                      selectedTier === tier
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 text-gray-500 hover:bg-slate-100 hover:text-gray-900'
                    }`}
                  >
                    {tier === 'All' ? 'Semua Paket' : tier}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-gray-200 hidden sm:block flex-shrink-0" />

              {/* Categories filter */}
              <div className="flex flex-wrap gap-1.5 justify-center items-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">Desain:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition ${
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-slate-50 text-gray-500 hover:bg-slate-100 hover:text-gray-900'
                    }`}
                  >
                    {cat === 'All' ? 'Semua Kategori' : cat}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Templates Grid Catalog */}
        {loading ? (
          <div className="p-20 text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto" />
            <p className="text-sm text-gray-400 font-semibold">Mengambil katalog desain dari galeri cloud...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-200 shadow-sm max-w-md mx-auto space-y-4">
            <Palette className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-700">Tema Tidak Ditemukan</h3>
            <p className="text-xs text-gray-400 mt-0.5 leading-normal">
              Kami tidak dapat menemukan tema dengan kata kunci atau kategori yang Anda pilih saat ini.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {filteredTemplates.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  {/* Photo mockup Card */}
                  <div className="aspect-[16/9] bg-slate-50 relative overflow-hidden">
                    <img 
                      src={item.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400'} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    />
                    
                    {/* Dark gradient and Category overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent flex items-end p-4">
                      <div>
                        <span className="bg-primary-500 text-white text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full mb-1 inline-block">
                          {item.category || 'Minimalist'}
                        </span>
                        <h3 className="font-extrabold text-white text-base leading-snug mt-1">{item.name}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Body Pricing info */}
                  <div className="p-5 flex items-center justify-between border-b border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kategori Paket</span>
                    <span className="text-xs font-extrabold">
                      {(Number(item.price) === 0 || Number(item.price) === 49000) && (
                        <span className="text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm font-bold">
                          🤍 Silver
                        </span>
                      )}
                      {Number(item.price) === 99000 && (
                        <span className="text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100 shadow-sm font-bold">
                          👑 Gold
                        </span>
                      )}
                      {Number(item.price) === 149000 && (
                        <span className="text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 shadow-sm font-bold">
                          ✨ Platinum
                        </span>
                      )}
                      {Number(item.price) !== 0 && Number(item.price) !== 49000 && Number(item.price) !== 99000 && Number(item.price) !== 149000 && (
                        <span className="text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm font-bold">
                          Rp {Number(item.price).toLocaleString('id-ID')}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Footer buttons row */}
                <div className="p-4 bg-slate-50/50 flex items-center gap-2">
                  <a 
                    href={`/preview/${item.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" /> Pratinjau
                  </a>

                  <button
                    onClick={() => handleUseTemplate(item.slug, item.price)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    Gunakan Tema <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* 3. Simple Footer */}
      <footer className="bg-white py-10 border-t border-gray-150 text-center w-full">
        <p className="text-gray-400 text-xs font-semibold">© 2026 NikahYuk! All rights reserved.</p>
      </footer>

    </div>
  );
}
