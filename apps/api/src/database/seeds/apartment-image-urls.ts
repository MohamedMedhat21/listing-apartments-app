type UnitType = 'Apartment' | 'Duplex' | 'Penthouse' | 'Studio';

function unsplashPhoto(photoId: string, width: number, height: number): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

// Every ID below was verified with an HTTP HEAD request (200) before inclusion.
// Do not add photo IDs without checking — many common Unsplash slugs 404.

const VERIFIED_APARTMENT_PHOTOS = {
  livingRoomA: 'photo-1502672260266-1c1ef2d93688',
  livingRoomB: 'photo-1560448204-e02f11c3d0e2',
  livingRoomC: 'photo-1586023492125-27b2c045efd7',
  livingRoomD: 'photo-1616486338812-3dadae4b4ace',
  loftStudio: 'photo-1493809842364-78817add7ffb',
  modernInteriorA: 'photo-1600607687939-ce8a6c25118c',
  modernInteriorB: 'photo-1600607687920-4e2a09cf159d',
  modernInteriorC: 'photo-1600566753086-00f18fb6b3ea',
  modernInteriorD: 'photo-1631679706909-1844bbd07221',
  kitchenA: 'photo-1484154218962-a197022b5858',
  kitchenB: 'photo-1556912172-45b7abe8b7e1',
  bedroomA: 'photo-1505693416388-ac5ce068fe85',
  bedroomB: 'photo-1618221195710-dd6b41faaea6',
  houseExteriorA: 'photo-1600585154340-be6161a56a0c',
  houseExteriorB: 'photo-1600596542815-ffad4c1539a9',
  houseExteriorC: 'photo-1570129477492-45c003edd2be',
  houseExteriorD: 'photo-1600585154526-990dced4db0d',
  luxuryHomeA: 'photo-1564013799919-ab600027ffc6',
  luxuryHomeB: 'photo-1501183638710-841dd1904471',
} as const;

function photos(ids: readonly string[], width = 800, height = 600): string[] {
  return ids.map((id) => unsplashPhoto(id, width, height));
}

const STUDIO_IMAGES = photos([
  VERIFIED_APARTMENT_PHOTOS.loftStudio,
  VERIFIED_APARTMENT_PHOTOS.livingRoomC,
  VERIFIED_APARTMENT_PHOTOS.livingRoomD,
  VERIFIED_APARTMENT_PHOTOS.modernInteriorA,
]);

const APARTMENT_IMAGES = photos([
  VERIFIED_APARTMENT_PHOTOS.livingRoomA,
  VERIFIED_APARTMENT_PHOTOS.livingRoomB,
  VERIFIED_APARTMENT_PHOTOS.modernInteriorA,
  VERIFIED_APARTMENT_PHOTOS.kitchenA,
  VERIFIED_APARTMENT_PHOTOS.bedroomA,
]);

const DUPLEX_IMAGES = photos([
  VERIFIED_APARTMENT_PHOTOS.houseExteriorA,
  VERIFIED_APARTMENT_PHOTOS.houseExteriorB,
  VERIFIED_APARTMENT_PHOTOS.kitchenB,
  VERIFIED_APARTMENT_PHOTOS.bedroomB,
  VERIFIED_APARTMENT_PHOTOS.modernInteriorB,
]);

const PENTHOUSE_IMAGES = photos([
  VERIFIED_APARTMENT_PHOTOS.luxuryHomeA,
  VERIFIED_APARTMENT_PHOTOS.luxuryHomeB,
  VERIFIED_APARTMENT_PHOTOS.modernInteriorC,
  VERIFIED_APARTMENT_PHOTOS.houseExteriorC,
  VERIFIED_APARTMENT_PHOTOS.houseExteriorD,
]);

const SHARED_INTERIOR_IMAGES = photos([
  VERIFIED_APARTMENT_PHOTOS.modernInteriorD,
  VERIFIED_APARTMENT_PHOTOS.livingRoomC,
  VERIFIED_APARTMENT_PHOTOS.kitchenA,
]);

export const APARTMENT_IMAGE_POOLS: Record<UnitType, readonly string[]> = {
  Studio: [...STUDIO_IMAGES, ...SHARED_INTERIOR_IMAGES],
  Apartment: [...APARTMENT_IMAGES, ...SHARED_INTERIOR_IMAGES],
  Duplex: [...DUPLEX_IMAGES, ...SHARED_INTERIOR_IMAGES],
  Penthouse: [...PENTHOUSE_IMAGES, ...SHARED_INTERIOR_IMAGES],
};

export function developerLogoUrl(photoId: string): string {
  return unsplashPhoto(photoId, 200, 200);
}

// Verified building / residential exterior photos used as developer logo stand-ins.
export const DEVELOPER_LOGO_PHOTOS = {
  palmHills: 'photo-1545324418-cc1a3fa10c00',
  sodic: 'photo-1518005020951-eccb494ad742',
  mountainView: 'photo-1460317442991-0ec209397118',
  emaarMisr: 'photo-1570129477492-45c003edd2be',
  tatweerMisr: 'photo-1564013799919-ab600027ffc6',
} as const;

export function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
}

export function pickApartmentImageUrls(
  rng: () => number,
  unitType: UnitType,
  seedPrefix: string,
): string[] {
  const count = Math.floor(rng() * 4); // 0-3 images, so some apartments have none (P8 fallback case)
  const pool = APARTMENT_IMAGE_POOLS[unitType];
  const selected: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const offset = hashString(`${seedPrefix}-${index}`);
    const primary = pool[offset % pool.length];
    if (primary === undefined) {
      throw new Error(`pickApartmentImageUrls: empty image pool for ${unitType}`);
    }
    let candidate = primary;
    if (selected.includes(candidate)) {
      const fallback = pool[(offset + index + 1) % pool.length];
      if (fallback === undefined) {
        throw new Error(`pickApartmentImageUrls: empty image pool for ${unitType}`);
      }
      candidate = fallback;
    }
    selected.push(candidate);
  }

  return selected;
}
