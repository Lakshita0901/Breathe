import { useState } from 'react';
import { Copy, Check, Leaf } from 'lucide-react';
import { CountryCode } from '../data/countries';
import { FootprintBreakdown, getEmotionalEquivalent } from '../utils/calculator';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../translations';

interface Props {
  countryCode: CountryCode;
  breakdown: FootprintBreakdown;
  regionId?: string;
}

/**
 * ShareCard Component
 * 
 * Renders a shareable score card preview presenting the user's carbon footprint.
 * Provides a click-to-copy button that copies a pre-formatted, translated text summary
 * suitable for sharing on LinkedIn or other professional networks.
 * 
 * Features:
 * - Direct copy via modern navigator.clipboard API.
 * - Textarea fallback mechanism to ensure capability in older browsers or restricted iframe environments.
 * 
 * @param props.countryCode - ISO country code representing the user's country.
 * @param props.breakdown - User's calculated monthly footprint metrics.
 * @param props.regionId - User's region context identifier (optional).
 */
export default function ShareCard({ countryCode, breakdown, regionId }: Props) {
  const { t, lang } = useLanguage();
  const localCountryName = t(`country_${countryCode}` as TranslationKey);
  const [copied, setCopied] = useState(false);

  const totalEmotional = getEmotionalEquivalent(countryCode, 'total', breakdown.total, regionId, lang);

  const moodKey = `mood_${breakdown.mood}` as TranslationKey;
  const translatedMood = t(moodKey);

  const shareText = `${t('share_myFootprint', { n: Math.round(breakdown.total) })}

${breakdown.moodEmoji} ${translatedMood}

${t('dash_transport')}: ${Math.round(breakdown.transport)} kg | ${t('dash_food')}: ${Math.round(breakdown.food)} kg | ${t('dash_energy')}: ${Math.round(breakdown.energy)} kg | ${t('dash_shopping')}: ${Math.round(breakdown.shopping)} kg

${t('share_pctOfAvg', { n: Math.round(breakdown.pctOfAvg), country: localCountryName })}

${totalEmotional}

${t('share_tagline')}

#Breathe #PromptWarsVirtual #Challenge3 #Sustainability #CarbonAwareness`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('share_title')}</h3>

      {/* Card preview */}
      <div className="bg-gradient-to-br from-breathe-green/5 to-breathe-blue/5 rounded-[20px] p-6 border border-breathe-green/10 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Leaf size={18} className="text-breathe-green" />
          <span className="font-bold text-breathe-green text-base">{t('cs_appName')}</span>
        </div>
        <p className="text-2xl font-bold text-gray-800 mb-1">
          {Math.round(breakdown.total)} <span className="text-sm font-normal text-gray-400">{t('cs_kgPerMonth')}</span>
        </p>
        <p className="text-sm text-gray-500 mb-3">
          {breakdown.moodEmoji} {translatedMood}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-white/80 text-gray-600 px-2 py-1 rounded-lg">{t('dash_transport')} {Math.round(breakdown.transport)}</span>
          <span className="text-xs bg-white/80 text-gray-600 px-2 py-1 rounded-lg">{t('dash_food')} {Math.round(breakdown.food)}</span>
          <span className="text-xs bg-white/80 text-gray-600 px-2 py-1 rounded-lg">{t('dash_energy')} {Math.round(breakdown.energy)}</span>
          <span className="text-xs bg-white/80 text-gray-600 px-2 py-1 rounded-lg">{t('dash_shopping')} {Math.round(breakdown.shopping)}</span>
        </div>
        <p className="text-xs text-gray-400">{t('share_pctOfAvg', { n: Math.round(breakdown.pctOfAvg), country: localCountryName })}</p>
        <p className="text-xs text-gray-400 italic mt-1">{totalEmotional}</p>
        <p className="text-xs text-breathe-green/60 mt-3 font-medium">{t('share_tagline')}</p>
      </div>

      <button
        onClick={handleCopy}
        aria-label="Copy shareable score card text"
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
          copied
            ? 'bg-breathe-green text-white'
            : 'bg-gray-50 text-gray-600 border border-gray-100 hover:border-breathe-green/30 hover:text-breathe-green'
        }`}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? t('share_copied') : t('share_copyLinkedIn')}
      </button>
    </div>
  );
}
