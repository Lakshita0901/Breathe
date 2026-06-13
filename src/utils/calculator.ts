import { CountryCode } from '../data/countries';
import countries from '../data/countries';

export interface QuizAnswers {
  transportId: string;
  weeklyKm: number;
  dietId: string;
  electricityKwh: number;
  monthlySpend: number;
  regionId?: string;
}

export interface FootprintBreakdown {
  transport: number;
  food: number;
  energy: number;
  shopping: number;
  total: number;
  pctOfAvg: number;
  mood: 'lighter' | 'average' | 'room' | 'clear';
  moodEmoji: string;
  moodText: string;
  highestCategory: 'transport' | 'food' | 'energy' | 'shopping';
}

const PARIS_TARGET = 167;

export function calculateFootprint(countryCode: CountryCode, answers: QuizAnswers): FootprintBreakdown {
  const country = countries[countryCode];
  const transportOption = country.transportOptions.find((o) => o.id === answers.transportId);
  const dietOption = country.dietOptions.find((o) => o.id === answers.dietId);

  const transport = answers.weeklyKm * 4.3 * (transportOption?.factor ?? 0.21);
  const food = dietOption?.factor ?? 80;
  const energy = answers.electricityKwh * country.gridFactor;
  const shopping = answers.monthlySpend * country.shoppingRate;

  const total = transport + food + energy + shopping;
  const pctOfAvg = (total / country.avgFootprint) * 100;

  let mood: FootprintBreakdown['mood'];
  let moodEmoji: string;
  let moodText: string;

  if (pctOfAvg < 70) {
    mood = 'lighter';
    moodEmoji = '\u{1F331}';
    moodText = "You're breathing lighter";
  } else if (pctOfAvg < 100) {
    mood = 'average';
    moodEmoji = '\u{1F30D}';
    moodText = 'Close to average';
  } else if (pctOfAvg < 140) {
    mood = 'room';
    moodEmoji = '\u26A0\uFE0F';
    moodText = 'Room to breathe better';
  } else {
    mood = 'clear';
    moodEmoji = '\u{1F525}';
    moodText = 'Time to clear the air';
  }

  const categories = { transport, food, energy, shopping };
  const highestCategory = (Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0]) as FootprintBreakdown['highestCategory'];

  return { transport, food, energy, shopping, total, pctOfAvg, mood, moodEmoji, moodText, highestCategory };
}

export function getComparisonBars(breakdown: FootprintBreakdown, countryCode: CountryCode) {
  const country = countries[countryCode];
  const max = Math.max(breakdown.total, country.avgFootprint, PARIS_TARGET);
  return {
    you: (breakdown.total / max) * 100,
    countryAvg: (country.avgFootprint / max) * 100,
    parisTarget: (PARIS_TARGET / max) * 100,
    youValue: breakdown.total,
    countryAvgValue: country.avgFootprint,
    parisValue: PARIS_TARGET,
  };
}

export function getEmotionalEquivalent(
  countryCode: CountryCode,
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'total',
  kg: number,
  regionId?: string
): string {
  const country = countries[countryCode];
  return country.emotionalEquivalents(regionId)[category](kg);
}

export function simulateWhatIf(
  countryCode: CountryCode,
  answers: QuizAnswers,
  newTransportId?: string,
  newDietId?: string,
  energyReductionPct?: number
): { newTotal: number; saved: number; savedEmotional: string } {
  const current = calculateFootprint(countryCode, answers);
  const modifiedAnswers = { ...answers };

  if (newTransportId) modifiedAnswers.transportId = newTransportId;
  if (newDietId) modifiedAnswers.dietId = newDietId;
  if (energyReductionPct !== undefined) {
    modifiedAnswers.electricityKwh = answers.electricityKwh * (1 - energyReductionPct / 100);
  }

  const newBreakdown = calculateFootprint(countryCode, modifiedAnswers);
  const saved = current.total - newBreakdown.total;
  const savedEmotional = getEmotionalEquivalent(countryCode, 'total', Math.abs(saved), answers.regionId);

  return { newTotal: newBreakdown.total, saved, savedEmotional };
}
