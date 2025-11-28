'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login gagal');
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF] p-4">
      {/* Login card */}
      <div className="relative bg-white p-8 md:p-12 rounded-3xl shadow-xl w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/Frame 5.png"
              alt="EmoClass Logo"
              width={400}
              height={120}
              priority
              unoptimized
              className="object-contain w-auto h-auto max-w-[300px]"
            />
          </div>
          <p className="text-gray-400 text-base">Sistem Monitoring Emosi Siswa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                placeholder="admin@emoclass.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              🔒 Akun hanya dapat dibuat oleh administrator
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span>Default:</span>
              <span className="text-gray-600">admin@emoclass.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
