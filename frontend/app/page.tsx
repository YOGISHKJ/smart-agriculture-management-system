'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout, Layers, Wheat, Droplets, FlaskConical, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('agri_token');
      if (token) {
        router.push('/farmer/dashboard');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#f8faf7] via-[#f0f7ef] to-[#e8f3e7]">
      {/* Header */}
      <header className="px-6 lg:px-12 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900">AgriPulse</span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-700">Farm Management Suite</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white/80 backdrop-blur rounded-xl border border-slate-200 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold border border-emerald-300/80 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Precision Agriculture &amp; Farm Resource Ledger</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl">
          Empowering Farmers with <span className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 bg-clip-text text-transparent">Data-Driven Insights</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl">
          Unified parcel mapping, crop cultivation tracking, precision irrigation monitoring, and fertilizer cost optimization.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center space-x-2"
          >
            <span>Open Farmer Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-800 font-bold text-sm rounded-xl border border-slate-300 hover:bg-slate-50 transition flex items-center justify-center"
          >
            Register Account
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 w-full text-left">
          <div className="p-5 rounded-2xl bg-white/90 border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Fields &amp; Parcels</h3>
            <p className="text-xs text-slate-500 mt-1">Track land area, soil categorization, and dedicated irrigation topology.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/90 border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Wheat className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Crop Cultivation</h3>
            <p className="text-xs text-slate-500 mt-1">Manage sowing, expected harvest schedules, seed quantities, and life cycle status.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/90 border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Irrigation Logs</h3>
            <p className="text-xs text-slate-500 mt-1">Record water liters, duration, and irrigation methods with per-crop aggregation.</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/90 border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Fertilizer Ledger</h3>
            <p className="text-xs text-slate-500 mt-1">Audit chemical, organic and bio-fertilizer quantities, costs, and application methods.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-200/80 text-center text-xs text-slate-500 bg-white/40">
        <p>AgriPulse Precision Agriculture System &bull; Express REST API &bull; PostgreSQL 16 &bull; Next.js 14 App Router</p>
      </footer>
    </div>
  );
}
