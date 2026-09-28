'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sprout, Database, ShieldCheck, Activity, BarChart3, 
  Layers, ArrowRight, CheckCircle2, ChevronRight, 
  Sparkles, FileText, Cpu, Compass, Wheat, Droplets, Landmark
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleQuickLogin = async (role: 'farmer' | 'admin' | 'officer') => {
    setLoadingRole(role);
    const credentials = {
      farmer: { email: 'ravi.kumar@agripulse.com', password: 'Farmer@123', redirect: '/farmer/dashboard' },
      admin: { email: 'admin@agripulse.com', password: 'Admin@123', redirect: '/admin/dashboard' },
      officer: { email: 'dr.sharma@agripulse.com', password: 'Officer@123', redirect: '/farmer/advisories' }
    }[role];

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email, password: credentials.password })
      });
      const data = await res.json();
      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('agri_user', JSON.stringify(data.user));
          localStorage.setItem('agri_token', data.token);
        }
        router.push(credentials.redirect);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-emerald-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-green-700 bg-clip-text text-transparent">
                AgriPulse
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                DBMS Level 3
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <a href="#architecture" className="hover:text-emerald-700 transition">Dual-Database Architecture</a>
            <a href="#modules" className="hover:text-emerald-700 transition">Modules</a>
            <a href="#dbms-features" className="hover:text-emerald-700 transition">DBMS Features</a>
            <Link href="/admin/database-demo" className="text-emerald-700 font-semibold flex items-center hover:text-emerald-800">
              <Database className="w-4 h-4 mr-1 text-emerald-600" /> Evaluation Console
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 transition flex items-center"
            >
              Register Farmer <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Production-Quality DBMS Level 3 Experiential Learning System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Agriculture Resource &amp; <br />
              <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-amber-600 bg-clip-text text-transparent">
                Farm Management System
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              A comprehensive full-stack agricultural platform integrating <strong>PostgreSQL</strong> for ACID-compliant structured farm ledgers &amp; triggers alongside <strong>MongoDB</strong> for polymorphic agronomic observations &amp; knowledge advisories.
            </p>

            {/* Quick Demo Access Buttons for Faculty Evaluation */}
            <div className="pt-4 p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-lg shadow-emerald-500/5 max-w-2xl mx-auto">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                1-Click Quick Demo Access (For College Faculty / Evaluation)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleQuickLogin('farmer')}
                  disabled={loadingRole !== null}
                  className="px-4 py-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-left transition group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>Farmer Portal</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Ravi Kumar (5 Acres)</div>
                </button>

                <button
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loadingRole !== null}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-left transition group shadow-md"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>Admin Console</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">Full System Governance</div>
                </button>

                <Link
                  href="/admin/database-demo"
                  className="px-4 py-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-left transition group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>DBMS Demo Lab</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-[11px] text-amber-700/80 mt-1">Queries, Triggers &amp; Views</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Database Architecture Showcase */}
      <section id="architecture" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Dual-Database Architecture</h2>
            <p className="text-slate-600 mt-2">
              Why two databases are essential: Real-world agricultural informatics requires both relational consistency and document flexibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PostgreSQL Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-100 relative shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                  SQL
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">PostgreSQL</h3>
                  <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Structured Relational Core</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Enforces strict relational ACID compliance, foreign key integrity, check constraints, automatic audit triggers, analytical views, and inventory deduction transactions.
              </p>
              <div className="space-y-2.5">
                {[
                  '13 Normalized Relational Tables (Users, Farms, Fields, Crops, Expenses, Harvests)',
                  'ACID Transactions: Atomic Fertilizer Usage & Inventory Deduction',
                  'PL/pgSQL Triggers: Revenue auto-calc & Crop status lifecycle auditing',
                  '4 Analytical Views for Multi-Table Financial & Yield Reporting',
                  '10 B-Tree Performance Indexes for Sub-Millisecond Queries'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* MongoDB Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100 relative shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
                  NoSQL
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">MongoDB</h3>
                  <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Polymorphic Agronomic Store</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Stores flexible agricultural documents where morphological attributes vary per crop (e.g. Tomato leaf chlorosis vs Rice water depth) and multi-level agronomic advisories.
              </p>
              <div className="space-y-2.5">
                {[
                  'Dynamic Crop Observations: Zero schema alterations for new crop metrics',
                  'Agricultural Advisory Knowledge Base with nested biological/chemical recommendations',
                  'Multi-Criteria & Full-Text Symptom Query Engine',
                  'MongoDB Aggregation Pipelines: $match, $group, $unwind, $facet',
                  'Time-Series Sensor Weather & Micro-Climate Records'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section id="modules" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Comprehensive Agricultural Modules</h2>
            <p className="text-slate-600 mt-2">
              Every feature is backed by real database constraints, foreign keys, and analytical views.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Landmark, title: 'Farm & Field Topology', desc: 'Manage farms, parcels, soil classification, and irrigation infrastructure.' },
              { icon: Wheat, title: 'Crop Lifecycle Schedules', desc: 'Track crop cycles from sowing through harvest with automated status auditing.' },
              { icon: Layers, title: 'Resource & Inventory Control', desc: 'Warehouse tracking with atomic stock deductions and reorder threshold alerts.' },
              { icon: Droplets, title: 'Irrigation & Hydrology', desc: 'Log water volumes, duration, and methods with crop-wise consumption analytics.' },
              { icon: BarChart3, title: 'Financial Ledger & Profits', desc: 'Categorized farm expenses and automated harvest revenue calculation.' },
              { icon: Activity, title: 'Dynamic Crop Observations', desc: 'MongoDB polymorphic scouting journals tailored per crop variety.' },
              { icon: Compass, title: 'Agronomic Advisory Base', desc: 'Symptom-based knowledge search with pest management protocols.' },
              { icon: ShieldCheck, title: 'Role-Based Authorization', desc: 'Granular privileges for Farmers, Agricultural Officers, and Administrators.' },
              { icon: Database, title: 'DBMS Evaluation Console', desc: 'Live SQL query runner, transaction tester, trigger inspector, and views.' },
            ].map((mod, i) => (
              <div key={i} className="p-6 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition group">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <mod.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{mod.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">AgriPulse Farm DBMS</span>
            <span>- DBMS Level 3 Experiential Learning Project</span>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-6">
            <Link href="/admin/database-demo" className="hover:text-emerald-700 font-medium">DBMS Demo Lab</Link>
            <Link href="/login" className="hover:text-emerald-700 font-medium">Farmer Login</Link>
            <Link href="/login" className="hover:text-emerald-700 font-medium">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
