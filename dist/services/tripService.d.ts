import { Trip, Location, Schedule, AlertThreshold } from '../types';
export declare class TripService {
    private trips;
    private userTrips;
    createTrip(userId: string, name: string, origin: Location, destination: Location, schedule: Schedule, alertThreshold: AlertThreshold): Promise<Trip>;
    getTripById(tripId: string): Promise<Trip | null>;
    getTripsByUserId(userId: string): Promise<Trip[]>;
    updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip | null>;
    deleteTrip(tripId: string): Promise<boolean>;
    toggleTripActive(tripId: string): Promise<Trip | null>;
    getActiveTripsForTime(currentTime: Date): Promise<Trip[]>;
    validateTripData(tripData: Partial<Trip>): string[];
    private formatTimeString;
    private subtractMinutes;
    private isTimeInRange;
    initializeDemoData(userId: string): Promise<void>;
}
//# sourceMappingURL=tripService.d.ts.map