import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  getHistory,
  saveToHistory,
  getLatestEntry,
  clearHistory,
  HistoryEntry,
} from '../utils/history';

const sampleEntry: Omit<HistoryEntry, 'date'> = {
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
};

describe('history utility', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  // ── getHistory ────────────────────────────────────────────────

  test('getHistory returns [] when localStorage is empty', () => {
    expect(getHistory()).toEqual([]);
  });

  test('getHistory returns [] when localStorage has non-array JSON', () => {
    localStorage.setItem('breathe_history', JSON.stringify({ notAnArray: true }));
    expect(getHistory()).toEqual([]);
  });

  test('getHistory returns [] when localStorage has invalid JSON', () => {
    localStorage.setItem('breathe_history', 'INVALID');
    expect(getHistory()).toEqual([]);
  });

  test('getHistory returns stored entries', () => {
    saveToHistory(sampleEntry);
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].total).toBe(246);
  });

  // ── saveToHistory ─────────────────────────────────────────────

  test('saveToHistory adds a date field to the returned entry', () => {
    const entry = saveToHistory(sampleEntry);
    expect(entry.date).toBeDefined();
    expect(typeof entry.date).toBe('string');
    // Should be a valid ISO date string
    expect(new Date(entry.date).toISOString()).toBe(entry.date);
  });

  test('saveToHistory persists entry so getHistory retrieves it', () => {
    saveToHistory(sampleEntry);
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].countryCode).toBe('IN');
  });

  test('saveToHistory trims to last 12 entries', () => {
    for (let i = 0; i < 15; i++) {
      saveToHistory({ ...sampleEntry, total: i * 10 });
    }
    const history = getHistory();
    expect(history).toHaveLength(12);
    // The last entry should be the most recent
    expect(history[history.length - 1].total).toBe(140);
  });

  test('saveToHistory keeps existing entries intact', () => {
    saveToHistory({ ...sampleEntry, total: 100 });
    saveToHistory({ ...sampleEntry, total: 200 });
    const history = getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].total).toBe(100);
    expect(history[1].total).toBe(200);
  });

  // ── getLatestEntry ────────────────────────────────────────────

  test('getLatestEntry returns null when no history', () => {
    expect(getLatestEntry()).toBeNull();
  });

  test('getLatestEntry returns the most recent entry', () => {
    saveToHistory({ ...sampleEntry, total: 111 });
    saveToHistory({ ...sampleEntry, total: 222 });
    const latest = getLatestEntry();
    expect(latest).not.toBeNull();
    expect(latest!.total).toBe(222);
  });

  // ── clearHistory ──────────────────────────────────────────────

  test('clearHistory removes all history from localStorage', () => {
    saveToHistory(sampleEntry);
    expect(getHistory()).toHaveLength(1);
    clearHistory();
    expect(getHistory()).toHaveLength(0);
  });

  test('clearHistory does not throw when localStorage is already empty', () => {
    expect(() => clearHistory()).not.toThrow();
  });

  test('getLatestEntry returns null after clearHistory', () => {
    saveToHistory(sampleEntry);
    clearHistory();
    expect(getLatestEntry()).toBeNull();
  });
});
