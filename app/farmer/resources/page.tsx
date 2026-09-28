'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, CheckCircle2, DollarSign, Droplet, ArrowDownRight, X, AlertCircle } from 'lucide-react';

export default function FarmerResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addResourceModal, setAddResourceModal] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  // New Resource Form
  const [resourceForm, setResourceForm] = useState({
    resource_name: '',
    category: 'FERTILIZER',
    unit: '50KG_BAG',
    purchase_price: '1200',
    available_quantity: '25',
    minimum_stock: '5',
    supplier: 'IFFCO Agri Supply'
  });

  // Fertilizer Usage Transaction Form
  const [applyForm, setApplyForm] = useState({
    cycle_id: '',
    quantity_applied: '2',
    application_date: new Date().toISOString().split('T')[0],
    application_method: 'Fertigation via Drip',
    notes: 'Vegetative growth booster'
  });

  const [submitting, setSubmitting] = useState(false);
  const [txnResult, setTxnResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetch('/api/resources').then(r => r.json()),
      fetch('/api/crop-cycles').then(r => r.json())
    ]).then(([resData, cycleData]) => {
      setResources(resData.resources || []);
      setCycles(cycleData.cycles || []);
      if (cycleData.cycles?.length > 0 && !applyForm.cycle_id) {
        setApplyForm(prev => ({ ...prev, cycle_id: String(cycleData.cycles[0].cycle_id) }));
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

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add resource');

      setAddResourceModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteFertilizerTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setTxnResult(null);

    const cycle = cycles.find(c => String(c.cycle_id) === String(applyForm.cycle_id));
    if (!cycle) {
      setError('Please select a valid crop cycle');
      setSubmitting(false);
      return;
    }

    const calculatedCost = Number(applyForm.quantity_applied) * Number(selectedResource.purchase_price);

    try {
      const res = await fetch('/api/fertilizer-usages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycle_id: cycle.cycle_id,
          resource_id: selectedResource.resource_id,
          field_id: cycle.field_id,
          application_date: applyForm.application_date,
          quantity_applied: Number(applyForm.quantity_applied),
          cost: calculatedCost,
          application_method: applyForm.application_method,
          notes: applyForm.notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transaction failed');

      setTxnResult(data.transaction || data);
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agricultural Resources &amp; Inventory</h1>
          <p className="text-xs text-slate-500">Warehouse stock monitoring with ACID transaction inventory deductions</p>
        </div>
        <button
          onClick={() => { setError(null); setAddResourceModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Inward Inventory Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading resources from PostgreSQL...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div key={res.resource_id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                    res.inventory_health_status === 'CRITICAL_LOW'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : res.inventory_health_status === 'REORDER_REQUIRED'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {res.inventory_health_status?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{res.resource_name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Supplier: {res.supplier || 'Cooperative'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Available Stock</span>
                    <span className="text-sm font-extrabold text-slate-900">{res.available_quantity} {res.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Minimum Alert</span>
                    <span className="text-xs font-semibold text-slate-600">{res.minimum_stock} {res.unit}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Unit Price: <strong>₹{res.purchase_price}</strong></span>
                  <span className="text-slate-900 font-bold">Valuation: ₹{res.total_stock_valuation?.toLocaleString()}</span>
                </div>
              </div>

              {res.category === 'FERTILIZER' && (
                <button
                  onClick={() => {
                    setSelectedResource(res);
                    setError(null);
                    setTxnResult(null);
                    setApplyModalOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center justify-center space-x-1.5"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Apply to Field (ACID Txn)</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ACID Transaction Fertilizer Modal */}
      {applyModalOpen && selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Apply Fertilizer (ACID Transaction)</h3>
                <p className="text-[11px] text-slate-500">Atomically inserts usage, decrements stock, and posts expense</p>
              </div>
              <button onClick={() => setApplyModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {txnResult && (
              <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  <span>ACID Transaction Committed Successfully</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  New Warehouse Stock: <strong>{txnResult.newStock} {selectedResource.unit}</strong> (Deducted {applyForm.quantity_applied})
                </p>
                <p className="text-[11px] text-emerald-700">
                  Usage Record: #{txnResult.usageId} &bull; Generated Ledger Voucher: #{txnResult.expenseId}
                </p>
              </div>
            )}

            <form onSubmit={handleExecuteFertilizerTransaction} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{selectedResource.resource_name}</span>
                  <span>Stock: {selectedResource.available_quantity} {selectedResource.unit}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Rate: ₹{selectedResource.purchase_price} per unit</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Target Crop Cycle</label>
                <select
                  required
                  value={applyForm.cycle_id}
                  onChange={(e) => setApplyForm({ ...applyForm, cycle_id: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                >
                  {cycles.map(c => (
                    <option key={c.cycle_id} value={c.cycle_id}>
                      {c.crop_name} - {c.field_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Quantity Applied [&gt; 0]</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={applyForm.quantity_applied}
                    onChange={(e) => setApplyForm({ ...applyForm, quantity_applied: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Application Method</label>
                  <select
                    value={applyForm.application_method}
                    onChange={(e) => setApplyForm({ ...applyForm, application_method: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="Fertigation via Drip">Fertigation via Drip</option>
                    <option value="Basal Soil Application">Basal Soil Application</option>
                    <option value="Side Dressing">Side Dressing</option>
                    <option value="Foliar Spray">Foliar Spray</option>
                    <option value="Broadcasting">Broadcasting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Application Date</label>
                <input
                  type="date"
                  required
                  value={applyForm.application_date}
                  onChange={(e) => setApplyForm({ ...applyForm, application_date: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                Total Transaction Cost: <strong>₹{(Number(applyForm.quantity_applied || 0) * Number(selectedResource.purchase_price)).toLocaleString()}</strong>
                <span className="block text-[10px] text-amber-700">Will automatically create matching voucher in expenses table.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  {submitting ? 'Executing ACID Txn...' : 'Execute Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inward Resource Modal */}
      {addResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Inward Inventory Resource</h3>
              <button onClick={() => setAddResourceModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Resource Trade Name</label>
                <input
                  type="text"
                  required
                  value={resourceForm.resource_name}
                  onChange={(e) => setResourceForm({ ...resourceForm, resource_name: e.target.value })}
                  placeholder="e.g. Water Soluble NPK 19-19-19"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Category</label>
                  <select
                    value={resourceForm.category}
                    onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="FERTILIZER">FERTILIZER</option>
                    <option value="PESTICIDE">PESTICIDE</option>
                    <option value="SEED">SEED</option>
                    <option value="EQUIPMENT">EQUIPMENT</option>
                    <option value="FUEL">FUEL</option>
                    <option value="PACKAGING">PACKAGING</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Unit Standard</label>
                  <input
                    type="text"
                    required
                    value={resourceForm.unit}
                    onChange={(e) => setResourceForm({ ...resourceForm, unit: e.target.value })}
                    placeholder="e.g. 50KG_BAG / LTR"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700">Unit Price</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={resourceForm.purchase_price}
                    onChange={(e) => setResourceForm({ ...resourceForm, purchase_price: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Inward Qty</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={resourceForm.available_quantity}
                    onChange={(e) => setResourceForm({ ...resourceForm, available_quantity: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Min Alert</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={resourceForm.minimum_stock}
                    onChange={(e) => setResourceForm({ ...resourceForm, minimum_stock: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Supplier / Vendor</label>
                <input
                  type="text"
                  value={resourceForm.supplier}
                  onChange={(e) => setResourceForm({ ...resourceForm, supplier: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddResourceModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  {submitting ? 'Adding...' : 'Inward Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
