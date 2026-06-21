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

  describe('India (IN) structure validation', () => {
    test('basic metadata', () => {
      const c = countries.IN;
      expect(c.code).toBe('IN');
      expect(c.name).toBe('India');
      expect(c.flag).toBe('🇮🇳');
      expect(c.avgFootprint).toBe(158);
      expect(c.gridFactor).toBe(0.82);
      expect(c.shoppingRate).toBe(0.003);
      expect(c.currency).toBe('₹');
    });

    test('transport and diet options', () => {
      const c = countries.IN;
      expect(c.transportOptions.length).toBeGreaterThan(0);
      expect(c.dietOptions.length).toBeGreaterThan(0);
      
      const walk = c.transportOptions.find(o => o.id === 'walk_cycle');
      expect(walk).toBeDefined();
      expect(walk?.factor).toBe(0);

      const vegetarian = c.dietOptions.find(o => o.id === 'vegetarian');
      expect(vegetarian).toBeDefined();
      expect(vegetarian?.factor).toBe(55);
    });

    test('emotional equivalents for regions', () => {
      const c = countries.IN;
      const metroEquiv = c.emotionalEquivalents('metro');
      expect(metroEquiv.transport(100)).toContain('Ola/Uber');
      expect(metroEquiv.food(100)).toContain('Swiggy');
      expect(metroEquiv.energy(1200)).toContain('AC');
      expect(metroEquiv.shopping(80)).toContain('Myntra');

      const midcityEquiv = c.emotionalEquivalents('midcity');
      expect(midcityEquiv.transport(100)).toContain('auto-rickshaw');

      const smalltownEquiv = c.emotionalEquivalents('smalltown');
      expect(smalltownEquiv.energy(350)).toContain('tubelight');

      const ruralEquiv = c.emotionalEquivalents('rural');
      expect(ruralEquiv.food(430)).toContain('cooking gas');

      const defaultEquiv = c.emotionalEquivalents();
      expect(defaultEquiv.transport(220)).toContain('train journeys');
    });
  });

  describe('Nigeria (NG) structure validation', () => {
    test('basic metadata & equivalents', () => {
      const c = countries.NG;
      expect(c.code).toBe('NG');
      expect(c.name).toBe('Nigeria');
      expect(c.flag).toBe('🇳🇬');
      expect(c.avgFootprint).toBe(50);
      expect(c.gridFactor).toBe(0.43);

      const lagosEquiv = c.emotionalEquivalents('lagos');
      expect(lagosEquiv.transport(15)).toContain('danfo');
      
      const ruralEquiv = c.emotionalEquivalents('rural');
      expect(ruralEquiv.energy(100)).toContain('kerosene');
    });
  });

  describe('Germany (DE) structure validation', () => {
    test('basic metadata & equivalents', () => {
      const c = countries.DE;
      expect(c.code).toBe('DE');
      expect(c.name).toBe('Germany');
      expect(c.flag).toBe('🇩🇪');
      expect(c.avgFootprint).toBe(675);
      expect(c.gridFactor).toBe(0.38);

      const cityEquiv = c.emotionalEquivalents('city');
      expect(cityEquiv.food(54)).toContain('beef');
      
      const ruralEquiv = c.emotionalEquivalents('rural');
      expect(ruralEquiv.energy(50)).toContain('home heating');
    });
  });

  describe('Brazil (BR) structure validation', () => {
    test('basic metadata & equivalents', () => {
      const c = countries.BR;
      expect(c.code).toBe('BR');
      expect(c.name).toBe('Brazil');
      expect(c.flag).toBe('🇧🇷');
      expect(c.avgFootprint).toBe(192);
      expect(c.gridFactor).toBe(0.09);

      const spEquiv = c.emotionalEquivalents('saopaulo');
      expect(spEquiv.shopping(70)).toContain('Havaianas');
    });
  });

  describe('Kenya (KE) structure validation', () => {
    test('basic metadata & equivalents', () => {
      const c = countries.KE;
      expect(c.code).toBe('KE');
      expect(c.name).toBe('Kenya');
      expect(c.flag).toBe('🇰🇪');
      expect(c.avgFootprint).toBe(42);
      expect(c.gridFactor).toBe(0.15);

      const nairobiEquiv = c.emotionalEquivalents('nairobi');
      expect(nairobiEquiv.transport(10)).toContain('matatu');
    });
  });

  describe('USA (US) structure validation', () => {
    test('basic metadata & equivalents', () => {
      const c = countries.US;
      expect(c.code).toBe('US');
      expect(c.name).toBe('USA');
      expect(c.flag).toBe('🇺🇸');
      expect(c.avgFootprint).toBe(1375);
      expect(c.gridFactor).toBe(0.39);

      const cityEquiv = c.emotionalEquivalents('city');
      expect(cityEquiv.transport(10)).toContain('subway');
    });
  });
});
