'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Droplets,
  Wheat,
  X,
  AlertCircle,
  CheckCircle2,
  Search,
  MapPin,
  Maximize2
} from 'lucide-react';
import { api, Field } from '@/lib/api';

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    soil_type: 'Red Sandy Loam',
    water_source: 'Borewell & Drip Line',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadFields = async () => {
    setLoading(true);
    try {
      const data = await api.fields.getAll();
      setFields(data.fields || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleOpenAdd = () => {
    setEditingField(null);
    setFormData({
      name: '',
      location: '',
      area: '',
      soil_type: 'Red Sandy Loam',
      water_source: 'Borewell & Drip Line',
      notes: ''
    });
    setError(null);
    setSuccessMsg(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (field: Field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      location: field.location,
      area: String(field.area),
      soil_type: field.soil_type || 'Red Sandy Loam',
      water_source: field.water_source || 'Borewell & Drip Line',
      notes: field.notes || ''
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
      name: formData.name.trim(),
      location: formData.location.trim(),
      area: parseFloat(formData.area),
      soil_type: formData.soil_type,
      water_source: formData.water_source,
      notes: formData.notes.trim() || undefined
    };

    try {
      if (editingField) {
        await api.fields.update(editingField.id, payload);
        setSuccessMsg('Field parcel updated successfully!');
      } else {
        await api.fields.create(payload);
        setSuccessMsg('New field parcel created successfully!');
      }

      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg(null);
      }, 1000);

      loadFields();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.fields.delete(id);
      setDeleteConfirmId(null);
      loadFields();
    } catch (err: any) {
      alert(err.message || 'Failed to delete field');
    }
  };

  const filteredFields = fields.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.soil_type && f.soil_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1 border border-emerald-200">
            <span>Land Topology</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fields &amp; Land Parcels</h1>
          <p className="text-xs text-slate-500">Manage agricultural plots, soil classifications, and water supply sources</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Field
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search fields by name, location, or soil type..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-[#fbfdfb]"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-800">{filteredFields.length}</span> of {fields.length} parcels
        </div>
      </div>

      {/* Fields Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500 animate-pulse">Loading field parcels...</div>
      ) : filteredFields.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-white border border-dashed border-slate-300">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No field parcels found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm ? 'Try changing your search query.' : 'Get started by creating your first farm parcel.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-700 transition"
            >
              Add First Field
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFields.map((fld) => (
            <div
              key={fld.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-inner">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(fld)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition"
                      title="Edit Field"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(fld.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{fld.name}</h3>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{fld.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Area</span>
                    <span className="font-extrabold text-slate-800 text-sm">{fld.area} Acres</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Soil Type</span>
                    <span className="font-bold text-slate-800 truncate block">{fld.soil_type || 'Loam'}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Water Source:</span>
                    <span className="font-semibold text-slate-700">{fld.water_source || 'Borewell'}</span>
                  </div>
                  {fld.notes && (
                    <div className="text-[11px] text-slate-500 italic bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/60">
                      "{fld.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Crop badge footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center">
                  <Wheat className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span>{fld.active_crops || 0} active crops</span>
                </span>
                <span className="text-[10px] text-slate-400">ID #{fld.id}</span>
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
              <h3 className="text-base font-bold text-slate-900">Delete Field Parcel?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will also permanently delete all associated crops, irrigation logs, and fertilizer records.
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

      {/* Add / Edit Field Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingField ? 'Edit Field Parcel' : 'Add New Field Parcel'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure land coordinates, acreage, and soil profile</p>
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
                <label className="block font-semibold text-slate-700">Field / Parcel Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. North Tomato Parcel"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Location / Sector *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Plot 4A, Green Valley Farm"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Area (Acres) * [&gt; 0]</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. 3.5"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Soil Classification</label>
                  <select
                    value={formData.soil_type}
                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                  >
                    <option value="Red Sandy Loam">Red Sandy Loam</option>
                    <option value="Black Alluvial Clay">Black Alluvial Clay</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Laterite Soil">Laterite Soil</option>
                    <option value="Silty Clay">Silty Clay</option>
                    <option value="Loamy Sand">Loamy Sand</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Water Source / Irrigation Supply</label>
                <input
                  type="text"
                  value={formData.water_source}
                  onChange={(e) => setFormData({ ...formData, water_source: e.target.value })}
                  placeholder="e.g. Borewell &amp; Drip Line / Canal Feed"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Agronomic Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. High nitrogen fertility, optimal for solanaceous crops"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingField ? 'Update Field' : 'Save Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
