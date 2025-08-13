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
  },
  
  // Additional schools and educational facilities
  {
    name: 'Tunbridge Wells Grammar School for Boys',
    address: 'St Johns Road, Tunbridge Wells, Kent',
    latitude: 51.1274,
    longitude: 0.2789,
    type: 'school',
    postcode: 'TN4 9PX'
  },
  {
    name: 'Sevenoaks Grammar School',
    address: 'Portsmouth Road, Sevenoaks, Kent',
    latitude: 51.2856,
    longitude: 0.1978,
    type: 'school',
    postcode: 'TN13 2DF'
  },
  {
    name: 'Trinity School',
    address: 'Shirley Park, Croydon, Surrey',
    latitude: 51.3767,
    longitude: -0.0711,
    type: 'school',
    postcode: 'CR9 7AT'
  },
  
  // Additional residential areas
  {
    name: 'Kippington Gardens (Residential)',
    address: 'Kippington Road, Sevenoaks, Kent',
    latitude: 51.2812,
    longitude: 0.1834,
    type: 'residential',
    postcode: 'TN13 2LL'
  },
  {
    name: 'Riverhead Village (Residential)',
    address: 'London Road, Riverhead, Kent',
    latitude: 51.2678,
    longitude: 0.2123,
    type: 'residential',
    postcode: 'TN13 2BJ'
  },
  {
    name: 'Pembury Gardens (Residential)',
    address: 'Pembury Road, Tunbridge Wells, Kent',
    latitude: 51.1453,
    longitude: 0.2856,
    type: 'residential',
    postcode: 'TN2 4NU'
  },
  
  // Business and commercial areas
  {
    name: 'Sevenoaks Business Centre',
    address: 'Vestry Road, Sevenoaks, Kent',
    latitude: 51.2723,
    longitude: 0.1856,
    type: 'commercial',
    postcode: 'TN14 5EL'
  },
  {
    name: 'Royal Tunbridge Wells Shopping Centre',
    address: 'Royal Victoria Place, Tunbridge Wells, Kent',
    latitude: 51.1312,
    longitude: 0.2623,
    type: 'commercial',
    postcode: 'TN1 2SS'
  },
  {
    name: 'Westwood Cross Shopping Centre',
    address: 'Broadstairs Road, Margate, Kent',
    latitude: 51.3567,
    longitude: 1.4123,
    type: 'commercial',
    postcode: 'CT9 4JJ'
  },
  
  // Healthcare facilities
  {
    name: 'Darent Valley Hospital',
    address: 'Darenth Wood Road, Dartford, Kent',
    latitude: 51.4234,
    longitude: 0.2789,
    type: 'healthcare',
    postcode: 'DA2 8DA'
  },
  {
    name: 'Sevenoaks Medical Centre',
    address: 'London Road, Sevenoaks, Kent',
    latitude: 51.2734,
    longitude: 0.1945,
    type: 'healthcare',
    postcode: 'TN13 1DZ'
  },
  
  // Sports and leisure
  {
    name: 'Knole House and Park',
    address: 'Knole Lane, Sevenoaks, Kent',
    latitude: 51.2734,
    longitude: 0.1634,
    type: 'commercial',
    postcode: 'TN15 0RP'
  },
  {
    name: 'Dunorlan Park',
    address: 'Dunorlan Drive, Tunbridge Wells, Kent',
    latitude: 51.1234,
    longitude: 0.2456,
    type: 'commercial',
    postcode: 'TN1 1UG'
  },
  
  // Transport hubs
  {
    name: 'Ebbsfleet International Station',
    address: 'Southfleet Road, Ebbsfleet, Kent',
    latitude: 51.4428,
    longitude: 0.3206,
    type: 'station',
    postcode: 'DA10 1EB'
  },
  {
    name: 'Ashford International Station',
    address: 'Station Road, Ashford, Kent',
    latitude: 51.1456,
    longitude: 0.8712,
    type: 'station',
    postcode: 'TN23 1PP'
  }
];

