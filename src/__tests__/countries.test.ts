import { describe, test, expect } from 'vitest';
import countries, { CountryCode } from '../data/countries';

describe('Countries Data Structures Tests', () => {
  const codes: CountryCode[] = ['IN', 'NG', 'DE', 'BR', 'KE', 'US'];

  test('all 6 country codes exist in the dataset', () => {
    expect(Object.keys(countries).length).toBe(6);
    codes.forEach((code) => {
      expect(countries[code]).toBeDefined();
    });
  });

  test('each country contains required properties', () => {
    codes.forEach((code) => {
      const country = countries[code];
      expect(country).toBeDefined();
      expect(country.avgFootprint).toBeDefined();
      expect(country.gridFactor).toBeDefined();
      expect(country.transportOptions).toBeDefined();
      expect(country.dietOptions).toBeDefined();
      expect(country.regionOptions).toBeDefined();
    });
  });

  test('all grid factors are > 0 and < 1', () => {
    codes.forEach((code) => {
      const country = countries[code];
      expect(country.gridFactor).toBeGreaterThan(0);
      expect(country.gridFactor).toBeLessThan(1);
    });
  });

  test('all avgFootprint values are > 0', () => {
    codes.forEach((code) => {
      const country = countries[code];
      expect(country.avgFootprint).toBeGreaterThan(0);
    });
  });

  test('every transport option contains id and label', () => {
    codes.forEach((code) => {
      const country = countries[code];
      country.transportOptions.forEach((option) => {
        expect(option.id).toBeDefined();
        expect(typeof option.id).toBe('string');
        expect(option.label).toBeDefined();
        expect(typeof option.label).toBe('string');
      });
    });
  });

  test('every diet option contains id and factor', () => {
    codes.forEach((code) => {
      const country = countries[code];
      country.dietOptions.forEach((option) => {
        expect(option.id).toBeDefined();
        expect(typeof option.id).toBe('string');
        expect(option.factor).toBeDefined();
        expect(typeof option.factor).toBe('number');
      });
    });
  });

  test('transport option IDs are unique per country', () => {
    codes.forEach((code) => {
      const country = countries[code];
      const ids = country.transportOptions.map(o => o.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  test('diet option IDs are unique per country', () => {
    codes.forEach((code) => {
      const country = countries[code];
      const ids = country.dietOptions.map(o => o.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  test('emotional equivalents coverage for all countries and regions', () => {
    codes.forEach((code) => {
      const country = countries[code];
      
      // Get all region IDs for this country, plus undefined (default)
      const regions = [undefined, ...country.regionOptions.map(r => r.id)];
      
      regions.forEach((regionId) => {
        const equivs = country.emotionalEquivalents(regionId);
        expect(equivs).toBeDefined();
        expect(typeof equivs.transport).toBe('function');
        expect(typeof equivs.food).toBe('function');
        expect(typeof equivs.energy).toBe('function');
        expect(typeof equivs.shopping).toBe('function');
        expect(typeof equivs.total).toBe('function');

        const categories: ('transport' | 'food' | 'energy' | 'shopping' | 'total')[] = [
          'transport', 'food', 'energy', 'shopping', 'total'
        ];

        categories.forEach((category) => {
          const fn = equivs[category];
          
          // Test positive value (normal path)
          const resultPositive = fn(1000);
          expect(resultPositive).toBeDefined();
          expect(typeof resultPositive).toBe('string');
          expect(resultPositive.length).toBeGreaterThan(0);
          expect(resultPositive).not.toContain('Almost carbon-free');

          // Test zero value (n <= 0 branch)
          const resultZero = fn(0);
          expect(resultZero).toBe('Almost carbon-free in this category 🌱');

          // Test negative value (n <= 0 branch)
          const resultNegative = fn(-50);
          expect(resultNegative).toBe('Almost carbon-free in this category 🌱');
        });
      });
    });
  });
});
