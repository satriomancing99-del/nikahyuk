import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, Check, HelpCircle, ArrowRight, ShieldCheck, Zap, Award, ChevronDown, ChevronUp, Palette
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function PublicPricing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Set document title for best-in-class SEO
  React.useEffect(() => {
    document.title = 'Daftar Harga & Paket Undangan Digital | NikahYuk!';
  }, []);

  // FAQ state toggle
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const pricingTiers = [
    {
      name: 'Paket Silver',
      price: 49000,
      icon: Zap,
      desc: 'Pilihan paling ekonomis untuk undangan pernikahan simpel, cepat, dan tetap terlihat elegan.',
      colorClass: 'text-slate-400 bg-slate-50 border-slate-100',
      btnClass: 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700',
      features: [
        'Masa aktif undangan 3 Bulan',
        'Kuota Tamu: Hingga 150 Kontak',
        'Akses Desain: Template Kategori Silver',
        'Galeri foto hemat (Maks 3 Foto)',
        'Lagu latar belakang (BGM) Standar',
        'Konfirmasi kehadiran (RSVP) standar',
        'Dinding Buku Tamu (Tanpa moderasi)',
        'Mendukung Tautan Personal Tamu'
      ],
      tag: 'Starter'
    },
    {
      name: 'Paket Gold',
      price: 99000,
      icon: Award,
      desc: 'Pilihan terbaik dan paling disukai calon pengantin dengan integrasi kado digital lengkap dan kuota tamu memadai.',
      colorClass: 'text-primary-600 bg-primary-50/50 border-primary-100',
      btnClass: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-100',
      features: [
        'Masa aktif undangan 6 Bulan',
        'Kuota Tamu: Hingga 500 Kontak',
        'Akses Desain: Template Silver & Gold',
        'Galeri foto responsif (Maks 8 Foto)',
        'Upload Lagu MP3 kustom sendiri',
        'Galeri Video kustom (YouTube Embed)',
        'Buku Tamu dengan Fitur Moderasi spam',
        'Locked-input Nama Tamu (Sesuai VCF/CSV)'
      ],
      tag: 'Terpopuler',
      recommended: true
    },
    {
      name: 'Paket Platinum',
      price: 149000,
      icon: ShieldCheck,
      desc: 'Kemewahan tanpa batas dengan masa aktif panjang, bebas iklan merek, dan pengelolaan tamu kuota tak terbatas.',
      colorClass: 'text-amber-600 bg-amber-50/50 border-amber-100',
      btnClass: 'bg-slate-900 hover:bg-slate-800 text-white shadow-md',
      features: [
        'Masa aktif undangan 1 Tahun (12 Bulan)',
        'Kuota Tamu: TANPA BATAS (Unlimited)',
        'Akses Desain: Semua Template (VIP)',
        'Galeri foto premium (Maks 12 Foto)',
        'Bebas Iklan logo platform NikahYuk!',
        'Upload Lagu MP3 & Rekaman Suara kustom',
        'Halaman RSVP Premium terintegrasi Dashboard',
        'Pengelolaan tamu via Impor Kontak VCF/CSV'
      ],
      tag: 'Eksklusif'
    }
  ];

  const faqs = [
    {
      q: 'Apakah saya bisa mengubah data undangan setelah melakukan pembayaran?',
      a: 'Tentu saja! Anda memiliki kebebasan penuh untuk mengubah nama mempelai, tanggal acara, lokasi Maps, lagu pengiring, maupun foto galeri sepuasnya kapan saja melalui Dasbor Akun Anda tanpa biaya tambahan.'
    },
    {
      q: 'Bagaimana cara kustomer mengaktifkan paket undangan setelah membeli?',
      a: 'Proses aktivasi sangat mudah. Setelah memilih paket dan melakukan pendaftaran akun, Anda cukup mengunggah bukti transfer bank atau pembayaran e-wallet Anda di halaman Transaksi Dasbor. Sistem admin kami akan melakukan verifikasi instan dalam hitungan menit.'
    },
    {
      q: 'Apakah ada batasan jumlah tamu undangan yang bisa dikirimi tautan?',
      a: 'Sama sekali tidak ada batasan! Anda bebas membagikan link personal tamu undangan pernikahan Anda kepada ratusan bahkan ribuan kerabat, keluarga besar, dan teman sejawat Anda secara gratis.'
    },
    {
      q: 'Apa itu fitur Locked-Input Nama Tamu pada Paket Gold & Platinum?',
      a: 'Ini adalah fitur keamanan database eksklusif dari NikahYuk!. Saat tamu Anda mengeklik link undangan pribadi mereka, kolom Nama pada form RSVP dan Buku Tamu akan terkunci secara otomatis. Hal ini mencegah pengisian data acak, menjaga orisinalitas ucapan, serta mempermudah analisis kehadiran di dashboard Anda.'
    },
    {
      q: 'Bagaimana sistem kado digital (e-gift) bekerja?',
      a: 'Undangan Anda akan menampilkan bagian khusus kado digital yang berisi nomor rekening bank (seperti BCA, Mandiri, dll) atau nomor e-wallet (seperti GoPay, OVO, Dana) Anda beserta tombol salin instan. Tamu juga dapat mengirimkan kado fisik dengan melihat alamat rumah kustom yang Anda sematkan.'
    }
  ];

  const handleSelectPackage = (packageName: string) => {
    const slug = packageName.toLowerCase().split(' ').pop(); // 'silver', 'gold', 'platinum'
    if (user) {
      navigate(`/dashboard/invitations/create?package=${slug}`);
    } else {
      navigate(`/register?package=${slug}`);
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
              <Link to="/templates" className="text-gray-500 hover:text-gray-900 font-medium transition">Katalog Template</Link>
              <Link to="/pricing" className="text-primary-600 font-bold transition">Daftar Harga</Link>
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

      {/* 2. Page Content */}
      <main className="flex-grow pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12">
        
        {/* Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-500/5 via-primary-500/5 to-indigo-500/5 border border-primary-100 p-8 sm:p-12 shadow-sm text-center max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 font-bold text-xs ring-1 ring-primary-100 mx-auto">
            <Award className="w-3.5 h-3.5" />
            <span>Investasi Terbaik untuk Pernikahan Sakral Anda</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Pilihan Paket <span className="text-primary-600 italic">Sekali Bayar</span>, Tanpa Biaya Tersembunyi
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Pilih paket pembuatan undangan digital yang paling sesuai dengan kebutuhan perayaan cinta Anda. Bebas edit sepuasnya kapan saja.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingTiers.map((tier, idx) => {
            const IconComponent = tier.icon;
            return (
              <div 
                key={idx} 
                className={`bg-white rounded-3xl border shadow-sm transition flex flex-col justify-between relative overflow-hidden ${
                  tier.recommended 
                    ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-20 scale-102 z-10 md:-translate-y-2' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Recommended Tag */}
                {tier.recommended && (
                  <span className="absolute top-4 right-4 bg-primary-500 text-white text-[9px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full shadow-sm">
                    {tier.tag}
                  </span>
                )}
                
                {/* Header pricing details */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="space-y-2">
                    {!tier.recommended && (
                      <span className="bg-slate-100 text-slate-600 text-[9px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full inline-block">
                        {tier.tag}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tier.colorClass}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-lg leading-none">{tier.name}</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                      {tier.desc}
                    </p>
                  </div>

                  <div className="border-t border-b border-slate-100 py-4 flex items-baseline gap-1">
                    <span className="text-xs font-bold text-gray-400">Rp</span>
                    <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                      {tier.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs font-semibold text-gray-450 ml-1">/ sekali bayar</span>
                  </div>

                  {/* Bullet features list */}
                  <ul className="space-y-3">
                    {tier.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card footer CTA button */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                  <button
                    onClick={() => handleSelectPackage(tier.name)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${tier.btnClass}`}
                  >
                    Pilih {tier.name} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm max-w-5xl mx-auto space-y-6">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-gray-900">Perbandingan Detail Fitur Paket</h3>
            <p className="text-xs text-gray-400 mt-0.5">Analisis perbedaan kelengkapan modul di setiap paket NikahYuk! digital.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 font-bold text-gray-400 uppercase tracking-wide text-[10px]">Modul Aplikasi</th>
                  <th className="py-3 px-4 font-bold text-slate-700 text-center">Silver</th>
                  <th className="py-3 px-4 font-bold text-primary-600 text-center">Gold (Rekomendasi)</th>
                  <th className="py-3 px-4 font-bold text-amber-600 text-center">Platinum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-slate-650">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Masa Aktif Undangan</td>
                  <td className="py-3 px-4 text-center">3 Bulan</td>
                  <td className="py-3 px-4 text-center text-primary-600 font-bold bg-primary-50/10">6 Bulan</td>
                  <td className="py-3 px-4 text-center text-amber-600 font-bold bg-amber-50/10">1 Tahun (12 Bulan)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Kuota Kontak Tamu</td>
                  <td className="py-3 px-4 text-center">Hingga 150 Tamu</td>
                  <td className="py-3 px-4 text-center text-primary-600 font-bold bg-primary-50/10">Hingga 500 Tamu</td>
                  <td className="py-3 px-4 text-center text-amber-600 font-bold bg-amber-50/10">Tanpa Batas (Unlimited)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Kustom Lagu MP3</td>
                  <td className="py-3 px-4 text-center text-gray-300">—</td>
                  <td className="py-3 px-4 text-center text-primary-600 font-bold bg-primary-50/10">Ya (Unggah MP3)</td>
                  <td className="py-3 px-4 text-center text-amber-600 font-bold bg-amber-50/10">Ya + Suara Sambutan</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Kapasitas Galeri Foto</td>
                  <td className="py-3 px-4 text-center">Maks 3 Foto</td>
                  <td className="py-3 px-4 text-center bg-primary-50/10">Maks 8 Foto</td>
                  <td className="py-3 px-4 text-center bg-amber-50/10">Maks 12 Foto</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Integrasi Kado Digital (E-Gift)</td>
                  <td className="py-3 px-4 text-center text-gray-300">—</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-primary-50/10">Ya (Rek & E-Wallet)</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-amber-50/10">Ya (Rek, E-Wallet & Kado)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Keamanan Tautan Tamu (Locked Name)</td>
                  <td className="py-3 px-4 text-center text-gray-300">—</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-primary-50/10">Ya (Terkunci Otomatis)</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-amber-50/10">Ya (Terkunci Otomatis)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Bebas Iklan Platform</td>
                  <td className="py-3 px-4 text-center text-gray-300">—</td>
                  <td className="py-3 px-4 text-center text-gray-300 bg-primary-50/10">—</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-amber-50/10">Ya (100% Bersih)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Impor Tamu Massal (VCF/CSV)</td>
                  <td className="py-3 px-4 text-center text-gray-300">—</td>
                  <td className="py-3 px-4 text-center text-gray-300 bg-primary-50/10">—</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-amber-50/10">Ya (Impor Kontak Asisten)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-serif font-bold text-gray-900">Pertanyaan yang Sering Diajukan</h3>
            <p className="text-xs text-gray-400 mt-1">Dapatkan jawaban cepat terkait transaksi dan aktivasi undangan pernikahan Anda.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    type="button"
                    className="w-full text-left p-5 flex items-center justify-between font-bold text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 flex-shrink-0 ml-4">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-primary-500" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-slate-50 bg-slate-50/30 text-xs sm:text-sm leading-relaxed text-gray-500 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* 3. Simple Footer */}
      <footer className="bg-white py-10 border-t border-gray-150 text-center w-full">
        <p className="text-gray-400 text-xs font-semibold">© 2026 NikahYuk! All rights reserved.</p>
      </footer>

    </div>
  );
}
