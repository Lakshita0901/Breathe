import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import LandingHero from '../components/LandingHero';
import CountrySelector from '../components/CountrySelector';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('App Component Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('App renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  test('LandingPage (LandingHero) shows the main heading', () => {
    render(<LandingHero onStart={vi.fn()} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Every breath you take/i);
    expect(heading).toHaveTextContent(/tells a story/i);
  });

  test('CountrySelector shows 6 countries', () => {
    render(
      <LanguageProvider lang="en">
        <CountrySelector onSelect={vi.fn()} onViewHistory={vi.fn()} />
      </LanguageProvider>
    );

    const countriesList = ['India', 'Nigeria', 'Germany', 'Brazil', 'Kenya', 'USA'];
    countriesList.forEach((countryName) => {
      expect(screen.getByText(countryName)).toBeInTheDocument();
    });
  });

  test('full user flow: landing -> country -> language -> quiz -> dashboard -> start over', () => {
    render(<App />);

    // --- Screen 0: LandingHero ---
    expect(screen.getByText(/Every breath you take/i)).toBeInTheDocument();
    const startBtn = screen.getByRole('button', { name: /Start breathing better/i });
    fireEvent.click(startBtn);

    // LandingHero has a 500ms exit timeout
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // --- Screen 1: CountrySelector ---
    expect(screen.getByRole('heading', { name: /Where are you breathing from/i })).toBeInTheDocument();
    
    // Select India
    const indiaBtn = screen.getByRole('button', { name: /Select India/i });
    fireEvent.click(indiaBtn);

    // --- Screen 2: LanguageSelector ---
    expect(screen.getByText(/Your story, your language/i)).toBeInTheDocument();

    // Select English
    const englishBtn = screen.getByRole('button', { name: /Select English/i });
    fireEvent.click(englishBtn);

    // Click Continue
    const continueBtn = screen.getByRole('button', { name: /Continue to quiz/i });
    fireEvent.click(continueBtn);

    // --- Screen 3: Quiz ---
    // Section 1: Transport
    expect(screen.getByText(/Transport/i)).toBeInTheDocument();
    const transportOpt = screen.getByRole('button', { name: /Select Auto-rickshaw/i });
    fireEvent.click(transportOpt);
    const nextBtn1 = screen.getByRole('button', { name: /Next section/i });
    fireEvent.click(nextBtn1);

    // Section 2: Food
    expect(screen.getByText(/Food/i)).toBeInTheDocument();
    const foodOpt = screen.getByRole('button', { name: /Select Vegetarian/i });
    fireEvent.click(foodOpt);
    const nextBtn2 = screen.getByRole('button', { name: /Next section/i });
    fireEvent.click(nextBtn2);

    // Section 3: Energy (uses default values)
    expect(screen.getByText(/Energy/i)).toBeInTheDocument();
    const nextBtn3 = screen.getByRole('button', { name: /Next section/i });
    fireEvent.click(nextBtn3);

    // Section 4: Shopping (uses default values)
    expect(screen.getByText(/Shopping/i)).toBeInTheDocument();
    const nextBtn4 = screen.getByRole('button', { name: /Next section/i });
    fireEvent.click(nextBtn4);

    // Section 5: Region
    expect(screen.getByRole('heading', { name: /^Where you live$/i })).toBeInTheDocument();
    const regionOpt = screen.getByRole('button', { name: /Select metro/i });
    fireEvent.click(regionOpt);
    const submitBtn = screen.getByRole('button', { name: /See your footprint/i });
    fireEvent.click(submitBtn);

    // --- Screen 4: Dashboard ---
    expect(screen.getAllByText(/Your footprint/i).length).toBeGreaterThan(0);

    // Verify localStorage has saved state
    expect(localStorage.getItem('breathe_state')).not.toBeNull();

    // Click Start Over
    const startOverBtn = screen.getByRole('button', { name: /Start over/i });
    fireEvent.click(startOverBtn);

    // Returns to Landing Page
    expect(screen.getByText(/Every breath you take/i)).toBeInTheDocument();
    expect(localStorage.getItem('breathe_state')).toBeNull();
  });

  test('navigation back button from Language Selection to Country Selection', () => {
    render(<App />);

    // Landing -> Country
    fireEvent.click(screen.getByRole('button', { name: /Start breathing better/i }));
    act(() => { vi.advanceTimersByTime(500); });

    // Country -> Language
    fireEvent.click(screen.getByRole('button', { name: /Select India/i }));

    // Language -> Back to Country
    const backToCountryBtn = screen.getByRole('button', { name: /Go back to country selection/i });
    fireEvent.click(backToCountryBtn);

    expect(screen.getByRole('heading', { name: /Where are you breathing from/i })).toBeInTheDocument();
  });

  test('navigation back button from Quiz to Language Selection and going previous in sections', () => {
    render(<App />);

    // Landing -> Country
    fireEvent.click(screen.getByRole('button', { name: /Start breathing better/i }));
    act(() => { vi.advanceTimersByTime(500); });

    // Country -> Language
    fireEvent.click(screen.getByRole('button', { name: /Select India/i }));

    // Language -> Quiz
    fireEvent.click(screen.getByRole('button', { name: /Select English/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to quiz/i }));

    // Quiz Section 1 -> Go back to Language
    const backToLangBtn = screen.getByRole('button', { name: /Go back/i });
    fireEvent.click(backToLangBtn);
    expect(screen.getByText(/Your story, your language/i)).toBeInTheDocument();

    // Language -> Quiz
    fireEvent.click(screen.getByRole('button', { name: /Select English/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to quiz/i }));

    // Quiz Section 1 -> Quiz Section 2
    fireEvent.click(screen.getByRole('button', { name: /Select Auto-rickshaw/i }));
    fireEvent.click(screen.getByRole('button', { name: /Next section/i }));

    // Quiz Section 2 -> Quiz Section 1 using previous button
    const prevBtn = screen.getByRole('button', { name: /Previous section/i });
    fireEvent.click(prevBtn);
    expect(screen.getByText(/Transport/i)).toBeInTheDocument();
  });

  test('retaking quiz from welcome back history banner and history toggle', () => {
    // Populate fake history in localStorage
    const fakeHistory = [
      {
        countryCode: 'IN',
        languageCode: 'en',
        transport: 100,
        food: 55,
        energy: 82,
        shopping: 9,
        total: 246,
        pctOfAvg: 155.7,
        mood: 'room',
        moodEmoji: '⚠️',
        moodText: 'Room to breathe better',
        date: new Date().toISOString(),
      }
    ];
    localStorage.setItem('breathe_history', JSON.stringify(fakeHistory));

    render(<App />);

    // Landing -> Country
    fireEvent.click(screen.getByRole('button', { name: /Start breathing better/i }));
    act(() => { vi.advanceTimersByTime(500); });

    // In Country Selector. The welcome back card should be visible.
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();

    // Toggle history view
    const historyBtn = screen.getByRole('button', { name: /View your history/i });
    fireEvent.click(historyBtn);
    // Since we mocked history, the HistoryChart component should render
    expect(screen.getByText(/Your footprint history/i)).toBeInTheDocument();

    // Select India to set state.countryCode
    const indiaBtn = screen.getByRole('button', { name: /Select India/i });
    fireEvent.click(indiaBtn);

    // Now in Language Selector. Click back to Country Selector.
    const backToCountryBtn = screen.getByRole('button', { name: /Go back to country selection/i });
    fireEvent.click(backToCountryBtn);

    // Now back in Country Selector. Click Retake.
    const retakeBtn = screen.getByRole('button', { name: /Retake quiz from previous country/i });
    fireEvent.click(retakeBtn);

    // Should immediately go to LanguageSelector since state.countryCode was set to IN
    expect(screen.getByText(/Your story, your language/i)).toBeInTheDocument();
  });
});
