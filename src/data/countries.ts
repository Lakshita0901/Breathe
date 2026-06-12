export type CountryCode = 'IN' | 'NG' | 'DE' | 'BR' | 'KE' | 'US';

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  avgFootprint: number;
  languages: { code: string; name: string }[];
  transportOptions: { id: string; label: string; factor: number }[];
  dietOptions: { id: string; label: string; factor: number }[];
  gridFactor: number;
  shoppingRate: number;
  currency: string;
  electricityHint: string;
  emotionalEquivalents: {
    transport: (kg: number) => string;
    food: (kg: number) => string;
    energy: (kg: number) => string;
    shopping: (kg: number) => string;
    total: (kg: number) => string;
  };
}

const countries: Record<CountryCode, Country> = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '\u{1F1EE}\u{1F1F3}',
    avgFootprint: 158,
    languages: [
      { code: 'en', name: 'English' },
      { code: 'hi', name: '\u0939\u093F\u0902\u0926\u0940' },
      { code: 'mr', name: '\u092E\u0930\u093E\u0920\u0940' },
      { code: 'ta', name: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD' },
      { code: 'te', name: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41' },
    ],
    transportOptions: [
      { id: 'walk_cycle', label: 'Walk / Cycle', factor: 0 },
      { id: 'auto', label: 'Auto-rickshaw', factor: 0.09 },
      { id: 'bus', label: 'City bus / ST bus', factor: 0.08 },
      { id: 'metro', label: 'Metro / Local train', factor: 0.04 },
      { id: 'scooter', label: 'Bike or scooter', factor: 0.09 },
      { id: 'car_petrol', label: 'Car petrol/diesel', factor: 0.21 },
      { id: 'car_cng', label: 'Car CNG', factor: 0.10 },
    ],
    dietOptions: [
      { id: 'vegetarian', label: 'Vegetarian', factor: 55 },
      { id: 'eggetarian', label: 'Eggetarian', factor: 65 },
      { id: 'nonveg_occasional', label: 'Non-veg occasional 1-2x/week', factor: 80 },
      { id: 'nonveg_daily', label: 'Non-veg daily', factor: 130 },
    ],
    gridFactor: 0.82,
    shoppingRate: 0.003,
    currency: '\u20B9',
    electricityHint: 'Typical: 100-400 kWh/month',
    emotionalEquivalents: {
      transport: (kg) => `= ${Math.round(kg / 22)} Delhi\u2192Agra train journeys`,
      food: (kg) => `= ${Math.round(kg * 14.5)} rotis worth of cooking gas`,
      energy: (kg) => `= your ceiling fan running for ${Math.round(kg / 20)} months nonstop`,
      shopping: (kg) => `= ${Math.round(kg / 3)} cotton kurtas manufactured`,
      total: (kg) => `= ${Math.round(kg / 22)} Delhi\u2192Agra train journeys`,
    },
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    flag: '\u{1F1F3}\u{1F1EC}',
    avgFootprint: 50,
    languages: [
      { code: 'en', name: 'English' },
      { code: 'yo', name: 'Yor\u00F9b\u00E1' },
      { code: 'ha', name: 'Hausa' },
      { code: 'ig', name: 'Igbo' },
    ],
    transportOptions: [
      { id: 'walk', label: 'Walk', factor: 0 },
      { id: 'keke', label: 'Keke NAPEP', factor: 0.09 },
      { id: 'danfo', label: 'Danfo / Minibus', factor: 0.09 },
      { id: 'brt', label: 'BRT', factor: 0.08 },
      { id: 'okada', label: 'Okada motorbike', factor: 0.12 },
      { id: 'car', label: 'Private car', factor: 0.21 },
    ],
    dietOptions: [
      { id: 'plant_heavy', label: 'Plant-heavy (vegetables & grains)', factor: 50 },
      { id: 'mixed', label: 'Mixed (some meat few times/week)', factor: 80 },
      { id: 'meat_daily', label: 'Meat daily', factor: 130 },
    ],
    gridFactor: 0.43,
    shoppingRate: 0.0001,
    currency: '\u20A6',
    electricityHint: 'Typical: 50-200 kWh/month',
    emotionalEquivalents: {
      transport: (kg) => `= ${Math.round(kg / 3.5)} Lagos\u2192Ibadan danfo rides`,
      food: (kg) => `= ${Math.round(kg / 2.5)} pots of jollof rice cooked on kerosene`,
      energy: (kg) => `= ${Math.round(kg * 200)} phone charges`,
      shopping: (kg) => `= ${Math.round(kg * 50)} locally made items`,
      total: (kg) => `= ${Math.round(kg / 3.5)} Lagos\u2192Ibadan danfo rides`,
    },
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    flag: '\u{1F1E9}\u{1F1EA}',
    avgFootprint: 675,
    languages: [
      { code: 'de', name: 'Deutsch' },
      { code: 'en', name: 'English' },
    ],
    transportOptions: [
      { id: 'bicycle', label: 'Bicycle', factor: 0 },
      { id: 'walk', label: 'Walk', factor: 0 },
      { id: 'ubahn', label: 'U-Bahn / S-Bahn', factor: 0.04 },
      { id: 'tram', label: 'Tram / Bus', factor: 0.08 },
      { id: 'ice', label: 'ICE / Regional train', factor: 0.04 },
      { id: 'car_petrol', label: 'Car petrol', factor: 0.21 },
      { id: 'car_diesel', label: 'Car diesel', factor: 0.23 },
      { id: 'car_ev', label: 'Car EV', factor: 0.02 },
    ],
    dietOptions: [
      { id: 'vegan', label: 'Vegan', factor: 40 },
      { id: 'vegetarian', label: 'Vegetarian', factor: 55 },
      { id: 'flexitarian', label: 'Flexitarian (meat few times/week)', factor: 90 },
      { id: 'omnivore', label: 'Omnivore (meat daily)', factor: 130 },
    ],
    gridFactor: 0.38,
    shoppingRate: 0.1,
    currency: '\u20AC',
    electricityHint: 'Typical: 150-400 kWh/month',
    emotionalEquivalents: {
      transport: (kg) => `= ${Math.round(kg / 28)} Berlin\u2192Hamburg ICE trips`,
      food: (kg) => `= ${Math.round(kg / 27)} kg of beef produced`,
      energy: (kg) => `= ${Math.round(kg / 0.5)} loads of laundry`,
      shopping: (kg) => `= ${Math.round(kg / 15)} fast-fashion jackets manufactured`,
      total: (kg) => `= ${Math.round(kg / 28)} Berlin\u2192Hamburg ICE trips`,
    },
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    flag: '\u{1F1E7}\u{1F1F7}',
    avgFootprint: 192,
    languages: [
      { code: 'pt', name: 'Portugu\u00EAs' },
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Espa\u00F1ol' },
    ],
    transportOptions: [
      { id: 'walk', label: 'Walk', factor: 0 },
      { id: 'bicycle', label: 'Bicycle', factor: 0 },
      { id: 'onibus', label: '\u00D4nibus city bus', factor: 0.08 },
      { id: 'metro', label: 'Metr\u00F4 / Trem', factor: 0.04 },
      { id: 'mototaxi', label: 'Mototaxi', factor: 0.12 },
      { id: 'car_flex', label: 'Car flex/petrol', factor: 0.21 },
      { id: 'car_ev', label: 'Car EV', factor: 0.02 },
    ],
    dietOptions: [
      { id: 'plant_heavy', label: 'Plant-heavy', factor: 50 },
      { id: 'mixed', label: 'Mixed (some meat)', factor: 80 },
      { id: 'churrasco', label: 'Churrasco lifestyle (meat-heavy daily)', factor: 160 },
    ],
    gridFactor: 0.09,
    shoppingRate: 0.05,
    currency: 'R$',
    electricityHint: 'Typical: 100-300 kWh/month',
    emotionalEquivalents: {
      transport: (kg) => `= ${Math.round(kg / 3)} \u00F4nibus rides across S\u00E3o Paulo`,
      food: (kg) => `= ${Math.round(kg / 13)} churrasco meals`,
      energy: (kg) => `= ${Math.round(kg / 0.3)} hours of air conditioning`,
      shopping: (kg) => `= ${Math.round(kg / 7)} Havaianas pairs manufactured`,
      total: (kg) => `= ${Math.round(kg / 3)} \u00F4nibus rides across S\u00E3o Paulo`,
    },
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    flag: '\u{1F1F0}\u{1F1EA}',
    avgFootprint: 42,
    languages: [
      { code: 'sw', name: 'Kiswahili' },
      { code: 'en', name: 'English' },
    ],
    transportOptions: [
      { id: 'walk', label: 'Walk', factor: 0 },
      { id: 'bicycle', label: 'Bicycle', factor: 0 },
      { id: 'matatu', label: 'Matatu minibus', factor: 0.09 },
      { id: 'boda', label: 'Boda boda motorbike', factor: 0.12 },
      { id: 'bus', label: 'Bus', factor: 0.08 },
      { id: 'car', label: 'Private car', factor: 0.21 },
    ],
    dietOptions: [
      { id: 'plant_heavy', label: 'Plant-heavy (ugali, vegetables, legumes)', factor: 50 },
      { id: 'mixed', label: 'Mixed (some meat)', factor: 80 },
      { id: 'meat_daily', label: 'Meat daily', factor: 130 },
    ],
    gridFactor: 0.15,
    shoppingRate: 0.0008,
    currency: 'KSh',
    electricityHint: 'Typical: 30-150 kWh/month',
    emotionalEquivalents: {
      transport: (kg) => `= ${Math.round(kg / 2.5)} matatu rides across Nairobi`,
      food: (kg) => `= ${Math.round(kg / 2)} servings of nyama choma`,
      energy: (kg) => `= ${Math.round(kg * 600)} phone charges`,
      shopping: (kg) => `= ${Math.round(kg * 12)} kitenge fabric pieces`,
      total: (kg) => `= ${Math.round(kg / 2.5)} matatu rides across Nairobi`,
    },
  },
  US: {
    code: 'US',
    name: 'USA',
    flag: '\u{1F1FA}\u{1F1F8}',
    avgFootprint: 1375,
    languages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Espa\u00F1ol' },
    ],
    transportOptions: [
      { id: 'walk_bike', label: 'Walk / Bike', factor: 0 },
      { id: 'public', label: 'Public transit', factor: 0.08 },
      { id: 'car_ev', label: 'Car EV', factor: 0.02 },
      { id: 'car_hybrid', label: 'Car hybrid', factor: 0.12 },
      { id: 'car_petrol', label: 'Car petrol', factor: 0.21 },
      { id: 'suv', label: 'Car SUV / Truck', factor: 0.28 },
    ],
    dietOptions: [
      { id: 'vegan', label: 'Vegan', factor: 40 },
      { id: 'vegetarian', label: 'Vegetarian', factor: 55 },
      { id: 'flexitarian', label: 'Flexitarian', factor: 90 },
      { id: 'sad', label: 'Standard American diet (meat most meals)', factor: 140 },
    ],
    gridFactor: 0.39,
    shoppingRate: 0.09,
    currency: '$',
    electricityHint: 'Typical: 500-1200 kWh/month',
    emotionalEquivalents: {
      transport: (kg) => `= ${Math.round(kg / 170)} coast-to-coast flights`,
      food: (kg) => `= ${Math.round(kg / 27)} quarter-pound burgers produced`,
      energy: (kg) => `= ${Math.round(kg / 1.5)} days of AC in a Texas summer`,
      shopping: (kg) => `= ${Math.round(kg / 8)} pairs of sneakers manufactured`,
      total: (kg) => `= ${Math.round(kg / 170)} coast-to-coast flights`,
    },
  },
};

export default countries;
