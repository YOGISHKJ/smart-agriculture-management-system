'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Plus, TrendingUp, DollarSign, Sparkles, CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function FarmerHarvestsPage() {
  const [harvests, setHarvests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    cycle_id: '',
    harvest_date: new Date().toISOString().split('T')[0],
    quantity_kg: '15000',
    unit: 'KG',
    quality_grade: 'GRADE_A',
    selling_price_per_unit: '28.00',
    buyer_name: 'Bangalore APMC Wholesale Market',
    notes: 'Grade-A firm fruit sorting'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetch('/api/harvests').then(r => r.json()),
      fetch('/api/crop-cycles').then(r => r.json())
    ]).then(([hrvData, cycleData]) => {
      setHarvests(hrvData.harvests || []);
      setAnalytics(hrvData.analytics || {});
      setCycles(cycleData.cycles || []);
      if (cycleData.cycles?.length > 0 && !formData.cycle_id) {
        setFormData(prev => ({ ...prev, cycle_id: String(cycleData.cycles[0].cycle_id) }));
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record harvest');

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedRevenue = (Number(formData.quantity_kg || 0) * Number(formData.selling_price_per_unit || 0)).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Harvest Yield &amp; Revenue Realization</h1>
          <p className="text-xs text-slate-500">PostgreSQL Trigger auto-calculates Total Revenue and transitions crop cycles to HARVESTED</p>
        </div>
        <button
          onClick={() => { setError(null); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Register Harvest Yield
        </button>
      </div>

      {/* Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Total Harvest Output</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{(analytics.total_yield_kg || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">KG</span></div>
          <span className="text-[11px] text-emerald-700 font-medium">Delivered to APMC wholesale markets</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Gross Realized Revenue</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">₹{(analytics.total_revenue || 0).toLocaleString()}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Computed via PostgreSQL Trigger</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Realized Price Realization</span>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{analytics.average_price_per_kg || 0} <span className="text-xs font-bold text-slate-500">/ KG</span></div>
          <span className="text-[11px] text-slate-400 font-medium">Weighted average selling price</span>
        </div>
      </div>

      {/* Harvests Table */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading harvest records from PostgreSQL...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Harvest Date</th>
                  <th className="py-3 px-4">Crop Variety &amp; Parcel</th>
                  <th className="py-3 px-4">Quality Grade</th>
                  <th className="py-3 px-4 text-center">Output (KG)</th>
                  <th className="py-3 px-4 text-right">Price / KG</th>
                  <th className="py-3 px-4 text-right">Total Gross Revenue</th>
                  <th className="py-3 px-4">Buyer / APMC Trader</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {harvests.map((h) => (
                  <tr key={h.harvest_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{h.harvest_date}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{h.crop_name}</div>
                      <div className="text-[10px] text-slate-400">{h.field_name} &bull; {h.farm_name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {h.quality_grade.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">{h.quantity_kg?.toLocaleString()} {h.unit}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-700">₹{h.selling_price_per_unit}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700">₹{h.total_revenue?.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-slate-600">{h.buyer_name || 'APMC Yard'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Harvest Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register Harvest Yield</h3>
                <p className="text-[11px] text-slate-500">Auto-triggers revenue formula &amp; cycle state update</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRecordHarvest} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Harvested Crop Cycle</label>
                <select
                  required
                  value={formData.cycle_id}
                  onChange={(e) => setFormData({ ...formData, cycle_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  {cycles.map(c => (
                    <option key={c.cycle_id} value={c.cycle_id}>
                      {c.crop_name} ({c.field_name}) - Current: {c.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={formData.harvest_date}
                    onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Quality Grade</label>
                  <select
                    value={formData.quality_grade}
                    onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="GRADE_A">GRADE A (Premium)</option>
                    <option value="EXPORT_QUALITY">EXPORT QUALITY</option>
                    <option value="STANDARD">STANDARD</option>
                    <option value="GRADE_B">GRADE B</option>
                    <option value="GRADE_C">GRADE C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Harvest Quantity (KG) [&gt; 0]</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity_kg}
                    onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Selling Price / KG (INR) [&gt;= 0]</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.selling_price_per_unit}
                    onChange={(e) => setFormData({ ...formData, selling_price_per_unit: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Live Revenue Preview */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-semibold text-emerald-700 block">Trigger Formula Calculation:</span>
                  <span className="text-xs text-emerald-800">{formData.quantity_kg || 0} KG &times; ₹{formData.selling_price_per_unit || 0}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-800">₹{Number(calculatedRevenue).toLocaleString()}</span>
                  <span className="text-[9px] uppercase font-bold text-emerald-600 block">Total Revenue</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Merchant / Buyer Entity</label>
                <input
                  type="text"
                  value={formData.buyer_name}
                  onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                  placeholder="e.g. Bangalore APMC Yard 4"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  {submitting ? 'Registering...' : 'Register Harvest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
