// Unit tests for NotificationService - TDD approach
import { NotificationService } from '../../src/services/notificationService';
import { Trip, TrafficAlert, Route, User } from '../../src/types';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockUser: User;
  let mockTrip: Trip;
  let mockRoutes: Route[];

  beforeEach(() => {
    notificationService = new NotificationService();
    
    mockUser = {
      id: 'user-123',
      email: 'alex@example.com',
      name: 'Alex Kent',
      createdAt: new Date(),
      settings: {
        defaultNavApp: 'waze',
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00'
        }
      }
    };

    mockTrip = {
      id: 'trip-456',
      userId: 'user-123',
      name: 'Home to Tuition Centre',
      origin: {
        latitude: 51.2719,
        longitude: 0.1904,
        address: 'Sevenoaks High Street, Kent',
        name: 'Sevenoaks Centre'
      },
      destination: {
        latitude: 51.2737,
        longitude: 0.1887,
        address: 'Tunbridge Wells Grammar School',
        name: 'TWGS'
      },
      schedule: {
        days: [1, 2, 3, 4, 5],
        windowStart: '08:00',
        windowEnd: '08:15'
      },
      alertThreshold: {
        type: 'MINUTES',
        value: 10
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockRoutes = [
      {
        id: 'route_1',
        name: 'A21 (London Road)',
        polyline: 'mock_polyline_1',
        distance: 12000,
        staticDuration: 900, // 15 minutes
        currentDuration: 1200, // 20 minutes (5 min delay)
        delay: 300, // 5 minutes delay
        delayPercentage: 33.3,
        status: 'MODERATE',
        reason: 'Heavy traffic due to road works'
      },
      {
        id: 'route_2',
        name: 'A25 via High Street',
        polyline: 'mock_polyline_2',
        distance: 13500,
        staticDuration: 1080, // 18 minutes
        currentDuration: 1800, // 30 minutes (12 min delay)
        delay: 720, // 12 minutes delay
        delayPercentage: 66.7,
        status: 'HEAVY',
        reason: 'Major accident blocking two lanes'
      }
    ];
  });

  describe('Alert Threshold Evaluation', () => {
    it('should not trigger alert when delays are below threshold', async () => {
      const routesWithMinorDelay = mockRoutes.map(route => ({
        ...route,
        delay: 300, // 5 minutes (below 10-minute threshold)
        currentDuration: route.staticDuration + 300
      }));

      const shouldAlert = await notificationService.shouldTriggerAlert(mockTrip, routesWithMinorDelay);
      
      expect(shouldAlert).toBe(false);
    });

    it('should trigger alert when any route exceeds minutes threshold', async () => {
      const shouldAlert = await notificationService.shouldTriggerAlert(mockTrip, mockRoutes);
      
      expect(shouldAlert).toBe(true);
    });

    it('should handle percentage-based thresholds correctly', async () => {
      const percentageTrip = {
        ...mockTrip,
        alertThreshold: {
          type: 'PERCENTAGE' as const,
          value: 50 // 50% delay threshold
        }
      };

      // Route with 33.3% delay should not trigger
      const routesUnderThreshold = [mockRoutes[0]];
      let shouldAlert = await notificationService.shouldTriggerAlert(percentageTrip, routesUnderThreshold);
      expect(shouldAlert).toBe(false);

      // Route with 66.7% delay should trigger
      const routesOverThreshold = [mockRoutes[1]];
      shouldAlert = await notificationService.shouldTriggerAlert(percentageTrip, routesOverThreshold);
      expect(shouldAlert).toBe(true);
    });

    it('should use the worst route for threshold evaluation', async () => {
      const mixedRoutes = [
        {
          ...mockRoutes[0],
          delay: 300 // 5 minutes (below threshold)
        },
        {
          ...mockRoutes[1],
          delay: 900 // 15 minutes (above threshold)
        }
      ];

      const shouldAlert = await notificationService.shouldTriggerAlert(mockTrip, mixedRoutes);
      
      expect(shouldAlert).toBe(true);
    });
  });

  describe('Alert Creation', () => {
    it('should create traffic alert with correct structure', async () => {
      const triggeredRoute = mockRoutes[1]; // Route with heavy traffic
      
      const alert = await notificationService.createAlert(mockTrip, triggeredRoute, mockRoutes);

      expect(alert).toBeDefined();
      expect(alert.id).toBeDefined();
      expect(alert.tripId).toBe(mockTrip.id);
      expect(alert.timestamp).toBeInstanceOf(Date);
      expect(alert.triggeredBy).toBe(triggeredRoute.name);
      expect(alert.delayMinutes).toBe(Math.round(triggeredRoute.delay / 60));
      expect(alert.reason).toBe(triggeredRoute.reason);
      expect(alert.routes).toEqual(mockRoutes);
      expect(alert.userAction).toBeUndefined(); // Initially undefined
    });

    it('should calculate delay in minutes correctly', async () => {
      const routeWith90SecDelay = {
        ...mockRoutes[0],
        delay: 90 // 1.5 minutes
      };

      const alert = await notificationService.createAlert(mockTrip, routeWith90SecDelay, [routeWith90SecDelay]);
      
      expect(alert.delayMinutes).toBe(2); // Should round up to 2 minutes
    });

    it('should store alert in history', async () => {
      const alert = await notificationService.createAlert(mockTrip, mockRoutes[0], mockRoutes);
      
      const alertHistory = await notificationService.getAlertHistory(mockTrip.id);
      
      expect(alertHistory).toContain(alert);
      expect(alertHistory[alertHistory.length - 1].id).toBe(alert.id);
    });
  });

  describe('Notification Delivery', () => {
    it('should send notification successfully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const alert: TrafficAlert = {
        id: 'alert-123',
        tripId: mockTrip.id,
        timestamp: new Date(),
        triggeredBy: 'A21 (London Road)',
        delayMinutes: 12,
        reason: 'Heavy traffic',
        routes: mockRoutes
      };

      const result = await notificationService.sendNotification(mockUser, mockTrip, alert);
      
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TRAFFIC ALERT')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(mockUser.email)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(alert.reason)
      );
      
      consoleSpy.mockRestore();
    });

    it('should respect quiet hours settings', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Set current time to within quiet hours (e.g., 23:00)
      const quietHoursTime = new Date();
      quietHoursTime.setHours(23, 0, 0, 0);
      
      jest.spyOn(Date, 'now').mockReturnValue(quietHoursTime.getTime());
      
      const alert: TrafficAlert = {
        id: 'alert-123',
        tripId: mockTrip.id,
        timestamp: new Date(),
        triggeredBy: 'A21 (London Road)',
        delayMinutes: 12,
        reason: 'Heavy traffic',
        routes: mockRoutes
      };

      const result = await notificationService.sendNotification(mockUser, mockTrip, alert);
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification suppressed due to quiet hours')
      );
      
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should handle user without quiet hours settings', async () => {
      const userWithoutQuietHours = {
        ...mockUser,
        settings: {
          defaultNavApp: 'google_maps'
        }
      };

      const alert: TrafficAlert = {
        id: 'alert-123',
        tripId: mockTrip.id,
        timestamp: new Date(),
        triggeredBy: 'A21 (London Road)',
        delayMinutes: 12,
        reason: 'Heavy traffic',
        routes: mockRoutes
      };

      const result = await notificationService.sendNotification(userWithoutQuietHours, mockTrip, alert);
      
      expect(result).toBe(true); // Should send regardless of time
    });

    it('should format notification message correctly', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const alert: TrafficAlert = {
        id: 'alert-123',
        tripId: mockTrip.id,
        timestamp: new Date(),
        triggeredBy: 'A21 (London Road)',
        delayMinutes: 12,
        reason: 'Major accident',
        routes: mockRoutes
      };

      await notificationService.sendNotification(mockUser, mockTrip, alert);
      
      const logCalls = consoleSpy.mock.calls.map(call => call[0]).join(' ');
      
      expect(logCalls).toContain('Home to Tuition Centre');
      expect(logCalls).toContain('12 minute delay');
      expect(logCalls).toContain('Major accident');
      expect(logCalls).toContain('A21 (London Road)');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Alert History Management', () => {
    it('should retrieve alert history for a trip', async () => {
      const alert1 = await notificationService.createAlert(mockTrip, mockRoutes[0], mockRoutes);
      const alert2 = await notificationService.createAlert(mockTrip, mockRoutes[1], mockRoutes);
      
      const history = await notificationService.getAlertHistory(mockTrip.id);
      
      expect(history).toHaveLength(2);
      expect(history.map(a => a.id)).toContain(alert1.id);
      expect(history.map(a => a.id)).toContain(alert2.id);
      // Should be ordered by timestamp (most recent first)
      expect(history[0].timestamp.getTime()).toBeGreaterThanOrEqual(history[1].timestamp.getTime());
    });

    it('should return empty array for trip with no alerts', async () => {
      const history = await notificationService.getAlertHistory('non-existent-trip');
      
      expect(history).toEqual([]);
    });

    it('should update alert with user action', async () => {
      const alert = await notificationService.createAlert(mockTrip, mockRoutes[0], mockRoutes);
      
      const updatedAlert = await notificationService.updateAlertAction(alert.id, 'NAVIGATED_ALTERNATIVE');
      
      expect(updatedAlert).toBeDefined();
      expect(updatedAlert!.userAction).toBe('NAVIGATED_ALTERNATIVE');
      
      // Verify in history
      const history = await notificationService.getAlertHistory(mockTrip.id);
      const historyAlert = history.find(a => a.id === alert.id);
      expect(historyAlert!.userAction).toBe('NAVIGATED_ALTERNATIVE');
    });

    it('should return null when updating non-existent alert', async () => {
      const result = await notificationService.updateAlertAction('non-existent', 'DISMISSED');
      
      expect(result).toBeNull();
    });
  });

  describe('Alert Statistics', () => {
    beforeEach(async () => {
      // Create some sample alerts for different trips
      await notificationService.createAlert(mockTrip, mockRoutes[0], mockRoutes);
      await notificationService.createAlert(mockTrip, mockRoutes[1], mockRoutes);
      
      const anotherTrip = { ...mockTrip, id: 'trip-789', name: 'School Run' };
      await notificationService.createAlert(anotherTrip, mockRoutes[0], [mockRoutes[0]]);
    });

    it('should get total alert count', async () => {
      const totalAlerts = await notificationService.getTotalAlertCount();
      
      expect(totalAlerts).toBe(3);
    });

    it('should get alert count for specific user', async () => {
      const userAlertCount = await notificationService.getUserAlertCount(mockUser.id);
      
      expect(userAlertCount).toBe(3); // All alerts are for the same user
    });

    it('should get recent alerts across all trips', async () => {
      const recentAlerts = await notificationService.getRecentAlerts(5);
      
      expect(recentAlerts).toHaveLength(3);
      // Should be ordered by timestamp (most recent first)
      for (let i = 0; i < recentAlerts.length - 1; i++) {
        expect(recentAlerts[i].timestamp.getTime())
          .toBeGreaterThanOrEqual(recentAlerts[i + 1].timestamp.getTime());
      }
    });

    it('should limit recent alerts to requested count', async () => {
      const recentAlerts = await notificationService.getRecentAlerts(2);
      
      expect(recentAlerts).toHaveLength(2);
    });
  });

  describe('Notification Rate Limiting', () => {
    it('should prevent duplicate alerts within time window', async () => {
      const alert1 = await notificationService.createAlert(mockTrip, mockRoutes[0], mockRoutes);
      
      // Try to create another alert immediately for the same trip and route
      const shouldCreateSecond = await notificationService.shouldCreateAlert(mockTrip.id, mockRoutes[0].name);
      
      expect(shouldCreateSecond).toBe(false);
    });

    it('should allow alerts after cooldown period', async () => {
      await notificationService.createAlert(mockTrip, mockRoutes[0], mockRoutes);
      
      // Mock time passing (default cooldown is 15 minutes)
      const futureTime = new Date(Date.now() + 16 * 60 * 1000); // 16 minutes later
      jest.spyOn(Date, 'now').mockReturnValue(futureTime.getTime());
      
      const shouldCreateSecond = await notificationService.shouldCreateAlert(mockTrip.id, mockRoutes[0].name);
      
      expect(shouldCreateSecond).toBe(true);
      
      jest.restoreAllMocks();
    });

    it('should allow alerts for different routes on same trip', async () => {
      await notificationService.createAlert(mockTrip, mockRoutes[0], mockRoutes);
      
      const shouldCreateForDifferentRoute = await notificationService.shouldCreateAlert(mockTrip.id, mockRoutes[1].name);
      
      expect(shouldCreateForDifferentRoute).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing trip data gracefully', async () => {
      const incompleteTrip = { ...mockTrip, name: undefined } as any;
      
      await expect(
        notificationService.createAlert(incompleteTrip, mockRoutes[0], mockRoutes)
      ).rejects.toThrow('Invalid trip data');
    });

    it('should handle missing route data gracefully', async () => {
      const incompleteRoute = { ...mockRoutes[0], name: undefined } as any;
      
      await expect(
        notificationService.createAlert(mockTrip, incompleteRoute, mockRoutes)
      ).rejects.toThrow('Invalid route data');
    });

    it('should handle notification delivery failures', async () => {
      const userWithInvalidEmail = { ...mockUser, email: '' };
      
      const alert: TrafficAlert = {
        id: 'alert-123',
        tripId: mockTrip.id,
        timestamp: new Date(),
        triggeredBy: 'A21 (London Road)',
        delayMinutes: 12,
        reason: 'Heavy traffic',
        routes: mockRoutes
      };

      const result = await notificationService.sendNotification(userWithInvalidEmail, mockTrip, alert);
      
      expect(result).toBe(false);
    });
  });
});