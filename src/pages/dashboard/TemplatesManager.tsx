import React, { useState, useEffect, useRef } from 'react';
import {
  Palette, Plus, FileJson, FileArchive, ExternalLink, Eye, Trash2, Edit3,
  CheckCircle2, FolderOpen, AlertCircle, Coins, Layout, Smartphone, Monitor,
  Loader2, Upload, Search, Filter, X, Check, RefreshCw, Code, Copy,
  Music, Play, Pause, Lock, Sparkles
} from 'lucide-react';
import JSZip from 'jszip';
import { templateService, musicLibraryService } from '../../services';
import { Template, MusicLibrary } from '../../types/database.types';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { getTemplateThumbnail } from '../../utils/templateThumbnails';

// Supported category list
const CATEGORIES = ['Classic', 'Rustic', 'Minimalist', 'Modern', 'Islamic', 'Floral', 'Premium', 'Typography'];

const FALLBACK_TEMPLATES = [
  {
    name: 'Klasik Elegant Royal',
    slug: 'classic-silver',
    category: 'Classic',
    price: 0,
    thumbnail_url: getTemplateThumbnail('classic-silver'),
    preview_url: '/preview/classic',
    status: 'active'
  },
  {
    name: 'Classic Royal Gold',
    slug: 'classic-gold',
    category: 'Classic',
    price: 99000,
    thumbnail_url: getTemplateThumbnail('classic-gold'),
    preview_url: '/preview/classic',
    status: 'active'
  },
  {
    name: 'Classic Obsidian Velvet',
    slug: 'classic-platinum',
    category: 'Classic',
    price: 149000,
    thumbnail_url: getTemplateThumbnail('classic-platinum'),
    preview_url: '/preview/classic',
    status: 'active'
  },
  {
    name: 'Rustic Warm Autumn',
    slug: 'rustic-silver',
    category: 'Rustic',
    price: 0,
    thumbnail_url: getTemplateThumbnail('rustic-silver'),
    preview_url: '/preview/rustic',
    status: 'active'
  },
  {
    name: 'Rustic Modern Botanical',
    slug: 'rustic',
    category: 'Rustic',
    price: 99000,
    thumbnail_url: getTemplateThumbnail('rustic'),
    preview_url: '/preview/rustic',
    status: 'active'
  },
  {
    name: 'Rustic Whispering Pines',
    slug: 'rustic-platinum',
    category: 'Rustic',
    price: 149000,
    thumbnail_url: getTemplateThumbnail('rustic-platinum'),
    preview_url: '/preview/rustic',
    status: 'active'
  },
  {
    name: 'Minimalist Clean Slate',
    slug: 'minimalist-silver',
    category: 'Minimalist',
    price: 0,
    thumbnail_url: getTemplateThumbnail('minimalist-silver'),
    preview_url: '/preview/minimalist',
    status: 'active'
  },
  {
    name: 'Minimalist Bento Grid',
    slug: 'minimalist-gold',
    category: 'Minimalist',
    price: 99000,
    thumbnail_url: getTemplateThumbnail('minimalist-gold'),
    preview_url: '/preview/minimalist',
    status: 'active'
  },
  {
    name: 'Minimalist Premium Gold',
    slug: 'minimalist',
    category: 'Minimalist',
    price: 149000,
    thumbnail_url: getTemplateThumbnail('minimalist'),
    preview_url: '/preview/minimalist',
    status: 'active'
  },
  {
    name: 'Islamic White Jasmine',
    slug: 'islamic-silver',
    category: 'Islamic',
    price: 0,
    thumbnail_url: getTemplateThumbnail('islamic-silver'),
    preview_url: '/preview/islamic',
    status: 'active'
  },
  {
    name: 'Islamic Sakura Rahmat',
    slug: 'islamic',
    category: 'Islamic',
    price: 99000,
    thumbnail_url: getTemplateThumbnail('islamic'),
    preview_url: '/preview/islamic',
    status: 'active'
  },
  {
    name: 'Islamic Emerald Arch',
    slug: 'islamic-platinum',
    category: 'Islamic',
    price: 149000,
    thumbnail_url: getTemplateThumbnail('islamic-platinum'),
    preview_url: '/preview/islamic',
    status: 'active'
  },
  {
    name: 'Floral Sweet Lavender',
    slug: 'floral-silver',
    category: 'Floral',
    price: 0,
    thumbnail_url: getTemplateThumbnail('floral-silver'),
    preview_url: '/preview/floral',
    status: 'active'
  },
  {
    name: 'Floral Garden Rose',
    slug: 'floral-gold',
    category: 'Floral',
    price: 99000,
    thumbnail_url: getTemplateThumbnail('floral-gold'),
    preview_url: '/preview/floral',
    status: 'active'
  },
  {
    name: 'Floral Watercolor Blossom',
    slug: 'floral',
    category: 'Floral',
    price: 149000,
    thumbnail_url: getTemplateThumbnail('floral'),
    preview_url: '/preview/floral',
    status: 'active'
  },
  {
    name: 'Elegance Typique Minimalist',
    slug: 'elegance-typique',
    category: 'Typography',
    price: 0,
    thumbnail_url: getTemplateThumbnail('elegance-typique'),
    preview_url: '/preview/elegance-typique',
    status: 'active'
  }
];

const getDefaultJsxCodeForCategory = (category: string, name: string) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('rustic')) {
    return `// Template: ${name} (Rustic Theme)
// Created with Love - 100% Compatible Sandboxing

import React from 'react';
import { Heart, Calendar, MapPin } from 'lucide-react';

export default function RusticInvitation({ mempelai, events, gifts, gallery, wishes }) {
  // Defensive Coding: Safeguard all dynamic variables with optional chaining (?.)
  const groomName = mempelai?.groom_name || 'Aditya';
  const brideName = mempelai?.bride_name || 'Aulia';
  
  return (
    <div className="min-h-screen bg-[#f4f1ea] font-serif text-[#424c3e]">
      {/* Hero Header */}
      <header className="py-20 text-center bg-gradient-to-b from-[#e2ddcf] to-[#f4f1ea] px-4">
        <div className="p-4 inline-block bg-[#7c8d76] text-white rounded-full mb-4 shadow-sm">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <p className="text-xs uppercase tracking-widest text-[#586453] font-semibold">The Wedding of</p>
        <h1 className="text-5xl font-bold mt-4 font-serif text-[#424c3e]">
          {groomName} & {brideName}
        </h1>
      </header>

      {/* Love Story / Quotes */}
      <section className="max-w-md mx-auto px-6 py-12 text-center space-y-4">
        <p className="italic text-[#586453] text-sm font-serif">
          "{mempelai?.quote || 'Dan di antara tanda-tanda kebesaran-Nya...'}"
        </p>
        {mempelai?.love_story && (
          <div className="mt-8 text-left text-sm bg-white/70 p-6 rounded-2xl border border-[#d1c9b6]">
            <h3 className="font-bold mb-3 uppercase tracking-wider text-xs">Momen Bahagia</h3>
            <p className="whitespace-pre-line text-stone-600 font-sans leading-relaxed">
              {mempelai?.love_story}
            </p>
          </div>
        )}
      </section>

      {/* Events */}
      <section className="max-w-md mx-auto px-6 py-6 space-y-6">
        {events?.length > 0 ? (
          events.map((evt) => (
            <div key={evt.id} className="bg-white/95 border border-[#d1c9b6] p-6 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] font-bold bg-[#f7f5f0] text-[#586453] border border-[#c0b49c] px-3 py-1 rounded-full uppercase tracking-widest">
                {evt.type}
              </span>
              <h2 className="text-xl font-bold mt-3 text-[#424c3e]">{evt.title}</h2>
              <p className="text-sm text-stone-500 mt-2 font-sans">{evt.date} • {evt.start_time} - {evt.end_time}</p>
              <p className="text-sm font-semibold mt-4 text-[#424c3e]">{evt.location_name}</p>
              <p className="text-xs text-stone-500 font-sans mt-1">{evt.address}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-stone-400">Belum ada acara dikonfigurasikan.</p>
        )}
      </section>
    </div>
  );
}
`;
  } else if (cat.includes('minimal')) {
    return `// Template: ${name} (Minimalist Theme)
// Created with Love - 100% Compatible Sandboxing

import React from 'react';
import { Heart } from 'lucide-react';

export default function MinimalistInvitation({ mempelai, events, gifts, wishes }) {
  // Safeguards for inputs
  const groomName = mempelai?.groom_name || 'Aditya';
  const brideName = mempelai?.bride_name || 'Aulia';

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#18181b] tracking-tight">
      <header className="py-24 text-center px-4 border-b border-gray-150">
        <span className="text-xs tracking-widest uppercase text-gray-400 font-mono">The Wedding</span>
        <h1 className="text-4xl mt-3 font-light uppercase tracking-wider text-gray-950">
          {groomName} & {brideName}
        </h1>
        <div className="w-10 h-[1.5px] bg-gray-900 mx-auto mt-6" />
      </header>

      {/* Events */}
      <section className="max-w-sm mx-auto px-4 py-16 space-y-12">
        {events?.length > 0 ? (
          events.map((evt) => (
            <div key={evt.id} className="border-l border-gray-900 pl-6 space-y-2">
              <span className="text-[10px] tracking-widest uppercase font-mono text-gray-400">{evt.type}</span>
              <h3 className="font-bold text-lg uppercase tracking-tight text-gray-900">{evt.title}</h3>
              <p className="text-xs font-mono text-gray-500">{evt.date} | {evt.start_time} WIB</p>
              <p className="text-sm font-medium mt-1">{evt.location_name}</p>
              <p className="text-xs text-gray-500 leading-relaxed font-light">{evt.address}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-neutral-300">Belum ada acara dikonfigurasikan.</p>
        )}
      </section>
    </div>
  );
}
`;
  } else if (cat.includes('islamic')) {
    return `// Template: ${name} (Islamic Theme)
// Created with Love - 100% Compatible Sandboxing

import React from 'react';
import { Heart } from 'lucide-react';

export default function IslamicInvitation({ mempelai, events, gifts }) {
  const groomName = mempelai?.groom_name || 'Aditya';
  const brideName = mempelai?.bride_name || 'Aulia';

  return (
    <div className="min-h-screen bg-[#f5f9f6] font-serif text-[#1e4620]">
      <header className="py-20 text-center bg-gradient-to-b from-[#d4e6d9] to-[#f5f9f6] px-4">
        <div className="text-lg font-arabic mb-2 text-[#1e4620]/70">البسملة</div>
        <p className="text-xs uppercase tracking-widest text-[#2e6031] font-sans font-semibold">Pernikahan Islami</p>
        <h1 className="text-4xl font-bold mt-4 text-[#1e4620]">
          {groomName} & {brideName}
        </h1>
      </header>

      <section className="max-w-md mx-auto px-6 py-12 text-center">
        <p className="italic text-[#2e6031] text-sm leading-relaxed font-serif">
          "{mempelai?.quote || 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu...'}"
        </p>
      </section>
    </div>
  );
}
`;
  } else {
    // Classic/Standard Fallback
    return `// Template: ${name} (Classic Legacy Theme)
// Created with Love - 100% Compatible Sandboxing

import React from 'react';
import { Heart } from 'lucide-react';

export default function ClassicInvitation({ mempelai, events, gifts, gallery, wishes }) {
  const groomName = mempelai?.groom_name || 'Aditya';
  const brideName = mempelai?.bride_name || 'Aulia';

  return (
    <div className="min-h-screen bg-[#fcfbf9] font-serif text-stone-800">
      <header className="relative py-24 text-center bg-gradient-to-b from-rose-50/70 to-[#fcfbf9] px-4">
        <div className="inline-flex items-center gap-1 bg-pink-50 border border-pink-150 px-4 py-1.5 rounded-full text-[10px] text-pink-700 font-bold uppercase tracking-widest mb-4">
          <Heart className="w-3 h-3 fill-current text-pink-500" /> Walimatul 'Urs
        </div>
        <p className="text-xs uppercase tracking-widest text-pink-600 font-sans font-bold">The Wedding of</p>
        <h1 className="text-5xl font-semibold text-[#be185d] mt-3">
          {groomName} & {brideName}
        </h1>
      </header>

      {/* Marriage Details */}
      <section className="max-w-md mx-auto px-6 py-8 text-center space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-rose-150 shadow-sm">
          <p className="text-xs text-stone-400 uppercase tracking-widest">Atas Rahmat Allah SWT</p>
          <div className="mt-4 inline-grid grid-cols-2 w-full gap-4">
            <div className="text-center border-r border-[#be185d]/10 pr-2">
              <h3 className="font-bold text-stone-800">{groomName}</h3>
              <p className="text-[11px] text-stone-500 mt-1">{mempelai?.groom_parent || 'Putra Terbaik Bpk. Heri & Ibu'}</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-stone-800">{brideName}</h3>
              <p className="text-[11px] text-stone-500 mt-1">{mempelai?.bride_parent || 'Putri Terbaik Bpk. Ahmad & Ibu'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
`;
  }
};

