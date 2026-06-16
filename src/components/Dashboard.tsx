import { useState } from 'react';
import { Truck, Carrot, Zap, ShoppingBag, Leaf, Save, Check, RotateCcw } from 'lucide-react';
import { CountryCode } from '../data/countries';
import countries from '../data/countries';
import { FootprintBreakdown, QuizAnswers, getComparisonBars, getEmotionalEquivalent } from '../utils/calculator';
import { saveToHistory } from '../utils/history';
import WhatIfSimulator from './WhatIfSimulator';
import ChatBot from './ChatBot';
import ShareCard from './ShareCard';
import HistoryChart from './HistoryChart';
import { getHistory } from '../utils/history';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../translations';

interface Props {
  countryCode: CountryCode;
  languageCode: string;
  breakdown: FootprintBreakdown;
  answers: QuizAnswers;
  regionId?: string;
}

export default function Dashboard({ countryCode, languageCode, breakdown, answers, regionId }: Props) {
  const { t } = useLanguage();
  const country = countries[countryCode];
  const localCountryName = t(`country_${countryCode}` as TranslationKey);
  const history = getHistory();
  const comparisons = getComparisonBars(breakdown, countryCode);
  const [saved, setSaved] = useState(false);

  const moodKey = `mood_${breakdown.mood}` as TranslationKey;
  const translatedMoodText = t(moodKey);

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
    { key: 'transport' as const, label: t('dash_transport'), icon: <Truck size={18} />, value: breakdown.transport, color: 'bg-breathe-blue' },
    { key: 'food' as const, label: t('dash_food'), icon: <Carrot size={18} />, value: breakdown.food, color: 'bg-breathe-green' },
    { key: 'energy' as const, label: t('dash_energy'), icon: <Zap size={18} />, value: breakdown.energy, color: 'bg-amber-400' },
    { key: 'shopping' as const, label: t('dash_shopping'), icon: <ShoppingBag size={18} />, value: breakdown.shopping, color: 'bg-purple-400' },
  ];

  const maxCat = Math.max(...categories.map((c) => c.value));

  return (
    <div className="fade-in min-h-screen px-4 py-8 pb-16">
      <div className="max-w-lg mx-auto">
        {/* Top Header Navigation */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-3">
          <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-lg leading-none">{country.flag}</span>
            <span>{country.name}</span>
          </div>
          <button
            onClick={onStartOver}
            aria-label="Start over"
            className="text-gray-400 hover:text-breathe-green text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={12} /> {t('app_startOver')}
          </button>
        </div>

        {/* Score */}
        <div className="text-center mb-10 score-appear">
          <div className="inline-flex items-center gap-2 bg-breathe-green/10 text-breathe-green text-xs font-medium px-3 py-1 rounded-full mb-5">
            <Leaf size={12} className="animate-pulse" /> {t('dash_yourFootprint')}
          </div>
          <div className="breathe-glow inline-block rounded-3xl px-8 py-5">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-800 tracking-tight">
              {Math.round(breakdown.total)}
            </h1>
            <p className="text-breathe-green font-semibold text-base mt-1">{t('dash_kgThisMonth')}</p>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-xl">{breakdown.moodEmoji}</span>
            <span className="font-semibold text-gray-700 text-sm">{translatedMoodText}</span>
          </div>
        </div>

        {/* Comparison bars */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('dash_howYouCompare')}</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t('dash_you')}</span>
                <span>{Math.round(comparisons.youValue)} kg</span>
              </div>
              <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-breathe-green rounded-full transition-all duration-700" style={{ width: `${comparisons.you}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t('dash_countryAverage', { country: localCountryName })}</span>
                <span>{Math.round(comparisons.countryAvgValue)} kg</span>
              </div>
              <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-breathe-blue rounded-full transition-all duration-700" style={{ width: `${comparisons.countryAvg}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{t('dash_parisTarget')}</span>
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
              <p className="text-2xl font-bold text-gray-800">
                {Math.round(cat.value)} <span className="text-xs font-normal text-gray-400">kg</span>
              </p>
              <div className="h-1.5 bg-gray-50 rounded-full mt-3 overflow-hidden">
                <div className={`h-full ${cat.color} rounded-full transition-all duration-700`} style={{ width: `${maxCat > 0 ? (cat.value / maxCat) * 100 : 0}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic leading-relaxed">
                {getEmotionalEquivalent(countryCode, cat.key, cat.value, regionId, lang)}
              </p>
            </div>
          ))}
        </div>

        <WhatIfSimulator countryCode={countryCode} currentTotal={breakdown.total} />

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saved}
            aria-label="Save this month's result to history"
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${saved
                ? 'bg-breathe-green/10 text-breathe-green border border-breathe-green/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-breathe-green/30 hover:text-breathe-green'
              }`}
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? t('dash_savedHistory') : t('dash_saveResult')}
          </button>
        </div>

        <div className="mt-6">
          <ChatBot
            countryCode={countryCode}
            languageCode={languageCode}
            breakdown={breakdown}
            answers={answers}
            regionId={regionId}
          />
        </div>
      </div>
    </div>
  );
}
