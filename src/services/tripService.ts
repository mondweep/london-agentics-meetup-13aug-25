// Trip management service
import { v4 as uuidv4 } from 'uuid';
import { Trip, User, Location, Schedule, AlertThreshold } from '../types';

export class TripService {
  private trips: Map<string, Trip> = new Map();
  private userTrips: Map<string, string[]> = new Map(); // userId -> tripIds[]

  async createTrip(
    userId: string,
    name: string,
    origin: Location,
    destination: Location,
    schedule: Schedule,
    alertThreshold: AlertThreshold
  ): Promise<Trip> {
    const tripId = uuidv4();
    const now = new Date();

    const trip: Trip = {
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
    
    // Update user's trip list
    const userTripIds = this.userTrips.get(userId) || [];
    userTripIds.push(tripId);
    this.userTrips.set(userId, userTripIds);

    return trip;
  }

  async getTripById(tripId: string): Promise<Trip | null> {
    return this.trips.get(tripId) || null;
  }

  async getTripsByUserId(userId: string): Promise<Trip[]> {
    const tripIds = this.userTrips.get(userId) || [];
    const trips: Trip[] = [];

    for (const tripId of tripIds) {
      const trip = this.trips.get(tripId);
      if (trip) {
        trips.push(trip);
      }
    }

    return trips.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip | null> {
    const existingTrip = this.trips.get(tripId);
    if (!existingTrip) {
      return null;
    }

    const updatedTrip: Trip = {
      ...existingTrip,
      ...updates,
      id: tripId, // Ensure ID doesn't change
      userId: existingTrip.userId, // Ensure user ownership doesn't change
      updatedAt: new Date()
    };

    this.trips.set(tripId, updatedTrip);
    return updatedTrip;
  }

  async deleteTrip(tripId: string): Promise<boolean> {
    const trip = this.trips.get(tripId);
    if (!trip) {
      return false;
    }

    // Remove from user's trip list
    const userTripIds = this.userTrips.get(trip.userId) || [];
    const filteredTripIds = userTripIds.filter(id => id !== tripId);
    this.userTrips.set(trip.userId, filteredTripIds);

    // Remove the trip
    this.trips.delete(tripId);
    return true;
  }

  async toggleTripActive(tripId: string): Promise<Trip | null> {
    const trip = this.trips.get(tripId);
    if (!trip) {
      return null;
    }

    const updatedTrip: Trip = {
      ...trip,
      isActive: !trip.isActive,
      updatedAt: new Date()
    };

    this.trips.set(tripId, updatedTrip);
    return updatedTrip;
  }

  // Get all active trips that should be monitored at a given time
  async getActiveTripsForTime(currentTime: Date): Promise<Trip[]> {
    const allTrips = Array.from(this.trips.values());
    const activeTrips: Trip[] = [];

    const currentDay = currentTime.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTimeString = this.formatTimeString(currentTime);

    for (const trip of allTrips) {
      if (!trip.isActive) continue;

      // Check if current day matches trip schedule
      if (!trip.schedule.days.includes(currentDay)) continue;

      // Check if we're within the monitoring window (e.g., 30 minutes before departure)
      const monitoringStartTime = this.subtractMinutes(trip.schedule.windowStart, 30);
      const monitoringEndTime = trip.schedule.windowEnd;

      if (this.isTimeInRange(currentTimeString, monitoringStartTime, monitoringEndTime)) {
        activeTrips.push(trip);
      }
    }

    return activeTrips;
  }

  // Validation helpers
  validateTripData(tripData: Partial<Trip>): string[] {
    const errors: string[] = [];

    if (!tripData.name || tripData.name.trim().length === 0) {
      errors.push('Trip name is required');
    }

    if (!tripData.origin) {
      errors.push('Origin location is required');
    } else {
      if (!tripData.origin.latitude || !tripData.origin.longitude) {
        errors.push('Origin coordinates are required');
      }
    }

    if (!tripData.destination) {
      errors.push('Destination location is required');
    } else {
      if (!tripData.destination.latitude || !tripData.destination.longitude) {
        errors.push('Destination coordinates are required');
      }
    }

    if (!tripData.schedule) {
      errors.push('Schedule is required');
    } else {
      if (!tripData.schedule.days || tripData.schedule.days.length === 0) {
        errors.push('At least one day must be selected');
      }
      if (!tripData.schedule.windowStart || !tripData.schedule.windowEnd) {
        errors.push('Departure window times are required');
      }
    }

    if (!tripData.alertThreshold) {
      errors.push('Alert threshold is required');
    } else {
      if (tripData.alertThreshold.value <= 0) {
        errors.push('Alert threshold must be greater than 0');
      }
    }

    return errors;
  }

  // Helper methods
  private formatTimeString(date: Date): string {
    return date.toTimeString().substring(0, 5); // HH:MM format
  }

  private subtractMinutes(timeString: string, minutes: number): string {
    const [hours, mins] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins - minutes, 0, 0);
    return this.formatTimeString(date);
  }

  private isTimeInRange(currentTime: string, startTime: string, endTime: string): boolean {
    return currentTime >= startTime && currentTime <= endTime;
  }

  // Demo data initialization
  async initializeDemoData(userId: string): Promise<void> {
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
          days: [2], // Tuesday
          windowStart: '16:30',
          windowEnd: '16:45'
        },
        alertThreshold: {
          type: 'MINUTES' as const,
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
          days: [1, 2, 3, 4, 5], // Monday to Friday
          windowStart: '08:15',
          windowEnd: '08:30'
        },
        alertThreshold: {
          type: 'PERCENTAGE' as const,
          value: 25
        }
      }
    ];

    for (const tripData of demoTrips) {
      await this.createTrip(
        userId,
        tripData.name,
        tripData.origin,
        tripData.destination,
        tripData.schedule,
        tripData.alertThreshold
      );
    }
  }
}