// City + vertical rotation. Deterministic per day-of-year so the pool walks
// evenly and no market is re-hit for weeks.

export const VERTICALS = [
  'plumber', 'HVAC contractor', 'electrician', 'roofing contractor', 'landscaping',
  'general contractor', 'auto repair shop', 'barbershop', 'hair salon', 'nail salon',
  'tattoo shop', 'mobile detailing', 'towing service', 'house cleaning service',
  'handyman', 'pest control', 'appliance repair', 'locksmith', 'tree service',
  'flooring contractor', 'taqueria', 'family restaurant', 'food truck', 'bakery',
  'butcher shop', 'dry cleaner', 'tailor', 'mechanic'
];

// Never queried. Also dropped in filter.js if they slip through a broad query.
export const EXCLUDED_KEYWORDS = [
  'daycare', 'day care', 'child care', 'childcare', 'preschool', 'pre-school',
  'school', 'elementary', 'montessori', 'learning center', 'learning centre',
  'senior care', 'assisted living', 'residential care', 'group home',
  'nursing', 'hospice', 'academy', 'tutoring'
];

export const CITIES = [
  // Washington
  { city: 'Seattle', state: 'WA' }, { city: 'Spokane', state: 'WA' },
  { city: 'Tacoma', state: 'WA' }, { city: 'Vancouver', state: 'WA' },
  { city: 'Everett', state: 'WA' }, // South Carolina
  { city: 'Columbia', state: 'SC' }, { city: 'Charleston', state: 'SC' },
  { city: 'Greenville', state: 'SC' }, { city: 'North Charleston', state: 'SC' },
  { city: 'Rock Hill', state: 'SC' }, { city: 'Myrtle Beach', state: 'SC' },
  // North Carolina
  { city: 'Charlotte', state: 'NC' }, { city: 'Raleigh', state: 'NC' },
  { city: 'Greensboro', state: 'NC' }, { city: 'Durham', state: 'NC' },
  { city: 'Winston-Salem', state: 'NC' }, { city: 'Wilmington', state: 'NC' }, // California
  { city: 'San Diego', state: 'CA' }, { city: 'Chula Vista', state: 'CA' },
  { city: 'Escondido', state: 'CA' }, { city: 'Oceanside', state: 'CA' },
  { city: 'Riverside', state: 'CA' }, { city: 'Bakersfield', state: 'CA' },
  { city: 'Fresno', state: 'CA' }, { city: 'Sacramento', state: 'CA' },
  { city: 'Stockton', state: 'CA' }, { city: 'Modesto', state: 'CA' },
  // Texas
  { city: 'Houston', state: 'TX' }, { city: 'San Antonio', state: 'TX' },
  { city: 'Dallas', state: 'TX' }, { city: 'Austin', state: 'TX' },
  { city: 'Fort Worth', state: 'TX' }, { city: 'El Paso', state: 'TX' },
  { city: 'Arlington', state: 'TX' }, { city: 'Corpus Christi', state: 'TX' },
  { city: 'Plano', state: 'TX' }, { city: 'Laredo', state: 'TX' },
  { city: 'Lubbock', state: 'TX' }, { city: 'McAllen', state: 'TX' },
  // Florida
  { city: 'Jacksonville', state: 'FL' }, { city: 'Miami', state: 'FL' },
  { city: 'Tampa', state: 'FL' }, { city: 'Orlando', state: 'FL' },
  { city: 'St. Petersburg', state: 'FL' }, { city: 'Port St. Lucie', state: 'FL' }, { city: 'Cape Coral', state: 'FL' },
  { city: 'Tallahassee', state: 'FL' }, { city: 'Fort Lauderdale', state: 'FL' },
  // Arizona
  { city: 'Phoenix', state: 'AZ' }, { city: 'Tucson', state: 'AZ' },
  { city: 'Mesa', state: 'AZ' }, { city: 'Chandler', state: 'AZ' },
  { city: 'Glendale', state: 'AZ' }, { city: 'Gilbert', state: 'AZ' },
  { city: 'Scottsdale', state: 'AZ' }, // Georgia
  { city: 'Atlanta', state: 'GA' }, { city: 'Augusta', state: 'GA' },
  { city: 'Columbus', state: 'GA' }, { city: 'Macon', state: 'GA' },
  { city: 'Savannah', state: 'GA' }, { city: 'Athens', state: 'GA' },
  // Ohio
  { city: 'Columbus', state: 'OH' }, { city: 'Cleveland', state: 'OH' },
  { city: 'Cincinnati', state: 'OH' }, { city: 'Toledo', state: 'OH' },
  { city: 'Akron', state: 'OH' }, { city: 'Dayton', state: 'OH' },
  { city: 'Canton', state: 'OH' }, // Midwest
  { city: 'Indianapolis', state: 'IN' }, { city: 'Chicago', state: 'IL' }, { city: 'Milwaukee', state: 'WI' }, { city: 'Madison', state: 'WI' },
  { city: 'Detroit', state: 'MI' }, { city: 'Grand Rapids', state: 'MI' },
  { city: 'Kansas City', state: 'MO' }, { city: 'St. Louis', state: 'MO' },
  { city: 'Omaha', state: 'NE' }, { city: 'Des Moines', state: 'IA' },
  { city: 'Wichita', state: 'KS' }, { city: 'Minneapolis', state: 'MN' },
  { city: 'Sioux Falls', state: 'SD' },
  // Northeast
  { city: 'Philadelphia', state: 'PA' }, { city: 'Pittsburgh', state: 'PA' },
  { city: 'Allentown', state: 'PA' }, { city: 'Newark', state: 'NJ' },
  { city: 'Buffalo', state: 'NY' }, { city: 'Rochester', state: 'NY' },
  { city: 'Syracuse', state: 'NY' }, { city: 'Hartford', state: 'CT' },
  { city: 'Providence', state: 'RI' }, { city: 'Worcester', state: 'MA' },
  { city: 'Manchester', state: 'NH' },
  // South
  { city: 'Nashville', state: 'TN' }, { city: 'Memphis', state: 'TN' },
  { city: 'Knoxville', state: 'TN' }, { city: 'Louisville', state: 'KY' }, { city: 'Lexington', state: 'KY' },
  { city: 'Birmingham', state: 'AL' }, { city: 'Jackson', state: 'MS' }, { city: 'New Orleans', state: 'LA' },
  { city: 'Baton Rouge', state: 'LA' }, { city: 'Shreveport', state: 'LA' },
  { city: 'Little Rock', state: 'AR' }, { city: 'Oklahoma City', state: 'OK' },
  { city: 'Tulsa', state: 'OK' }, { city: 'Richmond', state: 'VA' },
  { city: 'Virginia Beach', state: 'VA' }, { city: 'Norfolk', state: 'VA' },
  { city: 'Baltimore', state: 'MD' },
  // Mountain / West
  { city: 'Denver', state: 'CO' }, { city: 'Colorado Springs', state: 'CO' },
  { city: 'Salt Lake City', state: 'UT' }, { city: 'Boise', state: 'ID' },
  { city: 'Las Vegas', state: 'NV' }, { city: 'Reno', state: 'NV' },
  { city: 'Albuquerque', state: 'NM' }, { city: 'Portland', state: 'OR' },
  { city: 'Eugene', state: 'OR' }, { city: 'Salem', state: 'OR' },
  { city: 'Billings', state: 'MT' }
];

export function dayOfYear(d = new Date()) {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / 86400000);
}

function slice(pool, start, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(pool[(start + i) % pool.length]);
  return out;
}

// Primary 8 cities for today.
export function citiesForToday(doy = dayOfYear(), count = 8) {
  return slice(CITIES, doy % CITIES.length, count);
}

// Next 4 cities after the primary block — the widen-and-retry pass.
export function widenCities(doy = dayOfYear(), primaryCount = 8, count = 4) {
  return slice(CITIES, (doy % CITIES.length) + primaryCount, count);
}

// 10-vertical rotating slice.
export function verticalsForToday(doy = dayOfYear(), count = 10) {
  return slice(VERTICALS, (doy * count) % VERTICALS.length, count);
}
