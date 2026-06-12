import { CountryCode } from '../data/countries';

const HISTORY_KEY = 'breathe_history';

export interface HistoryEntry {
  countryCode: CountryCode;
  languageCode: string;
  transport: number;
  food: number;
  energy: number;
  shopping: number;
  total: number;
  pctOfAvg: number;
  mood: 'lighter' | 'average' | 'room' | 'clear';
  moodEmoji: string;
  moodText: string;
  date: string; // ISO string
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: Omit<HistoryEntry, 'date'>): HistoryEntry {
  const history = getHistory();
  const newEntry: HistoryEntry = { ...entry, date: new Date().toISOString() };
  history.push(newEntry);
  // Keep only the last 12 entries
  const trimmed = history.slice(-12);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
  return newEntry;
}

export function getLatestEntry(): HistoryEntry | null {
  const history = getHistory();
  return history.length > 0 ? history[history.length - 1] : null;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
