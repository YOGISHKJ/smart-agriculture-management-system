'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Database, Sparkles, Image as ImageIcon, Calendar, X, AlertCircle } from 'lucide-react';

export default function FarmerObservationsPage() {
  const [observations, setObservations] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [farmId, setFarmId] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [cropStage, setCropStage] = useState('FLOWERING_AND_EARLY_FRUITING');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Dynamic Morphological Attributes per crop
  const [tomatoAttrs, setTomatoAttrs] = useState({ leaf_color: 'Pale Yellow / Chlorotic', spots_detected: 'No', whitefly_trap_count: '14', canopy_coverage_pct: '85' });
  const [riceAttrs, setRiceAttrs] = useState({ standing_water_depth_cm: '4.5', panicle_initiation_started: 'No', stem_borer_egg_masses_per_sqm: '2', tillers_per_hill_avg: '22' });
  const [chilliAttrs, setChilliAttrs] = useState({ leaf_curl_type: 'Upward Boat Shaped (Thrips)', thrips_trap_count: '18', flower_drop_severity: 'Low' });
  const [wheatAttrs, setWheatAttrs] = useState({ stripe_rust_severity: 'None', yellow_pustules_present: 'No', flag_leaf_vigor: 'High' });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetch('/api/observations').then(r => r.json()),
      fetch('/api/farms').then(r => r.json()),
      fetch('/api/fields').then(r => r.json())
    ]).then(([obsData, farmData, fldData]) => {
      setObservations(obsData.observations || []);
      setFarms(farmData.farms || []);
      setFields(fldData.fields || []);
      if (farmData.farms?.length > 0 && !farmId) setFarmId(String(farmData.farms[0].farm_id));
      if (fldData.fields?.length > 0 && !fieldId) setFieldId(String(fldData.fields[0].field_id));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Prepare crop-specific dynamic document payload
    let dynamic_attributes: any = {};
    if (selectedCrop === 'Tomato') dynamic_attributes = tomatoAttrs;
    else if (selectedCrop === 'Rice (Basmati)') dynamic_attributes = riceAttrs;
    else if (selectedCrop === 'Green Chilli') dynamic_attributes = chilliAttrs;
    else if (selectedCrop === 'Wheat (Durum)') dynamic_attributes = wheatAttrs;
    else dynamic_attributes = { notes_custom: 'Standard observation log' };

    const symptomsArray = symptomsInput.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: Number(farmId),
          field_id: Number(fieldId),
          crop: selectedCrop,
          crop_stage: cropStage,
          symptoms_observed: symptomsArray,
          dynamic_attributes,
          notes,
          images: imageUrl ? [{ url: imageUrl, caption: `${selectedCrop} observation photo` }] : []
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create observation');

      setModalOpen(false);
      setSymptomsInput('');
      setNotes('');
      setImageUrl('');
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
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Database className="w-3 h-3" />
            <span>MongoDB Document Collection: crop_observations</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dynamic Crop Scouting Observations</h1>
          <p className="text-xs text-slate-500">
            Demonstrating NoSQL Polymorphic Schema: different crops record varying morphological and sensor metrics without SQL table schema alteration.
          </p>
        </div>

        <button
          onClick={() => { setError(null); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Record Dynamic Observation
        </button>
      </div>

      {/* Observations List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Querying dynamic documents from MongoDB...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {observations.map((obs, idx) => (
            <div key={obs._id || idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-slate-900">{obs.crop}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                      MongoDB Document
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Farmer: <span className="font-semibold text-slate-700">{obs.farmer_name}</span> &bull; Farm: <span className="font-semibold text-slate-700">{obs.farm_name}</span>
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {new Date(obs.observation_date).toLocaleDateString()}
                </span>
              </div>

              {/* Crop Growth Stage */}
              <div className="text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Growth Stage</span>
                <span className="font-semibold text-slate-800">{obs.crop_stage?.replace(/_/g, ' ')}</span>
              </div>

              {/* Symptoms Observed */}
              {obs.symptoms_observed?.length > 0 && (
                <div className="text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Symptoms Detected</span>
                  <div className="flex flex-wrap gap-1">
                    {obs.symptoms_observed.map((sym: string, sIdx: number) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-medium text-[11px]">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Polymorphic Attributes (MongoDB Key Demonstration) */}
              {obs.dynamic_attributes && Object.keys(obs.dynamic_attributes).length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-2">
                    Polymorphic Document Attributes (Flexible Schema):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(obs.dynamic_attributes).map(([key, val]) => (
                      <div key={key} className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px] capitalize">{key.replace(/_/g, ' ')}</span>
                        <strong className="text-slate-800">{String(val)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {obs.notes && (
                <p className="text-xs text-slate-600 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 italic">
                  &ldquo;{obs.notes}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Observation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Dynamic Crop Observation</h3>
                <p className="text-[11px] text-emerald-700 font-semibold">MongoDB Dynamic Morphological Document</p>
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

            <form onSubmit={handleAddObservation} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Farm</label>
                  <select
                    required
                    value={farmId}
                    onChange={(e) => setFarmId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    {farms.map(f => (
                      <option key={f.farm_id} value={f.farm_id}>{f.farm_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Crop Variety (Schema Trigger)</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-emerald-400 bg-emerald-50/50 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-emerald-900"
                  >
                    <option value="Tomato">Tomato (Arka Rakshak)</option>
                    <option value="Rice (Basmati)">Rice (Basmati)</option>
                    <option value="Green Chilli">Green Chilli (G4)</option>
                    <option value="Wheat (Durum)">Wheat (Durum)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Crop Phenological Stage</label>
                <select
                  value={cropStage}
                  onChange={(e) => setCropStage(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  <option value="SEEDLING_VEGETATIVE">Seedling / Vegetative</option>
                  <option value="ACTIVE_TILLERING">Active Tillering</option>
                  <option value="FLOWERING_AND_EARLY_FRUITING">Flowering &amp; Fruit Set</option>
                  <option value="FRUIT_DEVELOPMENT">Fruit Development / Grain Sizing</option>
                  <option value="MATURITY_RIPENING">Maturity / Ripening</option>
                </select>
              </div>

              {/* DYNAMIC ATTRIBUTES FORM SECTION (Changes dynamically based on Crop) */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center space-x-1.5 font-bold text-emerald-900 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Dynamic Fields for: {selectedCrop}</span>
                </div>

                {selectedCrop === 'Tomato' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Foliage Color / Chlorosis</label>
                      <input
                        type="text"
                        value={tomatoAttrs.leaf_color}
                        onChange={(e) => setTomatoAttrs({ ...tomatoAttrs, leaf_color: e.target.value })}
                        className="mt-1 block w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Whiteflies per Trap</label>
                      <input
                        type="text"
                        value={tomatoAttrs.whitefly_trap_count}
                        onChange={(e) => setTomatoAttrs({ ...tomatoAttrs, whitefly_trap_count: e.target.value })}
                        className="mt-1 block w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {selectedCrop === 'Rice (Basmati)' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Standing Water Depth (cm)</label>
                      <input
                        type="text"
                        value={riceAttrs.standing_water_depth_cm}
                        onChange={(e) => setRiceAttrs({ ...riceAttrs, standing_water_depth_cm: e.target.value })}
                        className="mt-1 block w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Stem Borer Egg Masses / m²</label>
                      <input
                        type="text"
                        value={riceAttrs.stem_borer_egg_masses_per_sqm}
                        onChange={(e) => setRiceAttrs({ ...riceAttrs, stem_borer_egg_masses_per_sqm: e.target.value })}
                        className="mt-1 block w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {selectedCrop === 'Green Chilli' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Leaf Curl Vector Type</label>
                      <input
                        type="text"
                        value={chilliAttrs.leaf_curl_type}
                        onChange={(e) => setChilliAttrs({ ...chilliAttrs, leaf_curl_type: e.target.value })}
                        className="mt-1 block w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Thrips Blue Trap Count</label>
                      <input
                        type="text"
                        value={chilliAttrs.thrips_trap_count}
                        onChange={(e) => setChilliAttrs({ ...chilliAttrs, thrips_trap_count: e.target.value })}
                        className="mt-1 block w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Symptoms Observed (Comma-separated)</label>
                <input
                  type="text"
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="e.g. Yellowing of leaf margins, slight curl"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Farmer Field Scouting Narrative / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Scouted North block at 8:00 AM. Traps replaced and bio-spray scheduled."
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
                  {submitting ? 'Inserting in MongoDB...' : 'Store in MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
