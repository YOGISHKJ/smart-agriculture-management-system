'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Plus, Calendar, Clock, DollarSign, X, AlertCircle } from 'lucide-react';

export default function FarmerActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    cycle_id: '',
    activity_date: new Date().toISOString().split('T')[0],
    activity_type: 'FERTILIZER_APPLICATION',
    description: '',
    labour_hours: '4',
    cost: '1500'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetch('/api/activities').then(r => r.json()),
      fetch('/api/crop-cycles').then(r => r.json())
    ]).then(([actData, cycleData]) => {
      setActivities(actData.activities || []);
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

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const selectedCycle = cycles.find(c => String(c.cycle_id) === String(formData.cycle_id));
    if (!selectedCycle) {
      setError('Please select a valid crop cycle');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          field_id: selectedCycle.field_id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record activity');

      setModalOpen(false);
      setFormData(prev => ({
        ...prev,
        description: '',
        labour_hours: '4',
        cost: '1500'
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Farming Operations &amp; Activities</h1>
          <p className="text-xs text-slate-500">Field task execution logs with labor hours and cost accounting</p>
        </div>
        <button
          onClick={() => { setError(null); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Log Farming Activity
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading activities from PostgreSQL...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Task Classification</th>
                  <th className="py-3 px-4">Crop &amp; Parcel</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Labor (Hrs)</th>
                  <th className="py-3 px-4 text-right">Cost (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((act) => (
                  <tr key={act.activity_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{act.activity_date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {act.activity_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{act.crop_name}</div>
                      <div className="text-[10px] text-slate-400">{act.field_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">{act.description}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{act.labour_hours} hrs</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">₹{act.cost?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Field Activity</h3>
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

            <form onSubmit={handleAddActivity} className="space-y-4 mt-4 text-xs">
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
                      {c.crop_name} - {c.field_name} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Activity Type</label>
                  <select
                    value={formData.activity_type}
                    onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="PLOUGHING">PLOUGHING</option>
                    <option value="SOWING">SOWING</option>
                    <option value="FERTILIZER_APPLICATION">FERTILIZER APPLICATION</option>
                    <option value="IRRIGATION">IRRIGATION</option>
                    <option value="PEST_CONTROL">PEST CONTROL</option>
                    <option value="WEED_CONTROL">WEED CONTROL</option>
                    <option value="PRUNING">PRUNING</option>
                    <option value="SOIL_TESTING">SOIL TESTING</option>
                    <option value="HARVESTING">HARVESTING</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Execution Date</label>
                  <input
                    type="date"
                    required
                    value={formData.activity_date}
                    onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Detailed Description</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Applied 2 bags bio-fertilizer via drip and adjusted emitters"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Labor Effort (Hours) [&gt;= 0]</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formData.labour_hours}
                    onChange={(e) => setFormData({ ...formData, labour_hours: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Operation Cost (INR) [&gt;= 0]</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
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
                  {submitting ? 'Recording...' : 'Log Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
