import { DEVELOPER_LOGO_PHOTOS, developerLogoUrl } from '../apartment-image-urls';

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
    logoUrl: developerLogoUrl(DEVELOPER_LOGO_PHOTOS.palmHills),
  },
  {
    name: 'SODIC',
    description:
      'Sixth of October Development & Investment Company, a pioneer of master-planned communities in West and East Cairo.',
    logoUrl: developerLogoUrl(DEVELOPER_LOGO_PHOTOS.sodic),
  },
  {
    name: 'Mountain View',
    description:
      'Developer focused on resort-style residential compounds combining green landscaping with modern architecture.',
    logoUrl: developerLogoUrl(DEVELOPER_LOGO_PHOTOS.mountainView),
  },
  {
    name: 'Emaar Misr',
    description:
      'The Egyptian arm of Emaar Properties, delivering large mixed-use communities in New Cairo and the North Coast.',
    logoUrl: developerLogoUrl(DEVELOPER_LOGO_PHOTOS.emaarMisr),
  },
  {
    name: 'Tatweer Misr',
    description:
      'Developer of fully integrated urban communities across Cairo and the Red Sea and North coasts.',
    logoUrl: developerLogoUrl(DEVELOPER_LOGO_PHOTOS.tatweerMisr),
  },
];
