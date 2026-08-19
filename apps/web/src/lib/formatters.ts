const egpFormatter = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
});

const wholeNumberFormatter = new Intl.NumberFormat('en-EG', {
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return egpFormatter.format(value);
}

export function formatArea(value: number): string {
  return `${wholeNumberFormatter.format(value)} m²`;
}

function formatCount(value: number, singular: string, plural: string): string {
  return `${wholeNumberFormatter.format(value)} ${value === 1 ? singular : plural}`;
}

export function formatBedrooms(value: number): string {
  return formatCount(value, 'bedroom', 'bedrooms');
}

export function formatBathrooms(value: number): string {
  return formatCount(value, 'bathroom', 'bathrooms');
}
