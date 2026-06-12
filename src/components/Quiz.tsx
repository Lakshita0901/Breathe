import { useState } from 'react';
import { ArrowLeft, Carrot, Zap, ShoppingBag, Truck } from 'lucide-react';
import { CountryCode } from '../data/countries';
import countries from '../data/countries';
import { QuizAnswers } from '../utils/calculator';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  countryCode: CountryCode;
  onSubmit: (answers: QuizAnswers) => void;
  onBack: () => void;
}

export default function Quiz({ countryCode, onSubmit, onBack }: Props) {
  const { t } = useLanguage();
  const country = countries[countryCode];
  const [transportId, setTransportId] = useState<string>('');
  const [weeklyKm, setWeeklyKm] = useState<string>('50');
  const [dietId, setDietId] = useState<string>('');
  const [electricityKwh, setElectricityKwh] = useState<string>('200');
  const [monthlySpend, setMonthlySpend] = useState<string>('5000');
  const [section, setSection] = useState<number>(0);

  const unit = countryCode === 'US' ? 'miles' : 'km';

  const sections = [
    {
      title: t('quiz_transport'),
      icon: <Truck size={20} className="text-breathe-green" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-500 text-xs mb-2">{t('quiz_transportQ')}</p>
          {country.transportOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTransportId(opt.id)}
              aria-label={`Select ${opt.label}`}
              className={`w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                transportId === opt.id
                  ? 'bg-breathe-green text-white shadow-md shadow-breathe-green/20'
                  : 'bg-white text-gray-700 border border-gray-100 hover:border-breathe-green/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <div className="mt-4">
            <label className="text-gray-600 text-sm font-medium block mb-1" htmlFor="weeklyKm">
              {t('quiz_weeklyDistance', { unit })}
            </label>
            <input
              id="weeklyKm"
              type="number"
              min="0"
              value={weeklyKm}
              onChange={(e) => setWeeklyKm(e.target.value)}
              aria-label={`Weekly distance in ${unit}`}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-200 focus:border-breathe-green focus:ring-1 focus:ring-breathe-green/30 outline-none text-gray-800 text-sm transition-all"
              placeholder={t('quiz_distancePlaceholder')}
            />
          </div>
        </div>
      ),
      valid: transportId !== '',
    },
    {
      title: t('quiz_food'),
      icon: <Carrot size={20} className="text-breathe-green" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-500 text-xs mb-2">{t('quiz_foodQ')}</p>
          {country.dietOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setDietId(opt.id)}
              aria-label={`Select ${opt.label}`}
              className={`w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                dietId === opt.id
                  ? 'bg-breathe-green text-white shadow-md shadow-breathe-green/20'
                  : 'bg-white text-gray-700 border border-gray-100 hover:border-breathe-green/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ),
      valid: dietId !== '',
    },
    {
      title: t('quiz_energy'),
      icon: <Zap size={20} className="text-breathe-green" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-500 text-xs mb-2">{t('quiz_energyQ')}</p>
          <input
            id="electricityKwh"
            type="number"
            min="0"
            value={electricityKwh}
            onChange={(e) => setElectricityKwh(e.target.value)}
            aria-label="Monthly electricity usage in kWh"
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 focus:border-breathe-green focus:ring-1 focus:ring-breathe-green/30 outline-none text-gray-800 text-sm transition-all"
            placeholder={t('quiz_kwhPlaceholder')}
          />
          <p className="text-gray-400 text-xs">{country.electricityHint}</p>
        </div>
      ),
      valid: electricityKwh !== '' && Number(electricityKwh) >= 0,
    },
    {
      title: t('quiz_shopping'),
      icon: <ShoppingBag size={20} className="text-breathe-green" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-500 text-xs mb-2">{t('quiz_shoppingQ')}</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{country.currency}</span>
            <input
              id="monthlySpend"
              type="number"
              min="0"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(e.target.value)}
              aria-label="Monthly spend on new items"
              className="w-full py-2.5 pl-12 pr-4 rounded-xl border border-gray-200 focus:border-breathe-green focus:ring-1 focus:ring-breathe-green/30 outline-none text-gray-800 text-sm transition-all"
              placeholder="0"
            />
          </div>
        </div>
      ),
      valid: monthlySpend !== '' && Number(monthlySpend) >= 0,
    },
  ];

  const current = sections[section];
  const canProceed = current.valid;
  const isLast = section === sections.length - 1;

  const handleSubmit = () => {
    onSubmit({
      transportId,
      weeklyKm: Number(weeklyKm) || 0,
      dietId,
      electricityKwh: Number(electricityKwh) || 0,
      monthlySpend: Number(monthlySpend) || 0,
    });
  };

  return (
    <div className="fade-in min-h-screen flex flex-col items-center px-4 py-8">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="text-gray-400 hover:text-gray-600 text-sm mb-4 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={14} /> {t('quiz_back')}
        </button>

        <div className="text-center mb-6">
          <p className="text-breathe-green font-medium text-xs tracking-wider uppercase mb-2">
            {t('quiz_sectionOf', { n: section + 1, total: sections.length })}
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">
            {t('quiz_tagline')}
          </h1>
        </div>

        <div className="flex gap-1.5 mb-6">
          {sections.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= section ? 'bg-breathe-green' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          {current.icon}
          <h2 className="text-lg font-semibold text-gray-800">{current.title}</h2>
        </div>

        <div className="slide-up">{current.content}</div>

        <div className="flex gap-3 mt-8">
          {section > 0 && (
            <button
              onClick={() => setSection(section - 1)}
              aria-label="Previous section"
              className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all text-sm"
            >
              {t('quiz_previous')}
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) handleSubmit();
              else setSection(section + 1);
            }}
            disabled={!canProceed}
            aria-label={isLast ? 'See your footprint' : 'Next section'}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              canProceed
                ? 'bg-breathe-green text-white shadow-lg shadow-breathe-green/25 hover:shadow-xl'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isLast ? t('quiz_seeFootprint') : t('quiz_next')}
          </button>
        </div>
      </div>
    </div>
  );
}
