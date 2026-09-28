'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Clock, CheckCircle2, Droplets, Package, DollarSign, Trophy, X, AlertCircle } from 'lucide-react';

export default function FarmerCropCyclesPage() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    field_id: '',
    crop_id: '',
    sowing_date: '',
    expected_harvest_date: '',
    target_yield_kg: '',
    notes: '',
    status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetch('/api/crop-cycles').then(r => r.json()),
      fetch('/api/fields').then(r => r.json()),
      fetch('/api/crops').then(r => r.json())
    ]).then(([cyclesData, fieldsData, cropsData]) => {
      setCycles(cyclesData.cycles || []);
      setFields(fieldsData.fields || []);
      setCrops(cropsData.crops || []);
      if (fieldsData.fields?.length > 0 && !formData.field_id) {
        setFormData(prev => ({ ...prev, field_id: String(fieldsData.fields[0].field_id) }));
      }
      if (cropsData.crops?.length > 0 && !formData.crop_id) {
        setFormData(prev => ({ ...prev, crop_id: String(cropsData.crops[0].crop_id) }));
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

  const handleAddCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/crop-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule crop cycle');

      setModalOpen(false);
      setFormData(prev => ({
        ...prev,
        sowing_date: '',
        expected_harvest_date: '',
        target_yield_kg: '',
        notes: ''
      }));
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Crop Cultivation Cycles</h1>
          <p className="text-xs text-slate-500">Scheduled production timelines with automated status auditing</p>
        </div>
        <button
          onClick={() => { setError(null); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Schedule Crop Cycle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading cultivation cycles from PostgreSQL...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cycles.map((cycle) => (
            <div key={cycle.cycle_id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
                    {cycle.status}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{cycle.crop_name}</h3>
                  <p className="text-xs text-slate-500">
                    Farm: <span className="font-semibold text-slate-700">{cycle.farm_name}</span> &bull; Field: <span className="font-semibold text-slate-700">{cycle.field_name}</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Sowing Date</span>
                  <span className="font-bold text-slate-800">{cycle.sowing_date}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Expected Harvest</span>
                  <span className="font-bold text-slate-800">{cycle.expected_harvest_date}</span>
                </div>
              </div>

              {/* Operational Rollup Metrics */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block">Water</span>
                  <span className="text-xs font-bold text-slate-800">{cycle.water_consumed_liters?.toLocaleString() || 0} L</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block">Fertilizer</span>
                  <span className="text-xs font-bold text-slate-800">{cycle.fertilizer_applied_units || 0} U</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block">Activities</span>
                  <span className="text-xs font-bold text-slate-800">{cycle.activities_count || 0}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[9px] uppercase font-semibold text-slate-400 block">Expenses</span>
                  <span className="text-xs font-bold text-rose-700">₹{cycle.total_cycle_expenses?.toLocaleString() || 0}</span>
                </div>
              </div>

              {cycle.harvest && (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 block">Harvest Registered</span>
                    <span className="text-[11px] text-emerald-700">{cycle.harvest.quantity_kg} KG &bull; Grade: {cycle.harvest.quality_grade}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-800 block">₹{cycle.harvest.total_revenue?.toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-600 uppercase font-semibold">Gross Revenue</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Cycle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Schedule Crop Cycle</h3>
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

            <form onSubmit={handleAddCycle} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Target Field</label>
                  <select
                    required
                    value={formData.field_id}
                    onChange={(e) => setFormData({ ...formData, field_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    {fields.map(f => (
                      <option key={f.field_id} value={f.field_id}>{f.field_name} ({f.farm_name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Crop Variety</label>
                  <select
                    required
                    value={formData.crop_id}
                    onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    {crops.map(c => (
                      <option key={c.crop_id} value={c.crop_id}>{c.crop_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Sowing Date</label>
                  <input
                    type="date"
                    required
                    value={formData.sowing_date}
                    onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Expected Harvest [&gt;= Sowing]</label>
                  <input
                    type="date"
                    required
                    value={formData.expected_harvest_date}
                    onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Target Yield (KG)</label>
                <input
                  type="number"
                  value={formData.target_yield_kg}
                  onChange={(e) => setFormData({ ...formData, target_yield_kg: e.target.value })}
                  placeholder="e.g. 15000"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Agronomic Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Drip fertigation schedule with mulching"
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
                  {submitting ? 'Scheduling...' : 'Schedule Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
