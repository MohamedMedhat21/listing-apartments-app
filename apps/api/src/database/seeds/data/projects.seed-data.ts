export interface ProjectSeedData {
  developerName: string;
  name: string;
  city: string;
  district: string;
  description: string;
}

// Two projects per developer (docs/requirements.md section 9: ~10 projects).
export const projectsSeedData: ProjectSeedData[] = [
  {
    developerName: 'Palm Hills Developments',
    name: 'Palm Hills New Cairo',
    city: 'New Cairo',
    district: 'Fifth Settlement',
    description:
      'A gated community of villas and apartments centred on a golf course and green spine.',
  },
  {
    developerName: 'Palm Hills Developments',
    name: 'Palm Hills October',
    city: '6th of October',
    district: 'Palm Hills',
    description:
      'A well-established West Cairo compound with mature landscaping and a central commercial strip.',
  },
  {
    developerName: 'SODIC',
    name: 'Westown',
    city: 'Sheikh Zayed',
    district: 'Westown',
    description:
      'A mixed-use community anchored by Westown Hub, SODIC\u2019s retail and dining destination.',
  },
  {
    developerName: 'SODIC',
    name: 'Villette',
    city: 'New Cairo',
    district: 'Villette',
    description:
      'A contemporary community known for its central park, sports club, and art-inspired public spaces.',
  },
  {
    developerName: 'Mountain View',
    name: 'Mountain View iCity',
    city: 'New Cairo',
    district: 'iCity',
    description: 'A large-scale smart city development with extensive lagoons and green corridors.',
  },
  {
    developerName: 'Mountain View',
    name: 'Mountain View Chillout Park',
    city: '6th of October',
    district: 'Chillout Park',
    description:
      'A resort-style compound built around a chain of lagoons and open-air leisure areas.',
  },
  {
    developerName: 'Emaar Misr',
    name: 'Mivida',
    city: 'New Cairo',
    district: 'Mivida',
    description:
      'An expansive community of clubhouses, schools, and parks spread across a green valley.',
  },
  {
    developerName: 'Emaar Misr',
    name: 'Uptown Cairo',
    city: 'Cairo',
    district: 'Mokattam',
    description:
      'A hilltop community overlooking Cairo, combining golf, retail, and residential districts.',
  },
  {
    developerName: 'Tatweer Misr',
    name: 'Bloomfields',
    city: 'Mostakbal City',
    district: 'Bloomfields',
    description:
      'A New Cairo extension community centred on a central park and neighbourhood retail plazas.',
  },
  {
    developerName: 'Tatweer Misr',
    name: 'IL Monte Galala',
    city: 'Ain Sokhna',
    district: 'IL Monte Galala',
    description:
      'A hillside coastal destination on the Red Sea with residences overlooking the sea and mountains.',
  },
];
