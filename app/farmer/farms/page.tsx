'use client';

import React, { useState, useEffect } from 'react';
import { Landmark, Plus, MapPin, Layers, CheckCircle2, Trash2, X, AlertCircle } from 'lucide-react';

export default function FarmerFarmsPage() {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    farm_name: '',
    location: '',
    area: '',
    soil_type: 'Red Sandy Loam',
    ownership_type: 'OWNED',
    status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFarms = () => {
    fetch('/api/farms')
      .then(res => res.json())
      .then(data => {
        setFarms(data.farms || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create farm');

      setModalOpen(false);
      setFormData({ farm_name: '', location: '', area: '', soil_type: 'Red Sandy Loam', ownership_type: 'OWNED', status: 'ACTIVE' });
      fetchFarms();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Farm Topology Management</h1>
          <p className="text-xs text-slate-500">Registered agricultural holdings and land parcel definitions</p>
        </div>
        <button
          onClick={() => { setError(null); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Farm
        </button>
      </div>

      {/* Farms Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading farms from PostgreSQL...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div key={farm.farm_id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
                    {farm.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{farm.farm_name}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{farm.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Area</span>
                    <span className="font-bold text-slate-800">{farm.area} Acres</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Soil Classification</span>
                    <span className="font-bold text-slate-800">{farm.soil_type}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Child Fields ({farm.fields_count || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(farm.fields || []).map((fld: any) => (
                      <span key={fld.field_id} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded">
                        {fld.field_name} ({fld.area} ac)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Farm Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Register New Farm</h3>
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

            <form onSubmit={handleAddFarm} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Farm Name</label>
                <input
                  type="text"
                  required
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  placeholder="e.g. Green Valley Farm"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Location / Village / Zone</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Kolar Agricultural Belt, Karnataka"
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
                    placeholder="e.g. 5.0"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Soil Type</label>
                  <select
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="Red Sandy Loam">Red Sandy Loam</option>
                    <option value="Black Alluvial Clay">Black Alluvial Clay</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Laterite Soil">Laterite Soil</option>
                    <option value="Alluvial Silt">Alluvial Silt</option>
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
                  {submitting ? 'Saving to PostgreSQL...' : 'Register Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
