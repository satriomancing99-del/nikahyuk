import { Link, useNavigate } from 'react-router-dom';
import { useState, FormEvent, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, initialized, signIn } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && user && profile) {
      if (profile.role === 'super_admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true }); // Customer admin dashboard
      }
    }
  }, [user, profile, initialized, navigate]);



  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      
      // onAuthStateChange or signIn in authStore will handle profile fetching. 
      // Manually trigger redirect to dashboard to ensure we don't get stuck in loading
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err.message);
      let errorMsg = err.message || 'Gagal login, periksa kembali email dan password Anda.';
      
      if (err.message.includes('Email not confirmed')) {
        errorMsg = 'Email belum dikonfirmasi. Silakan cek email Anda atau nonaktifkan "Confirm Email" di profil Supabase (Authentication > Providers > Email).';
      } else if (err.message.includes('Invalid login credentials') || err.message.includes('Email atau password salah')) {
        errorMsg = 'Email atau password salah. Pastikan kredensial benar dan Anda sudah mendaftar.';
      }
      
      setError(errorMsg);
      setLoading(false);
    }
  };

  if (!initialized || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Selamat Datang</h1>
        <p className="text-gray-600">Masuk ke akun NikahYuk! Anda.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}



      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Lupa password?</a>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-600">
        Belum punya akun?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}
