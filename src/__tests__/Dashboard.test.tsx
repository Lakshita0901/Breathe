import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Dashboard from '../components/Dashboard';
import { LanguageProvider } from '../contexts/LanguageContext';
import { FootprintBreakdown, QuizAnswers } from '../utils/calculator';

vi.mock('../utils/history', async () => {
  const actual = await vi.importActual('../utils/history');
  return {
    ...actual,
    saveToHistory: vi.fn(),
    getHistory: () => [],
  };
});

describe('Dashboard Component', () => {
  const mockBreakdown: FootprintBreakdown = {
    transport: 100,
    food: 55,
    energy: 82,
    shopping: 9,
    total: 246,
    pctOfAvg: 155.7,
    mood: 'room',
    moodEmoji: '⚠️',
    moodText: 'Room to breathe better',
    highestCategory: 'transport',
  };

  const mockAnswers: QuizAnswers = {
    transportId: 'car_petrol',
    weeklyKm: 100,
    dietId: 'vegetarian',
    electricityKwh: 100,
    monthlySpend: 3000,
    regionId: 'metro',
  };

  test('renders footprint score and categories', () => {
    const handleStartOver = vi.fn();

    render(
      <LanguageProvider lang="en">
        <Dashboard
          countryCode="IN"
          languageCode="en"
          breakdown={mockBreakdown}
          answers={mockAnswers}
          regionId="metro"
          onStartOver={handleStartOver}
        />
      </LanguageProvider>
    );

    // Score
    expect(screen.getByText('246')).toBeInTheDocument();
    
    // Country and header info
    expect(screen.getByText('India')).toBeInTheDocument();

    // Categories
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
  });

  test('calls onStartOver when start over button is clicked', () => {
    const handleStartOver = vi.fn();

    render(
      <LanguageProvider lang="en">
        <Dashboard
          countryCode="IN"
          languageCode="en"
          breakdown={mockBreakdown}
          answers={mockAnswers}
          onStartOver={handleStartOver}
        />
      </LanguageProvider>
    );

    const startOverBtn = screen.getByRole('button', { name: /start over/i });
    fireEvent.click(startOverBtn);
    expect(handleStartOver).toHaveBeenCalledTimes(1);
  });

  test('calls saveToHistory when save button is clicked', async () => {
    const handleStartOver = vi.fn();
    const { saveToHistory: mockedSaveToHistory } = await import('../utils/history');

    render(
      <LanguageProvider lang="en">
        <Dashboard
          countryCode="IN"
          languageCode="en"
          breakdown={mockBreakdown}
          answers={mockAnswers}
          onStartOver={handleStartOver}
        />
      </LanguageProvider>
    );

    const saveBtn = screen.getByRole('button', { name: /save this month's result/i });
    fireEvent.click(saveBtn);
    
    expect(mockedSaveToHistory).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Saved to your history')).toBeInTheDocument();
  });
});
