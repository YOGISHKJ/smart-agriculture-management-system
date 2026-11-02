'use client';

import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Layers,
  Wheat,
  X,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { api, WaterUsage, Crop } from '@/lib/api';

export default function WaterPage() {
  const [waterUsages, setWaterUsages] = useState<WaterUsage[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropSummaries, setCropSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WaterUsage | null>(null);

  const [formData, setFormData] = useState({
    crop_id: '',
    date: new Date().toISOString().split('T')[0],
    method: 'DRIP',
    liters: '3500',
    duration_minutes: '120',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [waterRes, cropsRes] = await Promise.all([
        api.water.getAll(),
        api.crops.getAll()
      ]);
      setWaterUsages(waterRes.water_usages || []);
      setCropSummaries(waterRes.summary_by_crop || []);
      setCrops(cropsRes.crops || []);
      if (cropsRes.crops?.length > 0 && !formData.crop_id) {
        setFormData(prev => ({ ...prev, crop_id: String(cropsRes.crops[0].id) }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load water usage logs');
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
      method: 'DRIP',
      liters: '3500',
      duration_minutes: '120',
      notes: ''
    });
    setError(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (log: WaterUsage) => {
    setEditingLog(log);
    setFormData({
      crop_id: String(log.crop_id),
      date: log.date.split('T')[0],
      method: log.method,
      liters: String(log.liters),
      duration_minutes: String(log.duration_minutes),
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
      method: formData.method,
      liters: parseFloat(formData.liters),
      duration_minutes: parseInt(formData.duration_minutes, 10),
      notes: formData.notes.trim() || undefined
    };

    try {
      if (editingLog) {
        await api.water.update(editingLog.id, payload);
        setSuccessMsg('Irrigation record updated successfully!');
      } else {
        await api.water.create(payload);
        setSuccessMsg('Water usage logged successfully!');
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
      await api.water.delete(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const totalOverallLiters = waterUsages.reduce((acc, curr) => acc + Number(curr.liters || 0), 0);
  const totalOverallDuration = waterUsages.reduce((acc, curr) => acc + Number(curr.duration_minutes || 0), 0);

  const filteredLogs = waterUsages.filter((w) => {
    const matchesSearch =
      (w.crop_name && w.crop_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.method && w.method.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.field_name && w.field_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCrop = cropFilter ? String(w.crop_id) === cropFilter : true;
    return matchesSearch && matchesCrop;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold uppercase tracking-wider mb-1 border border-blue-200">
            <span>Irrigation &amp; Hydrology</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Water Usage &amp; Irrigation Logs</h1>
          <p className="text-xs text-slate-500">Track water volume consumed per crop parcel, duration, and irrigation methods</p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={crops.length === 0}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center self-start sm:self-auto disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Log Water Usage
        </button>
      </div>

      {crops.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
          <span>You need to register at least one crop before logging water usage.</span>
          <a href="/farmer/crops" className="font-bold underline text-amber-950 ml-2">Register Crop</a>
        </div>
      )}

      {/* Aggregate Stat Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Water Delivered</span>
            <span className="text-2xl font-black text-slate-900">{totalOverallLiters.toLocaleString()} Liters</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cumulative Pumping Time</span>
            <span className="text-2xl font-black text-slate-900">{totalOverallDuration.toLocaleString()} Minutes</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Logged Irrigation Cycles</span>
            <span className="text-2xl font-black text-slate-900">{waterUsages.length} Events</span>
          </div>
        </div>
      </div>

      {/* Per Crop Breakdown Ribbon */}
      {cropSummaries.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Water Allocation Breakdown by Crop
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
            {cropSummaries.map((cs) => (
              <div key={cs.crop_id} className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="font-bold text-slate-800 text-xs truncate block">{cs.crop_name}</span>
                <div className="flex items-center justify-between text-[11px] mt-1 text-blue-900">
                  <span className="font-extrabold">{Number(cs.total_liters).toLocaleString()} L</span>
                  <span className="text-[10px] text-blue-600 font-medium">({cs.log_count} runs)</span>
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
            placeholder="Search by crop, field, or method..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-[#fbfdfb]"
          />
        </div>

        <div>
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-[#fbfdfb]"
          >
            <option value="">All Crop Varieties</option>
            {crops.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.field_name})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Water Logs Table / Cards */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500 animate-pulse">Loading irrigation logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-white border border-dashed border-slate-300">
          <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No irrigation records found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || cropFilter ? 'Try changing your search query or filter.' : 'Log your first irrigation event to track water volume.'}
          </p>
          {!searchTerm && !cropFilter && crops.length > 0 && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow hover:bg-blue-700 transition"
            >
              Log First Irrigation
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Crop &amp; Field</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Volume (Liters)</th>
                <th className="py-3.5 px-4">Duration</th>
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
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{log.crop_name}</span>
                    <span className="text-[10px] text-slate-500">{log.field_name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                      {log.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-blue-700">
                    {Number(log.liters).toLocaleString()} L
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {log.duration_minutes} mins
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {log.notes || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(log)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition mr-1"
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
              <h3 className="text-base font-bold text-slate-900">Delete Water Log?</h3>
              <p className="text-xs text-slate-500 mt-1">This will permanently remove this irrigation event record.</p>
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

      {/* Add / Edit Water Usage Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingLog ? 'Edit Irrigation Record' : 'Log Water Usage'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Record irrigation volume, duration, and method applied to crop</p>
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
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.field_name} ({c.status})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Irrigation Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Irrigation Method *</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="DRIP">DRIP (Micro-irrigation)</option>
                    <option value="SPRINKLER">SPRINKLER</option>
                    <option value="FLOOD">FLOOD (Surface Basin)</option>
                    <option value="CANAL">CANAL / Gravity</option>
                    <option value="MANUAL">MANUAL (Hose / Tank)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Water Volume (Liters) * [&gt; 0]</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formData.liters}
                    onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                    placeholder="e.g. 4500"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Pumping Duration (Minutes) * [&gt; 0]</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    placeholder="e.g. 120"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Observation Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Morning drip run during high temperature vegetative phase"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingLog ? 'Update Water Log' : 'Save Water Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
