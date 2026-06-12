import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CountryCode } from '../data/countries';
import countries from '../data/countries';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  countryCode: CountryCode;
  onSelect: (langCode: string) => void;
  onBack: () => void;
}

export default function LanguageSelector({ countryCode, onSelect, onBack }: Props) {
  const { t } = useLanguage();
  const country = countries[countryCode];
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fade-in min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <button
          onClick={onBack}
          aria-label="Go back to country selection"
          className="text-gray-400 hover:text-gray-600 text-sm mb-6 flex items-center gap-1 mx-auto transition-colors"
        >
          <ArrowLeft size={14} /> {t('ls_back')}
        </button>
        <p className="text-4xl mb-3">{country.flag}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
          {t('ls_chooseLanguage')}
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          {t('ls_insightsPersonal')}
        </p>
        <div className="space-y-3 mb-8">
          {country.languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              aria-label={`Select ${lang.name}`}
              className={`w-full py-3 px-5 rounded-xl text-left text-base font-medium transition-all duration-200 ${
                selected === lang.code
                  ? 'bg-breathe-green text-white shadow-md shadow-breathe-green/20'
                  : 'bg-white text-gray-700 border border-gray-100 hover:border-breathe-green/30'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          aria-label="Continue to quiz"
          className={`w-full py-3 rounded-xl font-semibold text-base transition-all duration-300 ${
            selected
              ? 'bg-breathe-green text-white shadow-lg shadow-breathe-green/25 hover:shadow-xl hover:shadow-breathe-green/30'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          {t('ls_continue')}
        </button>
      </div>
    </div>
  );
}
