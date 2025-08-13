// API routes for trip management
import { Router, Request, Response } from 'express';
import { TripService } from '../services/tripService';
import { TrafficMonitoringService } from '../services/trafficMonitoringService';
import { ApiResponse, Trip } from '../types';

const router = Router();
const tripService = new TripService();
const trafficService = new TrafficMonitoringService();

// GET /api/trips - Get all trips for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'User ID is required'
      };
      return res.status(400).json(response);
    }

    const trips = await tripService.getTripsByUserId(userId);
    
    const response: ApiResponse<Trip[]> = {
      success: true,
      data: trips
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching trips:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch trips'
    };
    res.status(500).json(response);
  }
});

// GET /api/trips/:id - Get specific trip
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await tripService.getTripById(id);
    
    if (!trip) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Trip not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Trip> = {
      success: true,
      data: trip
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching trip:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch trip'
    };
    res.status(500).json(response);
  }
});

// POST /api/trips - Create new trip
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, name, origin, destination, schedule, alertThreshold } = req.body;
    
    // Validate required fields
    const errors = tripService.validateTripData(req.body);
    if (errors.length > 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Validation failed',
        message: errors.join(', ')
      };
      return res.status(400).json(response);
    }

    const trip = await tripService.createTrip(
      userId,
      name,
      origin,
      destination,
      schedule,
      alertThreshold
    );

    const response: ApiResponse<Trip> = {
      success: true,
      data: trip,
      message: 'Trip created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating trip:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create trip'
    };
    res.status(500).json(response);
  }
});

// PUT /api/trips/:id - Update trip
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate if there are any validation errors
    if (Object.keys(updates).length > 0) {
      const errors = tripService.validateTripData(updates);
      if (errors.length > 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Validation failed',
          message: errors.join(', ')
        };
        return res.status(400).json(response);
      }
    }

    const updatedTrip = await tripService.updateTrip(id, updates);
    
    if (!updatedTrip) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Trip not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Trip> = {
      success: true,
      data: updatedTrip,
      message: 'Trip updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating trip:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update trip'
    };
    res.status(500).json(response);
  }
});

// DELETE /api/trips/:id - Delete trip
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await tripService.deleteTrip(id);
    
    if (!success) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Trip not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Trip deleted successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error deleting trip:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete trip'
    };
    res.status(500).json(response);
  }
});

// POST /api/trips/:id/toggle - Toggle trip active status
router.post('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedTrip = await tripService.toggleTripActive(id);
    
    if (!updatedTrip) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Trip not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Trip> = {
      success: true,
      data: updatedTrip,
      message: `Trip ${updatedTrip.isActive ? 'activated' : 'deactivated'} successfully`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error toggling trip status:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to toggle trip status'
    };
    res.status(500).json(response);
  }
});

// GET /api/trips/:id/traffic - Get current traffic status for trip
router.get('/:id/traffic', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await tripService.getTripById(id);
    
    if (!trip) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Trip not found'
      };
      return res.status(404).json(response);
    }

    const routes = await trafficService.getCurrentTrafficStatus(trip);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        trip,
        routes,
        lastUpdated: new Date()
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching traffic status:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch traffic status'
    };
    res.status(500).json(response);
  }
});

// POST /api/trips/:id/monitor - Start monitoring trip
router.post('/:id/monitor', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await tripService.getTripById(id);
    
    if (!trip) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Trip not found'
      };
      return res.status(404).json(response);
    }

    const job = await trafficService.startMonitoring(trip);

    const response: ApiResponse<any> = {
      success: true,
      data: job,
      message: 'Monitoring started successfully'
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

// GET /api/trips/:id/alerts - Get alert history for trip
router.get('/:id/alerts', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alerts = await trafficService.getAlertHistory(id);

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