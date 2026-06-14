import { useState, useEffect } from 'react';
import { CountryCode } from './data/countries';
import countries from './data/countries';
import { QuizAnswers, FootprintBreakdown, calculateFootprint } from './utils/calculator';
import CountrySelector from './components/CountrySelector';
import LanguageSelector from './components/LanguageSelector';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';
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

      {state.screen === 3 && state.countryCode && state.languageCode && state.breakdown && state.answers && (
        <Dashboard
          countryCode={state.countryCode}
          languageCode={state.languageCode}
          breakdown={state.breakdown}
          answers={state.answers}
          regionId={state.answers?.regionId}
          onRetake={() => setState((s) => ({ ...s, screen: 2 }))}
          onStartOver={handleStartOver}
        />
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
