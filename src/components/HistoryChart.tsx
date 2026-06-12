import { HistoryEntry } from '../utils/history';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  entries: HistoryEntry[];
}

export default function HistoryChart({ entries }: Props) {
  const { t } = useLanguage();
  const recent = entries.slice(-6);
  if (recent.length === 0) return null;

  const maxTotal = Math.max(...recent.map((e) => e.total), 1);

  const formatMonth = (isoDate: string) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', { month: 'short' });
  };

  const formatFullDate = (isoDate: string) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('hist_title')}</h3>

      <div className="flex items-end gap-3 h-36 mb-2">
        {recent.map((entry, i) => {
          const heightPct = (entry.total / maxTotal) * 100;
          const isLatest = i === recent.length - 1;
          return (
            <div key={entry.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-gray-500">{Math.round(entry.total)}</span>
              <div className="w-full flex justify-center">
                <div
                  className={`w-8 rounded-t-lg transition-all duration-500 ${
                    isLatest ? 'bg-breathe-green' : 'bg-breathe-green/30'
                  }`}
                  style={{ height: `${Math.max(heightPct, 8)}%` }}
                  aria-label={`${formatFullDate(entry.date)}: ${Math.round(entry.total)} kg CO2`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        {recent.map((entry) => (
          <div key={entry.date} className="flex-1 text-center">
            <span className="text-[10px] text-gray-400">{formatMonth(entry.date)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-breathe-green inline-block" /> {t('hist_latest')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-breathe-green/30 inline-block" /> {t('hist_previous')}
        </span>
        <span className="ml-auto">{t('hist_unit')}</span>
      </div>
    </div>
  );
}
