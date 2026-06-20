import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import CountrySelector from '../components/CountrySelector';
import { LanguageProvider } from '../contexts/LanguageContext';

vi.mock('../utils/history', () => {
  return {
    getLatestEntry: () => ({
      countryCode: 'IN',
      total: 120,
      moodEmoji: '🌱',
      moodText: 'Lighter',
      date: '2026-06-20T00:00:00.000Z',
    }),
    getHistory: () => [
      {
        countryCode: 'IN',
        total: 120,
        moodEmoji: '🌱',
        moodText: 'Lighter',
        date: '2026-06-20T00:00:00.000Z',
      }
    ],
  };
});

describe('CountrySelector Component', () => {
  test('renders options and interacts correctly', () => {
    const handleSelect = vi.fn();
    const handleViewHistory = vi.fn();

    render(
      <LanguageProvider lang="en">
        <CountrySelector onSelect={handleSelect} onViewHistory={handleViewHistory} />
      </LanguageProvider>
    );

    // Welcome back banner should display because getLatestEntry returned mock entry
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText(/120/i)).toBeInTheDocument();

    // Toggle history
    const historyBtn = screen.getByRole('button', { name: /History/i });
    fireEvent.click(historyBtn);
    // HistoryChart should now be displayed
    expect(screen.getByText('Your footprint history')).toBeInTheDocument();

    // Retake
    const retakeBtn = screen.getByRole('button', { name: /Retake/i });
    fireEvent.click(retakeBtn);
    expect(handleViewHistory).toHaveBeenCalledTimes(1);

    // Click country
    const indiaBtn = screen.getByRole('button', { name: /Select India/i });
    fireEvent.click(indiaBtn);
    expect(handleSelect).toHaveBeenCalledWith('IN');
  });
});
