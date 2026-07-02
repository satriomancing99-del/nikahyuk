import { Link, useNavigate } from 'react-router-dom';
import { useState, FormEvent, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, initialized, signUp } = useAuthStore();
  
  const [name, setName] = useState('');
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
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, initialized, navigate]);




  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signUp(email, password, name);
      
      setError("Registrasi berhasil! Silakan masuk ke akun Anda.");
      setLoading(false);
      navigate('/login');
      return;

    } catch (err: any) {
      console.error('Register error:', err.message);
      setError(err.message || 'Terjadi kesalahan saat pendaftaran.');
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
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Buat Akun</h1>
        <p className="text-gray-600">Gabung NikahYuk! dan buat undangan impianmu.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}



      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="name">
            Nama Lengkap
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
            placeholder="John Doe"
          />
        </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
            placeholder="Minimal 8 karakter"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Daftar Sekarang'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-600">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
