// Demo and system routes for testing and demonstration
import { Router, Request, Response } from 'express';
import { TripService } from '../services/tripService';
import { TrafficMonitoringService } from '../services/trafficMonitoringService';
import { KENT_LOCATIONS, DEMO_TRIPS } from '../data/kentLocations';
import { ApiResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const tripService = new TripService();
const trafficService = new TrafficMonitoringService();

// GET /api/demo/locations - Get Kent locations for demo
router.get('/locations', async (req: Request, res: Response) => {
  try {
    const response: ApiResponse<typeof KENT_LOCATIONS> = {
      success: true,
      data: KENT_LOCATIONS,
      message: 'Kent locations retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching locations:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch locations'
    };
    res.status(500).json(response);
  }
});

// POST /api/demo/setup - Initialize demo data for a user
router.post('/setup', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User ID is required'
      };
      return res.status(400).json(response);
    }

    // Create demo trips
    await tripService.initializeDemoData(userId);
    
    // Get created trips to return
    const trips = await tripService.getTripsByUserId(userId);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        userId,
        tripsCreated: trips.length,
        trips
      },
      message: 'Demo data initialized successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error setting up demo data:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to set up demo data'
    };
    res.status(500).json(response);
  }
});

// POST /api/demo/traffic-scenario - Simulate a traffic scenario
router.post('/traffic-scenario', async (req: Request, res: Response) => {
  try {
    const { routeName, severity, reason } = req.body;
    
    if (!routeName || severity === undefined || !reason) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Route name, severity, and reason are required'
      };
      return res.status(400).json(response);
    }

    await trafficService.simulateTrafficIncident(routeName, severity, reason);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        routeName,
        severity,
        reason,
        timestamp: new Date()
      },
      message: 'Traffic scenario simulated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error simulating traffic scenario:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to simulate traffic scenario'
    };
    res.status(500).json(response);
  }
});

// GET /api/demo/system-status - Get system monitoring status
router.get('/system-status', async (req: Request, res: Response) => {
  try {
    const systemStatus = await trafficService.getSystemStatus();
    const activeJobs = await trafficService.getActiveJobs();

    const response: ApiResponse<any> = {
      success: true,
      data: {
        ...systemStatus,
        activeJobsDetails: activeJobs,
        timestamp: new Date(),
        recentAlerts: (global as any).recentAlerts || []
      },
      message: 'System status retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching system status:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch system status'
    };
    res.status(500).json(response);
  }
});

// POST /api/demo/create-demo-user - Create a demo user with preset data
router.post('/create-demo-user', async (req: Request, res: Response) => {
  try {
    const { persona } = req.body; // 'alex' or 'chloe'
    const userId = uuidv4();
    
    // Create appropriate demo trips based on persona
    let demoTrips;
    if (persona === 'chloe') {
      demoTrips = [
        {
          name: 'London Commute',
          origin: {
            latitude: 51.1167,
            longitude: 0.2267,
            address: 'Nellington Road, Tunbridge Wells, Kent TN4 8YB',
            name: 'Home'
          },
          destination: {
            latitude: 51.1321,
            longitude: 0.2634,
            address: 'Mount Pleasant Road, Tunbridge Wells, Kent TN1 1QR',
            name: 'Tunbridge Wells Station'
          },
          schedule: {
            days: [1, 2, 4], // Mon, Tue, Thu (hybrid schedule)
            windowStart: '08:00',
            windowEnd: '08:15'
          },
          alertThreshold: {
            type: 'MINUTES' as const,
            value: 5
          }
        },
        {
          name: 'Client Meeting Sevenoaks',
          origin: {
            latitude: 51.1167,
            longitude: 0.2267,
            address: 'Nellington Road, Tunbridge Wells, Kent TN4 8YB',
            name: 'Home'
          },
          destination: {
            latitude: 51.2719,
            longitude: 0.1904,
            address: 'High Street, Sevenoaks, Kent TN13 1UT',
            name: 'Sevenoaks High Street'
          },
          schedule: {
            days: [3, 5], // Wed, Fri
            windowStart: '09:30',
            windowEnd: '09:45'
          },
          alertThreshold: {
            type: 'PERCENTAGE' as const,
            value: 20
          }
        }
      ];
    } else {
      // Default to Alex's trips
      await tripService.initializeDemoData(userId);
      const trips = await tripService.getTripsByUserId(userId);
      
      const response: ApiResponse<any> = {
        success: true,
        data: {
          userId,
          persona: 'alex',
          user: {
            id: userId,
            name: 'Alex Thompson',
            email: `alex-demo-${userId.slice(0, 8)}@example.com`,
            settings: {
              defaultNavApp: 'tesla',
              quietHours: {
                enabled: true,
                start: '22:00',
                end: '07:00'
              }
            }
          },
          trips
        },
        message: 'Demo user created successfully'
      };
      
      return res.json(response);
    }

    // Create Chloe's trips manually
    for (const tripData of demoTrips) {
      await tripService.createTrip(
        userId,
        tripData.name,
        tripData.origin,
        tripData.destination,
        tripData.schedule,
        tripData.alertThreshold
      );
    }

    const trips = await tripService.getTripsByUserId(userId);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        userId,
        persona,
        user: {
          id: userId,
          name: persona === 'chloe' ? 'Chloe Williams' : 'Alex Thompson',
          email: `${persona}-demo-${userId.slice(0, 8)}@example.com`,
          settings: {
            defaultNavApp: persona === 'chloe' ? 'google_maps' : 'tesla',
            quietHours: {
              enabled: true,
              start: '22:00',
              end: '07:00'
            }
          }
        },
        trips
      },
      message: 'Demo user created successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error creating demo user:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create demo user'
    };
    res.status(500).json(response);
  }
});

// POST /api/demo/start-monitoring-all - Start monitoring all trips for a user (demo helper)
router.post('/start-monitoring-all', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User ID is required'
      };
      return res.status(400).json(response);
    }

    const trips = await tripService.getTripsByUserId(userId);
    const activeTrips = trips.filter(trip => trip.isActive);
    const monitoringJobs = [];

    for (const trip of activeTrips) {
      try {
        const job = await trafficService.startMonitoring(trip);
        monitoringJobs.push(job);
      } catch (error) {
        console.error(`Failed to start monitoring for trip ${trip.id}:`, error);
      }
    }

    const response: ApiResponse<any> = {
      success: true,
      data: {
        userId,
        tripsFound: trips.length,
        activeTrips: activeTrips.length,
        monitoringJobs: monitoringJobs.length,
        jobs: monitoringJobs
      },
      message: `Started monitoring ${monitoringJobs.length} active trips`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error starting monitoring for all trips:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to start monitoring for all trips'
    };
    res.status(500).json(response);
  }
});

export default router;