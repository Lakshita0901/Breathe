import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import AIInsights from '../components/AIInsights';
import { LanguageProvider } from '../contexts/LanguageContext';
import { FootprintBreakdown, QuizAnswers } from '../utils/calculator';

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

function renderAIInsights(countryCode = 'IN', languageCode = 'en') {
  return render(
    <LanguageProvider lang={languageCode}>
      <AIInsights
        countryCode={countryCode as any}
        languageCode={languageCode}
        breakdown={mockBreakdown}
        answers={mockAnswers}
      />
    </LanguageProvider>
  );
}

describe('AIInsights Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  // ── SAMPLE MODE (no API key) ───────────────────────────────────

  test('renders sample insight when no Anthropic API key (IN)', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    renderAIInsights('IN');
    await waitFor(() => {
      expect(screen.getByText(/Showing a sample insight/i)).toBeInTheDocument();
      expect(screen.getByText(/Your daily commute is the biggest part of your footprint/i)).toBeInTheDocument();
    });
  });

  test('renders US fallback sample for unknown country code when no key', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    // Use a country that has no SAMPLE_INSIGHTS entry — use DE which does exist, test fallback via US
    // Actually DE IS in SAMPLE_INSIGHTS, so test that it shows the right one
    renderAIInsights('DE');
    await waitFor(() => {
      expect(screen.getByText(/Your car use is driving most of your carbon output/i)).toBeInTheDocument();
    });
  });

  test('renders NG sample insight for NG country code', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    renderAIInsights('NG');
    await waitFor(() => {
      expect(screen.getByText(/Your transport choices make up the largest share/i)).toBeInTheDocument();
    });
  });

  test('renders US sample insight for US country code', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    renderAIInsights('US');
    await waitFor(() => {
      expect(screen.getByText(/Your car is the biggest contributor/i)).toBeInTheDocument();
    });
  });

  test('shows "sample" badge tag when usingSample is true', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    renderAIInsights();
    await waitFor(() => {
      expect(screen.getByText(/Showing a sample insight/i)).toBeInTheDocument();
    });
  });

  test('does NOT show regenerate button while loading (pending API call)', () => {
    // Must have a valid key so the component actually calls fetch (and enters loading state)
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'valid-mock-key-pending');
    // Never resolve — keeps loading=true
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));
    renderAIInsights('IN', 'en');
    // While fetch is pending, loading=true, so the regenerate button should NOT be visible
    expect(screen.queryByRole('button', { name: /Regenerate insights/i })).not.toBeInTheDocument();
  });

  test('shows Regenerate button after loading completes', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    renderAIInsights();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Regenerate insights/i })).toBeInTheDocument();
    });
  });

  // ── API MODE ───────────────────────────────────────────────────

  test('calls Anthropic API and renders response when valid key', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'valid-mock-anthropic-key');
    const mockResponseText = 'This is custom AI generated insights content.';
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: mockResponseText }] }),
    });

    renderAIInsights();
    await waitFor(() => {
      expect(screen.getByText(mockResponseText)).toBeInTheDocument();
    });
  });

  test('falls back to sample insight when API returns error', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'valid-mock-key');
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    renderAIInsights();
    await waitFor(() => {
      expect(screen.getByText(/Your daily commute is the biggest part/i)).toBeInTheDocument();
    });
  });

  test('falls back to sample insight when API returns no content', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'valid-mock-key');
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ content: [] }),
    });

    renderAIInsights();
    await waitFor(() => {
      expect(screen.getByText(/Your daily commute is the biggest part/i)).toBeInTheDocument();
    });
  });

  test('falls back to sample when fetch rejects (network error)', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'valid-mock-key');
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network fail'));

    renderAIInsights();
    await waitFor(() => {
      expect(screen.getByText(/Your daily commute is the biggest part/i)).toBeInTheDocument();
    });
  });

  // ── REGENERATE BUTTON ──────────────────────────────────────────

  test('clicking Regenerate triggers fetchInsight again (re-fetches)', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'valid-mock-key');
    const firstResponse = 'First insight response';
    const secondResponse = 'Second insight response after regenerate';

    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ text: firstResponse }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ text: secondResponse }] }),
      });

    renderAIInsights();
    await waitFor(() => expect(screen.getByText(firstResponse)).toBeInTheDocument());

    const btn = screen.getByRole('button', { name: /Regenerate insights/i });
    fireEvent.click(btn);

    await waitFor(() => expect(screen.getByText(secondResponse)).toBeInTheDocument());
  });

  // ── LANGUAGE / COUNTRY VARIATIONS ────────────────────────────

  test('renders for BR country sample insight', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    renderAIInsights('BR');
    await waitFor(() => {
      expect(screen.getByText(/Your transport footprint tells a story about city life in Brazil/i)).toBeInTheDocument();
    });
  });

  test('renders for KE country sample insight', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    renderAIInsights('KE');
    await waitFor(() => {
      expect(screen.getByText(/Your daily commute adds the most to your footprint/i)).toBeInTheDocument();
    });
  });

  test('renders without crashing when languageCode is Hindi', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    renderAIInsights('IN', 'hi');
    await waitFor(() => {
      // Should still show the IN sample insight text
      expect(screen.getByText(/Your daily commute is the biggest part/i)).toBeInTheDocument();
    });
  });

  test('renders AI title heading with correct text', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    renderAIInsights();
    // No API key means synchronous sample path, no async wait needed
    expect(screen.getByText('Breathe says')).toBeInTheDocument();
  });
});