export default function TemplatesManager() {
  const { profile, user } = useAuthStore();
  const [existingTemplates, setExistingTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Global Collaboration Toggle settings state
  const [collaborationEnabled, setCollaborationEnabled] = useState(false);


  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPackage, setSelectedPackage] = useState<string>('All');

  // Import States
  const [dragActive, setDragActive] = useState(false);
  const [globalDragActive, setGlobalDragActive] = useState(false);
  const [importType, setImportType] = useState<'zip' | 'json' | 'jsx' | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [draftJsxCode, setDraftJsxCode] = useState<string | null>(null);
  const [jsxWarnings, setJsxWarnings] = useState<string[]>([]);

  // Draft / Sandbox Template pending DB upload
  const [draftTemplate, setDraftTemplate] = useState<Partial<Template> | null>(null);
  const [draftFiles, setDraftFiles] = useState<Array<{ name: string; size: number; isFolder: boolean }>>([]);
  const [selectedDraftThumbnailFile, setSelectedDraftThumbnailFile] = useState<File | null>(null);
  const [customThumbnailPreview, setCustomThumbnailPreview] = useState<string>('');

  // Save status messages
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal for edit of existing template
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPrice, setEditingPrice] = useState(0);
  const [editingCategory, setEditingCategory] = useState('');
  const [editingStatus, setEditingStatus] = useState('active');

  // Preview Sandbox Modal (Smartphone / Desktop frame simulator)
  const [previewTemplate, setPreviewTemplate] = useState<Template | Partial<Template> | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [previewTab, setPreviewTab] = useState<'ui' | 'jsx'>('ui');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [activePromptTier, setActivePromptTier] = useState<'silver' | 'gold' | 'platinum' | 'typography'>('gold');

  // BGM (Background Music) library states
  const [bgmList, setBgmList] = useState<MusicLibrary[]>([]);
  const [bgmLoading, setBgmLoading] = useState(true);
  const [newBgmFile, setNewBgmFile] = useState<File | null>(null);
  const [newBgmTitle, setNewBgmTitle] = useState('');
  const [newBgmArtist, setNewBgmArtist] = useState('');
  const [isBgmUploading, setIsBgmUploading] = useState(false);
  const [playingBgmId, setPlayingBgmId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);


  const handleCopyPrompt = () => {
    let priceText = '99000';
    let photoLimitText = 'Maksimal 8 Foto saja (slice array gallery ke maks 8 data, contoh: gallery?.slice(0, 8).map(...)).';
    let bgmText = '- mempelai?.music_url (URL berkas latar musik .mp3 hasil pilihan atau unggahan manual kustomer. Wajib gunakan variabel ini untuk memutar musik latar kustomer! Sediakan URL musik instrumen romantis premium sebagai fallback pertahanan jika variabel ini null.)';
    let giftText = '- gifts (Array rekening/hadiah amplop digital):\n  * Map hadiah mempelai: gifts?.map(gift => ...)\n  * Sediakan tombol "Salin Rekening" bertuliskan Copy yang menyalin gift.account_number ke clipboard tamu secara mulus.';
    let eGiftSection = '- **E-Gift & Kado Amplop Digital**: Kotak rekening digital kustomer lengkap dengan tombol instan untuk menyalin nomor rekening ke clipboard secara mulus.';
    let watermarkText = '';

    if (activePromptTier === 'silver') {
      priceText = '49000';
      photoLimitText = 'Maksimal 3 Foto saja (slice array gallery ke maks 3 data, contoh: gallery?.slice(0, 3).map(...)).';
      bgmText = '- mempelai?.music_url (URL berkas latar musik .mp3 hasil pilihan atau unggahan manual kustomer. Wajib gunakan variabel ini untuk memutar musik latar kustomer! Sediakan URL musik instrumen romantis premium sebagai fallback pertahanan jika variabel ini null.)';
      giftText = 'DILARANG keras menampilkan/menghubungkan modul Rekening Amplop/E-Gift maupun properti gifts! Paket ini tidak menyediakan amplop digital.';
      eGiftSection = 'DILARANG keras membuat atau menampilkan bagian E-Gift/Kado digital!';
    } else if (activePromptTier === 'platinum') {
      priceText = '149000';
      photoLimitText = 'Maksimal 12 Foto saja (slice array gallery ke maks 12 data, contoh: gallery?.slice(0, 12).map(...)).';
      bgmText = '- mempelai?.music_url (URL berkas latar musik .mp3 hasil pilihan atau unggahan manual kustomer. Wajib gunakan variabel ini untuk memutar musik latar kustomer! Sediakan URL musik instrumen romantis premium sebagai fallback pertahanan jika variabel ini null.) + Sediakan tombol putar suara sambutan kustom kustomer bila tersedia.';
      watermarkText = '- DILARANG KERAS menampilkan logo, nama, atau identitas platform NikahYuk! di layar visual kustomer. Template Platinum harus 100% bersih tanpa watermark branding platform!';
    } else if (activePromptTier === 'typography') {
      priceText = '0';
      photoLimitText = 'DILARANG KERAS merender foto profil mempelai, foto utama, maupun seksi galeri prewedding! Paket ini didesain 100% murni berbasis keindahan tipografi artistik (Pure Typographic) untuk kustomer yang tidak ingin mengunggah foto.';
      bgmText = '- mempelai?.music_url (URL berkas latar musik .mp3 hasil pilihan atau unggahan manual kustomer. Wajib gunakan variabel ini untuk memutar musik latar kustomer! Sediakan URL musik instrumen romantis premium sebagai fallback pertahanan jika variabel ini null.)';
      giftText = '- gifts (Array rekening/hadiah amplop digital):\n  * Map hadiah mempelai: gifts?.map(gift => ...)\n  * Sediakan tombol "Salin Rekening" bertuliskan Copy yang menyalin gift.account_number ke clipboard tamu secara mulus.';
      eGiftSection = '- **E-Gift & Kado Amplop Digital**: Kotak rekening digital kustomer lengkap dengan tombol instan untuk menyalin nomor rekening ke clipboard secara mulus.';
      watermarkText = `* **LOGIKA TANPA GAMBAR (STRICTLY NO-IMAGE DESIGN)**:
    - JANGAN merender tag <img> untuk profil mempelai pria, wanita, cover depan, maupun galeri!
    - DILARANG KERAS merender placeholder avatar, lingkaran inisial huruf, kotak inisial, maupun ornamen berbentuk bingkai foto di bagian detail mempelai pria dan wanita! Di seksi profil mempelai, HANYA tampilkan nama mempelai (groom_name, bride_name) dan nama orang tua kustomer secara murni berbasis keindahan teks tipografi (Pure Typography) tanpa ada lingkaran/kotak tempat avatar sama sekali!
    - Untuk seksi cover pembuka depan & hero banner: Gunakan ornamen visual murni berbasis CSS/SVG (garis pembatas ultra-tipis, ornamen bunga SVG halus, garis lengkung artistik, atau pola gradien mewah) untuk menyelimuti nama mempelai agar terlihat megah dan estetik tanpa gambar latar belakang.
    - Seksi Galeri Prewedding wajib disembunyikan sepenuhnya!
    - Kategori config.json wajib diisi: "Typography"`;
    }

    const promptText = `Anda adalah AI developer ahli pembuat UI template undangan pernikahan digital berstandar premium dunia. Tugas Anda adalah menghasilkan KODE SUMBER KOMPONEN REACT (.jsx) dan berkas METADATA (.json) yang dirancang khusus untuk diimpor ke platform kami dalam satu paket ZIP.

Paket ZIP yang Anda hasilkan WAJIB berisi 3 berkas utama:
1. "config.json" (Berkas konfigurasi template)
2. "template.jsx" (Kode sumber komponen React premium)
3. "thumbnail.png" atau "thumbnail.jpg" (Gambar pratinjau berupa Phone Mockup premium yang elegan, menampilkan visual layar HP dengan isi undangan di dalamnya dan berlatar belakang artistik yang kontras. DILARANG keras menggunakan ilustrasi kartun/gambar pasangan pengantin biasa, melainkan wajib mockup perangkat HP profesional.)

Berikut adalah petunjuk teknis super-detail agar template yang dihasilkan 100% kompatibel dengan database kami, rapi, responsif, dan sangat mewah:

1. KETENTUAN BERKAS CONFIG.JSON:
Tulis konfigurasi metadata template Anda dengan format JSON berikut:
{
  "name": "[Nama Desain Premium - Contoh: Eternal Sakura Premium]",
  "category": "Classic | Rustic | Minimalist | Modern | Islamic | Floral | Premium",
  "price": ${priceText},
  "slug": "[slug-unik-huruf-kecil-dan-minus - Contoh: eternal-sakura-premium]",
  "thumbnail_url": "thumbnail.png",
  "preview_url": "/preview/[slug-unik-anda]"
}

2. DESAIN ESTETIKA & DIVERSIFIKASI LAYOUT (AESTHETIC & DIVERSE DESIGN GUIDELINES):
- **PETUNJUK TEMA UNIVERSAL (PENTING)**: Secara default, buatlah tema desain yang universal, netral, dan cocok untuk seluruh agama/tradisi (seperti Classic, Rustic, Floral, atau Minimalist) dengan kutipan cinta/pernikahan yang romantis secara universal, KECUALI jika pengguna secara spesifik meminta tema keagamaan tertentu (seperti Islamic).
- JANGAN terpaku pada 1 model desain standar. Buatlah desain, struktur layout, kombinasi warna, border-radius, font, gaya ornamen visual, ornamen dekoratif, grid foto (hindari tata letak baris kotak seragam yang monoton dan membosankan), bingkai foto dan transisi yang SEPENUHNYA UNIK, berbeda, inovatif, dan berkelas dunia untuk setiap kategori:
  * **Rustic/Botanical**: Gunakan earthy tones (cokelat pasir, krem lembut, hijau zaitun), font serif bernuansa klasik, dekorasi botani minimalis, border melengkung organik yang halus, dan nuansa kertas daur ulang bertekstur.
  * **Minimalist/Bento-Grid**: Tata letak asimetris kontemporer berbasis kotak (bento-style grid) tanpa border melingkar kasar, menggunakan ruang putih (white space) yang luas, tipografi sans-serif uppercase tipis pelengkap, dan skema warna monokromatik modern berserat mewah.
  * **Islamic/Arabesque**: Gabungkan ornamen kubah masjid halus, pola geometris islami (Arabesque), latar belakang hijau emerald tua yang berpadu dengan aksen emas bercahaya premium.
  * **Floral/Soft Romantic**: Didominasi sapuan cat air bunga pastel (mawar lembut, cherry blossom), font kaligrafi meliuk anggun, dan transisi fade-in memudar yang lambat and romantis.
  * **Elegant Premium Dark Mode**: Menggunakan latar belakang gelap pekat (charcoal, obsidian, deep space) dengan kontras tinggi dari teks and ornamen bergradasi emas berkilau mewah serta pembatas garis ultra-tipis yang futuristik.
- JANGAN PERNAH menggunakan animasi loop berulang (seperti \`repeat: Infinity\`) pada elemen teks statis seperti judul bagian ("Momen Bahagia", "Countdown Pernikahan", dll.), nama mempelai, kutipan, dan teks detail. Animasi loop berulang membuat teks berkedip (blink) terus-menerus dan merusak estetika premium. Semua teks hanya boleh memiliki animasi masuk (entrance animation) SEKALI saat pertama kali dimunculkan di layar.
- STRUKTUR KODE REACT YANG BENAR: JANGAN mendefinisikan komponen React lain di dalam fungsi komponen utama Anda (Nested Component Declarations). Mendeklarasikan komponen di dalam komponen lain akan merusak Virtual DOM React, memaksa DOM ter-mount ulang secara penuh pada setiap perubahan status (seperti setiap detik saat hitung mundur diperbarui), yang mengakibatkan animasi masuk terpipu berulang kali dan teks berkedip secara konstan (flashing/blinking). Semua sub-bagian wajib ditulis langsung di dalam badan render utama atau dideklarasikan sebagai fungsi pembantu standar di luar komponen utama!
- PENGATURAN ORIENTASI & ASPEK RASIO FOTO (DEFENSIVE IMAGE HANDLING):
  * Semua tag \`<img>\` wajib memiliki class \`object-cover\` dan \`w-full h-full\` agar gambar tidak pernah gepeng atau distorsi (stretched) saat orientasi foto kustomer (misalnya potret/berdiri) berbeda dengan bingkai di template (misalnya lanskap/tidur).
  * Khusus untuk bingkai foto profil mempelai (yang biasanya berorientasi potret/berdiri) atau cover utama: JANGAN gunakan bingkai lanskap tipis yang memotong foto terlalu ekstrem. Direkomendasikan menggunakan bingkai ber-aspek rasio fleksibel (seperti kotak \`aspect-square\`, lingkaran sempurna \`rounded-full\`, atau potret \`aspect-[3/4]\`), ATAU gunakan teknik blur-cadangan premium (gambar utama diposisikan \`object-contain\` di tengah bingkai, sedangkan di latar belakangnya diposisikan duplikat gambar yang sama dengan class \`absolute inset-0 w-full h-full object-cover filter blur-xl opacity-30\`). Teknik blur-cadangan ini menjamin seluruh foto kustomer (berdiri maupun lanskap) tampil penuh dengan estetika mewah berkelas dunia.

3. DAFTAR PARAMETER DATABASE (DEFENSIVE EXTRACTION):
Komponen React Anda akan menerima properti database berikut:
{ mempelai, events, gifts, gallery, wishes, guest }
Agar tidak terjadi error "Cannot read properties of undefined", wajib gunakan optional chaining (?.) untuk seluruh akses data:
- mempelai: 
  * mempelai?.groom_name (Nama mempelai pria, default: "Aditya Pratama")
  * mempelai?.groom_parent (Orang tua pria, default: "Bpk. Heri Pratama & Ibu Shinta")
  * mempelai?.bride_name (Nama mempelai wanita, default: "Aulia Rahmawati")
  * mempelai?.bride_parent (Orang tua wanita, default: "Bpk. Ahmad Rahmawan & Ibu Lestari")
  * mempelai?.quote (Kutipan doa/cinta, default: "Hari ini kami memulai perjalanan baru bersama, menyatukan dua hati dalam cinta, rasa syukur, dan harmoni selamanya...")
  * mempelai?.greeting (Salam pembuka keagamaan/universal kustomer, default: "Selamat Pagi/Siang/Sore/Malam, dengan penuh rasa syukur dan bahagia...". Wajib gunakan variabel ini agar seksi greeting/salam pembuka di undangan dinamis mengikuti agama/tradisi kustomer!)
  * mempelai?.love_story (Kisah cinta pasangan)
  * mempelai?.music_url ${bgmText}
  * mempelai?.thumbnail_url (PENTING: Ini adalah URL foto utama/cover utama hasil upload customer. Gunakan sebagai latar belakang cover utama, hero banner, atau cover pembuka undangan.)
  * **Foto Profil Masing-Masing Mempelai (Krusial untuk Detail Pasangan):** DILARANG KERAS menggunakan mempelai?.thumbnail_url untuk foto profil pria dan wanita secara bersamaan. Foto masing-masing mempelai harus diambil secara dinamis dari properti \`gallery\` (lihat panduan ekstraksi di bawah). Gunakan mempelai?.thumbnail_url hanya sebagai fallback jika foto spesifik tidak ditemukan di gallery.
- events (Array agenda acara):
  * Gunakan: const akad = events?.find(e => e.type === 'akad' || e.title?.toLowerCase().includes('akad'))
  * Gunakan: const resepsi = events?.find(e => e.type === 'resepsi' || e.title?.toLowerCase().includes('resepsi'))
  * Tampilkan format tanggal dengan rapi (contoh: "Sabtu, 27 Mei 2026"), jam ("09:00 - 11:00 WIB"), nama tempat ("Grand Ballroom"), dan alamat lengkap.
- guest (Data tamu undangan personal - CRITICAL!):
  * Wajib gunakan: guest?.name (Nama tamu personal, default fallback jika null: "Tamu Terhormat"). Tampilkan nama ini di kotak penutup/cover depan secara elegan!
  * Sediakan Form Kehadiran (RSVP) DAN Form Kirim Ucapan / Buku Tamu (Wish Form) yang fungsional dan bernuansa premium.
  * PENTING: Untuk kedua formulir tersebut (RSVP & Buku Tamu), jika data guest tersedia (tamu mengakses via link personal), input "Nama Tamu" WAJIB dibuat read-only atau disabled dengan style visual yang jelas (seperti background abu-abu & kursor tidak bisa diklik), serta otomatis terisi nilai \`guest.name\` agar tidak bisa dirubah secara manual oleh pengunjung. Ini krusial demi menjaga integritas data daftar tamu yang diimpor dari CSV atau daftar kustom yang sudah dibuat oleh customer!
- gifts (Array rekening/hadiah amplop digital):
  ${giftText}
- gallery (Array foto dari database, berisi foto profil mempelai dan foto prewedding):
  * **PENTING: Ekstraksi Foto Profil Mempelai Secara Spesifik (Wajib Diikuti!):**
    * **Foto Profil Pria (Groom Photo):** Wajib diekstrak dari gallery menggunakan filter caption 'groom_photo':
      \`const groomPhoto = gallery?.find(img => img.caption === 'groom_photo')?.url || mempelai?.thumbnail_url;\`
    * **Foto Profil Wanita (Bride Photo):** Wajib diekstrak dari gallery menggunakan filter caption 'bride_photo':
      \`const bridePhoto = gallery?.find(img => img.caption === 'bride_photo')?.url || mempelai?.thumbnail_url;\`
  * **PENTING: Pemisahan Galeri Prewedding (Wajib Diikuti!):**
    * Saat merender blok galeri prewedding (grid foto kustomer), Anda **WAJIB MENYARING KELUAR** (exclude) foto profil mempelai agar foto profil tidak muncul ganda di galeri prewedding.
    * Gunakan filter berikut sebelum merender galeri prewedding:
      \`const preweddingImages = gallery?.filter(img => img.caption !== 'groom_photo' && img.caption !== 'bride_photo') || [];\`
    * Lakukan render/mapping dari variabel \`preweddingImages\` yang sudah disaring tersebut, bukan dari array raw \`gallery\`!
  * **Urutan Foto Galeri Prewedding Berdasarkan Input Kustomer (Krusial!):** Data dalam array \`preweddingImages\` diurutkan secara berurutan sesuai urutan unggahan kustomer di dashboard:
    * \`preweddingImages?.[0]\` = Foto Prewedding Ke-1
    * \`preweddingImages?.[1]\` = Foto Prewedding Ke-2
    * \`preweddingImages?.[2]\` = Foto Prewedding Ke-3
    * dan seterusnya.
  * **PENTING: DESAIN LAYOUT GALERI BUKAN GRID DATAR MONOTON!** DILARANG KERAS merender foto prewedding hanya berupa barisan kotak-kotak berukuran seragam (seperti kotak persegi 1x1 berurutan dalam satu baris datar yang membosankan dan terlihat amatir).
  * **Wajib Gunakan Layout Artistik Variatif Sesuai Urutan:**
    * *Asymmetric Bento Grid*: Wajib gunakan foto prewedding pertama (\`preweddingImages?.[0]\`) sebagai elemen utama yang paling besar (\`col-span-2 row-span-2\` atau \`aspect-[4/3]\` besar), lalu kelilingi dengan foto-foto berikutnya (\`preweddingImages?.[1]\`, \`preweddingImages?.[2]\`, dst.) sebagai elemen pendukung yang lebih kecil (\`col-span-1\`). Ini menjamin foto utama kustomer tampil paling megah di tata letak bento modern.
    * *Staggered Masonry / Alternating Heights*: Susun foto secara berurutan (\`preweddingImages?.[0]\`, \`preweddingImages?.[1]\`, dst.) dengan tinggi bergantian atau offset margin asimetris agar urutan alur unggahan terasa natural dan estetik saat discroll.
    * *Artistic Staggered Collage (Polaroid Style)*: Susun kolase bertumpuk secara estetis berdasarkan urutan indeks, berikan kemiringan rotasi acak yang halus (contoh: \`rotate-1\`, \`-rotate-2\`, \`hover:rotate-0 transition duration-300\`) di mana foto pertama (\`preweddingImages?.[0]\`) menempati posisi terdepan/teratas.
    * *Interactive Carousel & Highlight Slider*: Jadikan foto prewedding pertama (\`preweddingImages?.[0]\`) sebagai gambar utama yang langsung aktif pertama kali di layar, dengan barisan thumbnail berurutan di bawahnya.
  * Gunakan mapping secara kreatif untuk merender elemen gambar prewedding secara murni: preweddingImages?.map(img => <img src={img.url} />)
  * PENTING: Blok galeri prewedding hanya boleh menampilkan elemen gambar <img> saja. DILARANG KERAS merender caption, deskripsi, overlay teks, atau tulisan keterangan apa pun baik dinamis maupun statis (seperti menuliskan teks penjelasan desain atau deskripsi visual tata letak).
  * Batasan Jumlah Foto Prewedding: ${photoLimitText}
- wishes (Array ucapan doa restu dari para tamu):
  * Tampilkan daftar ucapan secara bergulir (scrollable feed) yang menarik. Sediakan form input cepat untuk memposting ucapan (nama & teks ucapan).

4. GAMBARAN BESAR STRUKTUR KONTEN & INTERAKTIF (THE BIG PICTURE OF REQUIRED SECTIONS):
Anda dibebaskan menyusun layout, hierarki visual, warna, dan kombinasi animasi secara sekreatif mungkin, namun secara garis besar wajib menyajikan blok interaktif berikut:
- **Cover Welcome Overlay**: Layar sambutan awal yang menghalangi konten utama sebelum diklik. Menampilkan nama mempelai, nama personal tamu kustom (\`guest?.name || 'Tamu Terhormat'\`), dan tombol pembuka undangan interaktif. Ketika tombol diklik, gerbang cover meluncur ke atas (*slide-up*) dengan transisi super-halus dan memicu musik latar kustomer (\`mempelai?.music_url\`) berputar otomatis secara *looping*.
- **Floating Audio Controller**: Tombol lingkaran mengambang elegan di sudut layar yang memungkinkan pengunjung memutar/menjeda (*play/pause*) musik latar kapan saja.
- **Hero & Countdown Banner**: Sapaan megah nama mempelai berhias ornamen dekoratif/grafis yang disesuaikan dengan tema visual terpilih, dilengkapi modul hitung mundur dinamis menuju hari akad pernikahan.
- **Profil Pasangan Mempelai**: Kartu profil personal mempelai pria dan wanita yang rapi lengkap dengan nama orang tua, menggunakan foto profil kustomer pria (\`gallery?.find(img => img.caption === 'groom_photo')?.url\` dengan fallback \`mempelai?.thumbnail_url\`) dan foto profil kustomer wanita (\`gallery?.find(img => img.caption === 'bride_photo')?.url\` dengan fallback \`mempelai?.thumbnail_url\`).
- **Informasi Acara (Events)**: Menyajikan detail waktu, hari-H, alamat, dan tombol rute menuju Google Maps (\`google_maps_url\`) secara responsif.
- **Form RSVP & Kirim Ucapan Terkunci**: Panel di mana tamu dapat mengonfirmasi status kedatangan dan mengetikkan ucapan selamat dengan kolom nama yang dikunci aman.
- **Galeri Foto Bersih**: Cukup tampilkan deretan foto prewedding hasil upload kustomer dalam kontainer grid responsif yang estetis. PENTING: Kontainer galeri ini hanya boleh berisi gambar saja, tanpa ada teks penjelasan, keterangan layout, atau caption sama sekali di layar!
- **E-Gift & Kado Amplop Digital**: ${eGiftSection}

5. WATERMARK & BRANDING PLATFORM:
${watermarkText || '- Sediakan credit watermark berupa tautan "NikahYuk!" secara minimalis, bersih, dan estetis di footer paling bawah undangan.'}

6. STANDAR KEBERSIHAN TEKS & HALANGAN PLACEHOLDER (STRICT NO-PROSE / NO-PLACEHOLDER RULES):
- DILARANG KERAS menampilkan kalimat penjelasan desain, kalimat petunjuk prompt, atau teks meta-instruksi apa pun di layar undangan kustomer.
- Contoh teks yang HARAM dan DILARANG KERAS untuk ditulis/dirender di HTML/JSX visual:
  * "Foto ditampilkan bersih tanpa caption dalam susunan woodland bento yang organik dan responsif."
  * "Foto tampil bersih tanpa caption dalam galeri bento asimetris dengan bingkai organik."
  * Istilah deskripsi tata letak seperti "woodland bento", "bento asimetris", "bingkai organik", "desain bersih tanpa caption", atau sejenisnya.
- Kalimat-kalimat di atas adalah instruksi logika koding bagi Anda (AI), bukan teks pengisi (placeholder) yang harus dibaca oleh tamu undangan. Layar undangan hanya boleh menampilkan judul bagian standar yang bersih (misal: "Galeri Foto", "Momen Bahagia", dll.) dan data asli dari database. JANGAN PERNAH menyelipkan teks deskripsi visual ke dalam tag JSX.

7. LOGIKA SMART AUTO-HIDE SEKSI OPSIONAL (SMART SECTION TOGGLES):
- Selalu lakukan pengecekan keberadaan data kustomer secara dinamis sebelum merender seluruh kontainer seksi opsional demi menjaga visual premium:
  * **Kisah Cinta (Love Story)**: Wajib dibungkus dengan pemeriksaan kondisional: \`mempelai?.love_story && ( <section>...</section> )\`. Jika kustomer tidak mengisi kisah cinta (bernilai null, undefined, atau string kosong), seksi Kisah Cinta **wajib disembunyikan sepenuhnya** (tidak dirender sama sekali di DOM), bukan memunculkan seksi kosong dengan judul hampa.
  * **Galeri Prewedding**: Lakukan pengecekan terhadap array hasil saringan foto prewedding: \`preweddingImages && preweddingImages.length > 0 && ( <section>...</section> )\`. Jika kustomer tidak mengunggah foto prewedding sama sekali (array bernilai kosong / 0 data), seksi Galeri Foto **wajib disembunyikan sepenuhnya** dari layar agar tidak merusak tata letak typographic yang bersih.
  * **Kado Amplop / E-Gift**: Jika kustomer tidak mengonfigurasi rekening atau hadiah sama sekali, atau array \`gifts\` bernilai kosong (\`!gifts || gifts.length === 0\`), seksi kado amplop digital **wajib disembunyikan sepenuhnya** dari hadapan tamu.

8. ATURAN PENULISAN KODE TEMPLATE.JSX:
- Tulis seluruh kode komponen dalam SATU file tunggal ("template.jsx").
- Gunakan export default tunggal (misal: export default function InvitationComponent(...) or export default class ...).
- Import icon Lucide hanya dari 'lucide-react' (contoh: import { Heart, Calendar, MapPin, Gift, Clock, Copy, Check, Volume2, VolumeX, MailOpen } from 'lucide-react';).
- Import animasi motion hanya dari 'motion/react' (contoh: import { motion, AnimatePresence } from 'motion/react';).`;

    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Load BGM list from database
  const loadBgmList = async () => {
    try {
      setBgmLoading(true);
      const list = await musicLibraryService.getAll();
      setBgmList(list || []);
    } catch (err) {
      console.error('Error fetching database BGMs:', err);
    } finally {
      setBgmLoading(false);
    }
  };

  const handleUploadBgm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBgmFile) {
      alert('Silakan pilih berkas MP3 terlebih dahulu.');
      return;
    }
    if (!newBgmTitle.trim()) {
      alert('Silakan masukkan judul lagu.');
      return;
    }

    setIsBgmUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Sesi tidak ditemukan. Silakan login kembali.');

      const userId = session.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!profile || profile.role !== 'super_admin') {
        throw new Error('Anda tidak memiliki izin untuk mengunggah BGM bersama (khusus admin).');
      }

      await musicLibraryService.uploadAndSaveTrack(
        newBgmFile,
        newBgmTitle.trim(),
        newBgmArtist.trim() || 'Unknown',
        false, // Public shared track
        userId,
        profile.role
      );

      alert('BGM bersama berhasil ditambahkan ke perpustakaan!');
      setNewBgmFile(null);
      setNewBgmTitle('');
      setNewBgmArtist('');
      loadBgmList();
    } catch (err: any) {
      console.error('Error uploading BGM:', err);
      alert(err.message || 'Gagal menambahkan lagu.');
    } finally {
      setIsBgmUploading(false);
    }
  };

  const handleDeleteBgm = async (id: string, fileUrl: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lagu BGM ini dari perpustakaan?')) return;

    try {
      if (fileUrl.includes('/music/')) {
        const filePath = fileUrl.split('/music/').pop();
        if (filePath) {
          await supabase.storage.from('music').remove([decodeURIComponent(filePath)]);
        }
      }

      await musicLibraryService.delete(id);
      alert('BGM berhasil dihapus dari perpustakaan.');
      loadBgmList();
    } catch (err) {
      console.error('Error deleting BGM:', err);
      alert('Gagal menghapus BGM.');
    }
  };

  const togglePlayBgm = (id: string, url: string) => {
    if (playingBgmId === id) {
      audioRef.current?.pause();
      setPlayingBgmId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setPlayingBgmId(id);
      audioRef.current.onended = () => {
        setPlayingBgmId(null);
      };
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const fetchCollaborationSetting = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'collaboration_enabled')
        .single();
      if (!error && data) {
        const valObj = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setCollaborationEnabled(!!valObj?.enabled);
      }
    } catch (err) {
      console.error('Error fetching collaboration setting:', err);
    }
  };

  const handleToggleCollaboration = async () => {
    const nextVal = !collaborationEnabled;
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'collaboration_enabled',
          value: { enabled: nextVal },
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
      setCollaborationEnabled(nextVal);
      alert(`Akses kontribusi kustomer berhasil ${nextVal ? 'DIBUKA' : 'DITUTUP'}!`);
    } catch (err) {
      console.error('Error toggling collaboration setting:', err);
      alert('Gagal memperbarui status kolaborasi. Pastikan Anda telah menjalankan migrasi SQL 012_system_settings.sql.');
    }
  };

  // Load current database templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      let list = await templateService.getAll();

      // Auto-seed default templates if database is empty and logged-in user is admin/super_admin
      if ((!list || list.length === 0) && profile?.role === 'super_admin') {
        console.log('Templates table is empty. Seeding defaults from admin dashboard...');
        const seeded: Template[] = [];
        for (const item of FALLBACK_TEMPLATES) {
          try {
            const res = await templateService.create(item);
            seeded.push(res);
          } catch (createErr) {
            console.error('Failed to seed template:', item.slug, createErr);
          }
        }
        if (seeded.length > 0) {
          list = seeded;
        }
      }

      setExistingTemplates(list || []);
    } catch (err) {
      console.error('Error fetching database templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
    loadBgmList();
    fetchCollaborationSetting();
  }, []);



  // Listen to drag & drop events on #root / window level to support seamless upload dragging
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      setGlobalDragActive(true);
    };

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Ensure we keep it active while dragging over
      setGlobalDragActive(true);
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;

      // If drag leave is outside window, or depth check is 0
      if (
        dragCounter.current <= 0 ||
        e.relatedTarget === null ||
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        dragCounter.current = 0;
        setGlobalDragActive(false);
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setGlobalDragActive(false);

      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        handleFileSelected(e.dataTransfer.files[0]);
      }
    };

    window.addEventListener('dragenter', handleGlobalDragEnter);
    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('dragleave', handleGlobalDragLeave);
    window.addEventListener('drop', handleGlobalDrop);

    return () => {
      window.removeEventListener('dragenter', handleGlobalDragEnter);
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragleave', handleGlobalDragLeave);
      window.removeEventListener('drop', handleGlobalDrop);
    };
  }, []);

  // Drag and Drop triggers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);
    setGlobalDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  // Main file processing logic
  const handleFileSelected = async (file: File) => {
    setGlobalDragActive(false);
    dragCounter.current = 0;
    setIsParsing(true);
    setParsingError(null);
    setDraftTemplate(null);
    setDraftFiles([]);
    setSelectedDraftThumbnailFile(null);
    setCustomThumbnailPreview('');
    setDraftJsxCode(null);
    setJsxWarnings([]);

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.json')) {
      setImportType('json');
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);

          // Basic verification of required fields
          if (!parsed.name) {
            throw new Error('Konfigurasi JSON harus memiliki properti "name".');
          }

          const baseSlug = parsed.slug || parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

          setDraftTemplate({
            name: parsed.name,
            slug: baseSlug,
            category: parsed.category || 'Classic',
            price: Number(parsed.price) || 120000,
            thumbnail_url: parsed.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
            preview_url: parsed.preview_url || `/preview/${baseSlug}`,
            status: parsed.status || 'active'
          });

          // Simulate simple config list
          setDraftFiles([
            { name: file.name, size: file.size, isFolder: false }
          ]);
        } catch (err: any) {
          setParsingError(`Kesalahan parsing JSON: ${err.message}`);
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsText(file);

    } else if (fileName.endsWith('.zip')) {
      setImportType('zip');
      try {
        const zip = await JSZip.loadAsync(file);

        // Output all files inside the zip
        const fileList: Array<{ name: string; size: number; isFolder: boolean }> = [];
        zip.forEach((relativePath, zipEntry) => {
          fileList.push({
            name: zipEntry.name,
            size: (zipEntry as any)._data?.uncompressedSize || 0,
            isFolder: zipEntry.dir
          });
        });
        setDraftFiles(fileList);

        // Try to locate config.json
        const configEntry = zip.file('config.json') || zip.file('template.json') || Object.values(zip.files).find(f => f.name.endsWith('.json'));

        if (!configEntry) {
          throw new Error('File "config.json" atau "template.json" tidak ditemukan di dalam root ZIP.');
        }

        const configContentStr = await configEntry.async('string');
        const parsed = JSON.parse(configContentStr);

        if (!parsed.name) {
          throw new Error('Isi config.json di dalam ZIP harus menyertakan properti "name".');
        }

        const baseSlug = parsed.slug || parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        let extractedThumbnailUrl = parsed.thumbnail_url || '';

        // Try to search for thumbnail.jpg, thumbnail.png inside the ZIP
        const thumbnailEntry = zip.file('thumbnail.jpg') || zip.file('thumbnail.png') || Object.values(zip.files).find(f => f.name.includes('thumbnail') && (f.name.endsWith('.jpg') || f.name.endsWith('.png') || f.name.endsWith('.jpeg')));

        if (thumbnailEntry) {
          const base64Data = await thumbnailEntry.async('base64');
          const ext = thumbnailEntry.name.endsWith('.png') ? 'png' : 'jpeg';
          extractedThumbnailUrl = `data:image/${ext};base64,${base64Data}`;
        }

        // Try to search for any .jsx file inside the ZIP and extract its content as jsx_code
        let extractedJsxCode = '';
        const jsxEntry = Object.values(zip.files).find(f => f.name.endsWith('.jsx'));
        if (jsxEntry) {
          const jsxContent = await jsxEntry.async('string');
          extractedJsxCode = jsxContent;
          setDraftJsxCode(jsxContent);

          // Scan for JSX compatibility warnings inside ZIP uploads
          const warnings: string[] = [];
          if (jsxContent.includes('mempelai.') && !jsxContent.includes('mempelai?.')) {
            warnings.push('⚠️ Properti `mempelai` dipanggil langsung tanpa optional chaining (?.). Ubah menjadi `mempelai?.groom_name` dsb.');
          }
          if ((jsxContent.includes('events[') || jsxContent.includes('events.')) && !jsxContent.includes('events?.')) {
            warnings.push('⚠️ Array `events` dipanggil mendadak. Sangat disarankan: `events?.[0]` atau `events?.find(...)` agar aman.');
          }
          if (jsxContent.includes('gifts.') && !jsxContent.includes('gifts?.')) {
            warnings.push('⚠️ Kado rekening `gifts` dideretkan langsung. Gunakan `gifts?.map(...)` untuk melindungi UI dari error.');
          }
          if (jsxContent.includes('gallery.') && !jsxContent.includes('gallery?.')) {
            warnings.push('⚠️ Foto galeri `gallery` dirender langsung. Gunakan `gallery?.map(...)`.');
          }
          setJsxWarnings(warnings);
        }

        setDraftTemplate({
          name: parsed.name,
          slug: baseSlug,
          category: parsed.category || 'Classic',
          price: Number(parsed.price) || 150000,
          thumbnail_url: extractedThumbnailUrl || 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=400',
          preview_url: parsed.preview_url || `/preview/${baseSlug}`,
          status: parsed.status || 'active',
          jsx_code: extractedJsxCode || null
        });

      } catch (err: any) {
        setParsingError(`Kesalahan ekstraksi ZIP: ${err.message}`);
      } finally {
        setIsParsing(false);
      }
    } else if (fileName.endsWith('.jsx')) {
      setImportType('jsx');
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          setDraftJsxCode(content);

          // Extract name candidate from filename
          const baseName = file.name.replace(/\.jsx$/i, '');
          const formattedName = baseName
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]+/g, ' ')
            .trim();
          const finalName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
          const baseSlug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

          // Detect categories dynamically
          let detectedCategory = 'Modern';
          const lowerCode = content.toLowerCase();
          if (lowerCode.includes('floral') || baseSlug.includes('floral')) {
            detectedCategory = 'Floral';
          } else if (lowerCode.includes('rustic') || baseSlug.includes('rustic')) {
            detectedCategory = 'Rustic';
          } else if (lowerCode.includes('minimalist') || baseSlug.includes('minimalist')) {
            detectedCategory = 'Minimalist';
          } else if (lowerCode.includes('islamic') || baseSlug.includes('islamic')) {
            detectedCategory = 'Islamic';
          } else if (lowerCode.includes('classic') || baseSlug.includes('classic')) {
            detectedCategory = 'Classic';
          }

          setDraftTemplate({
            name: finalName,
            slug: baseSlug,
            category: detectedCategory,
            price: 150000,
            thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
            preview_url: `/preview/${baseSlug}`,
            status: 'active',
            jsx_code: content
          });

          // Run deep structural defensive coding compatibility scan checks
          const warnings: string[] = [];
          if (content.includes('mempelai.') && !content.includes('mempelai?.')) {
            warnings.push('⚠️ Properti `mempelai` dipanggil langsung tanpa optional chaining (?.). Ubah menjadi `mempelai?.groom_name` dsb.');
          }
          if ((content.includes('events[') || content.includes('events.')) && !content.includes('events?.')) {
            warnings.push('⚠️ Array `events` dipanggil mendadak. Sangat disarankan: `events?.[0]` atau `events?.find(...)` agar aman.');
          }
          if (content.includes('gifts.') && !content.includes('gifts?.')) {
            warnings.push('⚠️ Kado rekening `gifts` dideretkan langsung. Gunakan `gifts?.map(...)` untuk melindungi UI dari error.');
          }
          if (content.includes('gallery.') && !content.includes('gallery?.')) {
            warnings.push('⚠️ Foto galeri `gallery` dirender langsung. Gunakan `gallery?.map(...)`.');
          }
          if (content.includes('wishes.') && !content.includes('wishes?.')) {
            warnings.push('⚠️ Pesan para tamu `wishes` dirujuk mentah-mentah. Gunakan `wishes?.map(...)` atau `wishes || []`.');
          }
          setJsxWarnings(warnings);

          setDraftFiles([
            { name: file.name, size: file.size, isFolder: false }
          ]);
        } catch (err: any) {
          setParsingError(`Gagal membaca berkas JSX Anda: ${err.message}`);
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsText(file);
    } else {
      setParsingError('Format file tidak didukung! Pastikan Anda mengunggah file berekstensi .zip, .json, atau .jsx.');
      setIsParsing(false);
    }
  };

  // When manually selecting custom thumbnail for JSON package
  const handleCustomThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedDraftThumbnailFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        setCustomThumbnailPreview(res);
        if (draftTemplate) {
          setDraftTemplate(prev => prev ? ({ ...prev, thumbnail_url: res }) : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit draft template values inline in the Sandbox panel
  const handleDraftFieldChange = (field: keyof Template, value: any) => {
    if (draftTemplate) {
      setDraftTemplate(prev => prev ? ({ ...prev, [field]: value }) : null);
    }
  };

  // Save the staging draft template to database
  const handleSaveDraftToDatabase = async () => {
    if (!draftTemplate || !draftTemplate.name) return;
    try {
      setSaving(true);
      setSuccessMsg(null);

      // Enforce slug integrity
      let finalSlug = draftTemplate.slug || 'template-slug';
      finalSlug = finalSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      // Define default values
      const payload: any = {
        name: draftTemplate.name,
        slug: finalSlug,
        category: draftTemplate.category || 'Classic',
        price: draftTemplate.price || 150000,
        thumbnail_url: draftTemplate.thumbnail_url || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400',
        preview_url: draftTemplate.preview_url || `/preview/${finalSlug}`,
        status: profile?.role === 'customer' ? 'draft' : (draftTemplate.status || 'active'),
        jsx_code: draftTemplate.jsx_code || null
      };

      // Add dynamic tag of creator
      if (profile?.role === 'customer' && user?.id) {
        payload.created_by = user.id;
      }

      // Check if a template with the same slug already exists
      const { data: existingTemplate, error: checkError } = await supabase
        .from('templates')
        .select('id, created_by')
        .eq('slug', finalSlug)
        .maybeSingle();

      if (checkError) throw checkError;

      let isUpdate = false;
      if (existingTemplate) {
        const isOwner = user?.id && existingTemplate.created_by === user.id;
        const isAdmin = profile?.role === 'super_admin';

        if (isAdmin || isOwner) {
          await templateService.update(existingTemplate.id, payload);
          isUpdate = true;
        } else {
          throw new Error('Slug template ini sudah terdaftar oleh pengguna lain. Silakan ganti "Custom Slug" Anda.');
        }
      } else {
        await templateService.create(payload);
      }

      if (profile?.role === 'customer') {
        if (isUpdate) {
          setSuccessMsg(`Template "${payload.name}" berhasil diperbarui.`);
        } else {
          setSuccessMsg(`Selamat! Template "${payload.name}" berhasil diajukan untuk ditinjau oleh Admin.`);
        }
      } else {
        if (isUpdate) {
          setSuccessMsg(`Template "${payload.name}" berhasil diperbarui di database.`);
        } else {
          setSuccessMsg(`Template "${payload.name}" berhasil diunggah dan disimpan ke database.`);
        }
      }
      setDraftTemplate(null);
      setDraftFiles([]);
      setImportType(null);
      setCustomThumbnailPreview('');
      setSelectedDraftThumbnailFile(null);
      setDraftJsxCode(null);
      setJsxWarnings([]);

      // Reload templates
      await loadTemplates();

      // Clear toast after 4s
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Save to database error:', err);
      setParsingError(`Gagal menyimpan template ke database: ${err.message || 'Error tidak diketahui'}`);
    } finally {
      setSaving(false);
    }
  };

  // Open modal editor for existing templates
  const openEditModal = (tpl: Template) => {
    setEditingTemplate(tpl);
    setEditingName(tpl.name);
    setEditingPrice(tpl.price);
    setEditingCategory(tpl.category);
    setEditingStatus(tpl.status);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    try {
      setSaving(true);
      const updated = await templateService.update(editingTemplate.id, {
        name: editingName,
        price: Number(editingPrice),
        category: editingCategory,
        status: editingStatus
      });

      // Update local state
      setExistingTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
      setEditingTemplate(null);

      setSuccessMsg(`Template "${updated.name}" berhasil diperbarui.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Error updating template:', err);
      alert(`Gagal memperbarui template: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus template "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    try {
      setSaving(true);
      await templateService.delete(id);
      setExistingTemplates(prev => prev.filter(t => t.id !== id));
      setSuccessMsg(`Template "${name}" berhasil dihapus.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Error deleting template:', err);
      alert(`Gagal menghapus template: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Toggle template status active/inactive rapidly
  const handleToggleStatus = async (tpl: Template) => {
    const nextStatus = tpl.status === 'active' ? 'draft' : 'active';
    try {
      const updated = await templateService.update(tpl.id, { status: nextStatus });
      setExistingTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (err: any) {
      console.error('Error toggling template status:', err);
      alert('Gagal memperbarui status template.');
    }
  };

  // Filter existing templates
  const filteredTemplates = existingTemplates.filter(t => {
    const matchesSearch = (t?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t?.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t?.category === selectedCategory;

    // Classify template tier by price
    const price = Number(t.price || 0);
    let templatePackage = 'silver';
    if (price > 49000 && price <= 99000) {
      templatePackage = 'gold';
    } else if (price > 99000) {
      templatePackage = 'platinum';
    }

    const matchesPackage = selectedPackage === 'All' || templatePackage === selectedPackage;

    return matchesSearch && matchesCategory && matchesPackage;
  });

  if (profile?.role === 'customer') {
    if (!collaborationEnabled) {
      return (
        <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-md border border-amber-200">
            <Lock className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Akses Kolaborasi Ditutup</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Halo Kreator! Fitur kontribusi dan kolaborasi desain template saat ini sedang dinonaktifkan oleh Administrator platform NikahYuk!.
            </p>
          </div>
          <div className="bg-white border border-gray-150 rounded-2xl p-4 text-xs text-gray-400">
            Hubungi dukungan admin jika Anda memiliki desain template undangan MP3 premium yang ingin diunggah secara publik.
          </div>
        </div>
      );
    }

    const myContributions = existingTemplates.filter(t => t.created_by === user?.id);

    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel Kontributor Template</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-250 flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" /> Kreator Aktif
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              Bantu platform berkembang secara masif! Buat template undangan digital romantis premium menggunakan ChatGPT, lakukan kompilasi, uji sandbox, lalu ajukan review ke Admin.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm w-fit"
            >
              <Plus className="w-4 h-4" /> Unggah Berkas Template (.zip / .json / .jsx)
            </button>
            <button
              type="button"
              onClick={loadTemplates}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm w-fit"
            >
              <RefreshCw className="w-4 h-4" /> Segarkan Status
            </button>
          </div>
        </div>

        {/* Database alerts or notifications */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Import / Upload & Instructions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Uploader Card */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary-500" />
                Unggah Hasil Desain Anda
              </h2>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Mendukung arsip paket `.zip` berisi config, metadata `.json`, atau langsung berkas kode komponen `.jsx` dengan scanning kompatibilitas otomatis.
              </p>

              {/* Drop Zone Area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[180px] ${dragActive
                  ? 'border-primary-500 bg-primary-50/50 scale-[0.98]'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.json,.jsx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                {isParsing ? (
                  <>
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
                    <p className="text-sm font-semibold text-gray-800">Sedang mengekstrak & menganalisis...</p>
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm font-bold text-gray-700">Tarik berkas Anda ke sini, atau klik untuk memilih</p>
                    <p className="text-xs text-gray-400 mt-2 font-mono">ZIP, JSON, atau Kode Komponen (.jsx)</p>
                  </>
                )}
              </div>

              {parsingError && (
                <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 space-y-2">
                  <div className="flex gap-2 text-xs font-bold text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>⚠️ TEMPLATE DITOLAK: Kode Tidak Memenuhi Kualifikasi Standar!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-700">
                    Sistem menolak file yang diunggah karena format kode atau variabel internal tidak sesuai dengan konfigurasi database platform kami.
                  </p>
                  <div className="bg-white p-2.5 rounded-lg border border-rose-150 text-[10.5px] font-mono text-stone-700 leading-normal">
                    Detail: {parsingError}
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed font-semibold">
                    💡 Solusi: Mohon salin kembali Prompt Pembuatan Template secara utuh dari panel kanan, buka ChatGPT, paste prompt tersebut, dan minta ChatGPT untuk mereparasi/memperbaiki kode Anda agar 100% kompatibel.
                  </p>
                </div>
              )}
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-primary-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary-500 fill-current" />
                Petunjuk Pembuatan Mandiri via ChatGPT
              </h3>

              <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                  <p>
                    Pilih kategori paket template di sidebar kanan (Silver, Gold, Platinum, atau Tipografi) lalu klik Salin Prompt Pembuatan.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                  <p>
                    Buka <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-bold inline-flex items-center gap-0.5">ChatGPT <ExternalLink className="w-3.5 h-3.5" /></a>, paste seluruh prompt tersebut, lalu minta ChatGPT membuat komponen react premium.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                  <p>
                    Unduh file `template.jsx` dan `config.json` hasil ChatGPT. Kompres kedua file tersebut beserta gambar `thumbnail.jpg` menjadi satu berkas .zip, atau unggah langsung file `.jsx` tersebut di sini.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">4</span>
                  <p>
                    Kamu bisa menambahkan jenis kategori, warna, animasi, gambar, bentuk, atau tulisan apapun secara spesifik pada template yang ingin kamu buat. Cukup ketik di bagian paling atas atau paling bawah bagaimana keinginanmu. Sampaikan dengan jelas dan detail
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">5</span>
                  <p>
                    Klik tombol Ajukan untuk Review agar Admin dapat menyetujui kontribusi template Anda!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sandbox Draft & Contributions List */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sandbox Draft Staging */}
            {draftTemplate ? (
              <div className="bg-white rounded-3xl border border-primary-100 shadow-md p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-450 via-primary-550 to-pink-500" />

                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-bold">ST</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Sandbox Simulator (Pratinjau Kode)</h3>
                      <p className="text-[10px] text-gray-400">Kode Anda berhasil dikompilasi! Uji coba tata letak visual sebelum diajukan.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setDraftTemplate(null); setDraftFiles([]); setImportType(null); }}
                    className="text-gray-400 hover:text-gray-650"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nama Desain</label>
                      <input
                        type="text"
                        value={draftTemplate.name || ''}
                        onChange={(e) => handleDraftFieldChange('name', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Kategori</label>
                      <select
                        value={draftTemplate.category || 'Classic'}
                        onChange={(e) => handleDraftFieldChange('category', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Paket Tier & Harga</label>
                      <select
                        value={draftTemplate.price || 0}
                        onChange={(e) => handleDraftFieldChange('price', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value={0}>🤍 Paket Silver (Gratis / Rp 0)</option>
                        <option value={99000}>👑 Paket Gold (Rp 99,000)</option>
                        <option value={149000}>✨ Paket Platinum (Rp 149,000)</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(draftTemplate)}
                        className="flex-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary-500" /> Pratinjau Simulator
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleSaveDraftToDatabase}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-350 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {saving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Ajukan ke Admin
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Berkas Terkompilasi</label>
                    <div className="bg-white rounded-xl border border-gray-200 p-3 h-[180px] overflow-y-auto space-y-1.5">
                      {draftFiles.map((f, i) => (
                        <div key={i} className="flex justify-between text-[11px] font-mono p-1 rounded hover:bg-gray-50">
                          <span className="text-gray-650 truncate max-w-[155px]">📄 {f.name}</span>
                          <span className="text-gray-400">{(f.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Prompt Creator Segment */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
              <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-2xl border border-primary-100 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-1 text-primary-100">
                  <Code className="w-16 h-16 opacity-10" />
                </div>

                <h4 className="text-sm font-bold text-primary-900 mb-1 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-primary-500" />
                  Penyalin Prompt AI Pembuat Template
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  Gunakan tab di bawah untuk memilih tingkatan paket desain kustom, salin perintah prompt yang disediakan, dan tempel di ChatGPT untuk merancang template 100% kompatibel.
                </p>

                {/* Package selector tabs for Prompt Creator */}
                <div className="grid grid-cols-4 gap-1 bg-slate-100/80 p-1 rounded-xl mb-4 max-w-md">
                  {(['silver', 'gold', 'platinum', 'typography'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setActivePromptTier(tier)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${activePromptTier === tier
                        ? 'bg-white text-primary-600 shadow-xs font-extrabold'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      {tier === 'silver' ? '🤍 Silver' : tier === 'gold' ? '👑 Gold' : tier === 'platinum' ? '✨ Platinum' : '📖 Tnp Foto'}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className={`w-full text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 ${copiedPrompt
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 shadow-md animate-bounce'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-100 shadow-md'
                    }`}
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-4 h-4" /> Prompt Berhasil Disalin!
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 rotate-45" /> Salin Prompt Pembuatan Template ({activePromptTier.toUpperCase()})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List Contribution templates */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-primary-500" />
                Daftar Kontribusi Desain Anda ({myContributions.length})
              </h3>

              {loading ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                  <p className="text-xs text-gray-400">Memuat data kontribusi...</p>
                </div>
              ) : myContributions.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-gray-150 rounded-2xl bg-gray-50/50">
                  <Palette className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">Belum ada kontribusi template</p>
                  <p className="text-xs text-gray-400 mt-0.5">Mulai dengan mengunggah template pertama Anda menggunakan petunjuk di atas!</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {myContributions.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        <img
                          src={getTemplateThumbnail(tpl.slug, tpl.category, tpl.price) || getTemplateThumbnail('classic-silver')}
                          alt={tpl.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-1 items-center">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 shadow-sm text-gray-850">
                            {tpl.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${tpl.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-250'
                            }`}>
                            {tpl.status === 'active' ? 'Aktif (Disetujui)' : 'Draf (Review Admin)'}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono font-bold text-white uppercase">
                            Rp {Number(tpl.price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-55/50 border-t border-gray-150 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{tpl.name}</span>
                        <a
                          href={tpl.preview_url?.startsWith('http') ? tpl.preview_url : `/preview/${tpl.slug || 'classic'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            localStorage.setItem(`draft_template_${tpl.slug || 'classic'}`, JSON.stringify(tpl));
                          }}
                          className="text-primary-600 hover:text-primary-700 text-[10px] font-bold flex items-center gap-0.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Pratinjau
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Sandbox Modal Frame */}
        {previewTemplate ? (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-150 w-full h-[90vh] flex flex-col transition-all duration-300 z-10 cursor-default max-w-sm">
              <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
                <span className="text-xs font-bold">Simulator Smartphone</span>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
                <iframe
                  title="Mobile Viewport"
                  src={`/preview/${previewTemplate.slug || 'classic'}`}
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pengelola Template Undangan</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 border border-primary-200">
              Admin & Editor
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Impor template undangan buatan sendiri berupa arsip ZIP, konfigurasi JSON, atau file JSX, lalu pratinjau dan unggah ke database sistem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.role === 'super_admin' && (
            <button
              type="button"
              onClick={handleToggleCollaboration}
              className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-xs border ${collaborationEnabled
                ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
                : 'bg-amber-100 text-amber-800 border-amber-250 hover:bg-amber-200'
                }`}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              Kontribusi Kustomer: {collaborationEnabled ? 'AKTIF (ON)' : 'MATI (OFF)'}
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" /> Unggah Template (.zip / .json / .jsx)
          </button>
          <button
            type="button"
            onClick={loadTemplates}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm w-fit"
          >
            <RefreshCw className="w-4 h-4" /> Segarkan Data
          </button>
        </div>
      </div>

      {/* Database alerts or notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Import / Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-500" />
              Unggah File Template
            </h2>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Mendukung arsip paket `.zip` berisi config, metadata `.json`, atau langsung berkas kode komponen `.jsx` dengan scanning kompatibilitas otomatis.
            </p>

            {/* Drop Zone Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[180px] ${dragActive
                ? 'border-primary-500 bg-primary-50/50 scale-[0.98]'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.json,.jsx"
                onChange={handleFileInputChange}
                className="hidden"
              />
              {isParsing ? (
                <>
                  <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
                  <p className="text-sm font-semibold text-gray-800">Sedang mengekstrak & menganalisis...</p>
                  <p className="text-xs text-gray-400 mt-1">Membaca arsip paket...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-3 text-primary-500">
                    <FileArchive className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    Taruh file di sini atau <span className="text-primary-600 underline">pilih file</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2 font-mono">ZIP, JSON, atau Kode Komponen (.jsx)</p>
                </>
              )}
            </div>

            {parsingError && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 flex gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{parsingError}</span>
              </div>
            )}
          </div>

          {/* Guidelines info card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-150 rounded-3xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-primary-500" />
                Struktur config.json yang didukung:
              </h3>
              <pre className="text-[11px] font-mono text-gray-650 bg-white p-4 rounded-xl border border-gray-200 overflow-x-auto leading-relaxed max-h-[160px]">
                {`{
  "name": "Minimalist Gold Premium",
  "category": "Minimalist",
  "price": 250000,
  "slug": "minimalist-gold",
  "preview_url": "/preview/minimalist"
}`}
              </pre>
            </div>

            {/* AI Generator Prompt Segment */}
            <div className="bg-white rounded-2xl border border-primary-100 p-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-1 text-primary-100 dark:text-primary-50">
                <Code className="w-16 h-16 opacity-10" />
              </div>

              <h4 className="text-xs font-bold text-primary-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Code className="w-3.5 h-3.5 text-primary-500" />
                AI Prompt Creator (Rekomendasi)
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                Salin prompt super-mendetil di bawah ini lalu kirimkan ke AI (seperti Gemini) untuk membuat template kustom yang 100% kompatibel dan bebas error ketika diisi data customer.
              </p>

              {/* Package selector tabs for Prompt Creator */}
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl mb-3">
                {(['silver', 'gold', 'platinum', 'typography'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setActivePromptTier(tier)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${activePromptTier === tier
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                      }`}
                  >
                    {tier === 'silver' ? '🤍 Silver' : tier === 'gold' ? '👑 Gold' : tier === 'platinum' ? '✨ Platinum' : '📖 Tnp Foto'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyPrompt}
                className={`w-full text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${copiedPrompt
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 shadow-md'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-100 shadow-md'
                  }`}
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Prompt Berhasil Disalin!
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5 rotate-45" /> Salin Prompt Pembuatan Template
                  </>
                )}
              </button>
            </div>

            <div className="text-xs text-gray-500 space-y-1 text-left leading-relaxed pt-1 border-t border-gray-200/60">
              <p>📍 <strong>Kategori didukung:</strong> {CATEGORIES.join(', ')}</p>
              <p>💼 Paket `.zip` akan secara dinamis mengekstrak file `thumbnail.jpg` atau `thumbnail.png` yang disertakan di dalamnya.</p>
            </div>
          </div>

          {/* Perpustakaan BGM (Musik Latar) */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Music className="w-5 h-5 text-primary-500" />
                Kelola BGM Bersama
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Kelola koleksi lagu latar belakang (BGM) format MP3 yang dapat dipilih langsung oleh semua kustomer di dalam undangan mereka.
              </p>
            </div>

            {/* Form Upload BGM */}
            <form onSubmit={handleUploadBgm} className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Unggah BGM Baru
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Judul Lagu *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Janji Suci"
                    value={newBgmTitle}
                    onChange={(e) => setNewBgmTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Artis / Penyanyi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Yovie & Nuno (opsional)"
                    value={newBgmArtist}
                    onChange={(e) => setNewBgmArtist(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
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
                              // Auto-fill title from filename
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
                    <Plus className="w-3.5 h-3.5" /> Tambah ke Perpustakaan
                  </>
                )}
              </button>
            </form>

            {/* List BGM */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Koleksi BGM ({bgmList.length})
                </h3>
                <button
                  type="button"
                  onClick={loadBgmList}
                  className="text-gray-400 hover:text-gray-650"
                  title="Segarkan List BGM"
                >
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
                  <p className="text-[10px] text-gray-400">Gunakan form di atas untuk mengunggah BGM pertama.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {bgmList.map((bgm) => (
                    <div
                      key={bgm.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-gray-150 rounded-xl hover:shadow-xs transition duration-200"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => togglePlayBgm(bgm.id, bgm.url)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition ${playingBgmId === bgm.id
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                            }`}
                        >
                          {playingBgmId === bgm.id ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate leading-tight flex items-center gap-1.5">
                            {bgm.title}
                            {bgm.is_private && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded-sm font-bold uppercase">
                                Privat
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">{bgm.artist}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteBgm(bgm.id, bgm.url)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-50 flex-shrink-0 transition"
                        title="Hapus Lagu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Right Columns: Preview / Sandbox Draft Area & Database Sync */}
        <div className="lg:col-span-2 space-y-8">
          {/* Staging & Sandboxing Area for Uploaded Template Drafts */}
          {draftTemplate ? (
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
                      <Palette className="w-5 h-5 text-primary-500 animate-pulse" />
                    ) : (
                      <FileJson className="w-5 h-5 text-amber-500" />
                    )}
                    Pratinjau Impor ({importType?.toUpperCase()}): {draftTemplate.name}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setDraftTemplate(null);
                    setDraftFiles([]);
                    setImportType(null);
                  }}
                  className="p-1 rounded-full hover:bg-gray-150 text-gray-400 hover:text-gray-600 transition"
                  title="Batalkan Impor"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Layout splits for edit metadata & visual layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Form Editor Stage */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Nama Template</label>
                    <input
                      type="text"
                      value={draftTemplate.name || ''}
                      onChange={(e) => handleDraftFieldChange('name', e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none transition font-medium"
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
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Harga (IDR)</label>
                      <input
                        type="number"
                        value={draftTemplate.price || 0}
                        onChange={(e) => handleDraftFieldChange('price', Number(e.target.value))}
                        className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none transition font-semibold"
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
                        className="w-full text-xs font-mono border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none transition"
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

                  {/* Thumbnail picker for single JSON and JSX uploads since they do not contain binary media */}
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

                  {/* JSX Code Scanning Warnings Checklist & Code Viewer */}
                  {importType === 'jsx' && (
                    <div className="space-y-4">
                      {/* Code Compatibility Check */}
                      <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Pemindai Kompatibilitas JSX:
                        </div>
                        {jsxWarnings.length === 0 ? (
                          <div className="text-[11px] text-emerald-700 bg-emerald-50/50 px-3 py-2.5 rounded-xl flex items-start gap-1.5 font-medium leading-relaxed border border-emerald-100">
                            <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>Luar biasa! Seluruh properti customer (mempelai, events, gifts, gallery, wishes) terdeteksi aman menggunakan optional chaining. Template kebal dari error data kosong!</span>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[140px] overflow-y-auto">
                            <div className="text-[10px] text-amber-600 bg-amber-50/20 px-2.5 py-1.5 rounded-lg font-bold border border-amber-150">
                              Ditemukan beberapa akses objek langsung tanpa optional chaining (?.). Pastikan kustomisasi Anda defensive agar rilis aman:
                            </div>
                            {jsxWarnings.map((warning, idx) => (
                              <div key={idx} className="text-[10.5px] text-amber-800 bg-amber-50/60 px-3 py-2.5 rounded-xl flex items-start gap-2 border border-amber-100 font-medium leading-normal">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>{warning}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Monospace Code Editor */}
                      {draftJsxCode && (
                        <div className="bg-gray-950 rounded-2xl p-4 border border-gray-900 shadow-inner relative overflow-hidden">
                          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800/80">
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">Kode Sumber JSX ({draftTemplate.slug || 'template'}.jsx)</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Read-Only</span>
                          </div>
                          <pre className="text-[10px] font-mono text-emerald-400 bg-black/40 p-3 rounded-xl overflow-x-auto overflow-y-auto max-h-[180px] leading-relaxed select-all">
                            {draftJsxCode}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ZIP files lists logs */}
                  {draftFiles.length > 0 && importType !== 'jsx' && (
                    <div className="bg-gray-55/75 rounded-2xl p-4 border border-gray-150 max-h-[160px] overflow-y-auto">
                      <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-gray-800 uppercase tracking-wide">
                        <FolderOpen className="w-3.5 h-3.5 text-pink-500" />
                        Daftar Berkas Terdeteksi:
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 divide-y divide-gray-100">
                        {draftFiles.map((f, idx) => (
                          <div key={idx} className="py-1 flex justify-between gap-4">
                            <span className={f.isFolder ? 'text-blue-600 font-semibold' : 'text-gray-700'}>{f.name}</span>
                            <span>{f.isFolder ? 'Direct' : `${(f.size / 1024).toFixed(1)} KB`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Staged Card Simulator Output preview */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                      Visual Kartu Pemilihan
                    </span>

                    {/* The Sim card item */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow transition-shadow group">
                      <a
                        href={`/preview/${draftTemplate?.slug || 'classic'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (draftTemplate) {
                            localStorage.setItem(`draft_template_${draftTemplate.slug || 'classic'}`, JSON.stringify(draftTemplate));
                          }
                        }}
                        className="relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer group/img block"
                        title="Klik untuk Pratinjau (Preview)"
                      >
                        <img
                          src={getTemplateThumbnail(draftTemplate.slug || '', draftTemplate.category, draftTemplate.price) || getTemplateThumbnail('classic-silver')}
                          alt="Template Preview Sketch"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition duration-500"
                        />
                        {/* Hover overlay with Eye icon */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition duration-200 flex items-center justify-center">
                          <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md">
                            <Eye className="w-3 h-3" /> Preview
                          </span>
                        </div>
                        <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
                          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm shadow-sm font-semibold rounded-lg text-[10px] text-gray-800">
                            {draftTemplate.category}
                          </span>
                        </div>
                      </a>
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

                  {/* Actions to sandboxing trigger preview and build */}
                  <div className="flex gap-2.5 mt-4">
                    <a
                      href={`/preview/${draftTemplate?.slug || 'classic'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (draftTemplate) {
                          localStorage.setItem(`draft_template_${draftTemplate.slug || 'classic'}`, JSON.stringify(draftTemplate));
                        }
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" /> Preview
                    </a>
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
          ) : null}

          {/* Database Synchronization System Section - Live Grid */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Database Template Aktif</h3>
                <p className="text-xs text-gray-400 mt-0.5">Semua template yang terbit dan dapat diakses publik oleh kustomer.</p>
              </div>

              {/* Filtering Controls */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari template..."
                    className="pl-9 pr-4 py-1.5 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none w-40 sm:w-48 transition"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white font-medium"
                >
                  <option value="All">Semua Kategori</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white font-medium"
                >
                  <option value="All">Semua Paket</option>
                  <option value="silver">🤍 Paket Silver</option>
                  <option value="gold">👑 Paket Gold</option>
                  <option value="platinum">✨ Paket Platinum</option>
                </select>
              </div>
            </div>

            {/* In-DB Grid */}
            {loading ? (
              <div className="p-16 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                <p className="text-xs text-gray-400 font-semibold">Memuat daftar template aktif...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="p-16 text-center border-2 border-dashed border-gray-150 rounded-2xl">
                <Palette className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Tidak ada template ditemukan</p>
                <p className="text-xs text-gray-400 mt-0.5">Gunakan panel kiri untuk mengunggah template pertama Anda!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition duration-250 flex flex-col justify-between relative"
                  >
                    {/* Visual Media Cover */}
                    <a
                      href={tpl.preview_url?.startsWith('http') ? tpl.preview_url : `/preview/${tpl.slug || 'classic'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        localStorage.setItem(`draft_template_${tpl.slug || 'classic'}`, JSON.stringify(tpl));
                      }}
                      className="relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer group/img block"
                      title="Klik untuk Pratinjau (Preview)"
                    >
                      <img
                        src={getTemplateThumbnail(tpl.slug, tpl.category, tpl.price) || getTemplateThumbnail('classic-silver')}
                        alt={tpl.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition duration-500"
                      />
                      {/* Hover overlay with Eye icon */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition duration-200 flex items-center justify-center">
                        <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md">
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </span>
                      </div>
                    </a>

                    {/* Active/Draft tag badge */}
                    <div className="absolute top-3 left-3 flex gap-1 items-center z-10" onClick={(e) => e.stopPropagation()}>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 backdrop-blur-sm shadow-sm text-gray-850">
                        {tpl.category}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(tpl); }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${tpl.status === 'active'
                          ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                          : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200'
                          }`}
                      >
                        {tpl.status === 'active' ? 'Aktif' : 'Draf'}
                      </button>
                    </div>

                    {/* Deletions Trigger inside Cover */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition duration-200 flex gap-1 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(tpl); }}
                        className="p-1.5 bg-white/95 hover:bg-white text-blue-600 rounded-lg hover:text-blue-700 shadow transition"
                        title="Ubah Metadata"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id, tpl.name); }}
                        className="p-1.5 bg-white/95 hover:bg-white text-rose-600 rounded-lg hover:text-rose-700 shadow transition"
                        title="Hapus Dari Sistem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Meta information tags */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{tpl.name}</h4>
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">slug: {tpl.slug}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs font-bold text-primary-600">
                          Rp {tpl.price?.toLocaleString('id-ID')}
                        </span>

                        {/* Interactive live preview frame preview button */}
                        <a
                          href={tpl.preview_url?.startsWith('http') ? tpl.preview_url : `/preview/${tpl.slug || 'classic'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            localStorage.setItem(`draft_template_${tpl.slug || 'classic'}`, JSON.stringify(tpl));
                          }}
                          className="text-xs font-bold bg-gray-55 hover:bg-primary-50 text-gray-750 hover:text-primary-600 transition px-3 py-1.5 rounded-lg border border-gray-150 hover:border-primary-100 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Metadata Modal Dialog */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary-500" />
                Ubah Metadata Template
              </h3>
              <button
                onClick={() => setEditingTemplate(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
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
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Kategori</label>
                <select
                  value={editingCategory}
                  onChange={(e) => setEditingCategory(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:border-primary-500 focus:outline-none bg-white font-semibold"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Harga (IDR)</label>
                <input
                  type="number"
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(Number(e.target.value))}
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20 font-bold"
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

            <div className="flex gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpdateTemplate}
                className="flex-1 px-4 py-2 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Sibling Preview Modal matching DashboardOverview.tsx and Invitations.tsx exactly */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-250 bg-black/50">
          {/* Backdrop layer */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-zoom-out"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPreviewTemplate(null);
            }}
          />

          {/* Modal Content Container */}
          <div
            className={`relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-150 w-full h-[90vh] flex flex-col transition-all duration-300 z-10 cursor-default animate-in zoom-in-95 ${previewTab === 'jsx'
              ? 'max-w-5xl'
              : previewDevice === 'mobile'
                ? 'max-w-[420px]'
                : 'max-w-7xl'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{previewTemplate.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md">
                      {previewTemplate.category}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      slug: {previewTemplate.slug}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* View Mode Tabs: UI Preview vs JSX Code */}
                <div className="flex items-center gap-1 bg-gray-200 p-1.5 rounded-xl border border-gray-300">
                  <button
                    onClick={() => setPreviewTab('ui')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${previewTab === 'ui'
                      ? 'bg-white text-gray-950 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                      }`}
                    title="Tampilan UI Undangan"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Tampilan Undangan</span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('jsx')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${previewTab === 'jsx'
                      ? 'bg-white text-gray-950 shadow-sm'
                      : 'text-gray-500 hover:text-gray-100'
                      }`}
                    title="Lihat Kode Sumber React .JSX"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Kode Sumber (.jsx)</span>
                  </button>
                </div>

                {/* Device Selector (Visible only on UI Preview tab) */}
                {previewTab === 'ui' && (
                  <div className="flex items-center gap-1 bg-gray-200 p-1.5 rounded-xl border border-gray-300">
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg transition ${previewDevice === 'mobile'
                        ? 'bg-white text-gray-950 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                      title="Pratinjau Smartphone"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg transition ${previewDevice === 'desktop'
                        ? 'bg-white text-gray-950 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                      title="Pratinjau Desktop"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="h-6 w-px bg-gray-200 mx-1 md:block hidden" />

                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold px-3 py-2 rounded-xl transition"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>

            {/* Simulated Frame Canvas viewport block clicking */}
            <div className={`flex-1 overflow-hidden flex flex-col ${previewTab === 'ui' ? 'bg-white p-0' : 'bg-gray-50 p-4 sm:p-6'}`}>
              {previewTab === 'jsx' ? (
                // Beautiful Full IDE style code viewer of the JSX template
                <div className="w-full h-full bg-[#18181b] rounded-2xl border border-zinc-800 shadow-xl flex flex-col overflow-hidden relative font-mono text-xs select-text">
                  <div className="bg-zinc-900/90 px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5 mr-2">
                        <div className="w-3 h-3 bg-red-500/40 rounded-full" />
                        <div className="w-3 h-3 bg-yellow-500/40 rounded-full" />
                        <div className="w-3 h-3 bg-green-500/40 rounded-full" />
                      </div>
                      <span className="text-zinc-400 font-mono text-[11px] bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/50 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#7c8d76]" />
                        {previewTemplate.slug || 'template'}.jsx
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const code = previewTemplate.jsx_code || getDefaultJsxCodeForCategory(previewTemplate.category || 'Classic', previewTemplate.name || 'Untitled');
                          navigator.clipboard.writeText(code);
                          // Show ephemeral state
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-sans font-bold text-xs px-3 py-1.5 rounded-lg transition-all duration-150 inline-flex items-center gap-1.5 border border-zinc-700/60"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Kode</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-auto text-zinc-300 leading-relaxed text-left whitespace-pre select-text bg-[#121214]">
                    {/* Code print line container */}
                    <div className="flex gap-4">
                      {/* Live line number column */}
                      <div className="text-zinc-650 text-right select-none pr-3 border-r border-[#2d2d30] text-[11px] space-y-0.5">
                        {Array.from({ length: (previewTemplate.jsx_code || getDefaultJsxCodeForCategory(previewTemplate.category || 'Classic', previewTemplate.name || 'Untitled')).split('\n').length }).map((_, idx) => (
                          <div key={idx} className="h-[18px] text-zinc-550">{idx + 1}</div>
                        ))}
                      </div>

                      {/* Code body code syntax wrapper */}
                      <div className="text-[12px] font-mono text-zinc-300 space-y-0.5">
                        {(previewTemplate.jsx_code || getDefaultJsxCodeForCategory(previewTemplate.category || 'Classic', previewTemplate.name || 'Untitled')).split('\n').map((line, idx) => {
                          // Simple client side JSX syntax styling matching professional editors
                          return (
                            <div key={idx} className="h-[18px]" dangerouslySetInnerHTML={{
                              __html: line
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/\b(import|export|default|const|let|var|return|function|if|else|typeof|from|class|interface|type|extends|as)\b/g, '<span style="color: #f472b6;">$1</span>')
                                .replace(/\b(useState|useEffect|useRef|useMemo|useCallback)\b/g, '<span style="color: #60a5fa;">$1</span>')
                                .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color: #a7f3d0;">$1</span>')
                                .replace(/(\/\/.*)/g, '<span style="color: #a1a1aa; font-style: italic;">$1</span>')
                                .replace(/\b(React|RusticInvitation|MinimalistInvitation|IslamicInvitation|ClassicInvitation|Smartphone|Heart|Calendar|MapPin|Copy|MailOpen)\b/g, '<span style="color: #fbbf24;">$1</span>')
                            }} />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Clean edge-to-edge borderless live preview iframe
                <div className="w-full h-full flex-1" onClick={(e) => e.stopPropagation()}>
                  <iframe
                    src={
                      previewTemplate.preview_url?.startsWith('http')
                        ? previewTemplate.preview_url
                        : `/preview/${previewTemplate.slug || 'classic'}`
                    }
                    className="w-full h-full border-0"
                    title="Live Sandbox View"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full screen Drag & Drop Overlay */}
      {globalDragActive && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current = 0;
            setGlobalDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current = 0;
            setGlobalDragActive(false);
            if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
              handleFileSelected(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => {
            dragCounter.current = 0;
            setGlobalDragActive(false);
          }}
          className="fixed inset-0 bg-primary-600/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-200 cursor-pointer pointer-events-auto"
        >
          {/* Escape close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dragCounter.current = 0;
              setGlobalDragActive(false);
            }}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition pointer-events-auto"
            title="Batal Sesi Unggah"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="border-4 border-dashed border-white/60 rounded-[40px] p-12 max-w-lg w-full text-center flex flex-col items-center justify-center space-y-4 pointer-events-none">
            <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-white mb-2">
              <Upload className="w-10 h-10 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">Lepaskan File Untuk Mengimpor!</h3>
            <p className="text-white/80 text-sm">
              Lepaskan file arsip <span className="font-mono bg-white/25 px-1.5 py-0.5 rounded text-white font-bold">.zip</span>, konfigurasi <span className="font-mono bg-white/25 px-1.5 py-0.5 rounded text-white font-bold">.json</span>, atau komponen <span className="font-mono bg-white/25 px-1.5 py-0.5 rounded text-white font-bold">.jsx</span> Anda di mana saja untuk memulai impor paket template.
            </p>
            <p className="text-white/60 text-xs mt-2">Atau klik / ketuk di mana saja untuk membatalkan</p>
          </div>
        </div>
      )}
    </div>
  );
}