// Comprehensive route names for Kent area (based on real roads)
export const KENT_ROUTES = {
  PRIMARY_ROADS: [
    'A21 (London Road)',
    'A25 (High Street)',
    'A224 (Polhill)',
    'A225 (Dartford Road)',
    'A226 (Gravesend Road)', 
    'A227 (Wrotham Road)',
    'A228 (Basted Mill)',
    'A229 (Chatham Road)',
    'A26 (Tonbridge Road)',
    'A20 (London Road)',
    'A2 (Watling Street)'
  ],
  SECONDARY_ROADS: [
    'Via Seal Hollow Road',
    'Via Bradbourne Vale Road', 
    'Via Bradbourne Park Road',
    'Via Tonbridge Road',
    'Via Mount Pleasant Road',
    'Via Pembury Road',
    'Via St Johns Hill',
    'Via Riverhead',
    'Via Kippington',
    'Via Dunton Green',
    'Via Chipstead',
    'Via Sundridge'
  ],
  MOTORWAYS: [
    'M25 Junction 5 (Sevenoaks)',
    'M25 Junction 3 (Swanley)', 
    'M25 Junction 2 (Darenth)',
    'M26 towards Maidstone',
    'M20 Junction 4 (West Malling)',
    'M20 Junction 8 (Maidstone)',
    'A2(M) towards Canterbury',
    'M2 Junction 1 (Strood)'
  ],
  KENT_SPECIFIC: [
    'A21 towards Hastings',
    'A25 towards Maidstone',
    'Via Knockholt Pound',
    'Via Otford',
    'Via Shoreham',
    'Via Eynsford',
    'Via Farningham',
    'Via West Kingsdown'
  ]
};

// Time-sensitive route patterns for Kent commuting
export const KENT_TRAFFIC_PATTERNS = {
  RUSH_HOUR_HOTSPOTS: [
    { route: 'M25 Junction 5 (Sevenoaks)', severity: 0.7, times: ['07:30-09:00', '17:00-18:30'] },
    { route: 'A21 (London Road)', severity: 0.5, times: ['08:00-09:00', '17:30-18:30'] },
    { route: 'A225 (Dartford Road)', severity: 0.4, times: ['07:45-08:45', '17:00-18:00'] },
    { route: 'A26 (Tonbridge Road)', severity: 0.3, times: ['08:15-08:45', '17:15-17:45'] }
  ],
  SCHOOL_RUN_ROUTES: [
    { route: 'Via Bradbourne Park Road', severity: 0.3, times: ['08:15-08:45', '15:00-15:30'] },
    { route: 'A25 (High Street)', severity: 0.2, times: ['08:20-08:40', '15:10-15:25'] },
    { route: 'Via Seal Hollow Road', severity: 0.4, times: ['08:10-08:35', '15:15-15:35'] }
  ],
  WEEKEND_LEISURE: [
    { route: 'A21 towards Hastings', severity: 0.2, times: ['10:00-16:00'] },
    { route: 'Via Knole Park', severity: 0.1, times: ['11:00-15:00'] },
    { route: 'A20 towards Dover', severity: 0.3, times: ['09:00-17:00'] }
  ],
  COMMON_INCIDENTS: [
    { route: 'M25 Junction 5', reasons: ['Overturned vehicle', 'Multi-vehicle collision', 'Emergency repairs'] },
    { route: 'A21 (London Road)', reasons: ['Broken down lorry', 'Police incident', 'Surface water flooding'] },
    { route: 'A224 (Polhill)', reasons: ['Fallen tree', 'Ice/snow conditions', 'Emergency services'] }
  ]
};

