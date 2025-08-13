// Synthetic data for Kent locations based on PRD research
export interface KentLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'residential' | 'school' | 'station' | 'commercial' | 'healthcare';
  postcode: string;
}

export const KENT_LOCATIONS: KentLocation[] = [
  // Sevenoaks area (primary persona: Alex)
  {
    name: 'Sevenoaks High Street',
    address: 'High Street, Sevenoaks, Kent',
    latitude: 51.2719,
    longitude: 0.1904,
    type: 'commercial',
    postcode: 'TN13 1UT'
  },
  {
    name: 'Sevenoaks Railway Station',
    address: 'Station Approach, Sevenoaks, Kent',
    latitude: 51.2737,
    longitude: 0.1887,
    type: 'station',
    postcode: 'TN13 1DU'
  },
  {
    name: 'Sevenoaks Primary School',
    address: 'Granville Road, Sevenoaks, Kent',
    latitude: 51.2756,
    longitude: 0.1923,
    type: 'school',
    postcode: 'TN13 1LT'
  },
  {
    name: 'Bradbourne Vale Road (Residential)',
    address: 'Bradbourne Vale Road, Sevenoaks, Kent',
    latitude: 51.2689,
    longitude: 0.1845,
    type: 'residential',
    postcode: 'TN13 3QG'
  },
  
  // Tunbridge Wells area (secondary persona: Chloe)
  {
    name: 'Tunbridge Wells Central Station',
    address: 'Mount Pleasant Road, Tunbridge Wells, Kent',
    latitude: 51.1321,
    longitude: 0.2634,
    type: 'station',
    postcode: 'TN1 1QR'
  },
  {
    name: 'The Pantiles',
    address: 'The Pantiles, Tunbridge Wells, Kent',
    latitude: 51.1307,
    longitude: 0.2639,
    type: 'commercial',
    postcode: 'TN2 5TN'
  },
  {
    name: 'Tunbridge Wells Hospital',
    address: 'Tonbridge Road, Tunbridge Wells, Kent',
    latitude: 51.1285,
    longitude: 0.2341,
    type: 'healthcare',
    postcode: 'TN2 4QJ'
  },
  {
    name: 'Rusthall Common (Residential)',
    address: 'Nellington Road, Tunbridge Wells, Kent',
    latitude: 51.1167,
    longitude: 0.2267,
    type: 'residential',
    postcode: 'TN4 8YB'
  },
  
  // Other Kent commuter towns
  {
    name: 'Dartford Railway Station',
    address: 'Lowfield Street, Dartford, Kent',
    latitude: 51.4467,
    longitude: 0.2142,
    type: 'station',
    postcode: 'DA1 1NB'
  },
  {
    name: 'Gravesend Station',
    address: 'Railway Street, Gravesend, Kent',
    latitude: 51.4419,
    longitude: 0.3708,
    type: 'station',
    postcode: 'DA11 0AU'
  },
  {
    name: 'Maidstone East Station',
    address: 'Sandling Road, Maidstone, Kent',
    latitude: 51.2735,
    longitude: 0.5186,
    type: 'station',
    postcode: 'ME14 2BE'
  },
  {
    name: 'Canterbury Cathedral',
    address: 'Cathedral Lodge, Canterbury, Kent',
    latitude: 51.2799,
    longitude: 1.0830,
    type: 'commercial',
    postcode: 'CT1 2EH'
  },
  
  // Common destinations for families
  {
    name: 'Bluewater Shopping Centre',
    address: 'Greenhithe, Dartford, Kent',
    latitude: 51.4387,
    longitude: 0.2744,
    type: 'commercial',
    postcode: 'DA9 9ST'
  },
  {
    name: 'Knole Academy',
    address: 'Seal Hollow Road, Sevenoaks, Kent',
    latitude: 51.2834,
    longitude: 0.1756,
    type: 'school',
    postcode: 'TN13 3SE'
  },
  {
    name: 'Kumon Math Centre Sevenoaks',
    address: 'London Road, Sevenoaks, Kent',
    latitude: 51.2745,
    longitude: 0.1967,
    type: 'school',
    postcode: 'TN13 1AS'
  }
];

// Common route names for Kent area (based on real roads)
export const KENT_ROUTES = {
  PRIMARY_ROADS: [
    'A21 (London Road)',
    'A25 (High Street)',
    'A224 (Dartford Road)',
    'A225 (London Road)',
    'A227 (Gravesend Road)',
    'A228 (Basted Mill)'
  ],
  SECONDARY_ROADS: [
    'Via Seal Hollow Road',
    'Via Bradbourne Vale Road',
    'Via Tonbridge Road',
    'Via Mount Pleasant Road',
    'Via Pembury Road',
    'Via St Johns Hill'
  ],
  MOTORWAYS: [
    'M25 Junction 5',
    'M26',
    'M20 Junction 4',
    'A2(M)'
  ]
};

// Generate demo trips for personas
export const DEMO_TRIPS = [
  {
    name: "Leo's Tuition",
    origin: KENT_LOCATIONS.find(l => l.name === 'Bradbourne Vale Road (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Kumon Math Centre Sevenoaks')!,
    persona: 'Alex'
  },
  {
    name: 'School Run',
    origin: KENT_LOCATIONS.find(l => l.name === 'Bradbourne Vale Road (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Knole Academy')!,
    persona: 'Alex'
  },
  {
    name: 'London Commute',
    origin: KENT_LOCATIONS.find(l => l.name === 'Rusthall Common (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Tunbridge Wells Central Station')!,
    persona: 'Chloe'
  },
  {
    name: 'Client Meeting',
    origin: KENT_LOCATIONS.find(l => l.name === 'Rusthall Common (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Sevenoaks High Street')!,
    persona: 'Chloe'
  }
];