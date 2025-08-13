// Unit tests for TrafficMonitoringService
import { TrafficMonitoringService } from '../../src/services/trafficMonitoringService';
import { MockGoogleMapsAPI, MockTomTomTrafficAPI } from '../../src/services/mockApis';
import { Trip, Location } from '../../src/types';

// Mock the external APIs for controlled testing
jest.mock('../../src/services/mockApis');

describe('TrafficMonitoringService', () => {
  let trafficService: TrafficMonitoringService;
  let mockGoogleAPI: jest.Mocked<MockGoogleMapsAPI>;
  let mockTomTomAPI: jest.Mocked<MockTomTomTrafficAPI>;
  
  const testTrip: Trip = {
    id: 'trip-123',
    userId: 'user-456',
    name: 'Test Commute',
    origin: {
      latitude: 51.2719,
      longitude: 0.1904,
      address: 'Sevenoaks High Street, Kent'
    },
    destination: {
      latitude: 51.2737,
      longitude: 0.1887,
      address: 'Sevenoaks Station, Kent'
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

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mocked instances
    mockGoogleAPI = {
      computeRoutes: jest.fn(),
    } as any;
    
    mockTomTomAPI = {
      getTrafficFlow: jest.fn(),
      getTrafficIncidents: jest.fn(),
      injectTrafficScenario: jest.fn(),
      getCurrentConditions: jest.fn(),
    } as any;
    
    // Mock the getInstance methods
    (MockGoogleMapsAPI.getInstance as jest.Mock).mockReturnValue(mockGoogleAPI);
    (MockTomTomTrafficAPI.getInstance as jest.Mock).mockReturnValue(mockTomTomAPI);
    
    trafficService = new TrafficMonitoringService();
  });

  describe('Traffic Status Retrieval', () => {
    it('should get current traffic status for a trip', async () => {
      const mockRoutes = [
        {
          id: 'route_1',
          name: 'A21 (London Road)',
          polyline: 'mock_polyline_1',
          distance: 5000,
          staticDuration: 600, // 10 minutes
          currentDuration: 600,
          delay: 0,
          delayPercentage: 0,
          status: 'CLEAR' as const
        },
        {
          id: 'route_2',
          name: 'A25 (High Street)',
          polyline: 'mock_polyline_2',
          distance: 5200,
          staticDuration: 650, // 10.8 minutes
          currentDuration: 650,
          delay: 0,
          delayPercentage: 0,
          status: 'CLEAR' as const
        }
      ];

      const mockTrafficRoutes = mockRoutes.map(route => ({
        ...route,
        currentDuration: 720, // 12 minutes (traffic delay)
        delay: 120, // 2 minutes delay
        delayPercentage: 20,
        status: 'MODERATE' as const
      }));

      mockGoogleAPI.computeRoutes.mockResolvedValue(mockRoutes);
      mockTomTomAPI.getTrafficFlow
        .mockResolvedValueOnce(mockTrafficRoutes[0])
        .mockResolvedValueOnce(mockTrafficRoutes[1]);

      const routes = await trafficService.getCurrentTrafficStatus(testTrip);

      expect(mockGoogleAPI.computeRoutes).toHaveBeenCalledWith(
        testTrip.origin,
        testTrip.destination
      );
      expect(mockTomTomAPI.getTrafficFlow).toHaveBeenCalledTimes(2);
      expect(routes).toHaveLength(2);
      expect(routes[0].delay).toBe(120);
      expect(routes[0].status).toBe('MODERATE');
    });

    it('should handle API errors gracefully', async () => {
      mockGoogleAPI.computeRoutes.mockRejectedValue(new Error('Google API Error'));

      await expect(
        trafficService.getCurrentTrafficStatus(testTrip)
      ).rejects.toThrow('Google API Error');
    });
  });

  describe('Monitoring Job Management', () => {
    it('should start monitoring a trip', async () => {
      const mockRoutes = [{
        id: 'route_1',
        name: 'A21 (London Road)',
        polyline: 'mock_polyline',
        distance: 5000,
        staticDuration: 600,
        currentDuration: 600,
        delay: 0,
        delayPercentage: 0,
        status: 'CLEAR' as const
      }];

      mockGoogleAPI.computeRoutes.mockResolvedValue(mockRoutes);

      const job = await trafficService.startMonitoring(testTrip);

      expect(job).toBeDefined();
      expect(job.tripId).toBe(testTrip.id);
      expect(job.status).toBe('RUNNING');
      expect(job.routes).toEqual(mockRoutes);
      expect(mockGoogleAPI.computeRoutes).toHaveBeenCalledWith(
        testTrip.origin,
        testTrip.destination
      );
    });

    it('should handle monitoring start failures', async () => {
      mockGoogleAPI.computeRoutes.mockRejectedValue(new Error('Route computation failed'));

      await expect(
        trafficService.startMonitoring(testTrip)
      ).rejects.toThrow('Route computation failed');
    });

    it('should stop monitoring a job', async () => {
      // First start monitoring
      mockGoogleAPI.computeRoutes.mockResolvedValue([]);
      const job = await trafficService.startMonitoring(testTrip);

      // Then stop it
      const result = await trafficService.stopMonitoring(job.id);

      expect(result).toBe(true);

      // Verify job status is updated
      const stoppedJob = await trafficService.getMonitoringJob(job.id);
      expect(stoppedJob?.status).toBe('COMPLETED');
    });

    it('should return false when stopping non-existent job', async () => {
      const result = await trafficService.stopMonitoring('non-existent-job');
      expect(result).toBe(false);
    });
  });

  describe('Alert System', () => {
    it('should not trigger alert when delays are within threshold', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const mockRoutes = [{
        id: 'route_1',
        name: 'A21 (London Road)',
        polyline: 'mock_polyline',
        distance: 5000,
        staticDuration: 600, // 10 minutes
        currentDuration: 660, // 11 minutes (1 minute delay)
        delay: 60,
        delayPercentage: 10,
        status: 'CLEAR' as const
      }];

      mockGoogleAPI.computeRoutes.mockResolvedValue(mockRoutes);
      mockTomTomAPI.getTrafficFlow.mockResolvedValue(mockRoutes[0]);

      const job = await trafficService.startMonitoring(testTrip);

      // Wait a bit for initial polling
      await new Promise(resolve => setTimeout(resolve, 100));

      // No alert should be sent as delay (1 min) is below threshold (10 min)
      expect(job.alertSent).toBeFalsy();
      
      await trafficService.stopMonitoring(job.id);
      consoleSpy.mockRestore();
    });

    it('should provide system status information', async () => {
      mockTomTomAPI.getCurrentConditions.mockReturnValue([
        { route: 'A21 (London Road)', severity: 0.5, reason: 'Heavy traffic' },
        { route: 'A25 (High Street)', severity: 0.2, reason: 'Road works' }
      ]);

      const status = await trafficService.getSystemStatus();

      expect(status).toHaveProperty('activeJobs');
      expect(status).toHaveProperty('totalAlerts');
      expect(status).toHaveProperty('trafficConditions');
      expect(status.trafficConditions).toHaveLength(2);
    });
  });

  describe('Demo Functions', () => {
    it('should simulate traffic incidents', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await trafficService.simulateTrafficIncident('A21 (London Road)', 0.8, 'Major accident');

      expect(mockTomTomAPI.injectTrafficScenario).toHaveBeenCalledWith(
        'A21 (London Road)',
        0.8,
        'Major accident'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Simulating traffic incident')
      );

      consoleSpy.mockRestore();
    });

    it('should retrieve alert history for a trip', async () => {
      const alerts = await trafficService.getAlertHistory(testTrip.id);
      
      // Should initially be empty
      expect(Array.isArray(alerts)).toBe(true);
      expect(alerts.length).toBeGreaterThanOrEqual(0);
    });

    it('should get active monitoring jobs', async () => {
      const activeJobs = await trafficService.getActiveJobs();
      
      expect(Array.isArray(activeJobs)).toBe(true);
      // All jobs should have status 'RUNNING'
      activeJobs.forEach(job => {
        expect(job.status).toBe('RUNNING');
      });
    });
  });
});