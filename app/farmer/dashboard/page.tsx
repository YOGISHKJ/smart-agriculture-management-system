'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Landmark, Layers, Wheat, DollarSign, Trophy, 
  Droplets, TrendingUp, Calendar, Activity, Plus,
  ArrowUpRight, AlertTriangle, CheckCircle2, ChevronRight,
  Sun, CloudRain, Wind, FileText
} from 'lucide-react';

export default function FarmerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/farmer')
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
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Querying PostgreSQL &amp; MongoDB Analytics...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white shadow-lg shadow-emerald-900/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 text-[11px] font-semibold">
            <span>Primary Operational Unit: Green Valley Farm</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Farmer Agronomic Dashboard
          </h1>
          <p className="text-xs text-emerald-100 max-w-xl">
            Real-time telemetry across land topology, crop cycles, atomic inventory deductions, financial ledgers, and dynamic MongoDB observations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/farmer/fields"
            className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 text-xs font-bold shadow-sm hover:bg-emerald-50 transition flex items-center"
          >
            <Layers className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Enter Field &amp; Crop Details
          </Link>
          <Link
            href="/farmer/activities"
            className="px-3.5 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 text-white text-xs font-bold border border-emerald-600/60 transition flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Log Activity
          </Link>
          <Link
            href="/farmer/observations"
            className="px-3.5 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 text-white text-xs font-bold border border-emerald-600/60 transition flex items-center"
          >
            <FileText className="w-3.5 h-3.5 mr-1" /> Dynamic Observation
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Acreage */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Farm Land</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.total_acres || 5.0} <span className="text-xs font-bold text-slate-500">Acres</span></div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">Across {kpis.total_farms || 1} farm holdings ({kpis.total_fields || 2} fields)</div>
        </div>

        {/* Active Cycles */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Crop Cycles</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis.active_crop_cycles || 1} <span className="text-xs font-bold text-slate-500">Cycles</span></div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">Cultivated under drip &amp; sprinkler</div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{(kpis.total_expenses || 0).toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">Labor, seed, fertilizer &amp; logistics</div>
        </div>

        {/* Net Profit */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{(kpis.net_estimated_profit || 0).toLocaleString()}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Revenue: ₹{(kpis.total_revenue || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Main Grid: Crop Cycles & Weather / Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Crop Cycles & Activities (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Cultivations Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Ongoing Cultivation Cycles</h2>
                <p className="text-xs text-slate-500">Tracked via PostgreSQL Relational State Engine</p>
              </div>
              <Link href="/farmer/crop-cycles" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center">
                View All Cycles <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.activeCycles || []).length > 0 ? (
                data.activeCycles.map((cycle: any) => (
                  <div key={cycle.cycle_id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{cycle.crop_name}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
                          {cycle.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Field: <span className="font-semibold text-slate-700">{cycle.field_name}</span> &bull; Sown: {cycle.sowing_date} &bull; Expected: {cycle.expected_harvest_date}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/farmer/crop-cycles`}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Manage Cycle
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">No active cycles in progress.</div>
              )}
            </div>
          </div>

          {/* Recent Activities Timeline */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Farming Activities</h2>
                <p className="text-xs text-slate-500">Field operations with labor hours &amp; costs</p>
              </div>
              <Link href="/farmer/activities" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center">
                Activity Log <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {(data?.recentActivities || []).map((act: any) => (
                <div key={act.activity_id} className="py-3 flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{act.activity_type} - {act.crop_name}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Date: {act.activity_date} &bull; Labor: {act.labour_hours} hrs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">₹{act.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets: Weather, MongoDB Observations (1 Col) */}
        <div className="space-y-6">
          {/* Micro-Climate Weather Context */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Local Micro-Climate</span>
              <Sun className="w-5 h-5 text-amber-400" />
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black">28.5°C</span>
              <span className="text-xs text-blue-200">Partly Sunny</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-blue-800/80 pt-3">
              <div>
                <span className="text-blue-300 block text-[10px]">Humidity</span>
                <span className="font-semibold">62% RH</span>
              </div>
              <div>
                <span className="text-blue-300 block text-[10px]">Watering Total</span>
                <span className="font-semibold">{(kpis.total_water_liters || 25000).toLocaleString()} L</span>
              </div>
            </div>
          </div>

          {/* MongoDB Crop Observations */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900">Crop Observations</h2>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                  MongoDB NoSQL
                </span>
              </div>
              <Link href="/farmer/observations" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                View All
              </Link>
            </div>

            <p className="text-[11px] text-slate-500 mb-4">
              Demonstrating dynamic schema polymorphism (different morphological attributes per crop).
            </p>

            <div className="space-y-3">
              {(data?.recentObservations || []).map((obs: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{obs.crop}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(obs.observation_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{obs.notes}</p>
                  {obs.dynamic_attributes && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {Object.entries(obs.dynamic_attributes).slice(0, 3).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-white text-[10px] text-slate-600 border border-slate-200">
                          {k.replace(/_/g, ' ')}: <strong className="text-slate-800">{String(v)}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
