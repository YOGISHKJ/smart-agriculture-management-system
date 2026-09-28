'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Droplets, X, AlertCircle } from 'lucide-react';

export default function FarmerFieldsPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    farm_id: '',
    field_name: '',
    area: '',
    soil_type: '',
    irrigation_type: 'DRIP'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetch('/api/fields').then(r => r.json()),
      fetch('/api/farms').then(r => r.json())
    ]).then(([fieldsData, farmsData]) => {
      setFields(fieldsData.fields || []);
      setFarms(farmsData.farms || []);
      if (farmsData.farms?.length > 0 && !formData.farm_id) {
        setFormData(prev => ({ ...prev, farm_id: String(farmsData.farms[0].farm_id) }));
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

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add field');

      setModalOpen(false);
      setFormData(prev => ({ ...prev, field_name: '', area: '', soil_type: '' }));
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fields &amp; Land Parcels</h1>
          <p className="text-xs text-slate-500">Partitioned farm parcels with dedicated irrigation systems</p>
        </div>
        <button
          onClick={() => { setError(null); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Partition New Field
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading fields from PostgreSQL...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((fld) => (
            <div key={fld.field_id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 rounded-full flex items-center">
                  <Droplets className="w-3 h-3 mr-1 text-blue-600" /> {fld.irrigation_type}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{fld.field_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Farm: <span className="font-semibold text-slate-700">{fld.farm_name}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Field Area</span>
                  <span className="font-bold text-slate-800">{fld.area} Acres</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Soil Classification</span>
                  <span className="font-bold text-slate-800">{fld.soil_type || 'Loam'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Active Cultivation</span>
                {fld.active_cycle ? (
                  <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                    {fld.active_cycle.crop_name} (Active)
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No active crop cycle</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Field Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Field Parcel</h3>
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

            <form onSubmit={handleAddField} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Parent Farm (FK)</label>
                <select
                  required
                  value={formData.farm_id}
                  onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  {farms.map(f => (
                    <option key={f.farm_id} value={f.farm_id}>{f.farm_name} ({f.area} acres)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Field Name</label>
                <input
                  type="text"
                  required
                  value={formData.field_name}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                  placeholder="e.g. North Tomato Parcel"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Area (Acres) [CHECK &gt; 0]</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="2.5"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Irrigation Infrastructure</label>
                  <select
                    value={formData.irrigation_type}
                    onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="DRIP">DRIP</option>
                    <option value="SPRINKLER">SPRINKLER</option>
                    <option value="FLOOD">FLOOD</option>
                    <option value="CANAL">CANAL</option>
                    <option value="MANUAL">MANUAL</option>
                    <option value="RAINFED">RAINFED</option>
                  </select>
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
                  {submitting ? 'Saving...' : 'Add Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
