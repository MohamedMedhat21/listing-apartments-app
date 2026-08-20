import { ApartmentStatus } from '@apartments/shared';

import { hashString, pickApartmentImageUrls } from './apartment-image-urls';

export interface ApartmentSeedInput {
  unitName: string;
  unitNumber: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  floor: number | null;
  address: string | null;
  status: ApartmentStatus;
  amenities: string[];
  imageUrls: string[];
}

const AMENITIES_POOL = [
  'Swimming Pool',
  'Gym',
  '24/7 Security',
  'Kids Area',
  'Clubhouse',
  'Covered Parking',
  'Garden View',
  'Central A/C',
  'Elevator',
  'BBQ Area',
  'Landscaped Gardens',
  'Jogging Track',
];

const STATUS_CYCLE: ApartmentStatus[] = [
  ApartmentStatus.AVAILABLE,
  ApartmentStatus.AVAILABLE,
  ApartmentStatus.AVAILABLE,
  ApartmentStatus.RESERVED,
  ApartmentStatus.SOLD,
];

const UNIT_TYPES = ['Apartment', 'Duplex', 'Penthouse', 'Studio'] as const;
type UnitType = (typeof UNIT_TYPES)[number];

// mulberry32 — small, deterministic PRNG so re-running the seed produces
// byte-identical apartments every time (required for idempotency; see
// docs/implementation-plan.md P1 exit condition).
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) {
    throw new Error('generate-apartments: pick() called with an empty array');
  }
  return item;
}

export function generateApartmentsForProject(
  projectName: string,
  count: number,
): ApartmentSeedInput[] {
  const rng = mulberry32(hashString(projectName));
  const apartments: ApartmentSeedInput[] = [];

  for (let i = 0; i < count; i += 1) {
    const unitType = pick(rng, UNIT_TYPES);
    const floorNumber = Math.floor(rng() * 20);
    const buildingLetter = String.fromCharCode(65 + Math.floor(rng() * 6)); // A-F
    const unitNumber = `${buildingLetter}-${100 + i * 3 + Math.floor(rng() * 3)}`;
    // Every iteration always draws the same sequence of rng() calls
    // regardless of branching below, so the generated stream (and hence
    // every later apartment's unitNumber) doesn't shift if this logic changes.
    const bedroomsRoll = 1 + Math.floor(rng() * 4); // 1-4
    const bathroomsRoll = Math.floor(rng() * 2);
    const bedrooms = unitType === 'Studio' ? 0 : bedroomsRoll; // studios have no separate bedroom
    const bathrooms = Math.max(1, bedrooms - bathroomsRoll) || 1; // 1..bedrooms, never 0
    const areaSqm = Math.round((60 + rng() * 240 + bedrooms * 15) * 100) / 100;
    const pricePerSqm = 35000 + Math.floor(rng() * 45000);
    const price = Math.round(areaSqm * pricePerSqm * 100) / 100;
    const amenityCount = 2 + Math.floor(rng() * 5);
    const amenities = Array.from(
      new Set(Array.from({ length: amenityCount }, () => pick(rng, AMENITIES_POOL))),
    );
    const status = pick(rng, STATUS_CYCLE);
    const seedSlug = `${projectName}-${unitNumber}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    apartments.push({
      unitName: `${unitType} ${unitNumber}`,
      unitNumber,
      description:
        unitType === 'Studio'
          ? `A studio in ${projectName}, ${areaSqm} sqm with ${bathrooms} bathroom${bathrooms > 1 ? 's' : ''}.`
          : `A ${bedrooms}-bedroom ${unitType.toLowerCase()} in ${projectName}, ${areaSqm} sqm with ${bathrooms} bathroom${
              bathrooms > 1 ? 's' : ''
            }.`,
      price,
      bedrooms,
      bathrooms,
      areaSqm,
      floor: unitType === 'Penthouse' ? null : floorNumber,
      address: `Building ${buildingLetter}, ${projectName}`,
      status,
      amenities,
      imageUrls: pickApartmentImageUrls(rng, unitType, seedSlug),
    });
  }

  return apartments;
}
