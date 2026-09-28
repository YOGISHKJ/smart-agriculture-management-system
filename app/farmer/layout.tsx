'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Sprout, LayoutDashboard, Landmark, Layers, Wheat, CalendarDays,
  Activity, Package, DollarSign, Droplets, Trophy, FileText,
  HelpCircle, LogOut, Menu, X, Database, ChevronRight, User
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/farmer/farms', label: 'My Farms', icon: Landmark },
  { href: '/farmer/fields', label: 'Fields & Parcels', icon: Layers },
  { href: '/farmer/crops', label: 'Crop Catalog', icon: Wheat },
  { href: '/farmer/crop-cycles', label: 'Crop Cycles', icon: CalendarDays },
  { href: '/farmer/activities', label: 'Farming Activities', icon: Activity },
  { href: '/farmer/resources', label: 'Inventory & Stock', icon: Package },
  { href: '/farmer/expenses', label: 'Expense Ledger', icon: DollarSign },
  { href: '/farmer/irrigation', label: 'Irrigation Logs', icon: Droplets },
  { href: '/farmer/harvests', label: 'Harvest & Revenue', icon: Trophy },
  { href: '/farmer/observations', label: 'Crop Observations (NoSQL)', icon: FileText, badge: 'MongoDB' },
  { href: '/farmer/advisories', label: 'Advisory Knowledge Base', icon: HelpCircle, badge: 'MongoDB' },
];

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; roleName: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agri_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {}
      } else {
        setUser({ name: 'Ravi Kumar', email: 'ravi.kumar@agripulse.com', roleName: 'FARMER' });
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
    <div className="min-h-screen flex bg-[#f8faf7]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200/80 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link href="/farmer/dashboard" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">AgriPulse</span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-emerald-700">Farmer Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/farmer/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* DBMS Evaluation Link & User profile */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <Link
            href="/admin/database-demo"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 transition"
          >
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-amber-600" />
              <span>DBMS Demo Lab</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user?.name ? user.name[0] : 'R'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'Ravi Kumar'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'ravi.kumar@agripulse.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 glass-panel sticky top-0 z-20 border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-medium text-slate-500">
              Active Enterprise: <span className="font-semibold text-emerald-800">Green Valley Farm (5.00 Acres)</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/database-demo"
              className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition flex items-center"
            >
              <Database className="w-3.5 h-3.5 mr-1 text-amber-600" />
              <span className="hidden sm:inline">DBMS Level 3 Lab</span>
            </Link>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>PostgreSQL + MongoDB Online</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white py-4 px-3 shadow-2xl">
              <div className="flex items-center justify-between px-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Sprout className="w-6 h-6 text-emerald-600" />
                  <span className="text-base font-bold text-slate-900">AgriPulse</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto mt-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                        isActive ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
