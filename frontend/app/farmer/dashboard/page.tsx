'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Wheat,
  Droplets,
  FlaskConical,
  IndianRupee,
  TrendingUp,
  Plus,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { api, DashboardSummary } from '@/lib/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<{
    waterUsageOverTime: Array<{ date: string; liters: number; crops: string }>;
    fertilizerUsagePerCrop: Array<{ crop_name: string; total_kg: number; total_cost: number }>;
  }>({ waterUsageOverTime: [], fertilizerUsagePerCrop: [] });
  const [recentLogs, setRecentLogs] = useState<{ water: any[]; fertilizer: any[] }>({ water: [], fertilizer: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.dashboard.getSummary();
      setSummary(data.summary);
      setCharts(data.charts);
      setRecentLogs(data.recentLogs);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1 border border-emerald-200">
            <span>Live Farm Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Farm Management Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time overview of land parcels, active crop cultivation, water allocation, and fertilizer ledger.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/farmer/fields"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Field</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Error loading telemetry:</span> {error}
          </div>
          <button onClick={fetchDashboardData} className="ml-3 font-bold underline hover:text-rose-950">
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Fields */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Fields</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{loading ? '...' : summary?.totalFields ?? 0}</div>
            <p className="text-[10px] text-slate-500">Managed parcels</p>
          </div>
        </div>

        {/* Total Area */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Area</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {loading ? '...' : `${Number(summary?.totalArea || 0).toFixed(1)}`}
            </div>
            <p className="text-[10px] text-slate-500">Acres under cultiv.</p>
          </div>
        </div>

        {/* Active Crops */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Crops</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-900">{loading ? '...' : summary?.activeCrops ?? 0}</div>
            <p className="text-[10px] text-slate-500">In-ground crops</p>
          </div>
        </div>

        {/* Total Water Used */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Water Used</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-blue-900">
              {loading ? '...' : `${Number(summary?.totalWater || 0).toLocaleString()} L`}
            </div>
            <p className="text-[10px] text-slate-500">{summary?.totalWaterMinutes ?? 0} mins logged</p>
          </div>
        </div>

        {/* Total Fertilizer */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fertilizer</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-900">
              {loading ? '...' : `${Number(summary?.totalFertilizer || 0).toLocaleString()} kg`}
            </div>
            <p className="text-[10px] text-slate-500">Applied to crops</p>
          </div>
        </div>

        {/* Fertilizer Cost */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Input Cost</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-800">
              {loading ? '...' : `₹${Number(summary?.totalFertilizerCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-[10px] text-slate-500">Total nutrient spend</p>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Water Usage Over Time */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Water Consumption Timeline</h3>
                <p className="text-[11px] text-slate-500">Irrigation volume (Liters) recorded over time</p>
              </div>
            </div>
            <Link href="/farmer/water" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center">
              <span>View Logs</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="h-64 w-full pt-2">
            {charts.waterUsageOverTime.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No water usage data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.waterUsageOverTime} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} Liters`, 'Water']}
                  />
                  <Area type="monotone" dataKey="liters" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#waterGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Fertilizer Usage Per Crop */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Nutrient Application per Crop</h3>
                <p className="text-[11px] text-slate-500">Total fertilizer (kg) applied across crop varieties</p>
              </div>
            </div>
            <Link href="/farmer/fertilizer" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center">
              <span>View Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="h-64 w-full pt-2">
            {charts.fertilizerUsagePerCrop.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No fertilizer applications recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.fertilizerUsagePerCrop} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="crop_name" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(value: any, name: string) => [
                      name === 'total_kg' ? `${Number(value).toLocaleString()} kg` : `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      name === 'total_kg' ? 'Quantity' : 'Cost (₹)'
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="total_kg" name="Fertilizer (kg)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="total_cost" name="Cost (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/farmer/fields"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md transition flex items-center space-x-4"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900">Fields &amp; Parcels</h4>
            <p className="text-[11px] text-slate-500 truncate">Manage acreage &amp; soil types</p>
          </div>
        </Link>

        <Link
          href="/farmer/crops"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md transition flex items-center space-x-4"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Wheat className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900">Crop Cultivation</h4>
            <p className="text-[11px] text-slate-500 truncate">Sowing &amp; harvest schedules</p>
          </div>
        </Link>

        <Link
          href="/farmer/water"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md transition flex items-center space-x-4"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Droplets className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900">Irrigation Logs</h4>
            <p className="text-[11px] text-slate-500 truncate">Liters &amp; method records</p>
          </div>
        </Link>

        <Link
          href="/farmer/fertilizer"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md transition flex items-center space-x-4"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900">Fertilizer Ledger</h4>
            <p className="text-[11px] text-slate-500 truncate">Nutrient doses &amp; costs</p>
          </div>
        </Link>
      </div>

      {/* Recent Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Water Records */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Recent Irrigation Events
            </h3>
            <Link href="/farmer/water" className="text-xs font-bold text-emerald-700 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {recentLogs.water.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3">No irrigation logged yet.</p>
            ) : (
              recentLogs.water.map((w: any) => (
                <div key={w.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{w.crop_name}</span>
                    <span className="text-[11px] text-slate-500 block">{w.field_name} &bull; {w.method}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-700">{Number(w.liters).toLocaleString()} L</span>
                    <span className="text-[10px] text-slate-400 block">{w.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Fertilizer Records */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Recent Fertilizer Applications
            </h3>
            <Link href="/farmer/fertilizer" className="text-xs font-bold text-emerald-700 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {recentLogs.fertilizer.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3">No fertilizer applications logged yet.</p>
            ) : (
              recentLogs.fertilizer.map((f: any) => (
                <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{f.fertilizer_name}</span>
                    <span className="text-[11px] text-slate-500 block">{f.crop_name} ({f.field_name})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-purple-700">{Number(f.quantity_kg).toLocaleString()} kg</span>
                    <span className="text-[10px] text-slate-400 block">₹{Number(f.cost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} &bull; {f.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
