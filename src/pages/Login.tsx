import { Link, useNavigate } from 'react-router-dom';
import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, initialized } = useAuthStore();
  
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      console.error('Google sign in error:', err.message);
      setError(err.message || 'Gagal masuk dengan Google.');
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      // onAuthStateChange in authStore will handle profile fetching. 
      // Manually trigger redirect to dashboard to ensure we don't get stuck in loading
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err.message);
      let errorMsg = err.message || 'Gagal login, periksa kembali email dan password Anda.';
      
      if (err.message.includes('Email not confirmed')) {
        errorMsg = 'Email belum dikonfirmasi. Silakan cek email Anda atau nonaktifkan "Confirm Email" di profil Supabase (Authentication > Providers > Email).';
      } else if (err.message.includes('Invalid login credentials')) {
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
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
          <strong>Info Admin:</strong> Untuk mendapatkan akses Super Admin, silakan ke halaman Daftar dan gunakan email <code>admin@nikahyuk.com</code>.
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Google OAuth Sign-in Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Masuk dengan Google</span>
        </button>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">atau</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
      </div>

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
