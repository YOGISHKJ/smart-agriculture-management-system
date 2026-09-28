'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Wheat, Landmark, Droplets } from 'lucide-react';

export default function AdminAnalyticsPage() {
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
    return <div className="text-center py-12 text-xs text-slate-500">Aggregating analytical views...</div>;
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Agricultural &amp; Financial Analytics</h1>
        <p className="text-xs text-slate-400">Aggregated telemetry powered by PostgreSQL Views and MongoDB Collections</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">System Total Gross Revenue</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">₹{(kpis.system_revenue || 0).toLocaleString()}</div>
          <span className="text-[11px] text-emerald-500 font-medium">Realized across wholesale APMC markets</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Total System Expenditure</span>
          <div className="text-2xl font-black text-rose-400 mt-1">₹{(kpis.system_expenses || 0).toLocaleString()}</div>
          <span className="text-[11px] text-rose-500 font-medium">Operating costs across all farms</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Aggregate Net Profit</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">₹{(kpis.system_net_profit || 0).toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 font-medium">Net economic yield</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Warehouse Stock Valuation</span>
          <div className="text-2xl font-black text-blue-400 mt-1">₹{(kpis.inventory_valuation || 0).toLocaleString()}</div>
          <span className="text-[11px] text-blue-500 font-medium">Fertilizer, seed &amp; bio-chemical capital</span>
        </div>
      </div>

      {/* Popular Crops Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Cultivation Volume by Crop Variety</h3>
          <p className="text-xs text-slate-400">PostgreSQL Relational Grouping: crops &times; crop_cycles</p>
          <div className="space-y-3 pt-2">
            {(data?.popularCropsChart || []).map((crop: any) => (
              <div key={crop.name} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs">{crop.name}</span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-extrabold text-xs">
                  {crop.count} Active Cycles
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Agricultural Knowledge &amp; Observations (NoSQL)</h3>
          <p className="text-xs text-slate-400">MongoDB Aggregations: Dynamic Scouting Documents</p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Advisories</span>
              <span className="text-2xl font-black text-white mt-1 block">{kpis.total_advisories_mongodb || 5}</span>
              <span className="text-[10px] text-emerald-400">MongoDB indexed</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Crop Observations</span>
              <span className="text-2xl font-black text-white mt-1 block">{kpis.total_observations_mongodb || 3}</span>
              <span className="text-[10px] text-emerald-400">Polymorphic schemas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
