import { useState } from 'react';
import { Copy, Check, Leaf } from 'lucide-react';
import { CountryCode } from '../data/countries';
import countries from '../data/countries';
import { FootprintBreakdown, getEmotionalEquivalent } from '../utils/calculator';

interface Props {
  countryCode: CountryCode;
  breakdown: FootprintBreakdown;
}

export default function ShareCard({ countryCode, breakdown }: Props) {
  const country = countries[countryCode];
  const [copied, setCopied] = useState(false);

  const totalEmotional = getEmotionalEquivalent(countryCode, 'total', breakdown.total);

  const shareText = `My monthly carbon footprint: ${Math.round(breakdown.total)} kg CO₂

${breakdown.moodEmoji} ${breakdown.moodText}

Transport: ${Math.round(breakdown.transport)} kg | Food: ${Math.round(breakdown.food)} kg | Energy: ${Math.round(breakdown.energy)} kg | Shopping: ${Math.round(breakdown.shopping)} kg

${Math.round(breakdown.pctOfAvg)}% of ${country.name} average

${totalEmotional}

See what you breathe. Change what you leave.

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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Your score card</h3>

      {/* Card preview */}
      <div className="bg-gradient-to-br from-breathe-green/5 to-breathe-blue/5 rounded-2xl p-6 border border-breathe-green/10 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Leaf size={18} className="text-breathe-green" />
          <span className="font-bold text-breathe-green text-base">Breathe</span>
        </div>
        <p className="text-2xl font-bold text-gray-800 mb-1">
          {Math.round(breakdown.total)} <span className="text-sm font-normal text-gray-400">kg CO&#8322;/mo</span>
        </p>
        <p className="text-sm text-gray-500 mb-3">
          {breakdown.moodEmoji} {breakdown.moodText}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-white/80 text-gray-600 px-2 py-1 rounded-lg">Transport {Math.round(breakdown.transport)}</span>
          <span className="text-xs bg-white/80 text-gray-600 px-2 py-1 rounded-lg">Food {Math.round(breakdown.food)}</span>
          <span className="text-xs bg-white/80 text-gray-600 px-2 py-1 rounded-lg">Energy {Math.round(breakdown.energy)}</span>
          <span className="text-xs bg-white/80 text-gray-600 px-2 py-1 rounded-lg">Shopping {Math.round(breakdown.shopping)}</span>
        </div>
        <p className="text-xs text-gray-400">{Math.round(breakdown.pctOfAvg)}% of {country.name} average</p>
        <p className="text-xs text-gray-400 italic mt-1">{totalEmotional}</p>
        <p className="text-xs text-breathe-green/60 mt-3 font-medium">See what you breathe. Change what you leave.</p>
      </div>

      {/* Copy button */}
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
        {copied ? 'Copied to clipboard!' : 'Copy for LinkedIn'}
      </button>
    </div>
  );
}
