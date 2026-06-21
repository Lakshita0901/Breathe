import { CountryCode } from '../data/countries';
import countries from '../data/countries';
import { translations, TranslationKey } from '../translations';

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

/**
 * Calculates monthly carbon footprint breakdown including transport, food, energy, and shopping.
 * Automatically handles local country differences in grid factors, average footprints, and currency.
 * Assigns a comparative user mood indicator based on the percentage of the country average.
 * 
 * @param countryCode - ISO country code representing the target country (e.g. IN, NG, US)
 * @param answers - User responses containing specific choices for transport, diet, energy, and shopping
 * @returns Complete carbon footprint breakdown with category values, total footprint, and comparative statistics
 */
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

/**
 * Calculates scaled percentage widths and raw values for comparing the user's footprint
 * against the country average and the Paris Climate Agreement target.
 * Scaled proportionally relative to the maximum of the three values.
 * 
 * @param breakdown - The user's calculated footprint breakdown
 * @param countryCode - ISO country code representing the user's country
 * @returns Object containing comparative percentage widths and raw footprint values
 */
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

/**
 * Translates a carbon footprint value in kilograms into a tangible, emotional local equivalent
 * (e.g., equivalent number of auto-rickshaw rides, burgers, or ceiling fan hours).
 * Handles internationalization (translations) and falls back to default values if templates are missing.
 * 
 * @param countryCode - ISO country code representing the target country
 * @param category - Footprint category or 'total'
 * @param kg - Carbon footprint value in kilograms
 * @param regionId - Optional region identifier to customize equivalent relative to urban/rural context
 * @param lang - Target language code for translation dictionary lookup (default: 'en')
 * @returns A translated string presenting the footprint in tangible emotional terms
 */
export function getEmotionalEquivalent(
  countryCode: CountryCode,
  category: 'transport' | 'food' | 'energy' | 'shopping' | 'total',
  kg: number,
  regionId: string | undefined,
  lang: string = 'en'
): string {
  const dict = translations[lang] ?? translations.en;
  const enDict = translations.en;

  if (kg < 5) {
    return dict.emo_zero ?? enDict.emo_zero;
  }

  const catKey = category === 'total'
    ? `emo_${countryCode}_transport` as TranslationKey
    : `emo_${countryCode}_${category}` as TranslationKey;

  const template = dict[catKey] ?? enDict[catKey];
  if (!template) {
    const country = countries[countryCode];
    return country.emotionalEquivalents(regionId)[category](kg);
  }

  const divisors: Record<string, Record<string, number>> = {
    IN: { transport: 0.3, food: 0.069, energy: 20, shopping: 3 },
    NG: { transport: 1.5, food: 1.5, energy: 60, shopping: 2 },
    DE: { transport: 1, food: 27, energy: 0.5, shopping: 15 },
    BR: { transport: 2, food: 15, energy: 0.3, shopping: 7 },
    KE: { transport: 1, food: 2, energy: 7.5, shopping: 0.3 },
    US: { transport: 5, food: 27, energy: 1.5, shopping: 8 },
  };

  const d = divisors[countryCode]?.[category] ?? 1;
  const n = Math.round(kg / d);

  if (n <= 0) return dict.emo_zero ?? enDict.emo_zero;

  return template.replace(/\{n\}/g, String(n));
}

/**
 * Simulates the environmental impact of potential lifestyle changes in real time.
 * Re-calculates the footprint with hypothetical parameters and computes the savings.
 * 
 * @param countryCode - ISO country code representing the user's country
 * @param answers - Current quiz answers to use as baseline
 * @param newTransportId - Hypothetical transport option ID (optional)
 * @param newDietId - Hypothetical diet option ID (optional)
 * @param energyReductionPct - Hypothetical energy usage reduction percentage (0 to 50, optional)
 * @param lang - Target language code for translation lookup (default: 'en')
 * @returns Simulated monthly carbon total, absolute savings in kg, and localized emotional savings equivalent text
 */
export function simulateWhatIf(
  countryCode: CountryCode,
  answers: QuizAnswers,
  newTransportId?: string,
  newDietId?: string,
  energyReductionPct?: number,
  lang: string = 'en'
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
  const savedEmotional = getEmotionalEquivalent(countryCode, 'total', Math.abs(saved), answers.regionId, lang);

  return { newTotal: newBreakdown.total, saved, savedEmotional };
}
