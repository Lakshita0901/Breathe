import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import HistoryChart from '../components/HistoryChart';
import { LanguageProvider } from '../contexts/LanguageContext';
import { HistoryEntry } from '../utils/history';

describe('HistoryChart Component', () => {
  test('returns null if entries array is empty', () => {
    const { container } = render(
      <LanguageProvider lang="en">
        <HistoryChart entries={[]} />
      </LanguageProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders chart correctly when entries are provided', () => {
    const entries: HistoryEntry[] = [
      {
        countryCode: 'IN',
        languageCode: 'en',
        transport: 10,
        food: 20,
        energy: 30,
        shopping: 40,
        total: 100,
        pctOfAvg: 50,
        mood: 'lighter',
        moodEmoji: '🌱',
        moodText: 'Lighter',
        date: '2026-06-01T00:00:00.000Z',
      },
      {
        countryCode: 'IN',
        languageCode: 'en',
        transport: 20,
        food: 30,
        energy: 40,
        shopping: 50,
        total: 140,
        pctOfAvg: 70,
        mood: 'average',
        moodEmoji: '🌍',
        moodText: 'Average',
        date: '2026-06-20T00:00:00.000Z',
      },
    ];

    render(
      <LanguageProvider lang="en">
        <HistoryChart entries={entries} />
      </LanguageProvider>
    );

    // Title should be visible
    expect(screen.getByText('Your footprint history')).toBeInTheDocument();

    // Bars should have aria-labels with formatted full date and values
    // Jun 1, 2026: 100 kg CO2
    // Jun 20, 2026: 140 kg CO2
    const bar1 = screen.getByLabelText(/Jun 1, 2026: 100 kg CO2/i);
    const bar2 = screen.getByLabelText(/Jun 20, 2026: 140 kg CO2/i);

    expect(bar1).toBeInTheDocument();
    expect(bar2).toBeInTheDocument();

    // Months should show up in labels
    expect(screen.getAllByText('Jun').length).toBe(2);
  });
});
