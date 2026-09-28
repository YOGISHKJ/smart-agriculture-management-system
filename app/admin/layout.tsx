'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldCheck, LayoutDashboard, Users, Landmark, Wheat, 
  Package, HelpCircle, BarChart3, Database, LogOut, Menu, X, ArrowLeft
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
  { href: '/admin/database-demo', label: 'DBMS Evaluation Lab', icon: Database, highlight: true },
  { href: '/admin/users', label: 'User Governance', icon: Users },
  { href: '/admin/analytics', label: 'System Analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agri_user');
      if (stored) {
        try {
          setAdminUser(JSON.parse(stored));
        } catch (e) {}
      } else {
        setAdminUser({ name: 'System Administrator', email: 'admin@agripulse.com' });
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('agri_user');
        localStorage.removeItem('agri_token');
      }
      router.push('/login');
    } catch (e) {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-950 border-r border-slate-800 sticky top-0 h-screen z-30">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 justify-between">
          <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">AgriPulse</span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-400">Admin Console</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : item.highlight
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-amber-400 text-slate-950 rounded">
                    Lab
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800">
            <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Cross-Portal Switcher
            </span>
            <Link
              href="/farmer/dashboard"
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Switch to Farmer Portal</span>
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{adminUser?.name || 'System Administrator'}</p>
            <p className="text-[10px] text-emerald-400 truncate font-mono">{adminUser?.email || 'admin@agripulse.com'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-medium text-slate-400">
              System State: <span className="font-semibold text-emerald-400">Dual Database Active (PostgreSQL + MongoDB)</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/database-demo"
              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition flex items-center"
            >
              <Database className="w-3.5 h-3.5 mr-1" />
              <span>DBMS Evaluation Lab</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
