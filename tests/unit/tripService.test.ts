// Unit tests for TripService - TDD approach
import { TripService } from '../../src/services/tripService';
import { Trip, Location, Schedule, AlertThreshold } from '../../src/types';

describe('TripService', () => {
  let tripService: TripService;
  
  beforeEach(() => {
    tripService = new TripService();
  });

  describe('Trip Creation', () => {
    const validTripData = {
      name: 'Test Trip',
      origin: {
        latitude: 51.2719,
        longitude: 0.1904,
        address: 'Sevenoaks High Street, Kent'
      } as Location,
      destination: {
        latitude: 51.2737,
        longitude: 0.1887,
        address: 'Sevenoaks Station, Kent'
      } as Location,
      schedule: {
        days: [1, 2, 3, 4, 5], // Monday to Friday
        windowStart: '08:00',
        windowEnd: '08:15'
      } as Schedule,
      alertThreshold: {
        type: 'MINUTES' as const,
        value: 10
      } as AlertThreshold
    };

    it('should create a new trip successfully', async () => {
      const userId = 'user123';
      
      const trip = await tripService.createTrip(
        userId,
        validTripData.name,
        validTripData.origin,
        validTripData.destination,
        validTripData.schedule,
        validTripData.alertThreshold
      );

      expect(trip).toBeDefined();
      expect(trip.id).toBeDefined();
      expect(trip.userId).toBe(userId);
      expect(trip.name).toBe(validTripData.name);
      expect(trip.origin).toEqual(validTripData.origin);
      expect(trip.destination).toEqual(validTripData.destination);
      expect(trip.schedule).toEqual(validTripData.schedule);
      expect(trip.alertThreshold).toEqual(validTripData.alertThreshold);
      expect(trip.isActive).toBe(true);
      expect(trip.createdAt).toBeInstanceOf(Date);
      expect(trip.updatedAt).toBeInstanceOf(Date);
    });

    it('should retrieve trip by ID', async () => {
      const userId = 'user123';
      const createdTrip = await tripService.createTrip(
        userId,
        validTripData.name,
        validTripData.origin,
        validTripData.destination,
        validTripData.schedule,
        validTripData.alertThreshold
      );

      const retrievedTrip = await tripService.getTripById(createdTrip.id);
      
      expect(retrievedTrip).toEqual(createdTrip);
    });

    it('should return null for non-existent trip ID', async () => {
      const nonExistentId = 'non-existent-id';
      const trip = await tripService.getTripById(nonExistentId);
      
      expect(trip).toBeNull();
    });

    it('should retrieve all trips for a user', async () => {
      const userId = 'user456';
      
      // Create multiple trips
      const trip1 = await tripService.createTrip(
        userId,
        'Trip 1',
        validTripData.origin,
        validTripData.destination,
        validTripData.schedule,
        validTripData.alertThreshold
      );

      const trip2 = await tripService.createTrip(
        userId,
        'Trip 2',
        validTripData.destination, // Swap origin/destination
        validTripData.origin,
        validTripData.schedule,
        validTripData.alertThreshold
      );

      const userTrips = await tripService.getTripsByUserId(userId);
      
      expect(userTrips).toHaveLength(2);
      expect(userTrips.map(t => t.id)).toContain(trip1.id);
      expect(userTrips.map(t => t.id)).toContain(trip2.id);
      // Should be sorted by most recently updated first
      expect(userTrips[0].updatedAt.getTime()).toBeGreaterThanOrEqual(userTrips[1].updatedAt.getTime());
    });

    it('should return empty array for user with no trips', async () => {
      const userId = 'user-with-no-trips';
      const trips = await tripService.getTripsByUserId(userId);
      
      expect(trips).toEqual([]);
    });
  });

  describe('Trip Management', () => {
    let testTrip: Trip;
    const userId = 'test-user';

    beforeEach(async () => {
      testTrip = await tripService.createTrip(
        userId,
        'Test Trip',
        {
          latitude: 51.2719,
          longitude: 0.1904,
          address: 'Sevenoaks High Street, Kent'
        },
        {
          latitude: 51.2737,
          longitude: 0.1887,
          address: 'Sevenoaks Station, Kent'
        },
        {
          days: [1, 2, 3, 4, 5],
          windowStart: '08:00',
          windowEnd: '08:15'
        },
        {
          type: 'MINUTES',
          value: 10
        }
      );
    });

    it('should update trip successfully', async () => {
      const updates = {
        name: 'Updated Trip Name',
        alertThreshold: {
          type: 'PERCENTAGE' as const,
          value: 25
        }
      };

      const updatedTrip = await tripService.updateTrip(testTrip.id, updates);
      
      expect(updatedTrip).toBeDefined();
      expect(updatedTrip!.name).toBe(updates.name);
      expect(updatedTrip!.alertThreshold).toEqual(updates.alertThreshold);
      expect(updatedTrip!.updatedAt.getTime()).toBeGreaterThan(testTrip.updatedAt.getTime());
      // Other fields should remain unchanged
      expect(updatedTrip!.id).toBe(testTrip.id);
      expect(updatedTrip!.userId).toBe(testTrip.userId);
    });

    it('should return null when updating non-existent trip', async () => {
      const result = await tripService.updateTrip('non-existent', { name: 'New Name' });
      expect(result).toBeNull();
    });

    it('should toggle trip active status', async () => {
      expect(testTrip.isActive).toBe(true);
      
      const toggledTrip = await tripService.toggleTripActive(testTrip.id);
      
      expect(toggledTrip).toBeDefined();
      expect(toggledTrip!.isActive).toBe(false);
      
      // Toggle again
      const toggledAgain = await tripService.toggleTripActive(testTrip.id);
      expect(toggledAgain!.isActive).toBe(true);
    });

    it('should delete trip successfully', async () => {
      const result = await tripService.deleteTrip(testTrip.id);
      expect(result).toBe(true);
      
      // Verify trip no longer exists
      const deletedTrip = await tripService.getTripById(testTrip.id);
      expect(deletedTrip).toBeNull();
      
      // Verify trip removed from user's list
      const userTrips = await tripService.getTripsByUserId(userId);
      expect(userTrips.map(t => t.id)).not.toContain(testTrip.id);
    });

    it('should return false when deleting non-existent trip', async () => {
      const result = await tripService.deleteTrip('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Trip Validation', () => {
    it('should validate required fields', () => {
      const errors = tripService.validateTripData({});
      
      expect(errors).toContain('Trip name is required');
      expect(errors).toContain('Origin location is required');
      expect(errors).toContain('Destination location is required');
      expect(errors).toContain('Schedule is required');
      expect(errors).toContain('Alert threshold is required');
    });

    it('should validate trip name', () => {
      const errors = tripService.validateTripData({ name: '' });
      expect(errors).toContain('Trip name is required');
      
      const errorsWithSpaces = tripService.validateTripData({ name: '   ' });
      expect(errorsWithSpaces).toContain('Trip name is required');
    });

    it('should validate origin coordinates', () => {
      const errors = tripService.validateTripData({
        origin: {
          latitude: 0,
          longitude: 0,
          address: 'Test Address'
        } as Location
      });
      
      // Should not have coordinate errors for valid coordinates (even 0,0)
      expect(errors.filter(e => e.includes('Origin coordinates')).length).toBe(0);

      const invalidErrors = tripService.validateTripData({
        origin: {
          address: 'Test Address'
        } as any
      });
      
      expect(invalidErrors).toContain('Origin coordinates are required');
    });

    it('should validate schedule', () => {
      const errors = tripService.validateTripData({
        schedule: {
          days: [],
          windowStart: '08:00',
          windowEnd: '08:15'
        }
      });
      
      expect(errors).toContain('At least one day must be selected');

      const timeErrors = tripService.validateTripData({
        schedule: {
          days: [1, 2, 3],
          windowStart: '',
          windowEnd: ''
        }
      });
      
      expect(timeErrors).toContain('Departure window times are required');
    });

    it('should validate alert threshold', () => {
      const errors = tripService.validateTripData({
        alertThreshold: {
          type: 'MINUTES',
          value: 0
        }
      });
      
      expect(errors).toContain('Alert threshold must be greater than 0');

      const negativeErrors = tripService.validateTripData({
        alertThreshold: {
          type: 'PERCENTAGE',
          value: -5
        }
      });
      
      expect(negativeErrors).toContain('Alert threshold must be greater than 0');
    });

    it('should pass validation for valid trip data', () => {
      const validData = {
        name: 'Valid Trip',
        origin: {
          latitude: 51.2719,
          longitude: 0.1904,
          address: 'Test Origin'
        },
        destination: {
          latitude: 51.2737,
          longitude: 0.1887,
          address: 'Test Destination'
        },
        schedule: {
          days: [1, 2, 3, 4, 5],
          windowStart: '08:00',
          windowEnd: '08:15'
        },
        alertThreshold: {
          type: 'MINUTES' as const,
          value: 10
        }
      };

      const errors = tripService.validateTripData(validData);
      expect(errors).toEqual([]);
    });
  });

  describe('Active Trips for Monitoring', () => {
    beforeEach(async () => {
      // Create test trips with different schedules
      await tripService.createTrip(
        'user1',
        'Monday Trip',
        {
          latitude: 51.2719,
          longitude: 0.1904,
          address: 'Origin'
        },
        {
          latitude: 51.2737,
          longitude: 0.1887,
          address: 'Destination'
        },
        {
          days: [1], // Monday only
          windowStart: '08:00',
          windowEnd: '08:15'
        },
        {
          type: 'MINUTES',
          value: 10
        }
      );

      await tripService.createTrip(
        'user2',
        'Weekday Trip',
        {
          latitude: 51.2719,
          longitude: 0.1904,
          address: 'Origin'
        },
        {
          latitude: 51.2737,
          longitude: 0.1887,
          address: 'Destination'
        },
        {
          days: [1, 2, 3, 4, 5], // Monday to Friday
          windowStart: '09:00',
          windowEnd: '09:15'
        },
        {
          type: 'PERCENTAGE',
          value: 20
        }
      );
    });

    it('should find active trips for monitoring on correct day and time', async () => {
      // Simulate Monday at 07:35 AM (within monitoring window for 08:00 departure)
      const mondayMorning = new Date(2024, 0, 8, 7, 35); // January 8, 2024 is a Monday
      
      const activeTrips = await tripService.getActiveTripsForTime(mondayMorning);
      
      expect(activeTrips.length).toBeGreaterThan(0);
      expect(activeTrips.some(t => t.name === 'Monday Trip')).toBe(true);
    });

    it('should not find trips outside monitoring window', async () => {
      // Simulate Monday at 10:00 AM (outside any monitoring window)
      const mondayLate = new Date(2024, 0, 8, 10, 0);
      
      const activeTrips = await tripService.getActiveTripsForTime(mondayLate);
      
      expect(activeTrips.length).toBe(0);
    });
  });

  describe('Demo Data Initialization', () => {
    it('should initialize demo data for user', async () => {
      const userId = 'demo-user';
      
      await tripService.initializeDemoData(userId);
      
      const trips = await tripService.getTripsByUserId(userId);
      
      expect(trips.length).toBeGreaterThan(0);
      expect(trips.some(t => t.name.includes('Tuition'))).toBe(true);
      expect(trips.some(t => t.name.includes('School'))).toBe(true);
      
      // All demo trips should be active
      expect(trips.every(t => t.isActive)).toBe(true);
    });
  });
});