// Comprehensive demo trips for Kent personas
export const DEMO_TRIPS = [
  // Alex's trips (Sevenoaks resident with school-age child)
  {
    name: "Leo's Math Tuition",
    origin: KENT_LOCATIONS.find(l => l.name === 'Bradbourne Vale Road (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Kumon Math Centre Sevenoaks')!,
    persona: 'Alex',
    schedule: { days: [2, 4], windowStart: '16:30', windowEnd: '17:00' }, // Tuesdays & Thursdays
    alertThreshold: { type: 'MINUTES', value: 8 }
  },
  {
    name: 'School Drop-off (Knole Academy)',
    origin: KENT_LOCATIONS.find(l => l.name === 'Bradbourne Vale Road (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Knole Academy')!,
    persona: 'Alex',
    schedule: { days: [1, 2, 3, 4, 5], windowStart: '08:15', windowEnd: '08:30' }, // Weekdays
    alertThreshold: { type: 'MINUTES', value: 5 }
  },
  {
    name: 'Weekend Shopping (Bluewater)',
    origin: KENT_LOCATIONS.find(l => l.name === 'Bradbourne Vale Road (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Bluewater Shopping Centre')!,
    persona: 'Alex',
    schedule: { days: [6], windowStart: '10:00', windowEnd: '11:00' }, // Saturdays
    alertThreshold: { type: 'PERCENTAGE', value: 30 }
  },
  
  // Chloe's trips (Tunbridge Wells resident, London commuter)
  {
    name: 'London Commute',
    origin: KENT_LOCATIONS.find(l => l.name === 'Rusthall Common (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Tunbridge Wells Central Station')!,
    persona: 'Chloe',
    schedule: { days: [1, 2, 3, 4, 5], windowStart: '07:45', windowEnd: '08:00' }, // Weekdays
    alertThreshold: { type: 'MINUTES', value: 10 }
  },
  {
    name: 'Client Meeting (Sevenoaks)',
    origin: KENT_LOCATIONS.find(l => l.name === 'Rusthall Common (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Sevenoaks High Street')!,
    persona: 'Chloe',
    schedule: { days: [3], windowStart: '14:00', windowEnd: '14:30' }, // Wednesdays
    alertThreshold: { type: 'MINUTES', value: 15 }
  },
  {
    name: 'Hospital Appointment',
    origin: KENT_LOCATIONS.find(l => l.name === 'Rusthall Common (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Tunbridge Wells Hospital')!,
    persona: 'Chloe',
    schedule: { days: [1], windowStart: '09:15', windowEnd: '09:30' }, // Mondays
    alertThreshold: { type: 'MINUTES', value: 12 }
  },
  
  // Additional common Kent journeys
  {
    name: 'Grammar School Drop-off',
    origin: KENT_LOCATIONS.find(l => l.name === 'Kippington Gardens (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Tunbridge Wells Grammar School for Boys')!,
    persona: 'James',
    schedule: { days: [1, 2, 3, 4, 5], windowStart: '08:00', windowEnd: '08:15' },
    alertThreshold: { type: 'MINUTES', value: 7 }
  },
  {
    name: 'Ebbsfleet Commute',
    origin: KENT_LOCATIONS.find(l => l.name === 'Riverhead Village (Residential)')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Ebbsfleet International Station')!,
    persona: 'James',
    schedule: { days: [1, 2, 3, 4, 5], windowStart: '07:30', windowEnd: '07:45' },
    alertThreshold: { type: 'PERCENTAGE', value: 25 }
  },
  {
    name: 'Weekend Canterbury Trip',
    origin: KENT_LOCATIONS.find(l => l.name === 'Sevenoaks High Street')!,
    destination: KENT_LOCATIONS.find(l => l.name === 'Canterbury Cathedral')!,
    persona: 'Alex',
    schedule: { days: [0], windowStart: '09:00', windowEnd: '10:00' }, // Sundays
    alertThreshold: { type: 'MINUTES', value: 20 }
  }
];

// Kent-specific location categories for easy filtering
export const LOCATION_CATEGORIES = {
  SCHOOLS: KENT_LOCATIONS.filter(l => l.type === 'school'),
  STATIONS: KENT_LOCATIONS.filter(l => l.type === 'station'),
  SHOPPING: KENT_LOCATIONS.filter(l => l.type === 'commercial'),
  HEALTHCARE: KENT_LOCATIONS.filter(l => l.type === 'healthcare'),
  RESIDENTIAL: KENT_LOCATIONS.filter(l => l.type === 'residential')
};

// Popular journey combinations for Kent residents
export const POPULAR_ROUTES = {
  SEVENOAKS_TO_LONDON: {
    origins: ['Bradbourne Vale Road (Residential)', 'Kippington Gardens (Residential)', 'Riverhead Village (Residential)'],
    destinations: ['Sevenoaks Railway Station', 'Ebbsfleet International Station']
  },
  TUNBRIDGE_WELLS_COMMUTE: {
    origins: ['Rusthall Common (Residential)', 'Pembury Gardens (Residential)'],
    destinations: ['Tunbridge Wells Central Station', 'Royal Tunbridge Wells Shopping Centre']
  },
  SCHOOL_RUNS: {
    destinations: ['Knole Academy', 'Sevenoaks Grammar School', 'Tunbridge Wells Grammar School for Boys'],
    timeWindows: ['08:00-08:30', '15:00-15:30']
  },
  HEALTHCARE_TRIPS: {
    destinations: ['Tunbridge Wells Hospital', 'Sevenoaks Medical Centre', 'Darent Valley Hospital'],
    priority: 'high' // These trips often can't be delayed
  }
};