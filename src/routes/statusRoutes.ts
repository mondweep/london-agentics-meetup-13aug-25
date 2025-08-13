// API routes for system status and health monitoring
import { Router, Request, Response } from 'express';
import { TrafficMonitoringService } from '../services/trafficMonitoringService';
import { TripService } from '../services/tripService';
import { UserService } from '../services/userService';
import { NotificationService } from '../services/notificationService';
import { ApiResponse } from '../types';

const router = Router();
const trafficService = new TrafficMonitoringService();
const tripService = new TripService();
const userService = new UserService();
const notificationService = new NotificationService();

// GET /api/status - Overall system status
router.get('/', async (req: Request, res: Response) => {
  try {
    const systemStatus = await trafficService.getSystemStatus();
    const activeJobs = await trafficService.getActiveJobs();
    
    // Calculate additional metrics
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    const response: ApiResponse<any> = {
      success: true,
      data: {
        service: 'Pre-Route Traffic Monitoring API',
        version: '1.0.0',
        status: 'healthy',
        timestamp: new Date(),
        uptime: {
          seconds: uptime,
          formatted: formatUptime(uptime)
        },
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
        },
        monitoring: {
          ...systemStatus,
          activeJobsCount: activeJobs.length
        },
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          env: process.env.NODE_ENV || 'development'
        }
      },
      message: 'System is operating normally'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching system status:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch system status',
      message: 'System health check failed'
    };
    res.status(500).json(response);
  }
});

// GET /api/status/health - Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    const response: ApiResponse<any> = {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date(),
        service: 'Pre-Route Traffic Monitoring API',
        version: '1.0.0'
      },
      message: 'Service is running normally'
    };
    res.json(response);
  } catch (error) {
    console.error('Health check error:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Health check failed'
    };
    res.status(503).json(response);
  }
});

// GET /api/status/monitoring - Monitoring system status
router.get('/monitoring', async (req: Request, res: Response) => {
  try {
    const systemStatus = await trafficService.getSystemStatus();
    const activeJobs = await trafficService.getActiveJobs();
    const recentAlerts = (global as any).recentAlerts || [];

    const response: ApiResponse<any> = {
      success: true,
      data: {
        ...systemStatus,
        activeJobs: activeJobs.length,
        recentAlerts: recentAlerts.length,
        lastAlert: recentAlerts.length > 0 ? recentAlerts[recentAlerts.length - 1].timestamp : null,
        jobDetails: activeJobs,
        timestamp: new Date()
      },
      message: 'Monitoring system status retrieved successfully'
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

// GET /api/status/database - Database connection and statistics
router.get('/database', async (req: Request, res: Response) => {
  try {
    // Since we're using in-memory storage, we'll provide statistics about our data stores
    const allUsers = await userService.getAllUsers();
    let totalTrips = 0;
    let activeTrips = 0;
    
    for (const user of allUsers) {
      const userTrips = await tripService.getTripsByUserId(user.id);
      totalTrips += userTrips.length;
      activeTrips += userTrips.filter(trip => trip.isActive).length;
    }

    const response: ApiResponse<any> = {
      success: true,
      data: {
        status: 'connected',
        type: 'in-memory',
        statistics: {
          users: allUsers.length,
          trips: {
            total: totalTrips,
            active: activeTrips,
            inactive: totalTrips - activeTrips
          }
        },
        lastCheck: new Date()
      },
      message: 'Database status retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching database status:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch database status'
    };
    res.status(500).json(response);
  }
});

// GET /api/status/api-endpoints - API endpoint availability
router.get('/api-endpoints', async (req: Request, res: Response) => {
  try {
    const endpoints = {
      core: [
        { path: '/health', method: 'GET', status: 'active' },
        { path: '/api', method: 'GET', status: 'active' }
      ],
      trips: [
        { path: '/api/trips', method: 'GET', status: 'active' },
        { path: '/api/trips', method: 'POST', status: 'active' },
        { path: '/api/trips/:id', method: 'GET', status: 'active' },
        { path: '/api/trips/:id', method: 'PUT', status: 'active' },
        { path: '/api/trips/:id', method: 'DELETE', status: 'active' },
        { path: '/api/trips/:id/toggle', method: 'POST', status: 'active' },
        { path: '/api/trips/:id/traffic', method: 'GET', status: 'active' },
        { path: '/api/trips/:id/monitor', method: 'POST', status: 'active' },
        { path: '/api/trips/:id/alerts', method: 'GET', status: 'active' }
      ],
      users: [
        { path: '/api/users', method: 'GET', status: 'active' },
        { path: '/api/users', method: 'POST', status: 'active' },
        { path: '/api/users/:id', method: 'GET', status: 'active' },
        { path: '/api/users/:id', method: 'PUT', status: 'active' },
        { path: '/api/users/:id', method: 'DELETE', status: 'active' },
        { path: '/api/users/:id/settings', method: 'GET', status: 'active' },
        { path: '/api/users/:id/settings', method: 'PUT', status: 'active' }
      ],
      monitoring: [
        { path: '/api/monitoring/start', method: 'POST', status: 'active' },
        { path: '/api/monitoring/stop', method: 'POST', status: 'active' },
        { path: '/api/monitoring/status', method: 'GET', status: 'active' },
        { path: '/api/monitoring/jobs', method: 'GET', status: 'active' },
        { path: '/api/monitoring/simulate', method: 'POST', status: 'active' },
        { path: '/api/monitoring/alerts', method: 'GET', status: 'active' }
      ],
      notifications: [
        { path: '/api/notifications/send', method: 'POST', status: 'active' },
        { path: '/api/notifications/alert', method: 'POST', status: 'active' },
        { path: '/api/notifications/:userId', method: 'GET', status: 'active' },
        { path: '/api/notifications/:userId/mark-read', method: 'POST', status: 'active' },
        { path: '/api/notifications/:userId/unread', method: 'GET', status: 'active' },
        { path: '/api/notifications/:userId', method: 'DELETE', status: 'active' },
        { path: '/api/notifications/test', method: 'POST', status: 'active' }
      ],
      status: [
        { path: '/api/status', method: 'GET', status: 'active' },
        { path: '/api/status/health', method: 'GET', status: 'active' },
        { path: '/api/status/monitoring', method: 'GET', status: 'active' },
        { path: '/api/status/database', method: 'GET', status: 'active' },
        { path: '/api/status/api-endpoints', method: 'GET', status: 'active' }
      ],
      demo: [
        { path: '/api/demo/locations', method: 'GET', status: 'active' },
        { path: '/api/demo/setup', method: 'POST', status: 'active' },
        { path: '/api/demo/create-demo-user', method: 'POST', status: 'active' },
        { path: '/api/demo/traffic-scenario', method: 'POST', status: 'active' },
        { path: '/api/demo/system-status', method: 'GET', status: 'active' },
        { path: '/api/demo/start-monitoring-all', method: 'POST', status: 'active' }
      ]
    };

    const totalEndpoints = Object.values(endpoints).reduce((total, group) => total + group.length, 0);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        totalEndpoints,
        endpoints,
        lastCheck: new Date()
      },
      message: 'API endpoints status retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching API endpoints status:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch API endpoints status'
    };
    res.status(500).json(response);
  }
});

// Helper function to format uptime
function formatUptime(uptimeInSeconds: number): string {
  const days = Math.floor(uptimeInSeconds / 86400);
  const hours = Math.floor((uptimeInSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeInSeconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.length > 0 ? parts.join(' ') : '0s';
}

export default router;