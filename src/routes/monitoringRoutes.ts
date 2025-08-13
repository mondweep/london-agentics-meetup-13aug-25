// API routes for traffic monitoring management
import { Router, Request, Response } from 'express';
import { TrafficMonitoringService } from '../services/trafficMonitoringService';
import { TripService } from '../services/tripService';
import { ApiResponse } from '../types';

const router = Router();
const trafficService = new TrafficMonitoringService();
const tripService = new TripService();

// POST /api/monitoring/start - Start monitoring for all active trips
router.post('/start', async (req: Request, res: Response) => {
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
    console.error('Error starting monitoring:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to start monitoring'
    };
    res.status(500).json(response);
  }
});

// POST /api/monitoring/stop - Stop monitoring for all trips
router.post('/stop', async (req: Request, res: Response) => {
  try {
    const { userId, tripId } = req.body;
    
    let stoppedJobs = 0;

    if (tripId) {
      // Stop monitoring for specific trip
      const success = await trafficService.stopMonitoring(tripId);
      if (success) {
        stoppedJobs = 1;
      }
    } else if (userId) {
      // Stop monitoring for all user's trips
      const trips = await tripService.getTripsByUserId(userId);
      for (const trip of trips) {
        try {
          const success = await trafficService.stopMonitoring(trip.id);
          if (success) {
            stoppedJobs++;
          }
        } catch (error) {
          console.error(`Failed to stop monitoring for trip ${trip.id}:`, error);
        }
      }
    } else {
      // Stop all monitoring - iterate through active jobs
      const activeJobs = await trafficService.getActiveJobs();
      for (const job of activeJobs) {
        try {
          const success = await trafficService.stopMonitoring(job.id);
          if (success) {
            stoppedJobs++;
          }
        } catch (error) {
          console.error(`Failed to stop monitoring job ${job.id}:`, error);
        }
      }
    }

    const response: ApiResponse<any> = {
      success: true,
      data: {
        stoppedJobs
      },
      message: `Stopped monitoring ${stoppedJobs} jobs`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error stopping monitoring:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to stop monitoring'
    };
    res.status(500).json(response);
  }
});

// GET /api/monitoring/status - Get overall monitoring status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const systemStatus = await trafficService.getSystemStatus();
    const activeJobs = await trafficService.getActiveJobs();

    const response: ApiResponse<any> = {
      success: true,
      data: {
        ...systemStatus,
        activeJobsDetails: activeJobs,
        timestamp: new Date()
      },
      message: 'Monitoring status retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching monitoring status:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch monitoring status'
    };
    res.status(500).json(response);
  }
});

// GET /api/monitoring/jobs - Get active monitoring jobs
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    let jobs;
    if (userId) {
      // Get jobs for specific user
      const trips = await tripService.getTripsByUserId(userId as string);
      const tripIds = trips.map(trip => trip.id);
      const allJobs = await trafficService.getActiveJobs();
      jobs = allJobs.filter(job => tripIds.includes(job.tripId));
    } else {
      // Get all jobs
      jobs = await trafficService.getActiveJobs();
    }

    const response: ApiResponse<any> = {
      success: true,
      data: jobs
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching monitoring jobs:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch monitoring jobs'
    };
    res.status(500).json(response);
  }
});

// POST /api/monitoring/simulate - Simulate traffic incident
router.post('/simulate', async (req: Request, res: Response) => {
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
      message: 'Traffic incident simulated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error simulating traffic incident:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to simulate traffic incident'
    };
    res.status(500).json(response);
  }
});

// GET /api/monitoring/alerts - Get alert history
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { userId, tripId, limit } = req.query;
    
    let alerts = [];
    
    if (tripId) {
      alerts = await trafficService.getAlertHistory(tripId as string);
    } else if (userId) {
      const trips = await tripService.getTripsByUserId(userId as string);
      for (const trip of trips) {
        const tripAlerts = await trafficService.getAlertHistory(trip.id);
        alerts.push(...tripAlerts);
      }
      // Sort by timestamp descending
      alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
      // Get all alerts from global storage
      alerts = (global as any).recentAlerts || [];
    }

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      alerts = alerts.slice(0, limitNum);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: alerts
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch alerts'
    };
    res.status(500).json(response);
  }
});

export default router;