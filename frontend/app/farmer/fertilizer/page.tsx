'use client';

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  IndianRupee,
  Layers,
  Wheat,
  X,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { api, FertilizerUsage, Crop } from '@/lib/api';

export default function FertilizerPage() {
  const [fertilizerUsages, setFertilizerUsages] = useState<FertilizerUsage[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropSummaries, setCropSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FertilizerUsage | null>(null);

  const [formData, setFormData] = useState({
    crop_id: '',
    date: new Date().toISOString().split('T')[0],
    name: 'Neem Coated Urea (46% N)',
    type: 'CHEMICAL',
    quantity_kg: '50.0',
    cost: '350.00',
    method: 'Fertigation',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fertRes, cropsRes] = await Promise.all([
        api.fertilizer.getAll(),
        api.crops.getAll()
      ]);
      setFertilizerUsages(fertRes.fertilizer_usages || []);
      setCropSummaries(fertRes.summary_by_crop || []);
      setCrops(cropsRes.crops || []);
      if (cropsRes.crops?.length > 0 && !formData.crop_id) {
        setFormData(prev => ({ ...prev, crop_id: String(cropsRes.crops[0].id) }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load fertilizer records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingLog(null);
    setFormData({
      crop_id: crops.length > 0 ? String(crops[0].id) : '',
      date: new Date().toISOString().split('T')[0],
      name: 'Neem Coated Urea (46% N)',
      type: 'CHEMICAL',
      quantity_kg: '50.0',
      cost: '350.00',
      method: 'Fertigation',
      notes: ''
    });
    setError(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (log: FertilizerUsage) => {
    setEditingLog(log);
    setFormData({
      crop_id: String(log.crop_id),
      date: log.date.split('T')[0],
      name: log.name,
      type: log.type,
      quantity_kg: String(log.quantity_kg),
      cost: String(log.cost),
      method: log.method || 'Soil Application',
      notes: log.notes || ''
    });
    setError(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      crop_id: parseInt(formData.crop_id, 10),
      date: formData.date,
      name: formData.name.trim(),
      type: formData.type,
      quantity_kg: parseFloat(formData.quantity_kg),
      cost: parseFloat(formData.cost) || 0,
      method: formData.method,
      notes: formData.notes.trim() || undefined
    };

    try {
      if (editingLog) {
        await api.fertilizer.update(editingLog.id, payload);
        setSuccessMsg('Fertilizer record updated successfully!');
      } else {
        await api.fertilizer.create(payload);
        setSuccessMsg('Fertilizer application logged successfully!');
      }

      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg(null);
      }, 1000);

      loadData();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.fertilizer.delete(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const totalOverallKg = fertilizerUsages.reduce((acc, curr) => acc + Number(curr.quantity_kg || 0), 0);
  const totalOverallCost = fertilizerUsages.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);

  const filteredLogs = fertilizerUsages.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.crop_name && f.crop_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.field_name && f.field_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCrop = cropFilter ? String(f.crop_id) === cropFilter : true;
    return matchesSearch && matchesCrop;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ORGANIC':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'BIO_FERTILIZER':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'MICRONUTRIENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-bold uppercase tracking-wider mb-1 border border-purple-200">
            <span>Agronomic Nutrient Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fertilizer &amp; Nutrient Applications</h1>
          <p className="text-xs text-slate-500">Log chemical, organic, and bio-fertilizer quantities, costs, and application methods</p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={crops.length === 0}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center self-start sm:self-auto disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Log Fertilizer
        </button>
      </div>

      {crops.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
          <span>You need to register at least one crop before logging fertilizer usage.</span>
          <a href="/farmer/crops" className="font-bold underline text-amber-950 ml-2">Register Crop</a>
        </div>
      )}

      {/* Aggregate Stat Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Nutrients Applied</span>
            <span className="text-2xl font-black text-slate-900">{totalOverallKg.toLocaleString()} kg</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Fertilizer Spend</span>
            <span className="text-2xl font-black text-slate-900">₹{totalOverallCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Logged Applications</span>
            <span className="text-2xl font-black text-slate-900">{fertilizerUsages.length} Events</span>
          </div>
        </div>
      </div>

      {/* Per Crop Breakdown Ribbon */}
      {cropSummaries.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Fertilizer &amp; Cost Breakdown by Crop
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
            {cropSummaries.map((cs) => (
              <div key={cs.crop_id} className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="font-bold text-slate-800 text-xs truncate block">{cs.crop_name}</span>
                <div className="flex items-center justify-between text-[11px] mt-1 text-purple-900">
                  <span className="font-extrabold">{Number(cs.total_kg).toLocaleString()} kg</span>
                  <span className="text-[10px] text-emerald-700 font-bold">₹{Number(cs.total_cost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by fertilizer name, crop, type, or field..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-[#fbfdfb]"
          />
        </div>

        <div>
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-[#fbfdfb]"
          >
            <option value="">All Crop Varieties</option>
            {crops.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.field_name})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fertilizer Logs Table */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500 animate-pulse">Loading fertilizer records...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-white border border-dashed border-slate-300">
          <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No fertilizer application records found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || cropFilter ? 'Try adjusting your search query or filter.' : 'Log your first fertilizer application to start tracking nutrient inputs.'}
          </p>
          {!searchTerm && !cropFilter && crops.length > 0 && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow hover:bg-purple-700 transition"
            >
              Log First Fertilizer
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Fertilizer Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Target Crop &amp; Field</th>
                <th className="py-3.5 px-4">Quantity (kg)</th>
                <th className="py-3.5 px-4">Cost (₹)</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    {log.date.split('T')[0]}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {log.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTypeBadge(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{log.crop_name}</span>
                    <span className="text-[10px] text-slate-500">{log.field_name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-purple-700">
                    {Number(log.quantity_kg).toLocaleString()} kg
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800">
                    ₹{Number(log.cost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {log.method || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {log.notes || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(log)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition mr-1"
                      title="Edit Log"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(log.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Fertilizer Log?</h3>
              <p className="text-xs text-slate-500 mt-1">This will permanently delete this fertilizer application record.</p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Fertilizer Usage Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingLog ? 'Edit Fertilizer Application' : 'Log Fertilizer Application'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Record fertilizer type, quantity, cost, and method applied to crop</p>
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

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Target Crop Parcel *</label>
                <select
                  required
                  value={formData.crop_id}
                  onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                >
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.field_name} ({c.status})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Fertilizer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Neem Coated Urea"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Nutrient Classification *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                  >
                    <option value="CHEMICAL">CHEMICAL (Urea, DAP, NPK, MOP)</option>
                    <option value="ORGANIC">ORGANIC (Vermicompost, Manure)</option>
                    <option value="BIO_FERTILIZER">BIO_FERTILIZER (Rhizobium, Seaweed)</option>
                    <option value="MICRONUTRIENT">MICRONUTRIENT (Zinc, Boron, Iron)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Application Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Quantity (kg) * [&gt; 0]</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.quantity_kg}
                    onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                    placeholder="e.g. 25.0"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Total Cost (₹) [≥ 0]</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="e.g. 350.00"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Application Method</label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                >
                  <option value="Fertigation">Fertigation (through Drip System)</option>
                  <option value="Soil Application">Soil Application / Ring Placement</option>
                  <option value="Broadcasting">Broadcasting / Surface Spreading</option>
                  <option value="Foliar Spray">Foliar Spray (Liquid Solution)</option>
                  <option value="Side Dressing">Side Dressing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Observation Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. First vegetative dose with micronutrient booster"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingLog ? 'Update Fertilizer Log' : 'Save Fertilizer Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
