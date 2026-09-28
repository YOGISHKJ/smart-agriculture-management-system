'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Landmark, Wheat, DollarSign, Trophy, 
  Package, Database, ShieldCheck, ArrowRight, BarChart3,
  CheckCircle2, TrendingUp
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/admin')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-400">Loading System-Wide PostgreSQL &amp; MongoDB Metrics...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span>DBMS Level 3 Central Governance Controller</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Administration &amp; Governance</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Global aggregation of relational ledgers (PostgreSQL) and agricultural document collections (MongoDB).
          </p>
        </div>

        <Link
          href="/admin/database-demo"
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/10 transition flex items-center self-start md:self-auto"
        >
          <Database className="w-4 h-4 mr-1.5" /> Launch DBMS Evaluation Console
        </Link>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Farmers</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.total_farmers || 2} <span className="text-xs font-semibold text-slate-500">Users</span></div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">{kpis.total_farms || 3} Farm holdings registered</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Cultivations</span>
            <Wheat className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.active_crop_cycles || 3} <span className="text-xs font-semibold text-slate-500">Cycles</span></div>
          <div className="mt-1 text-[11px] text-amber-400 font-medium">Across {kpis.total_fields || 6} field parcels</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross System Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">₹{(kpis.system_revenue || 0).toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-slate-400 font-medium">Net Profit: ₹{(kpis.system_net_profit || 0).toLocaleString()}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Inventory Stock Value</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{(kpis.inventory_valuation || 0).toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-blue-400 font-medium">Warehouse valuation</div>
        </div>
      </div>

      {/* Farm Performance Financial Matrix (SQL VIEW Simulation) */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Farm Performance &amp; Profitability Matrix</h2>
            <p className="text-xs text-slate-400">PostgreSQL Relational View: farm_performance_view</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Farm Name</th>
                <th className="py-3 px-3">Owner / Farmer</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-center">Area</th>
                <th className="py-3 px-3 text-right">Total Expenses</th>
                <th className="py-3 px-3 text-right">Gross Revenue</th>
                <th className="py-3 px-3 text-right">Net Profit</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(data?.farmPerformance || []).map((farm: any) => (
                <tr key={farm.farm_id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3 px-3 font-bold text-white">{farm.farm_name}</td>
                  <td className="py-3 px-3 text-slate-300">{farm.owner_name}</td>
                  <td className="py-3 px-3 text-slate-400">{farm.location}</td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-300">{farm.area} ac</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-400">₹{farm.expenses?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-semibold text-emerald-400">₹{farm.revenue?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-black text-emerald-400">₹{farm.profit?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {farm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
