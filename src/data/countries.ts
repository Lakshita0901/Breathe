export type CountryCode = 'IN' | 'NG' | 'DE' | 'BR' | 'KE' | 'US';

export interface RegionOption {
  id: string;
  label?: string;
}

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
  regionOptions: RegionOption[];
  emotionalEquivalents: (regionId?: string) => {
    transport: (kg: number) => string;
    food: (kg: number) => string;
    energy: (kg: number) => string;
    shopping: (kg: number) => string;
    total: (kg: number) => string;
  };
}

const ZERO = 'Almost carbon-free in this category \uD83C\uDF31';

function div(kg: number, divisor: number, unit: string): string {
  const n = Math.round(kg / divisor);
  return n <= 0 ? ZERO : `= ${n} ${unit}`;
}

function mul(kg: number, multiplier: number, unit: string): string {
  const n = Math.round(kg * multiplier);
  return n <= 0 ? ZERO : `= ${n} ${unit}`;
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
    regionOptions: [
      { id: 'metro' },
      { id: 'midcity' },
      { id: 'smalltown' },
      { id: 'rural' },
    ],
    emotionalEquivalents: (regionId) => {
      if (regionId === 'metro') return {
        transport: (kg) => div(kg, 1.5, 'Ola/Uber rides across town'),
        food: (kg) => div(kg, 0.6, 'Swiggy orders worth of packaging and delivery'),
        energy: (kg) => div(kg, 120, 'months of running your AC overnight'),
        shopping: (kg) => div(kg, 8, 'Myntra fashion hauls'),
        total: (kg) => div(kg, 1.5, 'Ola/Uber rides across town'),
      };
      if (regionId === 'midcity') return {
        transport: (kg) => div(kg, 0.5, 'auto-rickshaw rides to work'),
        food: (kg) => div(kg, 0.3, 'dabbas of home cooking fuel'),
        energy: (kg) => div(kg, 55, 'months of ceiling fan and cooler running'),
        shopping: (kg) => div(kg, 3, 'local market shopping trips'),
        total: (kg) => div(kg, 0.5, 'auto-rickshaw rides to work'),
      };
      if (regionId === 'smalltown') return {
        transport: (kg) => div(kg, 0.4, 'auto rides to the town centre'),
        food: (kg) => div(kg, 0.3, 'dabbas of home cooking fuel'),
        energy: (kg) => div(kg, 35, 'months of tubelight and fan running'),
        shopping: (kg) => div(kg, 2.5, 'local market shopping trips'),
        total: (kg) => div(kg, 0.4, 'auto rides to the town centre'),
      };
      if (regionId === 'rural') return {
        transport: (kg) => div(kg, 2, 'trips to the nearest mandi'),
        food: (kg) => div(kg, 43, 'cooking gas cylinders'),
        energy: (kg) => div(kg, 35, 'months of tubelight and pump running'),
        shopping: (kg) => div(kg, 5, 'months of household purchases'),
        total: (kg) => div(kg, 2, 'trips to the nearest mandi'),
      };
      return {
        transport: (kg) => div(kg, 22, 'Delhi\u2192Agra train journeys'),
        food: (kg) => mul(kg, 14.5, 'rotis worth of cooking gas'),
        energy: (kg) => div(kg, 20, 'months of ceiling fan nonstop'),
        shopping: (kg) => div(kg, 3, 'cotton kurtas manufactured'),
        total: (kg) => div(kg, 22, 'Delhi\u2192Agra train journeys'),
      };
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
    regionOptions: [
      { id: 'lagos', label: 'Lagos / Abuja / Port Harcourt' },
      { id: 'othercity', label: 'Other city or town' },
      { id: 'rural', label: 'Rural area' },
    ],
    emotionalEquivalents: (regionId) => {
      if (regionId === 'lagos') return {
        transport: (kg) => div(kg, 1.5, 'danfo rides from Yaba to VI'),
        food: (kg) => div(kg, 1.5, 'pots of jollof rice cooked on gas'),
        energy: (kg) => div(kg, 60, 'months of generator fuel (4 hrs/day)'),
        shopping: (kg) => div(kg, 2, 'trips to Alaba International Market'),
        total: (kg) => div(kg, 1.5, 'danfo rides from Yaba to VI'),
      };
      if (regionId === 'othercity') return {
        transport: (kg) => div(kg, 0.5, 'keke NAPEP rides'),
        food: (kg) => div(kg, 2, 'pots of soup cooked on firewood'),
        energy: (kg) => div(kg, 12, 'weeks of small generator use'),
        shopping: (kg) => div(kg, 3, 'market bale purchases'),
        total: (kg) => div(kg, 0.5, 'keke NAPEP rides'),
      };
      if (regionId === 'rural') return {
        transport: (kg) => div(kg, 2, 'bus rides to the nearest town'),
        food: (kg) => mul(kg, 2.5, 'kerosene lantern nights'),
        energy: (kg) => div(kg, 10, 'months of kerosene lighting'),
        shopping: (kg) => div(kg, 1.5, 'market day purchases'),
        total: (kg) => div(kg, 2, 'bus rides to the nearest town'),
      };
      return {
        transport: (kg) => div(kg, 3.5, 'Lagos\u2192Ibadan danfo rides'),
        food: (kg) => div(kg, 2.5, 'pots of jollof rice cooked on kerosene'),
        energy: (kg) => mul(kg, 200, 'phone charges'),
        shopping: (kg) => mul(kg, 50, 'locally made items'),
        total: (kg) => div(kg, 3.5, 'Lagos\u2192Ibadan danfo rides'),
      };
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
    regionOptions: [
      { id: 'city', label: 'Berlin / Munich / Hamburg' },
      { id: 'othercity', label: 'Other city or town' },
      { id: 'rural', label: 'Rural area or suburb' },
    ],
    emotionalEquivalents: (regionId) => {
      if (regionId === 'city') return {
        transport: (kg) => div(kg, 1, 'S-Bahn rides across the city'),
        food: (kg) => div(kg, 27, 'kg of beef produced'),
        energy: (kg) => mul(kg, 2, 'dishwasher loads'),
        shopping: (kg) => div(kg, 15, 'fast-fashion jackets manufactured'),
        total: (kg) => div(kg, 1, 'S-Bahn rides across the city'),
      };
      if (regionId === 'othercity') return {
        transport: (kg) => div(kg, 0.3, 'bus or tram rides'),
        food: (kg) => div(kg, 3, 'Schnitzel meals'),
        energy: (kg) => mul(kg, 2, 'loads of laundry'),
        shopping: (kg) => div(kg, 8, 'pairs of jeans manufactured'),
        total: (kg) => div(kg, 0.3, 'bus or tram rides'),
      };
      if (regionId === 'rural') return {
        transport: (kg) => div(kg, 4, 'Autobahn trips to the supermarket'),
        food: (kg) => div(kg, 7, 'kg of pork produced'),
        energy: (kg) => div(kg, 25, 'weeks of home heating'),
        shopping: (kg) => div(kg, 4, 'online orders with home delivery'),
        total: (kg) => div(kg, 4, 'Autobahn trips to the supermarket'),
      };
      return {
        transport: (kg) => div(kg, 28, 'Berlin\u2192Hamburg ICE trips'),
        food: (kg) => div(kg, 27, 'kg of beef produced'),
        energy: (kg) => mul(kg, 2, 'loads of laundry'),
        shopping: (kg) => div(kg, 15, 'fast-fashion jackets manufactured'),
        total: (kg) => div(kg, 28, 'Berlin\u2192Hamburg ICE trips'),
      };
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
    regionOptions: [
      { id: 'saopaulo', label: 'São Paulo / Rio de Janeiro' },
      { id: 'othercity', label: 'Other city' },
      { id: 'rural', label: 'Rural area' },
    ],
    emotionalEquivalents: (regionId) => {
      if (regionId === 'saopaulo') return {
        transport: (kg) => div(kg, 2, 'Uber rides through city traffic'),
        food: (kg) => div(kg, 15, 'churrascaria meals'),
        energy: (kg) => mul(kg, 3.3, 'hours of air conditioning'),
        shopping: (kg) => div(kg, 7, 'pairs of Havaianas manufactured'),
        total: (kg) => div(kg, 2, 'Uber rides through city traffic'),
      };
      if (regionId === 'othercity') return {
        transport: (kg) => div(kg, 0.7, '\u00F4nibus city bus rides'),
        food: (kg) => mul(kg, 2, 'feij\u00E3o com arroz meals'),
        energy: (kg) => mul(kg, 10, 'hours of electric fan'),
        shopping: (kg) => div(kg, 2, 'feira shopping trips'),
        total: (kg) => div(kg, 0.7, '\u00F4nibus city bus rides'),
      };
      if (regionId === 'rural') return {
        transport: (kg) => div(kg, 4, 'bus trips to the nearest city'),
        food: (kg) => div(kg, 1, 'ro\u00E7a farm meals prepared'),
        energy: (kg) => div(kg, 1.5, 'hours of generator fuel'),
        shopping: (kg) => div(kg, 3, 'months of town purchases'),
        total: (kg) => div(kg, 4, 'bus trips to the nearest city'),
      };
      return {
        transport: (kg) => div(kg, 3, '\u00F4nibus rides across S\u00E3o Paulo'),
        food: (kg) => div(kg, 13, 'churrasco meals'),
        energy: (kg) => div(kg, 0.3, 'hours of air conditioning'),
        shopping: (kg) => div(kg, 7, 'Havaianas pairs manufactured'),
        total: (kg) => div(kg, 3, '\u00F4nibus rides across S\u00E3o Paulo'),
      };
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
    regionOptions: [
      { id: 'nairobi', label: 'Nairobi / Mombasa' },
      { id: 'othercity', label: 'Other town or city' },
      { id: 'rural', label: 'Rural area' },
    ],
    emotionalEquivalents: (regionId) => {
      if (regionId === 'nairobi') return {
        transport: (kg) => div(kg, 1, 'matatu rides across Nairobi'),
        food: (kg) => div(kg, 2, 'servings of nyama choma'),
        energy: (kg) => div(kg, 7.5, 'months of standard KPLC electricity'),
        shopping: (kg) => div(kg, 0.3, 'CBD market purchases'),
        total: (kg) => div(kg, 1, 'matatu rides across Nairobi'),
      };
      if (regionId === 'othercity') return {
        transport: (kg) => div(kg, 1, 'boda boda rides'),
        food: (kg) => mul(kg, 5, 'ugali and sukuma wiki meals'),
        energy: (kg) => div(kg, 7, 'months of household electricity'),
        shopping: (kg) => div(kg, 1, 'market day purchases'),
        total: (kg) => div(kg, 1, 'boda boda rides'),
      };
      if (regionId === 'rural') return {
        transport: (kg) => div(kg, 2, 'matatu rides to the nearest town'),
        food: (kg) => mul(kg, 2, 'charcoal jiko meals'),
        energy: (kg) => div(kg, 3, 'months of kerosene lamp use'),
        shopping: (kg) => mul(kg, 2, 'market day trips'),
        total: (kg) => div(kg, 2, 'matatu rides to the nearest town'),
      };
      return {
        transport: (kg) => div(kg, 2.5, 'matatu rides across Nairobi'),
        food: (kg) => div(kg, 2, 'servings of nyama choma'),
        energy: (kg) => mul(kg, 600, 'phone charges'),
        shopping: (kg) => mul(kg, 12, 'kitenge fabric pieces'),
        total: (kg) => div(kg, 2.5, 'matatu rides across Nairobi'),
      };
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
    regionOptions: [
      { id: 'city', label: 'Major city (New York / LA / Chicago)' },
      { id: 'suburb', label: 'Suburb or mid-size city' },
      { id: 'rural', label: 'Rural area' },
    ],
    emotionalEquivalents: (regionId) => {
      if (regionId === 'city') return {
        transport: (kg) => mul(kg, 2, 'subway rides'),
        food: (kg) => div(kg, 27, 'quarter-pound burgers produced'),
        energy: (kg) => div(kg, 1.5, 'days of AC in a New York apartment'),
        shopping: (kg) => div(kg, 8, 'pairs of sneakers manufactured'),
        total: (kg) => mul(kg, 2, 'subway rides'),
      };
      if (regionId === 'suburb') return {
        transport: (kg) => div(kg, 5, 'round-trip car commutes to work'),
        food: (kg) => div(kg, 3, 'fast food meals'),
        energy: (kg) => div(kg, 1.5, 'days of central air conditioning'),
        shopping: (kg) => div(kg, 5, 'Amazon deliveries'),
        total: (kg) => div(kg, 5, 'round-trip car commutes to work'),
      };
      if (regionId === 'rural') return {
        transport: (kg) => div(kg, 10, 'highway drives to the nearest town'),
        food: (kg) => div(kg, 10, 'backyard barbecue cookouts'),
        energy: (kg) => div(kg, 4, 'days of propane heating'),
        shopping: (kg) => div(kg, 8, 'big-box store shopping trips'),
        total: (kg) => div(kg, 10, 'highway drives to the nearest town'),
      };
      return {
        transport: (kg) => div(kg, 170, 'coast-to-coast flights'),
        food: (kg) => div(kg, 27, 'quarter-pound burgers produced'),
        energy: (kg) => div(kg, 1.5, 'days of AC in a Texas summer'),
        shopping: (kg) => div(kg, 8, 'pairs of sneakers manufactured'),
        total: (kg) => div(kg, 170, 'coast-to-coast flights'),
      };
    },
  },
};

export default countries;
