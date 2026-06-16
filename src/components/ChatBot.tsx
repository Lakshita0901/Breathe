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

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  en: { transport: 'transport', food: 'food', energy: 'energy', shopping: 'shopping' },
  hi: { transport: '\u092A\u0930\u093F\u0935\u0939\u0928', food: '\u0916\u093E\u0928\u093E', energy: '\u092A\u0930\u094D\u092F\u094B\u091C\u0928', shopping: '\u0936\u0949\u092A\u093F\u0902\u0917' },
  mr: { transport: '\u0935\u093E\u0939\u0924\u0942\u0915', food: '\u0905\u0928\u094D\u0928', energy: '\u090A\u0930\u094D\u091C\u093E', shopping: '\u0916\u0930\u0947\u0926\u0940' },
  ta: { transport: '\u0BAA\u0BCB\u0B95\u0BCD\u0B95\u0BC1\u0BB5\u0BB0\u0BA4\u0BCD\u0BA4\u0BC1', food: '\u0B89\u0BA3\u0BB5\u0BC1', energy: '\u0B86\u0BB1\u0BCD\u0BB1\u0BB2\u0BCD', shopping: '\u0B95\u0B9F\u0BC8' },
  te: { transport: '\u0C30\u0C35\u0C3E\u0C23\u0C3E', food: '\u0C06\u0C39\u0C3E\u0C30\u0C02', energy: '\u0C36\u0C15\u0C4D\u0C24\u0C3F', shopping: '\u0C37\u0C3E\u0C2A\u0C3F\u0C02\u0C17\u0C4D' },
  yo: { transport: 'Gbigbe', food: 'Ounj\u1EB9', energy: 'Agbara', shopping: 'Rira' },
  ha: { transport: 'Sufuri', food: 'Abinci', energy: 'Makamashin', shopping: 'Siyayya' },
  ig: { transport: 'Njem', food: 'Nri', energy: 'Ike', shopping: '\u1ECAz\u1EE5 ah\u1ECB\u0300a' },
  de: { transport: 'Verkehr', food: 'Ern\u00E4hrung', energy: 'Energie', shopping: 'Einkaufen' },
  pt: { transport: 'Transporte', food: 'Alimenta\u00E7\u00E3o', energy: 'Energia', shopping: 'Compras' },
  es: { transport: 'Transporte', food: 'Alimentaci\u00F3n', energy: 'Energ\u00EDa', shopping: 'Compras' },
  sw: { transport: 'Usafiri', food: 'Chakula', energy: 'Nishati', shopping: 'Ununuzi' },
};

export default function ChatBot({ countryCode, languageCode, breakdown, answers, regionId }: Props) {
  const { t } = useLanguage();
  const country = countries[countryCode];
  const langName = LANGUAGE_NAMES[languageCode] ?? languageCode;
  const localCategory = CATEGORY_LABELS[languageCode]?.[breakdown.highestCategory] ?? breakdown.highestCategory;
  const transportLabel = t(`transport_${answers.transportId}` as TranslationKey);
  const dietLabel = t(`diet_${answers.dietId}` as TranslationKey);
  const localCountryName = t(`country_${countryCode}` as TranslationKey);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usingSample, setUsingSample] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chipKeys: TranslationKey[] = ['chat_chipBiggest', 'chat_chipEasyTip', 'chat_chipEnergy', 'chat_chipScore'];

  const systemPrompt = `You are Breathe, a warm, caring carbon awareness coach. You speak like a thoughtful friend who genuinely cares. YOU MUST RESPOND ONLY IN ${langName}. Never respond in English unless ${langName} is English. Be specific, locally realistic, and encouraging about what is achievable in ${localCountryName}. Never suggest options unavailable there. Keep responses under 120 words. Conversational tone, no bullet points.

The user lives in ${localCountryName}${regionId ? `, region: ${regionId}` : ''}. Their monthly carbon footprint:
- Transport (${transportLabel}, ${answers.weeklyKm}km/week): ${Math.round(breakdown.transport)} kg CO2
- Food (${dietLabel}): ${Math.round(breakdown.food)} kg CO2
- Home energy (${answers.electricityKwh} kWh): ${Math.round(breakdown.energy)} kg CO2
- Shopping: ${Math.round(breakdown.shopping)} kg CO2
- Total: ${Math.round(breakdown.total)} kg/month (${Math.round(breakdown.pctOfAvg)}% of ${localCountryName} average of ${country.avgFootprint} kg/mo)
- Highest category: ${localCategory}`;

  async function sendMessage(userContent: string) {
    if (!userContent.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: userContent.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
      setTimeout(() => {
        setMessages([...updatedMessages, { role: 'assistant', content: localOpening() }]);
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
      setMessages([...updatedMessages, { role: 'assistant', content: localOpening() }]);
      setUsingSample(true);
    } finally {
      setLoading(false);
    }
  }

  function localOpening(): string {
    return t('chat_opening', { total: Math.round(breakdown.total), highest: localCategory });
  }

  useEffect(() => {
    if (messages.length > 0) return;

    const opening = localOpening();
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const noKey = !apiKey || apiKey === 'your_key_here';

    if (noKey) {
      setMessages([{ role: 'assistant', content: opening }]);
      setUsingSample(true);
      return;
    }

    setLoading(true);

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
        messages: [{ role: 'user', content: opening }],
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data) => {
        const text = data.content?.[0]?.text;
        setMessages([{ role: 'assistant', content: text ?? opening }]);
      })
      .catch(() => {
        setMessages([{ role: 'assistant', content: opening }]);
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
