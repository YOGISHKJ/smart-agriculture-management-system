'use client';

import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Clock, Activity, X, AlertCircle } from 'lucide-react';

export default function FarmerIrrigationPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    cycle_id: '',
    irrigation_date: new Date().toISOString().split('T')[0],
    water_quantity_liters: '6000',
    duration_minutes: '150',
    irrigation_method: 'DRIP',
    notes: 'Fruit development critical watering'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetch('/api/irrigation').then(r => r.json()),
      fetch('/api/crop-cycles').then(r => r.json())
    ]).then(([irrData, cycleData]) => {
      setRecords(irrData.irrigation_records || []);
      setAnalytics(irrData.analytics || {});
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

  const handleAddIrrigation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const cycle = cycles.find(c => String(c.cycle_id) === String(formData.cycle_id));
    if (!cycle) {
      setError('Please select a valid crop cycle');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/irrigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          field_id: cycle.field_id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log irrigation');

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Irrigation &amp; Hydrology Management</h1>
          <p className="text-xs text-slate-500">Water volume delivery records and system run-time telemetry</p>
        </div>
        <button
          onClick={() => { setError(null); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Log Irrigation Session
        </button>
      </div>

      {/* Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Total Water Delivered</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{(analytics.total_water_liters || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">Liters</span></div>
          <span className="text-[11px] text-slate-400 font-medium">Cumulative hydrologic footprint</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Total Pumping Duration</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{analytics.total_duration_hours || 0} <span className="text-xs font-bold text-slate-500">Hours</span></div>
          <span className="text-[11px] text-slate-400 font-medium">Electric &amp; solar pump operating hours</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Delivery Methods</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(analytics.by_method || {}).map(([method, liters]) => (
              <span key={method} className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                {method}: {(liters as number).toLocaleString()} L
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading hydrologic records from PostgreSQL...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Session Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Crop &amp; Field Parcel</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4 text-right">Water Volume</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec.irrigation_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{rec.irrigation_date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                        {rec.irrigation_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{rec.crop_name}</div>
                      <div className="text-[10px] text-slate-400">{rec.field_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{rec.duration_minutes} mins</td>
                    <td className="py-3.5 px-4 text-right font-black text-blue-700">{rec.water_quantity_liters?.toLocaleString()} L</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs">{rec.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Irrigation Event</h3>
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

            <form onSubmit={handleAddIrrigation} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Target Crop Cycle</label>
                <select
                  required
                  value={formData.cycle_id}
                  onChange={(e) => setFormData({ ...formData, cycle_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  {cycles.map(c => (
                    <option key={c.cycle_id} value={c.cycle_id}>
                      {c.crop_name} - {c.field_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Water Volume (Liters) [&gt; 0]</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.water_quantity_liters}
                    onChange={(e) => setFormData({ ...formData, water_quantity_liters: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Duration (Minutes) [&gt; 0]</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Irrigation Method</label>
                  <select
                    value={formData.irrigation_method}
                    onChange={(e) => setFormData({ ...formData, irrigation_method: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="DRIP">DRIP</option>
                    <option value="SPRINKLER">SPRINKLER</option>
                    <option value="FLOOD">FLOOD</option>
                    <option value="CANAL">CANAL</option>
                    <option value="MANUAL">MANUAL</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Session Date</label>
                  <input
                    type="date"
                    required
                    value={formData.irrigation_date}
                    onChange={(e) => setFormData({ ...formData, irrigation_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Operational Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Sub-main filter backwashed before dosing"
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
                  {submitting ? 'Logging...' : 'Log Irrigation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
