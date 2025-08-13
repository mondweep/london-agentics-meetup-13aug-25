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
};
export declare const DEMO_TRIPS: {
    name: string;
    origin: KentLocation;
    destination: KentLocation;
    persona: string;
}[];
//# sourceMappingURL=kentLocations.d.ts.map