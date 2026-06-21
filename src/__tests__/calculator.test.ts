import { describe, test, expect } from 'vitest';
import { calculateFootprint, getComparisonBars, QuizAnswers, simulateWhatIf } from '../utils/calculator';
import countries from '../data/countries';

describe('Calculator Logic Tests', () => {
  test('walking/cycling returns 0 transport emissions', () => {
    const answers: QuizAnswers = {
      transportId: 'walk_cycle',
      weeklyKm: 100,
      dietId: 'vegetarian',
      electricityKwh: 0,
      monthlySpend: 0,
    };
    const breakdown = calculateFootprint('IN', answers);
    expect(breakdown.transport).toBe(0);
  });

  test('car petrol returns correct kg for given km', () => {
    // 100 km * 4.3 * 0.21 = 90.3 kg
    const answers: QuizAnswers = {
      transportId: 'car_petrol',
      weeklyKm: 100,
      dietId: 'vegetarian',
      electricityKwh: 0,
      monthlySpend: 0,
    };
    const breakdown = calculateFootprint('IN', answers);
    expect(breakdown.transport).toBeCloseTo(90.3, 2);
  });

  test('vegan diet returns 40kg food emissions', () => {
    const answers: QuizAnswers = {
      transportId: 'walk_cycle',
      weeklyKm: 0,
      dietId: 'vegan',
      electricityKwh: 0,
      monthlySpend: 0,
    };
    // German (DE) has a vegan option with a factor of 40
    const breakdown = calculateFootprint('DE', answers);
    expect(breakdown.food).toBe(40);
  });

  test('vegetarian returns 55kg food emissions', () => {
    const answers: QuizAnswers = {
      transportId: 'walk_cycle',
      weeklyKm: 0,
      dietId: 'vegetarian',
      electricityKwh: 0,
      monthlySpend: 0,
    };
    const breakdown = calculateFootprint('IN', answers);
    expect(breakdown.food).toBe(55);
  });

  test('grid factor multiplication for India (0.82)', () => {
    const answers: QuizAnswers = {
      transportId: 'walk_cycle',
      weeklyKm: 0,
      dietId: 'vegetarian',
      electricityKwh: 100,
      monthlySpend: 0,
    };
    const breakdown = calculateFootprint('IN', answers);
    expect(breakdown.energy).toBeCloseTo(82, 2);
  });

  test('total = transport + food + energy + shopping', () => {
    const answers: QuizAnswers = {
      transportId: 'car_petrol',
      weeklyKm: 150,
      dietId: 'vegetarian',
      electricityKwh: 250,
      monthlySpend: 3000,
    };
    const breakdown = calculateFootprint('IN', answers);
    const sum = breakdown.transport + breakdown.food + breakdown.energy + breakdown.shopping;
    expect(breakdown.total).toBeCloseTo(sum, 4);
  });

  test('country averages are correct numbers', () => {
    expect(countries.IN.avgFootprint).toBe(158);
    expect(countries.NG.avgFootprint).toBe(50);
    expect(countries.DE.avgFootprint).toBe(675);
    expect(countries.BR.avgFootprint).toBe(192);
    expect(countries.KE.avgFootprint).toBe(42);
    expect(countries.US.avgFootprint).toBe(1375);
  });

  test('Paris target is 167 kg/month', () => {
    const mockBreakdown = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
      total: 100,
      pctOfAvg: 100,
      mood: 'average' as const,
      moodEmoji: '',
      moodText: '',
      highestCategory: 'food' as const,
    };
    const comparison = getComparisonBars(mockBreakdown, 'IN');
    expect(comparison.parisValue).toBe(167);
  });

  describe('Expanded Emission Factors and Country-Specific Calculations', () => {
    test('Nigeria transport (keke, okada) and diet (mixed, meat_daily)', () => {
      // Okada: weeklyKm 50 * 4.3 * 0.12 = 25.8 kg
      const answers: QuizAnswers = {
        transportId: 'okada',
        weeklyKm: 50,
        dietId: 'meat_daily',
        electricityKwh: 100, // 100 * 0.43 = 43 kg
        monthlySpend: 20000, // 20000 * 0.0001 = 2 kg
      };
      const breakdown = calculateFootprint('NG', answers);
      expect(breakdown.transport).toBeCloseTo(25.8, 1);
      expect(breakdown.food).toBe(130);
      expect(breakdown.energy).toBe(43);
      expect(breakdown.shopping).toBe(2);
      expect(breakdown.total).toBeCloseTo(25.8 + 130 + 43 + 2, 1);
    });

    test('Germany transport (car_diesel, car_ev) and diet (flexitarian)', () => {
      // Car Diesel: 100 * 4.3 * 0.23 = 98.9 kg
      const answers: QuizAnswers = {
        transportId: 'car_diesel',
        weeklyKm: 100,
        dietId: 'flexitarian',
        electricityKwh: 200, // 200 * 0.38 = 76 kg
        monthlySpend: 500, // 500 * 0.1 = 50 kg
      };
      const breakdown = calculateFootprint('DE', answers);
      expect(breakdown.transport).toBeCloseTo(98.9, 1);
      expect(breakdown.food).toBe(90);
      expect(breakdown.energy).toBe(76);
      expect(breakdown.shopping).toBe(50);
    });

    test('Brazil transport (mototaxi) and diet (churrasco)', () => {
      // Mototaxi: 80 * 4.3 * 0.12 = 41.28 kg
      const answers: QuizAnswers = {
        transportId: 'mototaxi',
        weeklyKm: 80,
        dietId: 'churrasco',
        electricityKwh: 150, // 150 * 0.09 = 13.5 kg
        monthlySpend: 300, // 300 * 0.05 = 15 kg
      };
      const breakdown = calculateFootprint('BR', answers);
      expect(breakdown.transport).toBeCloseTo(41.28, 2);
      expect(breakdown.food).toBe(160);
      expect(breakdown.energy).toBe(13.5);
      expect(breakdown.shopping).toBe(15);
    });

    test('Kenya transport (boda) and diet (plant_heavy)', () => {
      // Boda boda: 60 * 4.3 * 0.12 = 30.96 kg
      const answers: QuizAnswers = {
        transportId: 'boda',
        weeklyKm: 60,
        dietId: 'plant_heavy',
        electricityKwh: 80, // 80 * 0.15 = 12 kg
        monthlySpend: 10000, // 10000 * 0.0008 = 8 kg
      };
      const breakdown = calculateFootprint('KE', answers);
      expect(breakdown.transport).toBeCloseTo(30.96, 2);
      expect(breakdown.food).toBe(50);
      expect(breakdown.energy).toBe(12);
      expect(breakdown.shopping).toBe(8);
    });

    test('USA transport (suv, car_hybrid) and diet (sad)', () => {
      // SUV: 200 * 4.3 * 0.28 = 240.8 kg
      const answers: QuizAnswers = {
        transportId: 'suv',
        weeklyKm: 200,
        dietId: 'sad',
        electricityKwh: 800, // 800 * 0.39 = 312 kg
        monthlySpend: 1000, // 1000 * 0.09 = 90 kg
      };
      const breakdown = calculateFootprint('US', answers);
      expect(breakdown.transport).toBeCloseTo(240.8, 1);
      expect(breakdown.food).toBe(140);
      expect(breakdown.energy).toBe(312);
      expect(breakdown.shopping).toBe(90);
    });
  });

  describe('simulateWhatIf Logic Tests', () => {
    test('simulateWhatIf for transport change', () => {
      const answers: QuizAnswers = {
        transportId: 'car_petrol',
        weeklyKm: 100, // 90.3 kg
        dietId: 'vegetarian',
        electricityKwh: 100,
        monthlySpend: 0,
      };
      const result = simulateWhatIf('IN', answers, 'walk_cycle');
      // current total: 90.3 + 55 + 82 = 227.3
      // modified total: 0 + 55 + 82 = 137.0
      // saved: 90.3
      expect(result.newTotal).toBeCloseTo(137, 1);
      expect(result.saved).toBeCloseTo(90.3, 1);
    });

    test('simulateWhatIf for diet change', () => {
      const answers: QuizAnswers = {
        transportId: 'walk_cycle',
        weeklyKm: 0,
        dietId: 'nonveg_daily', // 130 kg
        electricityKwh: 0,
        monthlySpend: 0,
      };
      const result = simulateWhatIf('IN', answers, undefined, 'vegetarian');
      // current: 130
      // modified: 55
      // saved: 75
      expect(result.newTotal).toBe(55);
      expect(result.saved).toBe(75);
    });

    test('simulateWhatIf for energy reduction', () => {
      const answers: QuizAnswers = {
        transportId: 'walk_cycle',
        weeklyKm: 0,
        dietId: 'vegetarian',
        electricityKwh: 100, // 82 kg
        monthlySpend: 0,
      };
      const result = simulateWhatIf('IN', answers, undefined, undefined, 20); // 20% reduction
      // current: 55 + 82 = 137
      // modified: 55 + 82 * 0.8 = 55 + 65.6 = 120.6
      // saved: 16.4
      expect(result.newTotal).toBeCloseTo(120.6, 1);
      expect(result.saved).toBeCloseTo(16.4, 1);
    });

    test('simulateWhatIf returns correct emotional equivalent template', () => {
      const answers: QuizAnswers = {
        transportId: 'car_petrol',
        weeklyKm: 100,
        dietId: 'vegetarian',
        electricityKwh: 100,
        monthlySpend: 0,
      };
      const result = simulateWhatIf('IN', answers, 'walk_cycle');
      // saved is 90.3 kg.
      // emotional equivalent for IN total falls back to transport template: `Delhi→Agra train journeys` divisor 22
      // 90.3 / 22 = 4.10 -> 4 journeys
      expect(result.savedEmotional).toContain('auto rides to office');
      expect(result.savedEmotional).toContain('90');
    });
  });
});
