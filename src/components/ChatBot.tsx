import { useState, useEffect, useRef } from 'react';
import { Send, Leaf, MessageCircle } from 'lucide-react';
import { CountryCode } from '../data/countries';
import countries from '../data/countries';
import { FootprintBreakdown, QuizAnswers } from '../utils/calculator';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../translations';

interface Props {
  countryCode: CountryCode;
  languageCode: string;
  breakdown: FootprintBreakdown;
  answers: QuizAnswers;
  regionId?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', hi: 'Hindi', mr: 'Marathi', ta: 'Tamil', te: 'Telugu',
  yo: 'Yoruba', ha: 'Hausa', ig: 'Igbo', de: 'German', pt: 'Portuguese',
  es: 'Spanish', sw: 'Swahili',
};

const SAMPLE_OPENINGS: Record<string, string> = {
  IN: "I've looked at your footprint and I can see your transport is the biggest contributor. Your vegetarian diet is already making a real difference though! Ask me anything about lowering your impact.",
  NG: "Your footprint is here! Your daily commute adds the most, but your plant-heavy diet is a real strength. Feel free to ask me anything about your score.",
  DE: "I've analyzed your footprint. Your car use stands out the most, but your efficient home energy is worth celebrating. Ask me anything!",
  BR: "Your footprint is ready! Transport is your biggest category, but your diet with rice and beans is already climate-friendly. What would you like to know?",
  KE: "Here's your footprint! Your commute adds the most, but your plant-based diet is one of the lightest in the world. Ask me anything!",
  US: "Your footprint is ready! Your car is the biggest contributor, but if you're eating less meat than average, that's genuinely helping. What would you like to know?",
};

