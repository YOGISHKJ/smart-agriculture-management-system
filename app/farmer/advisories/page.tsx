'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, Sparkles, Database, Tag, ShieldCheck, Bug, Droplets, Leaf, ChevronDown, ChevronUp } from 'lucide-react';

export default function FarmerAdvisoriesPage() {
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAdvisories = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCrop) params.append('crop', selectedCrop);
    if (selectedCategory && selectedCategory !== 'ALL') params.append('category', selectedCategory);

    fetch(`/api/advisories?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setAdvisories(data.advisories || []);
        if (data.advisories?.length > 0 && !expandedId) {
          setExpandedId(data.advisories[0]._id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdvisories();
  }, [selectedCategory, selectedCrop]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdvisories();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Database className="w-3 h-3" />
            <span>MongoDB Collection: agricultural_advisories</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agricultural Advisory &amp; Symptom Search</h1>
          <p className="text-xs text-slate-500">
            Agronomic pest and disease interventions with nested biological and chemical management protocols
          </p>
        </div>
      </div>

      {/* Symptom Search Bar */}
      <form onSubmit={handleSearchSubmit} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms or disease names (e.g. 'leaves turning yellow', 'leaf curl', 'blast', 'spots')..."
            className="block w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
          />
          <button
            type="submit"
            className="absolute inset-y-1.5 right-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
          >
            Search NoSQL
          </button>
        </div>

        {/* Quick Filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Quick Filters:</span>
          {['Tomato', 'Rice (Basmati)', 'Green Chilli', 'Wheat (Durum)'].map(crop => (
            <button
              key={crop}
              type="button"
              onClick={() => setSelectedCrop(selectedCrop === crop ? '' : crop)}
              className={`px-2.5 py-1 rounded-lg border font-medium transition ${
                selectedCrop === crop
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {crop}
            </button>
          ))}
          {selectedCrop && (
            <button
              type="button"
              onClick={() => setSelectedCrop('')}
              className="text-[11px] text-rose-600 font-semibold hover:underline ml-1"
            >
              Clear Filter
            </button>
          )}
        </div>
      </form>

      {/* Advisories List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Querying MongoDB documents...</div>
      ) : advisories.length === 0 ? (
        <div className="text-center py-12 p-8 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No agricultural advisories matched your query. Try searching for "yellow", "curl", "blast", or select a crop chip.
        </div>
      ) : (
        <div className="space-y-4">
          {advisories.map((adv) => {
            const isExpanded = expandedId === adv._id;
            return (
              <div key={adv._id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 transition space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : adv._id)}>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-slate-900">{adv.topic}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {adv.crop}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        adv.severity_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        adv.severity_level === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {adv.severity_level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Author: <span className="font-semibold text-slate-700">{adv.author}</span> &bull; Verified: Yes &bull; Community Rating: {adv.helpful_votes} Helpful Votes
                    </p>
                  </div>

                  <button className="self-end sm:self-center p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Diagnostic Symptoms */}
                <div className="text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Diagnostic Physical Symptoms</span>
                  <div className="space-y-1">
                    {(adv.symptoms || []).map((sym: string, idx: number) => (
                      <div key={idx} className="flex items-start text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 flex-shrink-0 mt-1.5"></span>
                        <span>{sym}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nested Recommendations (Visible when expanded) */}
                {isExpanded && adv.recommendations && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs animate-fadeIn">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Multi-Faceted Agronomic Interventions:
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {adv.recommendations.cultural_practices && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-800 block mb-1 flex items-center">
                            <Leaf className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Cultural Practices
                          </span>
                          <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                            {adv.recommendations.cultural_practices.map((cp: string, cIdx: number) => (
                              <li key={cIdx}>{cp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {adv.recommendations.fertilizer_advice && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-800 block mb-1 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" /> Fertilizer &amp; Nutrition Advice
                          </span>
                          <p className="text-slate-600 text-[11px]">{adv.recommendations.fertilizer_advice}</p>
                        </div>
                      )}

                      {adv.recommendations.biological_control && (
                        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                          <span className="font-bold text-emerald-900 block mb-1 flex items-center">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Biological / Organic Control
                          </span>
                          <p className="text-emerald-800 text-[11px]">{adv.recommendations.biological_control}</p>
                        </div>
                      )}

                      {adv.recommendations.chemical_control && (
                        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                          <span className="font-bold text-blue-900 block mb-1 flex items-center">
                            <Bug className="w-3.5 h-3.5 mr-1 text-blue-700" /> Chemical Measures (Dosage &amp; Timing)
                          </span>
                          <p className="text-blue-800 text-[11px]">{adv.recommendations.chemical_control}</p>
                        </div>
                      )}
                    </div>

                    {adv.tags?.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                        <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {adv.tags.map((tag: string, tIdx: number) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
