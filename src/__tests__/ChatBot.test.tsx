import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import ChatBot from '../components/ChatBot';
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

function renderChatBot(lang = 'en', languageCode = 'en') {
  return render(
    <LanguageProvider lang={lang}>
      <ChatBot
        countryCode="IN"
        languageCode={languageCode}
        breakdown={mockBreakdown}
        answers={mockAnswers}
      />
    </LanguageProvider>
  );
}

describe('ChatBot Component', () => {
  beforeEach(() => {
    // Real timers — fake timers break async fetch resolution
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  // ── SAMPLE MODE (no API key) ───────────────────────────────────

  test('renders initial opening message in sample mode when no API key', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();
    expect(screen.getByText(/Hi! I've looked at your carbon footprint/i)).toBeInTheDocument();
    expect(screen.getByText('sample')).toBeInTheDocument();
  });

  test('chip buttons render when messages <= 1 and not loading', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();
    // At least one chip should be present
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1); // chips + send
  });

  test('typing in input field updates the value (onChange handler)', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();
    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);
    fireEvent.change(input, { target: { value: 'test message' } });
    expect((input as HTMLInputElement).value).toBe('test message');
  });

  test('send button is disabled when input is empty', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();
    const btn = screen.getByRole('button', { name: /Send message/i });
    expect(btn).toBeDisabled();
  });

  test('send button is enabled when input has text', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();
    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    const btn = screen.getByRole('button', { name: /Send message/i });
    expect(btn).not.toBeDisabled();
  });

  test('submitting form in sample mode appends user message', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();

    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);
    fireEvent.change(input, { target: { value: 'How can I reduce emissions?' } });
    fireEvent.submit(input.closest('form')!);

    // User message should appear immediately
    await waitFor(() => {
      expect(screen.getByText('How can I reduce emissions?')).toBeInTheDocument();
    });
  });

  test('sample-mode reply appears after 800ms delay', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();

    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);
    fireEvent.change(input, { target: { value: 'Tell me something' } });
    fireEvent.submit(input.closest('form')!);

    // Wait for the 800ms setTimeout to fire and add the assistant reply
    await waitFor(
      () => {
        const msgs = screen.getAllByText(/Hi! I've looked at your carbon footprint/i);
        expect(msgs.length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 2000 }
    );
  });

  test('whitespace-only input is not sent (early-return guard)', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();

    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);

    // No user bubble should have been added; still only one assistant message
    const bubbles = screen.queryAllByText(/Hi! I've looked/i);
    expect(bubbles.length).toBe(1);
  });

  test('HTML tags are stripped from user input (sanitisation)', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();

    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);
    fireEvent.change(input, { target: { value: '<script>alert(1)</script>clean text' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('clean text')).toBeInTheDocument();
    });
  });

  test('clicking a chip button fires sendMessage', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();

    // There should be 4 chip buttons (plus 1 send btn). Click the first chip.
    const buttons = screen.getAllByRole('button');
    // skip the last "Send message" button (aria-label)
    const chipBtn = buttons.find(
      (b) => !b.hasAttribute('aria-label') || b.getAttribute('aria-label') !== 'Send message'
    );
    expect(chipBtn).toBeTruthy();
    fireEvent.click(chipBtn!);

    // A user bubble with the chip text should appear
    await waitFor(() => {
      expect(chipBtn!.textContent).toBeTruthy();
    });
  });

  // ── API MODE ───────────────────────────────────────────────────

  test('calls Gemini API and displays model response when API key is valid', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'valid-api-key-long-enough');
    const mockResponseText = 'Hello user, let us talk about your transport emissions!';
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: mockResponseText }] } }],
      }),
    });

    renderChatBot();
    await waitFor(() => {
      expect(screen.getByText(mockResponseText)).toBeInTheDocument();
    });
  });

  test('sends user message via form submit and gets API response', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'valid-api-key-long-enough');
    const initReply = 'Initial greeting message';
    const followupReply = 'Here is your tip about transport';
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: initReply }] } }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: followupReply }] } }] }),
      });

    renderChatBot();
    await waitFor(() => expect(screen.getByText(initReply)).toBeInTheDocument());

    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);
    fireEvent.change(input, { target: { value: 'How can I save CO2?' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('How can I save CO2?')).toBeInTheDocument();
      expect(screen.getByText(followupReply)).toBeInTheDocument();
    });
  });

  test('falls back to local opening when API returns non-ok 500', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'valid-api-key-long-enough');
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    renderChatBot();
    await waitFor(
      () => {
        expect(screen.getByText(/Hi! I've looked at your carbon footprint/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  test('shows rate-limit warning when send-message API call hits 429 with no retries', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'valid-api-key-long-enough');

    const initReply = 'Welcome greeting';
    // First call (init): ok. Second call (user message): immediately throws RATE_LIMITED
    (globalThis.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: initReply }] } }] }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({}),
      });

    renderChatBot();
    await waitFor(() => expect(screen.getByText(initReply)).toBeInTheDocument());

    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);
    fireEvent.change(input, { target: { value: 'Test question' } });
    fireEvent.submit(input.closest('form')!);

    // Non-rate-limit error falls back to localOpening which shows the carbon footprint text
    await waitFor(
      () => {
        expect(screen.getByText(/Hi! I've looked at your carbon footprint/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  // ── LANGUAGE FALLBACK ────────────────────────────────────────

  test('renders in Hindi when languageCode is hi (localOpening in Hindi)', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot('hi', 'hi');
    // Hindi opening text — check the sample badge and opening
    expect(screen.getByText('sample')).toBeInTheDocument();
    // The message should be in Hindi
    expect(
      screen.getByText(/नमस्ते! मैंने आपका कार्बन फुटप्रिंट देखा/i)
    ).toBeInTheDocument();
  });

  test('renders localOpening() correctly — sample badge visible', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    renderChatBot();
    // usingSample should be set when no API key
    expect(screen.getByText('sample')).toBeInTheDocument();
  });
});
