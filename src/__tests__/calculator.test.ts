import { describe, test, expect } from 'vitest';
import { calculateFootprint, getComparisonBars, QuizAnswers } from '../utils/calculator';
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
});
