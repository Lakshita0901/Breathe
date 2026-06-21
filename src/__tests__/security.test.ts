import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
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

function renderChatBot() {
  return render(
    React.createElement(
      LanguageProvider,
      { lang: 'en' },
      React.createElement(ChatBot, {
        countryCode: 'IN',
        languageCode: 'en',
        breakdown: mockBreakdown,
        answers: mockAnswers,
      })
    )
  );
}

describe('Security Edge Cases and Sanitization Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test('Input trimming and HTML tag stripping (XSS prevention)', async () => {
    renderChatBot();
    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);

    // Malicious payload with various HTML tags
    const maliciousInput = '<script>alert("XSS")</script><b>Bold Text</b><img src="x" onerror="evil()"/>Hello World';
    fireEvent.change(input, { target: { value: maliciousInput } });
    fireEvent.submit(input.closest('form')!);

    // Expected sanitized input: "alert("XSS")Bold TextHello World"
    await waitFor(() => {
      expect(screen.getByText('alert("XSS")Bold TextHello World')).toBeInTheDocument();
    });
  });

  test('Input slicing to exactly 500 characters', async () => {
    renderChatBot();
    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);

    // Generate input of 600 characters
    const longInput = 'A'.repeat(600);
    fireEvent.change(input, { target: { value: longInput } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      // The message in the UI should be truncated to 500 characters
      const expectedText = 'A'.repeat(500);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
      // Ensure the full 600 character string is NOT in the document
      expect(screen.queryByText(longInput)).toBeNull();
    });
  });

  test('Rate limiting ignores rapid successive submissions (2 second cooldown)', async () => {
    // We stub Date.now to control time
    let mockTime = 1000000;
    vi.spyOn(Date, 'now').mockImplementation(() => mockTime);

    renderChatBot();
    const input = screen.getByPlaceholderText(/Ask Breathe anything/i);
    const form = input.closest('form')!;

    // Send first message at t = 1000000
    fireEvent.change(input, { target: { value: 'First Message' } });
    fireEvent.submit(form);

    // Wait for first message user bubble to appear
    await waitFor(() => {
      expect(screen.getByText('First Message')).toBeInTheDocument();
    });

    // Wait for the assistant reply (meaning loading is now false)
    await waitFor(() => {
      // There should be at least two assistant message bubbles (the initial opening + the response)
      const assistantTextMatches = screen.getAllByText(/Hi! I've looked at your carbon footprint/i);
      expect(assistantTextMatches.length).toBeGreaterThanOrEqual(2);
    });

    // Send second message 500ms after the first message's timestamp (t = 1000500) -> should be rate limited
    mockTime = 1000500;
    fireEvent.change(input, { target: { value: 'Second Message' } });
    fireEvent.submit(form);

    // Wait a brief period to check that "Second Message" does NOT appear
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.queryByText('Second Message')).toBeNull();

    // Advance time to 1003000 (3 seconds after the first message, > 2 seconds cooldown)
    mockTime = 1003000;
    fireEvent.change(input, { target: { value: 'Third Message' } });
    fireEvent.submit(form);

    // Now it should be allowed and appear in the document
    await waitFor(() => {
      expect(screen.getByText('Third Message')).toBeInTheDocument();
    });
  });

  test('Short/invalid API key falls back to sample mode and prints warning', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Set API key that is too short (length < 10)
    vi.stubEnv('VITE_GEMINI_API_KEY', 'short');
    renderChatBot();

    expect(screen.getByText('sample')).toBeInTheDocument();
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid or missing API key'));
    
    consoleWarnSpy.mockRestore();
  });
});
