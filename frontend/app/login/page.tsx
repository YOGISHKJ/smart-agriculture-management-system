'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout, Lock, Mail, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('farmer@agripulse.com');
  const [password, setPassword] = useState('Farmer@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.auth.login({ email, password });

      if (typeof window !== 'undefined') {
        localStorage.setItem('agri_token', data.token);
        localStorage.setItem('agri_user', JSON.stringify(data.user));
      }

      router.push('/farmer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (role: 'farmer' | 'admin') => {
    if (role === 'farmer') {
      setEmail('farmer@agripulse.com');
      setPassword('Farmer@123');
    } else {
      setEmail('admin@agripulse.com');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#f8faf7]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Sprout className="w-7 h-7" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-green-700 bg-clip-text text-transparent">
            AgriPulse
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Farmer Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Precision Farm Management &amp; Resource Ledger
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200/80">
          {/* Quick preset credentials for demo */}
          <div className="mb-6 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
            <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center">
              <KeyRound className="w-3.5 h-3.5 mr-1.5 text-emerald-700" /> Demo Credentials Quick-Select:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectDemo('farmer')}
                className={`px-3 py-2 rounded-lg border font-semibold transition ${
                  email === 'farmer@agripulse.com'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100/60'
                }`}
              >
                🌾 Demo Farmer
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('admin')}
                className={`px-3 py-2 rounded-lg border font-semibold transition ${
                  email === 'admin@agripulse.com'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                }`}
              >
                ⚙️ Demo Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  placeholder="farmer@agripulse.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Register new Farmer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
