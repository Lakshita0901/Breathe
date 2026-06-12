import { useState, useEffect } from 'react';
import { CountryCode } from './data/countries';
import countries from './data/countries';
import { QuizAnswers, FootprintBreakdown, calculateFootprint } from './utils/calculator';
import CountrySelector from './components/CountrySelector';
import LanguageSelector from './components/LanguageSelector';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';
import AIInsights from './components/AIInsights';
import ShareCard from './components/ShareCard';
import HistoryChart from './components/HistoryChart';
import { getHistory } from './utils/history';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const STORAGE_KEY = 'breathe_state';

interface AppState {
  screen: number;
  countryCode: CountryCode | null;
  languageCode: string | null;
  answers: QuizAnswers | null;
  breakdown: FootprintBreakdown | null;
}

interface AppContentProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

function AppContent({ state, setState }: AppContentProps) {
  const { t } = useLanguage();
  const history = getHistory();

  const handleCountrySelect = (code: CountryCode) => {
    setState((s) => ({ ...s, screen: 1, countryCode: code }));
  };

  const handleLanguageSelect = (langCode: string) => {
    setState((s) => ({ ...s, screen: 2, languageCode: langCode }));
  };

  const handleQuizSubmit = (answers: QuizAnswers) => {
    if (!state.countryCode) return;
    try {
      localStorage.setItem('breathe_quiz_answers', JSON.stringify(answers));
    } catch { /* ignore */ }
    const breakdown = calculateFootprint(state.countryCode, answers);
    setState((s) => ({ ...s, screen: 3, answers, breakdown }));
  };

  const handleContinueToInsights = () => {
    setState((s) => ({ ...s, screen: 4 }));
  };

  const handleStartOver = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('breathe_quiz_answers');
    } catch { /* ignore */ }
    setState({ screen: 0, countryCode: null, languageCode: null, answers: null, breakdown: null });
  };

  const handleViewHistory = () => {
    if (state.countryCode) {
      setState((s) => ({ ...s, screen: 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {state.screen === 0 && (
        <CountrySelector onSelect={handleCountrySelect} onViewHistory={handleViewHistory} />
      )}

      {state.screen === 1 && state.countryCode && (
        <LanguageSelector
          countryCode={state.countryCode}
          onSelect={handleLanguageSelect}
          onBack={() => setState((s) => ({ ...s, screen: 0 }))}
        />
      )}

      {state.screen === 2 && state.countryCode && (
        <Quiz
          countryCode={state.countryCode}
          onSubmit={handleQuizSubmit}
          onBack={() => setState((s) => ({ ...s, screen: 1 }))}
        />
      )}

      {state.screen === 3 && state.countryCode && state.languageCode && state.breakdown && (
        <Dashboard
          countryCode={state.countryCode}
          languageCode={state.languageCode}
          breakdown={state.breakdown}
          onContinue={handleContinueToInsights}
        />
      )}

      {state.screen === 4 && state.countryCode && state.languageCode && state.breakdown && state.answers && (
        <div className="fade-in min-h-screen px-4 py-8 pb-16">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800 mb-1">
                {t('app_personalizedInsights')}
              </h1>
              <p className="text-gray-400 text-sm">
                {t('app_tailoredTo', { country: countries[state.countryCode]?.name ?? '' })}
              </p>
            </div>

            <AIInsights
              countryCode={state.countryCode}
              languageCode={state.languageCode}
              breakdown={state.breakdown}
              answers={state.answers}
            />

            <ShareCard
              countryCode={state.countryCode}
              breakdown={state.breakdown}
            />

            {history.length > 0 && (
              <HistoryChart entries={history} />
            )}

            <button
              onClick={handleStartOver}
              aria-label="Start over with a new calculation"
              className="w-full py-3 rounded-xl text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              {t('app_startOver')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [state, setState] = useState<AppState>({
    screen: 0,
    countryCode: null,
    languageCode: null,
    answers: null,
    breakdown: null,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        if (parsed.screen > 0 && parsed.countryCode) {
          setState(parsed);
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (state.screen > 1) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { /* ignore */ }
    }
  }, [state]);

  return (
    <LanguageProvider lang={state.languageCode ?? 'en'}>
      <AppContent state={state} setState={setState} />
    </LanguageProvider>
  );
}

export default App;
