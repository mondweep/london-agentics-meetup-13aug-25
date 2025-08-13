export interface KentLocation {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    type: 'residential' | 'school' | 'station' | 'commercial' | 'healthcare';
    postcode: string;
}
export declare const KENT_LOCATIONS: KentLocation[];
export declare const KENT_ROUTES: {
    PRIMARY_ROADS: string[];
    SECONDARY_ROADS: string[];
    MOTORWAYS: string[];
    KENT_SPECIFIC: string[];
};
export declare const KENT_TRAFFIC_PATTERNS: {
    RUSH_HOUR_HOTSPOTS: {
        route: string;
        severity: number;
        times: string[];
    }[];
    SCHOOL_RUN_ROUTES: {
        route: string;
        severity: number;
        times: string[];
    }[];
    WEEKEND_LEISURE: {
        route: string;
        severity: number;
        times: string[];
    }[];
    COMMON_INCIDENTS: {
        route: string;
        reasons: string[];
    }[];
};
export declare const DEMO_TRIPS: {
    name: string;
    origin: KentLocation;
    destination: KentLocation;
    persona: string;
    schedule: {
        days: number[];
        windowStart: string;
        windowEnd: string;
    };
    alertThreshold: {
        type: string;
        value: number;
    };
}[];
export declare const LOCATION_CATEGORIES: {
    SCHOOLS: KentLocation[];
    STATIONS: KentLocation[];
    SHOPPING: KentLocation[];
    HEALTHCARE: KentLocation[];
    RESIDENTIAL: KentLocation[];
};
export declare const POPULAR_ROUTES: {
    SEVENOAKS_TO_LONDON: {
        origins: string[];
        destinations: string[];
    };
    TUNBRIDGE_WELLS_COMMUTE: {
        origins: string[];
        destinations: string[];
    };
    SCHOOL_RUNS: {
        destinations: string[];
        timeWindows: string[];
    };
    HEALTHCARE_TRIPS: {
        destinations: string[];
        priority: string;
    };
};
//# sourceMappingURL=kentLocations.d.ts.map