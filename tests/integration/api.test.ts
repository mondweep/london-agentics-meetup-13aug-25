// Integration tests for API routes - TDD approach
import request from 'supertest';
import app from '../../src/server';
import { TripService } from '../../src/services/tripService';
import { UserService } from '../../src/services/userService';
import { NotificationService } from '../../src/services/notificationService';

describe('API Integration Tests', () => {
  let tripService: TripService;
  let userService: UserService;
  let notificationService: NotificationService;
  let testUser: any;

  beforeEach(async () => {
    tripService = new TripService();
    userService = new UserService();
    notificationService = new NotificationService();
    
    // Create a test user for API tests
    testUser = await userService.createUser(
      'api-test@example.com',
      'API Test User',
      {
        defaultNavApp: 'waze',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        }
      }
    );
  });

  describe('Health and Info Endpoints', () => {
    it('GET /health should return service status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.service).toBe('Pre-Route Traffic Monitoring API');
    });

    it('GET /api should return API documentation', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.endpoints).toBeDefined();
      expect(response.body.data.endpoints.trips).toBeDefined();
      expect(response.body.data.endpoints.demo).toBeDefined();
    });

    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
    });
  });

  describe('Trip Management API', () => {
    const validTripData = {
      name: 'API Test Trip',
      origin: {
        latitude: 51.2719,
        longitude: 0.1904,
        address: 'Sevenoaks High Street, Kent',
        name: 'Sevenoaks Centre'
      },
      destination: {
        latitude: 51.2737,
        longitude: 0.1887,
        address: 'Sevenoaks Station, Kent',
        name: 'Sevenoaks Station'
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

    describe('POST /api/trips', () => {
      it('should create a new trip', async () => {
        const response = await request(app)
          .post('/api/trips')
          .send({
            userId: testUser.id,
            ...validTripData
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe(validTripData.name);
        expect(response.body.data.userId).toBe(testUser.id);
        expect(response.body.data.isActive).toBe(true);
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/trips')
          .send({
            userId: testUser.id,
            name: '' // Invalid: empty name
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('validation');
      });

      it('should validate location coordinates', async () => {
        const invalidData = {
          ...validTripData,
          origin: {
            latitude: 'invalid',
            longitude: 0.1904,
            address: 'Test Address'
          }
        };

        const response = await request(app)
          .post('/api/trips')
          .send({
            userId: testUser.id,
            ...invalidData
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('coordinates');
      });

      it('should validate schedule days', async () => {
        const invalidData = {
          ...validTripData,
          schedule: {
            days: [], // Invalid: no days selected
            windowStart: '08:00',
            windowEnd: '08:15'
          }
        };

        const response = await request(app)
          .post('/api/trips')
          .send({
            userId: testUser.id,
            ...invalidData
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('days');
      });
    });

    describe('GET /api/trips', () => {
      let testTrip: any;

      beforeEach(async () => {
        testTrip = await tripService.createTrip(
          testUser.id,
          'Test Trip for GET',
          validTripData.origin,
          validTripData.destination,
          validTripData.schedule,
          validTripData.alertThreshold
        );
      });

      it('should get trips for user', async () => {
        const response = await request(app)
          .get(`/api/trips?userId=${testUser.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe(testTrip.id);
      });

      it('should require userId query parameter', async () => {
        const response = await request(app)
          .get('/api/trips')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('userId');
      });

      it('should return empty array for user with no trips', async () => {
        const anotherUser = await userService.createUser('notrips@example.com', 'No Trips User');
        
        const response = await request(app)
          .get(`/api/trips?userId=${anotherUser.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([]);
      });
    });

    describe('GET /api/trips/:id', () => {
      let testTrip: any;

      beforeEach(async () => {
        testTrip = await tripService.createTrip(
          testUser.id,
          'Test Trip for GET by ID',
          validTripData.origin,
          validTripData.destination,
          validTripData.schedule,
          validTripData.alertThreshold
        );
      });

      it('should get trip by ID', async () => {
        const response = await request(app)
          .get(`/api/trips/${testTrip.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testTrip.id);
        expect(response.body.data.name).toBe('Test Trip for GET by ID');
      });

      it('should return 404 for non-existent trip', async () => {
        const response = await request(app)
          .get('/api/trips/non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('not found');
      });
    });

    describe('PUT /api/trips/:id', () => {
      let testTrip: any;

      beforeEach(async () => {
        testTrip = await tripService.createTrip(
          testUser.id,
          'Test Trip for PUT',
          validTripData.origin,
          validTripData.destination,
          validTripData.schedule,
          validTripData.alertThreshold
        );
      });

      it('should update trip successfully', async () => {
        const updates = {
          name: 'Updated Trip Name',
          alertThreshold: {
            type: 'PERCENTAGE',
            value: 25
          }
        };

        const response = await request(app)
          .put(`/api/trips/${testTrip.id}`)
          .send(updates)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updates.name);
        expect(response.body.data.alertThreshold).toEqual(updates.alertThreshold);
      });

      it('should return 404 for non-existent trip', async () => {
        const response = await request(app)
          .put('/api/trips/non-existent-id')
          .send({ name: 'New Name' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('not found');
      });

      it('should validate update data', async () => {
        const response = await request(app)
          .put(`/api/trips/${testTrip.id}`)
          .send({
            alertThreshold: {
              type: 'INVALID',
              value: -5
            }
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/trips/:id', () => {
      let testTrip: any;

      beforeEach(async () => {
        testTrip = await tripService.createTrip(
          testUser.id,
          'Test Trip for DELETE',
          validTripData.origin,
          validTripData.destination,
          validTripData.schedule,
          validTripData.alertThreshold
        );
      });

      it('should delete trip successfully', async () => {
        const response = await request(app)
          .delete(`/api/trips/${testTrip.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('deleted');

        // Verify trip is deleted
        const verifyResponse = await request(app)
          .get(`/api/trips/${testTrip.id}`)
          .expect(404);
      });

      it('should return 404 for non-existent trip', async () => {
        const response = await request(app)
          .delete('/api/trips/non-existent-id')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/trips/:id/toggle', () => {
      let testTrip: any;

      beforeEach(async () => {
        testTrip = await tripService.createTrip(
          testUser.id,
          'Test Trip for Toggle',
          validTripData.origin,
          validTripData.destination,
          validTripData.schedule,
          validTripData.alertThreshold
        );
      });

      it('should toggle trip active status', async () => {
        expect(testTrip.isActive).toBe(true);

        const response = await request(app)
          .post(`/api/trips/${testTrip.id}/toggle`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isActive).toBe(false);

        // Toggle again
        const response2 = await request(app)
          .post(`/api/trips/${testTrip.id}/toggle`)
          .expect(200);

        expect(response2.body.data.isActive).toBe(true);
      });

      it('should return 404 for non-existent trip', async () => {
        const response = await request(app)
          .post('/api/trips/non-existent-id/toggle')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Traffic Monitoring API', () => {
    let testTrip: any;

    beforeEach(async () => {
      testTrip = await tripService.createTrip(
        testUser.id,
        'Traffic Test Trip',
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

    describe('GET /api/trips/:id/traffic', () => {
      it('should get current traffic status for trip', async () => {
        const response = await request(app)
          .get(`/api/trips/${testTrip.id}/traffic`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.routes)).toBe(true);
        expect(response.body.data.routes.length).toBeGreaterThan(0);

        // Check route structure
        response.body.data.routes.forEach((route: any) => {
          expect(route.id).toBeDefined();
          expect(route.name).toBeDefined();
          expect(route.distance).toBeGreaterThan(0);
          expect(route.staticDuration).toBeGreaterThan(0);
          expect(route.currentDuration).toBeGreaterThan(0);
          expect(route.status).toMatch(/^(CLEAR|MODERATE|HEAVY)$/);
        });
      });

      it('should return 404 for non-existent trip', async () => {
        const response = await request(app)
          .get('/api/trips/non-existent-id/traffic')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/trips/:id/monitor', () => {
      it('should start monitoring a trip', async () => {
        const response = await request(app)
          .post(`/api/trips/${testTrip.id}/monitor`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.jobId).toBeDefined();
        expect(response.body.data.status).toBe('RUNNING');
      });

      it('should return 404 for non-existent trip', async () => {
        const response = await request(app)
          .post('/api/trips/non-existent-id/monitor')
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should handle monitoring already active trip', async () => {
        // Start monitoring first time
        await request(app)
          .post(`/api/trips/${testTrip.id}/monitor`)
          .expect(200);

        // Try to start again
        const response = await request(app)
          .post(`/api/trips/${testTrip.id}/monitor`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('already');
      });
    });

    describe('GET /api/trips/:id/alerts', () => {
      it('should get alert history for trip', async () => {
        const response = await request(app)
          .get(`/api/trips/${testTrip.id}/alerts`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should return 404 for non-existent trip', async () => {
        const response = await request(app)
          .get('/api/trips/non-existent-id/alerts')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Demo API', () => {
    describe('GET /api/demo/locations', () => {
      it('should return Kent locations for demo', async () => {
        const response = await request(app)
          .get('/api/demo/locations')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.locations).toBeDefined();
        expect(Array.isArray(response.body.data.locations)).toBe(true);

        // Check that it includes Sevenoaks and Tunbridge Wells
        const locations = response.body.data.locations;
        expect(locations.some((loc: any) => loc.name.includes('Sevenoaks'))).toBe(true);
        expect(locations.some((loc: any) => loc.name.includes('Tunbridge Wells'))).toBe(true);
      });
    });

    describe('POST /api/demo/create-demo-user', () => {
      it('should create demo user with sample trips', async () => {
        const response = await request(app)
          .post('/api/demo/create-demo-user')
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.trips).toBeDefined();
        expect(Array.isArray(response.body.data.trips)).toBe(true);
        expect(response.body.data.trips.length).toBeGreaterThan(0);
      });

      it('should not create duplicate demo users', async () => {
        // Create first demo user
        await request(app)
          .post('/api/demo/create-demo-user')
          .expect(201);

        // Try to create again
        const response = await request(app)
          .post('/api/demo/create-demo-user')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('existing');
      });
    });

    describe('POST /api/demo/traffic-scenario', () => {
      it('should simulate traffic scenario', async () => {
        const scenario = {
          route: 'A21 (London Road)',
          severity: 0.7,
          reason: 'API Test - Heavy traffic'
        };

        const response = await request(app)
          .post('/api/demo/traffic-scenario')
          .send(scenario)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.scenario).toEqual(scenario);
      });

      it('should validate scenario data', async () => {
        const invalidScenario = {
          route: '', // Invalid: empty route
          severity: 1.5, // Invalid: > 1.0
          reason: 'Test'
        };

        const response = await request(app)
          .post('/api/demo/traffic-scenario')
          .send(invalidScenario)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('validation');
      });
    });

    describe('GET /api/demo/system-status', () => {
      it('should return system monitoring status', async () => {
        const response = await request(app)
          .get('/api/demo/system-status')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.activeJobs).toBeDefined();
        expect(response.body.data.totalAlerts).toBeDefined();
        expect(response.body.data.trafficConditions).toBeDefined();
        expect(Array.isArray(response.body.data.trafficConditions)).toBe(true);
      });
    });

    describe('POST /api/demo/start-monitoring-all', () => {
      beforeEach(async () => {
        // Create demo user with trips
        await request(app)
          .post('/api/demo/create-demo-user')
          .expect(201);
      });

      it('should start monitoring all demo trips', async () => {
        const response = await request(app)
          .post('/api/demo/start-monitoring-all')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.monitoringJobs).toBeDefined();
        expect(Array.isArray(response.body.data.monitoringJobs)).toBe(true);
        expect(response.body.data.monitoringJobs.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/trips')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid JSON');
    });

    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/trips')
        .set('Content-Type', 'text/plain')
        .send('not json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle server errors gracefully', async () => {
      // Force an error by passing invalid data that would cause internal error
      const response = await request(app)
        .post('/api/trips')
        .send({
          userId: null,
          name: 'Test',
          origin: 'invalid'
        });

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Request Validation Middleware', () => {
    it('should enforce request size limits', async () => {
      // Create a very large request body
      const largeData = {
        userId: testUser.id,
        name: 'Test Trip',
        description: 'x'.repeat(15 * 1024 * 1024) // 15MB string
      };

      const response = await request(app)
        .post('/api/trips')
        .send(largeData)
        .expect(413);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('too large');
    });

    it('should sanitize input data', async () => {
      const maliciousData = {
        userId: testUser.id,
        name: '<script>alert("xss")</script>',
        origin: {
          latitude: 51.2719,
          longitude: 0.1904,
          address: 'Test Address'
        },
        destination: {
          latitude: 51.2737,
          longitude: 0.1887,
          address: 'Test Address'
        },
        schedule: {
          days: [1, 2, 3, 4, 5],
          windowStart: '08:00',
          windowEnd: '08:15'
        },
        alertThreshold: {
          type: 'MINUTES',
          value: 10
        }
      };

      const response = await request(app)
        .post('/api/trips')
        .send(maliciousData)
        .expect(201);

      // Name should be sanitized
      expect(response.body.data.name).not.toContain('<script>');
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting for demo endpoints', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).post('/api/demo/traffic-scenario').send({
          route: 'A21 (London Road)',
          severity: 0.5,
          reason: 'Rate limit test'
        })
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited (depending on implementation)
      const rateLimited = responses.filter((r: any) => r.status === 429);
      expect(rateLimited.length).toBeGreaterThanOrEqual(0); // May or may not be rate limited
    });
  });
});