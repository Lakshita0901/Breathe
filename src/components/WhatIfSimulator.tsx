import { useState, useEffect } from 'react';
import { Sparkles, TrendingDown, ArrowRight } from 'lucide-react';
import { CountryCode } from '../data/countries';
import countries from '../data/countries';
import { QuizAnswers, simulateWhatIf } from '../utils/calculator';

interface Props {
  countryCode: CountryCode;
  currentTotal: number;
}

const STORAGE_KEY = 'breathe_quiz_answers';

function getStoredAnswers(): QuizAnswers | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function WhatIfSimulator({ countryCode, currentTotal }: Props) {
  const country = countries[countryCode];
  const answers = getStoredAnswers();
  const [newTransport, setNewTransport] = useState<string>('');
  const [newDiet, setNewDiet] = useState<string>('');
  const [energyReduction, setEnergyReduction] = useState<number>(0);
  const [result, setResult] = useState<{ newTotal: number; saved: number; savedEmotional: string } | null>(null);

  useEffect(() => {
    if (!answers) return;
    const sim = simulateWhatIf(
      countryCode,
      answers,
      newTransport || undefined,
      newDiet || undefined,
      energyReduction > 0 ? energyReduction : undefined
    );
    setResult(sim);
  }, [newTransport, newDiet, energyReduction, countryCode, answers]);

  const hasChange = newTransport || newDiet || energyReduction > 0;

  return (
    <div className="bg-breathe-green/[0.03] rounded-2xl p-6 shadow-sm border border-breathe-green/15">
      {/* Heading */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-full bg-breathe-green/10 flex items-center justify-center">
          <Sparkles size={16} className="text-breathe-green" />
        </div>
        <h3 className="text-base font-semibold text-gray-800">What if you changed one thing?</h3>
      </div>
      <p className="text-xs text-gray-400 mb-5 ml-[42px]">See how small shifts could lighten your footprint</p>

      <div className="space-y-4">
        {/* Transport dropdown */}
        <div>
          <label className="text-xs text-gray-600 font-medium block mb-1.5" htmlFor="sim-transport">Change your transport</label>
          <select
            id="sim-transport"
            value={newTransport}
            onChange={(e) => setNewTransport(e.target.value)}
            aria-label="Select alternative transport mode"
            className="w-full py-2.5 px-4 rounded-xl border border-breathe-green/20 text-sm text-gray-700 bg-breathe-green/5 focus:border-breathe-green focus:ring-2 focus:ring-breathe-green/20 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Keep current</option>
            {country.transportOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Diet dropdown */}
        <div>
          <label className="text-xs text-gray-600 font-medium block mb-1.5" htmlFor="sim-diet">Change your diet</label>
          <select
            id="sim-diet"
            value={newDiet}
            onChange={(e) => setNewDiet(e.target.value)}
            aria-label="Select alternative diet"
            className="w-full py-2.5 px-4 rounded-xl border border-breathe-green/20 text-sm text-gray-700 bg-breathe-green/5 focus:border-breathe-green focus:ring-2 focus:ring-breathe-green/20 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Keep current</option>
            {country.dietOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Energy slider */}
        <div>
          <label className="text-xs text-gray-600 font-medium block mb-1.5" htmlFor="sim-energy">
            Reduce energy use by <span className="text-breathe-green font-semibold">{energyReduction}%</span>
          </label>
          <input
            id="sim-energy"
            type="range"
            min="0"
            max="50"
            step="5"
            value={energyReduction}
            onChange={(e) => setEnergyReduction(Number(e.target.value))}
            aria-label={`Reduce energy by ${energyReduction} percent`}
            className="w-full accent-breathe-green h-2"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>
      </div>

      {/* Result panel */}
      {hasChange && result && (
        <div className="mt-5 p-4 rounded-xl bg-white border border-breathe-green/15 shadow-sm">
          {result.saved > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={16} className="text-breathe-green" />
                <span className="text-sm font-semibold text-breathe-green">You could save {Math.round(result.saved)} kg CO&#8322;</span>
              </div>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-xs text-gray-500">New monthly total</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 line-through">{Math.round(currentTotal)} kg</span>
                  <ArrowRight size={12} className="text-breathe-green" />
                  <span className="text-lg font-bold text-gray-800">{Math.round(result.newTotal)} kg</span>
                </div>
              </div>
              <div className="bg-breathe-green/5 rounded-lg px-3 py-2.5">
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  That's {result.savedEmotional}
                </p>
              </div>
            </>
          )}
          {result.saved < 0 && (
            <>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-gray-500">New monthly total</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 line-through">{Math.round(currentTotal)} kg</span>
                  <ArrowRight size={12} className="text-amber-500" />
                  <span className="text-lg font-bold text-gray-800">{Math.round(result.newTotal)} kg</span>
                </div>
              </div>
              <p className="text-xs text-amber-600">
                This would add {Math.round(Math.abs(result.saved))} kg to your footprint
              </p>
            </>
          )}
          {result.saved === 0 && (
            <p className="text-xs text-gray-400">Same as your current selection</p>
          )}
        </div>
      )}

      {/* Prompt when no change selected */}
      {!hasChange && (
        <div className="mt-5 p-4 rounded-xl bg-white/50 border border-dashed border-breathe-green/15 text-center">
          <p className="text-xs text-gray-400">Pick a change above to see your potential savings</p>
        </div>
      )}
    </div>
  );
}
