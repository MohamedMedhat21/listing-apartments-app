import { describe, expect, it } from 'vitest';

import { formatArea, formatBathrooms, formatBedrooms, formatPrice } from './formatters';

describe('formatters', () => {
  it('formats prices as whole EGP amounts with thousands separators (BR-15)', () => {
    expect(formatPrice(2_500_000)).toBe('EGP\u00a02,500,000');
  });

  it('formats area as a rounded number of square metres', () => {
    expect(formatArea(180.4)).toBe('180 m²');
  });

  it('uses singular and plural labels for apartment specifications', () => {
    expect(formatBedrooms(1)).toBe('1 bedroom');
    expect(formatBedrooms(3)).toBe('3 bedrooms');
    expect(formatBathrooms(1)).toBe('1 bathroom');
    expect(formatBathrooms(2)).toBe('2 bathrooms');
  });
});
