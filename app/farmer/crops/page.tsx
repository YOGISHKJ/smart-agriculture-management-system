'use client';

import React, { useState, useEffect } from 'react';
import { Wheat, Plus, Calendar, Droplets, Globe, X, AlertCircle } from 'lucide-react';

export default function FarmerCropsPage() {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    crop_name: '',
    scientific_name: '',
    category: 'VEGETABLE',
    standard_maturity_days: '90',
    water_requirement: 'MEDIUM',
    optimal_soil: 'Well-drained sandy loam'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCrops = () => {
    fetch('/api/crops')
      .then(res => res.json())
      .then(data => {
        setCrops(data.crops || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add crop');

      setModalOpen(false);
      setFormData({
        crop_name: '',
        scientific_name: '',
        category: 'VEGETABLE',
        standard_maturity_days: '90',
        water_requirement: 'MEDIUM',
        optimal_soil: 'Well-drained sandy loam'
      });
      fetchCrops();
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Crop Master Catalog</h1>
          <p className="text-xs text-slate-500">Agronomic crop registry with standard maturity cycles and water requirements</p>
        </div>
        <button
          onClick={() => { setError(null); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Register Crop Variety
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading crops from PostgreSQL...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <div key={crop.crop_id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Wheat className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-full">
                  {crop.category}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{crop.crop_name}</h3>
                <p className="text-xs text-slate-400 italic mt-0.5">{crop.scientific_name || 'Botanical name unspecified'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span><strong>{crop.standard_maturity_days}</strong> Days Maturity</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-600">
                  <Droplets className="w-3.5 h-3.5 text-blue-600" />
                  <span><strong>{crop.water_requirement}</strong> Water Req.</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Optimal Pedological Conditions</span>
                <span className="text-slate-700">{crop.optimal_soil || 'Well aerated fertile soil'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Crop Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Crop to Catalog</h3>
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

            <form onSubmit={handleAddCrop} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Crop Variety Name [UNIQUE]</label>
                <input
                  type="text"
                  required
                  value={formData.crop_name}
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                  placeholder="e.g. Hybrid Arka Rakshak Tomato"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Botanical / Scientific Name</label>
                <input
                  type="text"
                  value={formData.scientific_name}
                  onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  placeholder="e.g. Solanum lycopersicum"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Category [CHECK Enum]</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="VEGETABLE">VEGETABLE</option>
                    <option value="CEREAL">CEREAL</option>
                    <option value="PULSE">PULSE</option>
                    <option value="FRUIT">FRUIT</option>
                    <option value="CASH_CROP">CASH_CROP</option>
                    <option value="OILSEED">OILSEED</option>
                    <option value="HORTICULTURE">HORTICULTURE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Maturity (Days) [&gt; 0]</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.standard_maturity_days}
                    onChange={(e) => setFormData({ ...formData, standard_maturity_days: e.target.value })}
                    placeholder="90"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Optimal Soil Description</label>
                <input
                  type="text"
                  value={formData.optimal_soil}
                  onChange={(e) => setFormData({ ...formData, optimal_soil: e.target.value })}
                  placeholder="e.g. Well-drained sandy loam pH 6.0-7.0"
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
                  {submitting ? 'Saving...' : 'Save Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
