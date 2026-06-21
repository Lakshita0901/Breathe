import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import ShareCard from '../components/ShareCard';
import { LanguageProvider } from '../contexts/LanguageContext';
import { FootprintBreakdown } from '../utils/calculator';

describe('ShareCard Component', () => {
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

  const originalClipboard = { ...globalThis.navigator.clipboard };

  beforeEach(() => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    vi.stubGlobal('navigator', originalClipboard);
  });

  test('renders ShareCard content correctly', () => {
    render(
      <LanguageProvider lang="en">
        <ShareCard
          countryCode="IN"
          breakdown={mockBreakdown}
          regionId="metro"
        />
      </LanguageProvider>
    );

    // Title and values
    expect(screen.getByText('Your score card')).toBeInTheDocument();
    expect(screen.getByText('246')).toBeInTheDocument();
    expect(screen.getByText(/Room to breathe better/i)).toBeInTheDocument();
  });

  test('copies card details to clipboard when clicked', async () => {
    render(
      <LanguageProvider lang="en">
        <ShareCard
          countryCode="IN"
          breakdown={mockBreakdown}
          regionId="metro"
        />
      </LanguageProvider>
    );

    const copyBtn = screen.getByRole('button', { name: /Copy shareable score card text/i });
    fireEvent.click(copyBtn);

    expect(globalThis.navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    
    // Button label should temporarily change to "Copied to clipboard!"
    await waitFor(() => {
      expect(screen.getByText('Copied to clipboard!')).toBeInTheDocument();
    });
  });

  test('fallback copy to clipboard when navigator.clipboard fails', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard error')),
      },
    });

    document.execCommand = vi.fn().mockImplementation(() => true);

    render(
      <LanguageProvider lang="en">
        <ShareCard
          countryCode="IN"
          breakdown={mockBreakdown}
          regionId="metro"
        />
      </LanguageProvider>
    );

    const copyBtn = screen.getByRole('button', { name: /Copy shareable score card text/i });
    fireEvent.click(copyBtn);

    // navigator.clipboard should be called and fail
    expect(globalThis.navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

    // fallback copy mechanism (document.execCommand) should be called
    await waitFor(() => {
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    // Button label should temporarily change to "Copied to clipboard!"
    await waitFor(() => {
      expect(screen.getByText('Copied to clipboard!')).toBeInTheDocument();
    });
  });
});
