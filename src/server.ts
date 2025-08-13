// Pre-Route Express Server
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import tripRoutes from './routes/tripRoutes';
import demoRoutes from './routes/demoRoutes';
import statusRoutes from './routes/statusRoutes';
import { ApiResponse } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  const response: ApiResponse<any> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
      service: 'Pre-Route Traffic Monitoring API'
    },
    message: 'Service is running normally'
  };
  res.json(response);
});

// API Routes
app.use('/api/trips', tripRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/demo', demoRoutes);

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  const response: ApiResponse<any> = {
    success: true,
    data: {
      service: 'Pre-Route Traffic Monitoring API',
      version: '1.0.0',
      endpoints: {
        health: 'GET /health',
        trips: {
          list: 'GET /api/trips?userId={id}',
          get: 'GET /api/trips/{id}',
          create: 'POST /api/trips',
          update: 'PUT /api/trips/{id}',
          delete: 'DELETE /api/trips/{id}',
          toggle: 'POST /api/trips/{id}/toggle',
          traffic: 'GET /api/trips/{id}/traffic',
          monitor: 'POST /api/trips/{id}/monitor',
          alerts: 'GET /api/trips/{id}/alerts'
        },
        users: {
          list: 'GET /api/users',
          get: 'GET /api/users/{id}',
          create: 'POST /api/users',
          update: 'PUT /api/users/{id}',
          delete: 'DELETE /api/users/{id}',
          settings: 'GET /api/users/{id}/settings',
          updateSettings: 'PUT /api/users/{id}/settings'
        },
        monitoring: {
          start: 'POST /api/monitoring/start',
          stop: 'POST /api/monitoring/stop',
          status: 'GET /api/monitoring/status',
          jobs: 'GET /api/monitoring/jobs',
          simulate: 'POST /api/monitoring/simulate',
          alerts: 'GET /api/monitoring/alerts'
        },
        notifications: {
          send: 'POST /api/notifications/send',
          alert: 'POST /api/notifications/alert',
          history: 'GET /api/notifications/{userId}',
          markRead: 'POST /api/notifications/{userId}/mark-read',
          unread: 'GET /api/notifications/{userId}/unread',
          clear: 'DELETE /api/notifications/{userId}',
          test: 'POST /api/notifications/test'
        },
        status: {
          overview: 'GET /api/status',
          health: 'GET /api/status/health',
          monitoring: 'GET /api/status/monitoring',
          database: 'GET /api/status/database',
          endpoints: 'GET /api/status/api-endpoints'
        },
        demo: {
          locations: 'GET /api/demo/locations',
          setup: 'POST /api/demo/setup',
          createUser: 'POST /api/demo/create-demo-user',
          trafficScenario: 'POST /api/demo/traffic-scenario',
          systemStatus: 'GET /api/demo/system-status',
          startMonitoringAll: 'POST /api/demo/start-monitoring-all'
        }
      },
      documentation: 'This API provides proactive traffic monitoring for routine journeys in Kent, UK'
    },
    message: 'Pre-Route API v1.0.0 - Ready for traffic intelligence'
  };
  res.json(response);
});

// 404 handler
app.use((req, res) => {
  const response: ApiResponse<null> = {
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  };
  res.status(404).json(response);
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  const response: ApiResponse<null> = {
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  };
  
  res.status(500).json(response);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log('🚗 Pre-Route Traffic Monitoring API');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 API documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('🇬🇧 Monitoring Kent traffic for proactive route intelligence');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📋 Quick Start for Demo:');
    console.log(`   1. Create demo user: POST http://localhost:${PORT}/api/demo/create-demo-user`);
    console.log(`   2. Get locations: GET http://localhost:${PORT}/api/demo/locations`);
    console.log(`   3. Check system status: GET http://localhost:${PORT}/api/demo/system-status`);
    console.log(`   4. Simulate traffic: POST http://localhost:${PORT}/api/demo/traffic-scenario`);
  }
});

export default app;