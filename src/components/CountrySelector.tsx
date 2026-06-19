import { useState } from 'react';
import { History, Leaf, ChevronRight } from 'lucide-react';
import { CountryCode } from '../data/countries';
import countries from '../data/countries';
import { getLatestEntry, getHistory, HistoryEntry } from '../utils/history';
import HistoryChart from './HistoryChart';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onSelect: (code: CountryCode) => void;
  onViewHistory: () => void;
}

const countryKeys: CountryCode[] = ['IN', 'NG', 'DE', 'BR', 'KE', 'US'];

export default function CountrySelector({ onSelect, onViewHistory }: Props) {
  const { t } = useLanguage();
  const [latest] = useState<HistoryEntry | null>(() => getLatestEntry());
  const [history] = useState<HistoryEntry[]>(() => getHistory());
  const [showHistory, setShowHistory] = useState(false);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fade-in min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <p className="text-breathe-green font-medium text-sm tracking-wider uppercase mb-3">
          {t('cs_appName')}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-2">
          {t('cs_whereBreathing')}
        </h1>
        <p className="text-gray-400 text-sm mb-10">
          {t('cs_tagline')}
        </p>

        {latest && (
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-breathe-green/15 mb-8 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Leaf size={14} className="text-breathe-green" />
              <span className="text-sm font-semibold text-gray-700">{t('cs_welcomeBack')}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(latest.total)} <span className="text-sm font-normal text-gray-400">{t('cs_kgPerMonth')}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {latest.moodEmoji} {latest.moodText} &middot; {formatDate(latest.date)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  aria-label="View your history"
                  className="flex items-center gap-1 text-breathe-green text-xs font-medium hover:underline"
                >
                  <History size={12} /> {t('cs_history')}
                </button>
                <button
                  onClick={onViewHistory}
                  aria-label="Retake quiz from previous country"
                  className="flex items-center gap-1 text-gray-400 text-xs font-medium hover:text-gray-600"
                >
                  {t('cs_retake')} <ChevronRight size={10} />
                </button>
              </div>
            </div>
          </div>
        )}

        {showHistory && history.length > 0 && (
          <div className="mb-8">
            <HistoryChart entries={history} />
          </div>
        )}

        {/* Small grid heading with animated globe emoji */}
        <div className="flex items-center justify-center gap-2 mb-4 text-sm font-semibold text-gray-500">
          <span>Where are you breathing from?</span>
          <span className="inline-block animate-spin-slow text-base leading-none">🌍</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {countryKeys.map((code) => {
            const c = countries[code];
            
            const getFootprintColor = (avg: number) => {
              if (avg < 150) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50', label: 'Low' };
              if (avg < 400) return { bg: 'bg-amber-50 text-amber-700 border-amber-200/50', label: 'Medium' };
              return { bg: 'bg-red-50 text-red-700 border-red-200/50', label: 'High' };
            };
            const badge = getFootprintColor(c.avgFootprint);

            return (
              <button
                key={code}
                onClick={() => onSelect(code)}
                aria-label={`Select ${c.name}, average ${c.avgFootprint} kg CO2 per month`}
                className="relative group bg-white rounded-[20px] p-7 shadow-sm hover:shadow-[0_0_20px_rgba(29,158,117,0.15)] border border-gray-100 hover:border-breathe-green/40 transition-all duration-300 text-left"
              >
                <div className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                  {badge.label}
                </div>
                <span className="text-[32px] block mb-3 group-hover:scale-110 transition-transform duration-300 leading-none">{c.flag}</span>
                <h3 className="font-semibold text-gray-800 text-base">{c.name}</h3>
                <p className="text-gray-400 text-xs mt-1">{t('cs_avgFootprint', { n: c.avgFootprint })}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
