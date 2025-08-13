"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripService = void 0;
const uuid_1 = require("uuid");
class TripService {
    constructor() {
        this.trips = new Map();
        this.userTrips = new Map();
    }
    async createTrip(userId, name, origin, destination, schedule, alertThreshold) {
        const tripId = (0, uuid_1.v4)();
        const now = new Date();
        const trip = {
            id: tripId,
            userId,
            name: name.trim(),
            origin,
            destination,
            schedule,
            alertThreshold,
            isActive: true,
            createdAt: now,
            updatedAt: now
        };
        this.trips.set(tripId, trip);
        const userTripIds = this.userTrips.get(userId) || [];
        userTripIds.push(tripId);
        this.userTrips.set(userId, userTripIds);
        return trip;
    }
    async getTripById(tripId) {
        return this.trips.get(tripId) || null;
    }
    async getTripsByUserId(userId) {
        const tripIds = this.userTrips.get(userId) || [];
        const trips = [];
        for (const tripId of tripIds) {
            const trip = this.trips.get(tripId);
            if (trip) {
                trips.push(trip);
            }
        }
        return trips.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
    async updateTrip(tripId, updates) {
        const existingTrip = this.trips.get(tripId);
        if (!existingTrip) {
            return null;
        }
        await new Promise(resolve => setTimeout(resolve, 1));
        const updatedTrip = {
            ...existingTrip,
            ...updates,
            id: tripId,
            userId: existingTrip.userId,
            updatedAt: new Date()
        };
        this.trips.set(tripId, updatedTrip);
        return updatedTrip;
    }
    async deleteTrip(tripId) {
        const trip = this.trips.get(tripId);
        if (!trip) {
            return false;
        }
        const userTripIds = this.userTrips.get(trip.userId) || [];
        const filteredTripIds = userTripIds.filter(id => id !== tripId);
        this.userTrips.set(trip.userId, filteredTripIds);
        this.trips.delete(tripId);
        return true;
    }
    async toggleTripActive(tripId) {
        const trip = this.trips.get(tripId);
        if (!trip) {
            return null;
        }
        const updatedTrip = {
            ...trip,
            isActive: !trip.isActive,
            updatedAt: new Date()
        };
        this.trips.set(tripId, updatedTrip);
        return updatedTrip;
    }
    async getActiveTripsForTime(currentTime) {
        const allTrips = Array.from(this.trips.values());
        const activeTrips = [];
        const currentDay = currentTime.getDay();
        const currentTimeString = this.formatTimeString(currentTime);
        for (const trip of allTrips) {
            if (!trip.isActive)
                continue;
            if (!trip.schedule.days.includes(currentDay))
                continue;
            const monitoringStartTime = this.subtractMinutes(trip.schedule.windowStart, 30);
            const monitoringEndTime = trip.schedule.windowEnd;
            if (this.isTimeInRange(currentTimeString, monitoringStartTime, monitoringEndTime)) {
                activeTrips.push(trip);
            }
        }
        return activeTrips;
    }
    validateTripData(tripData) {
        const errors = [];
        if (!tripData.name || tripData.name.trim().length === 0) {
            errors.push('Trip name is required');
        }
        if (!tripData.origin) {
            errors.push('Origin location is required');
        }
        else {
            if (typeof tripData.origin.latitude !== 'number' || typeof tripData.origin.longitude !== 'number') {
                errors.push('Origin coordinates are required');
            }
        }
        if (!tripData.destination) {
            errors.push('Destination location is required');
        }
        else {
            if (typeof tripData.destination.latitude !== 'number' || typeof tripData.destination.longitude !== 'number') {
                errors.push('Destination coordinates are required');
            }
        }
        if (!tripData.schedule) {
            errors.push('Schedule is required');
        }
        else {
            if (!tripData.schedule.days || tripData.schedule.days.length === 0) {
                errors.push('At least one day must be selected');
            }
            if (!tripData.schedule.windowStart || !tripData.schedule.windowEnd) {
                errors.push('Departure window times are required');
            }
        }
        if (!tripData.alertThreshold) {
            errors.push('Alert threshold is required');
        }
        else {
            if (tripData.alertThreshold.value <= 0) {
                errors.push('Alert threshold must be greater than 0');
            }
        }
        return errors;
    }
    formatTimeString(date) {
        return date.toTimeString().substring(0, 5);
    }
    subtractMinutes(timeString, minutes) {
        const [hours, mins] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, mins - minutes, 0, 0);
        return this.formatTimeString(date);
    }
    isTimeInRange(currentTime, startTime, endTime) {
        return currentTime >= startTime && currentTime <= endTime;
    }
    async initializeDemoData(userId) {
        const demoTrips = [
            {
                name: "Leo's Tuition",
                origin: {
                    latitude: 51.2689,
                    longitude: 0.1845,
                    address: 'Bradbourne Vale Road, Sevenoaks, Kent TN13 3QG',
                    name: 'Home'
                },
                destination: {
                    latitude: 51.2745,
                    longitude: 0.1967,
                    address: 'London Road, Sevenoaks, Kent TN13 1AS',
                    name: 'Kumon Math Centre'
                },
                schedule: {
                    days: [2],
                    windowStart: '16:30',
                    windowEnd: '16:45'
                },
                alertThreshold: {
                    type: 'MINUTES',
                    value: 10
                }
            },
            {
                name: 'School Run',
                origin: {
                    latitude: 51.2689,
                    longitude: 0.1845,
                    address: 'Bradbourne Vale Road, Sevenoaks, Kent TN13 3QG',
                    name: 'Home'
                },
                destination: {
                    latitude: 51.2834,
                    longitude: 0.1756,
                    address: 'Seal Hollow Road, Sevenoaks, Kent TN13 3SE',
                    name: 'Knole Academy'
                },
                schedule: {
                    days: [1, 2, 3, 4, 5],
                    windowStart: '08:15',
                    windowEnd: '08:30'
                },
                alertThreshold: {
                    type: 'PERCENTAGE',
                    value: 25
                }
            }
        ];
        for (const tripData of demoTrips) {
            await this.createTrip(userId, tripData.name, tripData.origin, tripData.destination, tripData.schedule, tripData.alertThreshold);
        }
    }
}
exports.TripService = TripService;
//# sourceMappingURL=tripService.js.map