export default function ChatBot({ countryCode, languageCode, breakdown, answers, regionId }: Props) {
  const { t } = useLanguage();
  const country = countries[countryCode];
  const langName = LANGUAGE_NAMES[languageCode] ?? languageCode;
  const transportLabel = country.transportOptions.find((o) => o.id === answers.transportId)?.label ?? answers.transportId;
  const dietLabel = country.dietOptions.find((o) => o.id === answers.dietId)?.label ?? answers.dietId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usingSample, setUsingSample] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chipKeys: TranslationKey[] = ['chat_chipBiggest', 'chat_chipEasyTip', 'chat_chipEnergy', 'chat_chipScore'];

  const systemPrompt = `You are Breathe, a warm, caring carbon awareness coach. You speak like a thoughtful friend who genuinely cares. YOU MUST RESPOND IN ${langName}. Never respond in English unless ${langName} is English. Be specific, locally realistic, and encouraging about what is achievable in ${country.name}. Never suggest options unavailable there. Keep responses under 120 words. Conversational tone, no bullet points.

The user lives in ${country.name}${regionId ? `, region: ${regionId}` : ''}. Their monthly carbon footprint:
- Transport (${transportLabel}, ${answers.weeklyKm}km/week): ${Math.round(breakdown.transport)} kg CO2
- Food (${dietLabel}): ${Math.round(breakdown.food)} kg CO2
- Home energy (${answers.electricityKwh} kWh): ${Math.round(breakdown.energy)} kg CO2
- Shopping: ${Math.round(breakdown.shopping)} kg CO2
- Total: ${Math.round(breakdown.total)} kg/month (${Math.round(breakdown.pctOfAvg)}% of ${country.name} average of ${country.avgFootprint} kg/mo)
- Highest category: ${breakdown.highestCategory}`;

  async function sendMessage(userContent: string) {
    if (!userContent.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: userContent.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      const sampleReply = generateSampleReply(userContent);
      setTimeout(() => {
        setMessages([...updatedMessages, { role: 'assistant', content: sampleReply }]);
        setLoading(false);
        setUsingSample(true);
      }, 800);
      return;
    }

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

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
          messages: apiMessages,
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const text = data.content?.[0]?.text;
      if (text) {
        setMessages([...updatedMessages, { role: 'assistant', content: text }]);
      } else {
        throw new Error('No content in response');
      }
    } catch {
      const sampleReply = generateSampleReply(userContent);
      setMessages([...updatedMessages, { role: 'assistant', content: sampleReply }]);
      setUsingSample(true);
    } finally {
      setLoading(false);
    }
  }

  function generateSampleReply(question: string): string {
    const q = question.toLowerCase();
    if (q.includes('biggest') || q.includes('problem') || q.includes('largest')) {
      return `Your biggest impact is ${breakdown.highestCategory} at ${Math.round(breakdown[breakdown.highestCategory])} kg CO2/month. That's ${Math.round((breakdown[breakdown.highestCategory] / breakdown.total) * 100)}% of your total footprint. Focus here for the biggest improvement.`;
    }
    if (q.includes('easy') || q.includes('tip') || q.includes('simple')) {
      return `One easy win: try reducing your ${breakdown.highestCategory} by just 10%. That would save about ${Math.round(breakdown[breakdown.highestCategory] * 0.1)} kg CO2/month. Small changes add up when they become habits.`;
    }
    if (q.includes('energy') || q.includes('electricity')) {
      return `Your energy use produces ${Math.round(breakdown.energy)} kg CO2/month. Switching to LED bulbs, unplugging devices, and using a clothes line instead of a dryer are easy ways to cut this down in ${country.name}.`;
    }
    if (q.includes('score') || q.includes('mean') || q.includes('result')) {
      return `Your score of ${Math.round(breakdown.total)} kg CO2/month is ${Math.round(breakdown.pctOfAvg)}% of the ${country.name} average (${country.avgFootprint} kg). ${breakdown.pctOfAvg < 100 ? 'You\'re below average — great work!' : 'You\'re above average, but small changes can bring it down fast.'}`;
    }
    return SAMPLE_OPENINGS[countryCode] ?? SAMPLE_OPENINGS['US'];
  }

  useEffect(() => {
    if (messages.length > 0) return;

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const noKey = !apiKey || apiKey === 'your_key_here';

    if (noKey) {
      setMessages([{ role: 'assistant', content: SAMPLE_OPENINGS[countryCode] ?? SAMPLE_OPENINGS['US'] }]);
      setUsingSample(true);
      return;
    }

    setLoading(true);
    const openingPrompt = `Hi! I just calculated my carbon footprint. My total is ${Math.round(breakdown.total)} kg CO2/month in ${country.name}. Can you give me a quick overview?`;

    fetch('https://api.anthropic.com/v1/messages', {
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
        messages: [{ role: 'user', content: openingPrompt }],
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data) => {
        const text = data.content?.[0]?.text;
        setMessages([{ role: 'assistant', content: text ?? SAMPLE_OPENINGS[countryCode] ?? SAMPLE_OPENINGS['US'] }]);
      })
      .catch(() => {
        setMessages([{ role: 'assistant', content: SAMPLE_OPENINGS[countryCode] ?? SAMPLE_OPENINGS['US'] }]);
        setUsingSample(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const showChips = messages.length <= 1 && !loading;

  return (
    <div className="bg-breathe-green/[0.03] rounded-2xl shadow-sm border border-breathe-green/15 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-4 pb-2">
        <div className="w-8 h-8 rounded-full bg-breathe-green/10 flex items-center justify-center">
          <MessageCircle size={16} className="text-breathe-green" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{t('ai_title')}</h3>
        {usingSample && (
          <span className="text-[10px] text-amber-600/70 bg-amber-50/60 px-2 py-0.5 rounded-full ml-auto">sample</span>
        )}
      </div>

      {/* Messages */}
      <div className="px-4 pb-3 max-h-80 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-br-sm'
                  : 'bg-breathe-green/8 text-gray-700 border border-breathe-green/10 rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-breathe-green/15 flex items-center justify-center">
                    <Leaf size={10} className="text-breathe-green" />
                  </div>
                  <span className="text-[10px] font-medium text-breathe-green/60">Breathe</span>
                </div>
              )}
              {msg.content.split('\n\n').map((p, j) => (
                <p key={j} className={j > 0 ? 'mt-2' : ''}>{p}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-breathe-green/8 rounded-2xl rounded-bl-sm px-3.5 py-3 border border-breathe-green/10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-breathe-green/15 flex items-center justify-center breathe-pulse">
                  <Leaf size={10} className="text-breathe-green" />
                </div>
                <span className="text-xs text-gray-400">{t('chat_thinking')}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested chips */}
      {showChips && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {chipKeys.map((key) => (
            <button
              key={key}
              onClick={() => sendMessage(t(key))}
              className="text-[11px] px-3 py-1.5 rounded-full bg-breathe-green/8 text-breathe-green/80 border border-breathe-green/15 hover:bg-breathe-green/15 hover:text-breathe-green transition-all cursor-pointer"
            >
              {t(key)}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat_placeholder')}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-breathe-green/20 text-sm text-gray-700 bg-white placeholder:text-gray-300 focus:border-breathe-green focus:ring-2 focus:ring-breathe-green/20 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="w-10 h-10 rounded-xl bg-breathe-green text-white flex items-center justify-center shadow-sm hover:shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
