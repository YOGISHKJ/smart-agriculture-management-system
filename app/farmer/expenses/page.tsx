'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Filter, Calendar, CreditCard, X, AlertCircle } from 'lucide-react';

export default function FarmerExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [farms, setFarms] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    farm_id: '',
    cycle_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    category: 'LABOUR',
    amount: '2500',
    payment_mode: 'UPI',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetch(`/api/expenses?category=${categoryFilter}`).then(r => r.json()),
      fetch('/api/farms').then(r => r.json()),
      fetch('/api/crop-cycles').then(r => r.json())
    ]).then(([expData, farmData, cycleData]) => {
      setExpenses(expData.expenses || []);
      setAnalytics(expData.analytics || {});
      setFarms(farmData.farms || []);
      setCycles(cycleData.cycles || []);
      if (farmData.farms?.length > 0 && !formData.farm_id) {
        setFormData(prev => ({ ...prev, farm_id: String(farmData.farms[0].farm_id) }));
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record expense');

      setModalOpen(false);
      setFormData(prev => ({ ...prev, amount: '2500', description: '' }));
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Farm Financial Expense Ledger</h1>
          <p className="text-xs text-slate-500">Itemized operational accounting tied to farm holdings and crop cycles</p>
        </div>
        <button
          onClick={() => { setError(null); setModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Record Expense Voucher
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Total Expenditure</span>
          <div className="text-2xl font-black text-rose-700 mt-1">₹{(analytics.total_expenses || 0).toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 font-medium">Across {analytics.total_vouchers || 0} transaction vouchers</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category Breakdown</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1"
            >
              <option value="ALL">All Categories</option>
              <option value="SEEDS">Seeds</option>
              <option value="FERTILIZER">Fertilizer</option>
              <option value="PESTICIDES">Pesticides</option>
              <option value="LABOUR">Labour</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="TRANSPORTATION">Transportation</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(analytics.by_category || {}).map(([cat, amt]) => (
              <span key={cat} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-medium text-slate-500">{cat}:</span> <strong className="text-slate-800">₹{(amt as number).toLocaleString()}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading ledger from PostgreSQL...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Voucher Date</th>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Allocation (Farm / Cycle)</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.expense_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{exp.expense_date}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{exp.receipt_number || '-'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{exp.farm_name}</div>
                      <div className="text-[10px] text-slate-400">{exp.crop_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">{exp.description}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{exp.payment_mode}</td>
                    <td className="py-3.5 px-4 text-right font-black text-rose-700">₹{exp.amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Expense Voucher</h3>
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

            <form onSubmit={handleAddExpense} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Farm Unit</label>
                  <select
                    required
                    value={formData.farm_id}
                    onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    {farms.map(f => (
                      <option key={f.farm_id} value={f.farm_id}>{f.farm_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Optional Crop Cycle</label>
                  <select
                    value={formData.cycle_id}
                    onChange={(e) => setFormData({ ...formData, cycle_id: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="">General Overhead</option>
                    {cycles.map(c => (
                      <option key={c.cycle_id} value={c.cycle_id}>{c.crop_name} ({c.field_name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Expense Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="SEEDS">SEEDS</option>
                    <option value="FERTILIZER">FERTILIZER</option>
                    <option value="PESTICIDES">PESTICIDES</option>
                    <option value="LABOUR">LABOUR</option>
                    <option value="IRRIGATION">IRRIGATION</option>
                    <option value="EQUIPMENT">EQUIPMENT</option>
                    <option value="TRANSPORTATION">TRANSPORTATION</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Amount (INR) [&gt;= 0]</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Voucher Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Payment Mode</label>
                  <select
                    value={formData.payment_mode}
                    onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="UPI">UPI / Net Banking</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CREDIT">Credit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Itemized Description</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Paid harvesting labor wages for 10 workers"
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
                  {submitting ? 'Posting...' : 'Post Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
