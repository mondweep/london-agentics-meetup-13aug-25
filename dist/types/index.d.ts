export interface Location {
    latitude: number;
    longitude: number;
    address: string;
    name?: string;
}
export interface Schedule {
    days: number[];
    windowStart: string;
    windowEnd: string;
}
export interface AlertThreshold {
    type: 'PERCENTAGE' | 'MINUTES';
    value: number;
}
export interface Trip {
    id: string;
    userId: string;
    name: string;
    origin: Location;
    destination: Location;
    schedule: Schedule;
    alertThreshold: AlertThreshold;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Route {
    id: string;
    name: string;
    polyline: string;
    distance: number;
    staticDuration: number;
    currentDuration: number;
    delay: number;
    delayPercentage: number;
    status: 'CLEAR' | 'MODERATE' | 'HEAVY';
    reason?: string;
}
export interface TrafficAlert {
    id: string;
    tripId: string;
    timestamp: Date;
    triggeredBy: string;
    delayMinutes: number;
    reason: string;
    routes: Route[];
    userAction?: 'DISMISSED' | 'NAVIGATED_ALTERNATIVE' | 'NAVIGATED_ORIGINAL';
}
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    settings: {
        defaultNavApp: string;
        quietHours?: {
            enabled: boolean;
            start: string;
            end: string;
        };
    };
}
export interface MonitoringJob {
    id: string;
    tripId: string;
    scheduledFor: Date;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    routes?: Route[];
    alertSent?: boolean;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface MockGoogleRoutesResponse {
    routes: Array<{
        polyline: {
            encodedPolyline: string;
        };
        distanceMeters: number;
        staticDuration: string;
        routeLabels?: string[];
    }>;
}
export interface MockTomTomTrafficResponse {
    flowSegmentData: {
        frc: string;
        currentSpeed: number;
        freeFlowSpeed: number;
        currentTravelTime: number;
        freeFlowTravelTime: number;
        confidence: number;
    };
}
//# sourceMappingURL=index.d.ts.map