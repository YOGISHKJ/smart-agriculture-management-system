'use client';

import React, { useState, useEffect } from 'react';
import {
  Wheat,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Droplets,
  FlaskConical,
  X,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter
} from 'lucide-react';
import { api, Crop, Field } from '@/lib/api';

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

  const [formData, setFormData] = useState({
    field_id: '',
    name: '',
    variety: '',
    season: 'Rabi',
    sowing_date: new Date().toISOString().split('T')[0],
    expected_harvest_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    seed_quantity: '5.0',
    status: 'ACTIVE' as 'PLANNED' | 'ACTIVE' | 'HARVESTED' | 'CANCELLED'
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cropsRes, fieldsRes] = await Promise.all([
        api.crops.getAll(),
        api.fields.getAll()
      ]);
      setCrops(cropsRes.crops || []);
      setFields(fieldsRes.fields || []);
      if (fieldsRes.fields?.length > 0 && !formData.field_id) {
        setFormData(prev => ({ ...prev, field_id: String(fieldsRes.fields[0].id) }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load crop records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCrop(null);
    setFormData({
      field_id: fields.length > 0 ? String(fields[0].id) : '',
      name: '',
      variety: '',
      season: 'Rabi',
      sowing_date: new Date().toISOString().split('T')[0],
      expected_harvest_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seed_quantity: '5.0',
      status: 'ACTIVE'
    });
    setError(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setFormData({
      field_id: String(crop.field_id),
      name: crop.name,
      variety: crop.variety || '',
      season: crop.season,
      sowing_date: crop.sowing_date.split('T')[0],
      expected_harvest_date: crop.expected_harvest_date.split('T')[0],
      seed_quantity: String(crop.seed_quantity),
      status: crop.status
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
      field_id: parseInt(formData.field_id, 10),
      name: formData.name.trim(),
      variety: formData.variety.trim() || undefined,
      season: formData.season,
      sowing_date: formData.sowing_date,
      expected_harvest_date: formData.expected_harvest_date,
      seed_quantity: parseFloat(formData.seed_quantity),
      status: formData.status
    };

    try {
      if (editingCrop) {
        await api.crops.update(editingCrop.id, payload);
        setSuccessMsg('Crop record updated successfully!');
      } else {
        await api.crops.create(payload);
        setSuccessMsg('New crop registered successfully!');
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
      await api.crops.delete(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete crop');
    }
  };

  const filteredCrops = crops.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.variety && c.variety.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.field_name && c.field_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesField = fieldFilter ? String(c.field_id) === fieldFilter : true;

    return matchesSearch && matchesStatus && matchesField;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HARVESTED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-1 border border-amber-200">
            <span>Crop Cultivation Cycles</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Crops &amp; Cultivation Ledger</h1>
          <p className="text-xs text-slate-500">Track sown crops, varieties, seasonal cycles, expected harvest dates, and inputs</p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={fields.length === 0}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center self-start sm:self-auto disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Register Crop
        </button>
      </div>

      {fields.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
          <span>You need at least one field parcel created before registering a crop.</span>
          <a href="/farmer/fields" className="font-bold underline text-amber-950 ml-2">Create Field</a>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crops by name, variety, or field..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-[#fbfdfb]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-[#fbfdfb]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active (In Ground)</option>
            <option value="PLANNED">Planned</option>
            <option value="HARVESTED">Harvested</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <select
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-[#fbfdfb]"
          >
            <option value="">All Field Parcels</option>
            {fields.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Crops List Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500 animate-pulse">Loading crop cultivation records...</div>
      ) : filteredCrops.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-white border border-dashed border-slate-300">
          <Wheat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No crop records found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter || fieldFilter
              ? 'Try adjusting your search or filter filters.'
              : 'Register your first crop cultivation cycle to begin tracking.'}
          </p>
          {!searchTerm && !statusFilter && fields.length > 0 && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-700 transition"
            >
              Register First Crop
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shadow-inner">
                    <Wheat className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(crop.status)}`}>
                      {crop.status}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(crop)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition"
                      title="Edit Crop"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(crop.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Crop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{crop.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Variety: <span className="font-semibold text-slate-700">{crop.variety || 'Standard'}</span> &bull; Season: <span className="font-semibold text-slate-700">{crop.season}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" /> Target Field:
                    </span>
                    <span className="font-bold text-slate-800">{crop.field_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Sowing Date:
                    </span>
                    <span className="font-semibold text-slate-700">{crop.sowing_date.split('T')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Expected Harvest:
                    </span>
                    <span className="font-semibold text-slate-700">{crop.expected_harvest_date.split('T')[0]}</span>
                  </div>
                </div>

                {/* Resource summaries for this crop */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-blue-600 font-semibold block uppercase">Total Water</span>
                      <span className="font-extrabold text-blue-900">{Number(crop.total_water_liters || 0).toLocaleString()} L</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-100 flex items-center space-x-2">
                    <FlaskConical className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-purple-600 font-semibold block uppercase">Fertilizer</span>
                      <span className="font-extrabold text-purple-900">{Number(crop.total_fertilizer_kg || 0).toLocaleString()} kg</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Seed Qty: <strong className="text-slate-700">{crop.seed_quantity} kg</strong></span>
                <span className="text-[10px]">Crop ID #{crop.id}</span>
              </div>
            </div>
          ))}
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
              <h3 className="text-base font-bold text-slate-900">Delete Crop Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will delete the crop cycle and all water &amp; fertilizer application records linked to it.
              </p>
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

      {/* Add / Edit Crop Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Wheat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCrop ? 'Edit Crop Cultivation' : 'Register New Crop'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Record sowing timeline, parcel location, and expected harvest</p>
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
                <label className="block font-semibold text-slate-700">Target Field Parcel *</label>
                <select
                  required
                  value={formData.field_id}
                  onChange={(e) => setFormData({ ...formData, field_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                >
                  {fields.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.area} Acres)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Crop Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Hybrid Tomato"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Variety / Cultivar</label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    placeholder="e.g. Arka Rakshak F1"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Season *</label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  >
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                    <option value="Year-round">Year-round / Perennial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Seed Quantity (kg/packets) * [&gt; 0]</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.seed_quantity}
                    onChange={(e) => setFormData({ ...formData, seed_quantity: e.target.value })}
                    placeholder="e.g. 5.0"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Sowing Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.sowing_date}
                    onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Expected Harvest Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expected_harvest_date}
                    onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Cycle Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                >
                  <option value="ACTIVE">ACTIVE - In Ground</option>
                  <option value="PLANNED">PLANNED - Nursery / Pre-sow</option>
                  <option value="HARVESTED">HARVESTED - Completed</option>
                  <option value="CANCELLED">CANCELLED - Abandoned</option>
                </select>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCrop ? 'Update Crop' : 'Register Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
