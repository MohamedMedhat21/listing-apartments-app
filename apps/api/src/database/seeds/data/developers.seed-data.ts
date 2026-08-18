export interface DeveloperSeedData {
  name: string;
  description: string;
  logoUrl: string;
}

// Realistic Egyptian developers (docs/requirements.md section 9).
export const developersSeedData: DeveloperSeedData[] = [
  {
    name: 'Palm Hills Developments',
    description:
      'One of Egypt\u2019s largest real estate developers, known for large-scale integrated communities across Greater Cairo and the North Coast.',
    logoUrl: 'https://picsum.photos/seed/palm-hills-logo/200/200',
  },
  {
    name: 'SODIC',
    description:
      'Sixth of October Development & Investment Company, a pioneer of master-planned communities in West and East Cairo.',
    logoUrl: 'https://picsum.photos/seed/sodic-logo/200/200',
  },
  {
    name: 'Mountain View',
    description:
      'Developer focused on resort-style residential compounds combining green landscaping with modern architecture.',
    logoUrl: 'https://picsum.photos/seed/mountain-view-logo/200/200',
  },
  {
    name: 'Emaar Misr',
    description:
      'The Egyptian arm of Emaar Properties, delivering large mixed-use communities in New Cairo and the North Coast.',
    logoUrl: 'https://picsum.photos/seed/emaar-misr-logo/200/200',
  },
  {
    name: 'Tatweer Misr',
    description:
      'Developer of fully integrated urban communities across Cairo and the Red Sea and North coasts.',
    logoUrl: 'https://picsum.photos/seed/tatweer-misr-logo/200/200',
  },
];
