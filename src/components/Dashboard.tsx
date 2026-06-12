import { useState } from 'react';
import { Truck, Carrot, Zap, ShoppingBag, Leaf, Save, Check } from 'lucide-react';
import { CountryCode } from '../data/countries';
import countries from '../data/countries';
import { FootprintBreakdown, getComparisonBars, getEmotionalEquivalent } from '../utils/calculator';
import { saveToHistory } from '../utils/history';
import WhatIfSimulator from './WhatIfSimulator';

interface Props {
  countryCode: CountryCode;
  languageCode: string;
  breakdown: FootprintBreakdown;
  onContinue: () => void;
}

export default function Dashboard({ countryCode, languageCode, breakdown, onContinue }: Props) {
  const country = countries[countryCode];
  const comparisons = getComparisonBars(breakdown, countryCode);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveToHistory({
      countryCode,
      languageCode,
      transport: breakdown.transport,
      food: breakdown.food,
      energy: breakdown.energy,
      shopping: breakdown.shopping,
      total: breakdown.total,
      pctOfAvg: breakdown.pctOfAvg,
      mood: breakdown.mood,
      moodEmoji: breakdown.moodEmoji,
      moodText: breakdown.moodText,
    });
    setSaved(true);
  };

  const categories = [
    { key: 'transport' as const, label: 'Transport', icon: <Truck size={18} />, value: breakdown.transport, color: 'bg-breathe-blue' },
    { key: 'food' as const, label: 'Food', icon: <Carrot size={18} />, value: breakdown.food, color: 'bg-breathe-green' },
    { key: 'energy' as const, label: 'Energy', icon: <Zap size={18} />, value: breakdown.energy, color: 'bg-amber-400' },
    { key: 'shopping' as const, label: 'Shopping', icon: <ShoppingBag size={18} />, value: breakdown.shopping, color: 'bg-purple-400' },
  ];

  const maxCat = Math.max(...categories.map((c) => c.value));

  return (
    <div className="fade-in min-h-screen px-4 py-8 pb-16">
      <div className="max-w-lg mx-auto">
        {/* Score */}
        <div className="text-center mb-10 score-appear">
          <div className="inline-flex items-center gap-2 bg-breathe-green/10 text-breathe-green text-xs font-medium px-3 py-1 rounded-full mb-5">
            <Leaf size={12} className="animate-pulse" /> Your footprint
          </div>
          <div className="breathe-glow inline-block rounded-3xl px-8 py-5">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-800 tracking-tight">
              {Math.round(breakdown.total)}
            </h1>
            <p className="text-breathe-green font-semibold text-base mt-1">kg CO&#8322; this month</p>
          </div>

          {/* Mood */}
          <div className="mt-5 inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-xl">{breakdown.moodEmoji}</span>
            <span className="font-semibold text-gray-700 text-sm">{breakdown.moodText}</span>
          </div>
        </div>

        {/* Comparison bars */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">How you compare</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>You</span>
                <span>{Math.round(comparisons.youValue)} kg</span>
              </div>
              <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-breathe-green rounded-full transition-all duration-700" style={{ width: `${comparisons.you}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{country.name} average</span>
                <span>{Math.round(comparisons.countryAvgValue)} kg</span>
              </div>
              <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-breathe-blue rounded-full transition-all duration-700" style={{ width: `${comparisons.countryAvg}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Paris target</span>
                <span>{Math.round(comparisons.parisValue)} kg</span>
              </div>
              <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${comparisons.parisTarget}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {categories.map((cat, i) => (
            <div
              key={cat.key}
              className={`slide-up stagger-${i + 1} bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-t-2 border-t-breathe-green/40`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-400">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-500">{cat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{Math.round(cat.value)} <span className="text-xs font-normal text-gray-400">kg</span></p>
              <div className="h-1.5 bg-gray-50 rounded-full mt-3 overflow-hidden">
                <div className={`h-full ${cat.color} rounded-full transition-all duration-700`} style={{ width: `${maxCat > 0 ? (cat.value / maxCat) * 100 : 0}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic leading-relaxed">
                {getEmotionalEquivalent(countryCode, cat.key, cat.value)}
              </p>
            </div>
          ))}
        </div>

        {/* What-if simulator */}
        <WhatIfSimulator countryCode={countryCode} currentTotal={breakdown.total} />

        {/* Save & Continue buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleSave}
            disabled={saved}
            aria-label="Save this month's result to history"
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              saved
                ? 'bg-breathe-green/10 text-breathe-green border border-breathe-green/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-breathe-green/30 hover:text-breathe-green'
            }`}
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Saved to your history' : "Save this month's result"}
          </button>
          <button
            onClick={onContinue}
            aria-label="Get AI insights about your footprint"
            className="w-full py-3.5 rounded-xl bg-breathe-green text-white font-semibold text-base shadow-lg shadow-breathe-green/25 hover:shadow-xl hover:shadow-breathe-green/30 transition-all duration-300"
          >
            Get personalized insights
          </button>
        </div>
      </div>
    </div>
  );
}
