import { Location, Route } from '../types';
export declare class MockGoogleMapsAPI {
    private static instance;
    static getInstance(): MockGoogleMapsAPI;
    computeRoutes(origin: Location, destination: Location): Promise<Route[]>;
    private calculateDistance;
    private selectRouteName;
    private generateMockPolyline;
}
export declare class MockTomTomTrafficAPI {
    private static instance;
    private trafficConditions;
    static getInstance(): MockTomTomTrafficAPI;
    constructor();
    getTrafficFlow(route: Route): Promise<Route>;
    getTrafficIncidents(route: Route): Promise<string[]>;
    private initializeTrafficConditions;
    private getTimeBasedTrafficScenarios;
    private getRandomTrafficScenarios;
    private updateTrafficConditions;
    private addNewIncident;
    private updateIncidentReason;
    private getRouteKey;
    injectTrafficScenario(routeName: string, severity: number, reason: string): void;
    getCurrentConditions(): Array<{
        route: string;
        severity: number;
        reason?: string;
    }>;
}
//# sourceMappingURL=mockApis.d.ts.map