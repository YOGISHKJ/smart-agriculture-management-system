'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Droplets, Wheat, Calendar, CheckCircle2, X, AlertCircle, Sparkles } from 'lucide-react';

export default function FarmerFieldsPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Unified Field & Crop Details Form State
  const [includeCrop, setIncludeCrop] = useState(true);
  const [formData, setFormData] = useState({
    // Field Details
    farm_id: '',
    field_name: '',
    area: '',
    soil_type: 'Red Sandy Loam',
    irrigation_type: 'DRIP',

    // Crop Details
    crop_mode: 'EXISTING', // 'EXISTING' | 'NEW'
    crop_id: '',
    new_crop_name: '',
    crop_category: 'VEGETABLE',
    standard_maturity_days: '90',
    
    // Cultivation Cycle Details
    sowing_date: new Date().toISOString().split('T')[0],
    expected_harvest_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    target_yield_kg: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetch('/api/fields').then(r => r.json()),
      fetch('/api/farms').then(r => r.json()),
      fetch('/api/crops').then(r => r.json())
    ]).then(([fieldsData, farmsData, cropsData]) => {
      setFields(fieldsData.fields || []);
      setFarms(farmsData.farms || []);
      setCrops(cropsData.crops || []);
      if (farmsData.farms?.length > 0 && !formData.farm_id) {
        setFormData(prev => ({ ...prev, farm_id: String(farmsData.farms[0].farm_id) }));
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

  const handleSaveFieldAndCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const payload: any = {
      farm_id: formData.farm_id,
      field_name: formData.field_name,
      area: formData.area,
      soil_type: formData.soil_type,
      irrigation_type: formData.irrigation_type
    };

    if (includeCrop) {
      if (formData.crop_mode === 'EXISTING') {
        payload.crop_id = formData.crop_id;
      } else {
        payload.new_crop_name = formData.new_crop_name;
        payload.crop_category = formData.crop_category;
        payload.standard_maturity_days = formData.standard_maturity_days;
      }
      payload.sowing_date = formData.sowing_date;
      payload.expected_harvest_date = formData.expected_harvest_date;
      payload.target_yield_kg = formData.target_yield_kg;
      payload.notes = formData.notes;
    }

    try {
      const res = await fetch('/api/fields/with-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save field and crop');

      setSuccessMsg(data.message || 'Field and Crop registered successfully in PostgreSQL!');
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg(null);
        setFormData(prev => ({
          ...prev,
          field_name: '',
          area: '',
          new_crop_name: '',
          target_yield_kg: '',
          notes: ''
        }));
      }, 1200);

      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1 border border-emerald-200">
            <span>PostgreSQL Relational Topology</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fields &amp; Crop Cultivation Parcels</h1>
          <p className="text-xs text-slate-500">Manage farm fields, dedicated irrigation methods, and active crop varieties</p>
        </div>
        <button
          onClick={() => { setError(null); setSuccessMsg(null); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Enter Field &amp; Crop Details
        </button>
      </div>

      {/* Fields List */}
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
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Soil Type</span>
                  <span className="font-bold text-slate-800">{fld.soil_type || 'Loam'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Active Sowed Crop</span>
                {fld.active_cycle ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wheat className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold text-emerald-900 block">{fld.active_cycle.crop_name}</span>
                        <span className="text-[10px] text-emerald-700">Sown: {fld.active_cycle.sowing_date}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900">
                      {fld.active_cycle.status}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No active crop cycle</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unified Enter Field & Crop Details Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enter Field &amp; Crop Details</h3>
                  <p className="text-[11px] text-slate-500">Atomically store field parcel and sowed crop into PostgreSQL</p>
                </div>
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

            {successMsg && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start text-xs text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveFieldAndCrop} className="space-y-4 mt-4 text-xs">
              {/* SECTION 1: FIELD DETAILS */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] uppercase font-bold text-slate-700 block tracking-wider">
                  1. Field Details
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700">Target Farm (FK)</label>
                    <select
                      required
                      value={formData.farm_id}
                      onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                    >
                      {farms.map(f => (
                        <option key={f.farm_id} value={f.farm_id}>{f.farm_name} ({f.area} ac)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Field Name / Parcel Tag</label>
                    <input
                      type="text"
                      required
                      value={formData.field_name}
                      onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                      placeholder="e.g. East Tomato Block"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700">Area (Acres) [&gt;0]</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g. 2.5"
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Soil Classification</label>
                    <select
                      value={formData.soil_type}
                      onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                    >
                      <option value="Red Sandy Loam">Red Sandy Loam</option>
                      <option value="Black Alluvial Clay">Black Alluvial Clay</option>
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Laterite Soil">Laterite Soil</option>
                      <option value="Alluvial Silt">Alluvial Silt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Irrigation Method</label>
                    <select
                      value={formData.irrigation_type}
                      onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                    >
                      <option value="DRIP">DRIP</option>
                      <option value="SPRINKLER">SPRINKLER</option>
                      <option value="FLOOD">FLOOD</option>
                      <option value="CANAL">CANAL</option>
                      <option value="MANUAL">MANUAL</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CROP & CULTIVATION DETAILS */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-emerald-900 block tracking-wider">
                    2. Sowed Crop Details &amp; Cycle Schedule
                  </span>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-semibold text-emerald-800">
                    <input
                      type="checkbox"
                      checked={includeCrop}
                      onChange={(e) => setIncludeCrop(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Sow Crop in this Field Now</span>
                  </label>
                </div>

                {includeCrop && (
                  <>
                    <div className="flex items-center space-x-4 pt-1">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="crop_mode"
                          checked={formData.crop_mode === 'EXISTING'}
                          onChange={() => setFormData({ ...formData, crop_mode: 'EXISTING' })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-slate-700">Choose from Catalog</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="crop_mode"
                          checked={formData.crop_mode === 'NEW'}
                          onChange={() => setFormData({ ...formData, crop_mode: 'NEW' })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-slate-700">Register New Crop Variety</span>
                      </label>
                    </div>

                    {formData.crop_mode === 'EXISTING' ? (
                      <div>
                        <label className="block font-semibold text-slate-700">Select Crop Variety</label>
                        <select
                          value={formData.crop_id}
                          onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                        >
                          {crops.map(c => (
                            <option key={c.crop_id} value={c.crop_id}>
                              {c.crop_name} ({c.category} - {c.standard_maturity_days} days)
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block font-semibold text-slate-700">New Crop Variety Name</label>
                          <input
                            type="text"
                            required={formData.crop_mode === 'NEW'}
                            value={formData.new_crop_name}
                            onChange={(e) => setFormData({ ...formData, new_crop_name: e.target.value })}
                            placeholder="e.g. Hybrid Sweet Corn (Sugar 75)"
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700">Category</label>
                          <select
                            value={formData.crop_category}
                            onChange={(e) => setFormData({ ...formData, crop_category: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                          >
                            <option value="VEGETABLE">VEGETABLE</option>
                            <option value="CEREAL">CEREAL</option>
                            <option value="PULSE">PULSE</option>
                            <option value="FRUIT">FRUIT</option>
                            <option value="CASH_CROP">CASH_CROP</option>
                            <option value="OILSEED">OILSEED</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700">Sowing Date</label>
                        <input
                          type="date"
                          required={includeCrop}
                          value={formData.sowing_date}
                          onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700">Expected Harvest Date [&gt;= Sowing]</label>
                        <input
                          type="date"
                          required={includeCrop}
                          value={formData.expected_harvest_date}
                          onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700">Target Yield (KG)</label>
                        <input
                          type="number"
                          value={formData.target_yield_kg}
                          onChange={(e) => setFormData({ ...formData, target_yield_kg: e.target.value })}
                          placeholder="e.g. 15000"
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700">Agronomic / Fertigation Notes</label>
                        <input
                          type="text"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="e.g. Drip inline emitters with mulch"
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}
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
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md shadow-emerald-600/20"
                >
                  {submitting ? 'Saving to Database...' : 'Save Field & Sowed Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
