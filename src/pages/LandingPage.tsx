import { Link } from 'react-router-dom';
import { Heart, Palette, Smartphone, Users, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function LandingPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary-500" fill="currentColor" />
              <span className="text-2xl font-bold text-gray-900 tracking-tight">NikahYuk!</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#fitur" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Fitur</a>
              <Link to="/templates" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Template</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Harga</Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-md text-sm"
                >
                  Dashboard Saya
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors hidden sm:block">Masuk</Link>
                  <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-sm hover:shadow-md">
                    Buat Undangan
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-8 ring-1 ring-primary-100">
            <span>Platform Undangan Digital No. 1</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 tracking-tight mb-6 leading-tight">
            Bagikan momen bahagia dengan <span className="text-primary-600 italic">cara elegan</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Buat undangan digital, kelola daftar tamu pengantin, dan terima RSVP serta ucapan dalam satu platform yang mudah digunakan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-medium text-lg transition-all">
              Mulai Gratis <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/templates" className="w-full sm:w-auto flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-4 rounded-full font-medium text-lg transition-all">
              Lihat Template
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fitur" className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Fitur Lengkap untuk Pernikahan Anda</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Semua yang Anda butuhkan untuk mengatur undangan pernikahan impian.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
             {[
               { icon: Smartphone, title: 'Responsif & Modern', desc: 'Tampilan undangan yang sempurna di perangkat mobile maupun desktop.' },
               { icon: Users, title: 'Manajemen Tamu', desc: 'Kelola daftar tamu, konfirmasi kehadiran RSVP, dan kiriman ucapan selamat secara digital.' },
               { icon: Palette, title: 'Multi Template Premium', desc: 'Pilih dari puluhan desain template eksklusif yang bisa disesuaikan.' }
             ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                   <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-6">
                      <feature.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                   <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
             ))}
          </div>
        </div>
      </section>
      
      {/* Simple Footer */}
      <footer className="bg-white py-12 border-t border-gray-100 text-center">
         <p className="text-gray-500 font-medium">© 2026 NikahYuk! All rights reserved.</p>
      </footer>
    </div>
  );
}
