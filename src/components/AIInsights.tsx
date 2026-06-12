import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, RefreshCw, Leaf } from 'lucide-react';
import { CountryCode } from '../data/countries';
import countries from '../data/countries';
import { FootprintBreakdown, QuizAnswers } from '../utils/calculator';

interface Props {
  countryCode: CountryCode;
  languageCode: string;
  breakdown: FootprintBreakdown;
  answers: QuizAnswers;
}

const SAMPLE_INSIGHTS: Record<string, string> = {
  IN: "Your daily commute is the biggest part of your footprint. Think of it this way: every auto-rickshaw ride adds a little more to Delhi's haze. But here's the good news: your vegetarian diet is already one of the lightest on the planet. That's something to feel genuinely good about. This week, try swapping even one auto ride to the metro. It's often faster in city traffic, and you'll cut your transport footprint noticeably.",
  NG: "Your transport choices make up the largest share of your footprint. Every danfo ride across Lagos adds a bit more to the air you breathe. But you're probably already eating more plant-based meals than most of the world. That's a real advantage. This week, try walking short distances instead of taking an okada. Your lungs and your wallet will both thank you.",
  DE: "Your car use is driving most of your carbon output. Each Berlin-to-Hamburg drive adds about 28 kg of CO2 to the air. But your relatively efficient home energy use is something to be proud of. Germany's grid is getting cleaner every year. This week, try taking the U-Bahn or S-Bahn for one trip you'd usually drive. It's reliable, and you'll notice the difference.",
  BR: "Your transport footprint tells a story about city life in Brazil. Every ride across town adds to the air above your city. But your diet, rich in rice and beans, is already more climate-friendly than most. That's worth celebrating. This week, try the metro instead of driving for one trip. It's often faster during rush hour anyway.",
  KE: "Your daily commute adds the most to your footprint, especially if you use a boda boda or private car. But your plant-heavy diet with ugali and vegetables is one of the lightest in the world. That's a real strength. This week, try a matatu ride instead of a boda boda for one trip. It's cheaper and gentler on the air around you.",
  US: "Your car is the biggest contributor to your carbon footprint. Each mile adds more than most people realize. But if you're already eating less meat than the average American, that's genuinely making a difference. This week, try carpooling or taking transit for just one trip. Small changes add up fast when millions of people make them.",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', hi: 'Hindi', mr: 'Marathi', ta: 'Tamil', te: 'Telugu',
  yo: 'Yoruba', ha: 'Hausa', ig: 'Igbo', de: 'German', pt: 'Portuguese',
  es: 'Spanish', sw: 'Swahili',
};

export default function AIInsights({ countryCode, languageCode, breakdown, answers }: Props) {
  const country = countries[countryCode];
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [usingSample, setUsingSample] = useState(false);

  const transportLabel = country.transportOptions.find((o) => o.id === answers.transportId)?.label ?? answers.transportId;
  const dietLabel = country.dietOptions.find((o) => o.id === answers.dietId)?.label ?? answers.dietId;
  const langName = LANGUAGE_NAMES[languageCode] ?? languageCode;

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    setError(false);
    setUsingSample(false);
    setInsight('');

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      setInsight(SAMPLE_INSIGHTS[countryCode] ?? SAMPLE_INSIGHTS['US']);
      setUsingSample(true);
      setLoading(false);
      return;
    }

    try {
      const systemPrompt = `You are a warm, caring carbon awareness coach named Breathe. You speak like a thoughtful friend who genuinely cares, not a data report. Respond in ${langName}. Be specific, locally realistic, and encouraging about what is achievable in ${country.name}. Never suggest options unavailable there. Under 130 words, 3 short paragraphs, no bullet points, conversational tone.`;

      const userPrompt = `Person lives in ${country.name}. Monthly carbon footprint:
Transport (${transportLabel}, ${answers.weeklyKm}km/week): ${Math.round(breakdown.transport)} kg CO2
Food (${dietLabel}): ${Math.round(breakdown.food)} kg CO2
Home energy (${answers.electricityKwh} kWh): ${Math.round(breakdown.energy)} kg CO2
Shopping: ${Math.round(breakdown.shopping)} kg CO2
Total: ${Math.round(breakdown.total)} kg/month which is ${Math.round(breakdown.pctOfAvg)}% of the ${country.name} average (${country.avgFootprint} kg/mo)
Highest category: ${breakdown.highestCategory}

Write 3 paragraphs:
1. Warmly acknowledge their highest impact with a specific local real-world comparison that makes it feel real
2. Genuinely celebrate one thing they are probably already doing right based on their data
3. Give one specific easy win they can start this week - realistic and available in ${country.name}, not generic advice`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const text = data.content?.[0]?.text;
      if (text) {
        setInsight(text);
      } else {
        throw new Error('No content in response');
      }
    } catch {
      setError(true);
      setInsight(SAMPLE_INSIGHTS[countryCode] ?? SAMPLE_INSIGHTS['US']);
      setUsingSample(true);
    } finally {
      setLoading(false);
    }
  }, [countryCode, languageCode, breakdown, answers, country, transportLabel, dietLabel, langName]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return (
    <div className="bg-breathe-green/[0.04] rounded-2xl p-6 shadow-sm border border-breathe-green/15">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-breathe-green/10 flex items-center justify-center">
            <MessageCircle size={16} className="text-breathe-green" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">Breathe says</h3>
        </div>
        {!loading && (
          <button
            onClick={fetchInsight}
            aria-label="Regenerate insights"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-breathe-green transition-colors px-2 py-1 rounded-lg hover:bg-breathe-green/5"
          >
            <RefreshCw size={12} /> Regenerate
          </button>
        )}
      </div>

      {/* Loading state with breathing animation */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="breathe-pulse flex items-center justify-center w-14 h-14 rounded-full bg-breathe-green/10">
            <Leaf size={24} className="text-breathe-green" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Breathe is thinking...</p>
            <p className="text-xs text-gray-400 mt-1">Crafting something personal for you</p>
          </div>
        </div>
      )}

      {/* Insight content */}
      {!loading && insight && (
        <div className="space-y-3">
          {usingSample && (
            <div className="flex items-center gap-2 text-amber-600/80 text-xs bg-amber-50/50 px-3 py-2 rounded-lg mb-2">
              <Leaf size={12} className="shrink-0" />
              <span>Showing a sample insight. Connect an API key for personalized results.</span>
            </div>
          )}
          {error && !usingSample && (
            <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-50/50 px-3 py-2 rounded-lg mb-2">
              <span>Could not reach the API. Showing a sample insight instead.</span>
            </div>
          )}
          {insight.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-gray-700 text-sm leading-relaxed">{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  );
}
