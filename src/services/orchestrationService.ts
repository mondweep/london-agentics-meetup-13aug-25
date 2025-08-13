// OrchestrationService - Coordinates all services for the Pre-Route system
import { TripService } from './tripService';
import { UserService } from './userService';
import { TrafficMonitoringService } from './trafficMonitoringService';
import { NotificationService } from './notificationService';
import { MockGoogleMapsAPI, MockTomTomTrafficAPI } from './mockApis';
import { Trip, User, TrafficAlert, MonitoringJob } from '../types';
import { DEMO_TRIPS } from '../data/kentLocations';

export class OrchestrationService {
  private tripService: TripService;
  private userService: UserService;
  private trafficService: TrafficMonitoringService;
  private notificationService: NotificationService;
  private activeMonitoringJobs: Map<string, MonitoringJob> = new Map();
  private monitoringInterval?: NodeJS.Timeout;

  constructor() {
    this.tripService = new TripService();
    this.userService = new UserService();
    this.trafficService = new TrafficMonitoringService();
    this.notificationService = new NotificationService();
  }

  /**
   * Initialize the system with demo data
   */
  async initializeDemo(): Promise<{ users: User[], trips: Trip[] }> {
    console.log('🚀 Initializing Pre-Route demo system...');
    
    // Create demo users
    const demoUsers = await this.userService.createDemoUsers();
    console.log(`👥 Created ${demoUsers.length} demo users`);

    // Create demo trips for each user
    const allTrips: Trip[] = [];
    
    for (let i = 0; i < Math.min(demoUsers.length, DEMO_TRIPS.length); i++) {
      const user = demoUsers[i];
      const tripTemplate = DEMO_TRIPS[i];
      
      if (tripTemplate.origin && tripTemplate.destination && tripTemplate.schedule) {
        const trip = await this.tripService.createTrip(
          user.id,
          tripTemplate.name,
          tripTemplate.origin,
          tripTemplate.destination,
          tripTemplate.schedule,
          tripTemplate.alertThreshold! as any
        );
        allTrips.push(trip);
      }
    }

    console.log(`🚗 Created ${allTrips.length} demo trips`);
    console.log('✅ Demo system initialized successfully');
    
    return { users: demoUsers, trips: allTrips };
  }

  /**
   * Start monitoring all active trips for a user
   */
  async startUserMonitoring(userId: string): Promise<MonitoringJob[]> {
    const userTrips = await this.tripService.getTripsByUserId(userId);
    const activeTrips = userTrips.filter(trip => trip.isActive);
    const monitoringJobs: MonitoringJob[] = [];

    for (const trip of activeTrips) {
      try {
        const job = await this.trafficService.startMonitoring(trip);
        this.activeMonitoringJobs.set(job.id, job);
        monitoringJobs.push(job);
      } catch (error) {
        console.error(`Failed to start monitoring for trip ${trip.id}:`, error);
      }
    }

    return monitoringJobs;
  }

  /**
   * Start monitoring all trips in the system
   */
  async startSystemWideMonitoring(): Promise<MonitoringJob[]> {
    const allUsers = await this.userService.getAllUsers();
    const allJobs: MonitoringJob[] = [];

    for (const user of allUsers) {
      const userJobs = await this.startUserMonitoring(user.id);
      allJobs.push(...userJobs);
    }

    // Start periodic check for new trips that need monitoring
    this.startPeriodicMonitoring();

    return allJobs;
  }

  /**
   * Handle a traffic alert by sending notifications
   */
  async handleTrafficAlert(trip: Trip, triggeredRoute: any, allRoutes: any[]): Promise<void> {
    try {
      // Get user information
      const user = await this.userService.getUserById(trip.userId);
      if (!user) {
        console.error(`User not found for trip ${trip.id}`);
        return;
      }

      // Check if we should create an alert (rate limiting)
      const shouldCreate = await this.notificationService.shouldCreateAlert(trip.id, triggeredRoute.name);
      if (!shouldCreate) {
        console.log(`🚫 Alert suppressed due to rate limiting for trip ${trip.name}`);
        return;
      }

      // Create alert
      const alert = await this.notificationService.createAlert(trip, triggeredRoute, allRoutes);

      // Send notification
      const notificationSent = await this.notificationService.sendNotification(user, trip, alert);
      
      if (notificationSent) {
        console.log(`📱 Alert sent successfully for trip ${trip.name}`);
      } else {
        console.log(`📴 Alert created but notification not sent (quiet hours or error)`);
      }

    } catch (error) {
      console.error('Error handling traffic alert:', error);
    }
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<{
    users: { total: number };
    trips: { total: number; active: number };
    monitoring: { activeJobs: number; totalAlerts: number };
    traffic: { currentConditions: any[] };
  }> {
    // Get user stats
    const totalUsers = await this.userService.getTotalUserCount();

    // Get trip stats
    const allUsers = await this.userService.getAllUsers();
    let totalTrips = 0;
    let activeTrips = 0;

    for (const user of allUsers) {
      const userTrips = await this.tripService.getTripsByUserId(user.id);
      totalTrips += userTrips.length;
      activeTrips += userTrips.filter(trip => trip.isActive).length;
    }

    // Get monitoring stats
    const systemStatus = await this.trafficService.getSystemStatus();
    const totalAlerts = await this.notificationService.getTotalAlertCount();

    return {
      users: { total: totalUsers },
      trips: { total: totalTrips, active: activeTrips },
      monitoring: { 
        activeJobs: systemStatus.activeJobs, 
        totalAlerts 
      },
      traffic: { currentConditions: systemStatus.trafficConditions }
    };
  }

  /**
   * Simulate a traffic scenario for demo purposes
   */
  async simulateTrafficScenario(route: string, severity: number, reason: string): Promise<void> {
    console.log(`🚨 Simulating traffic scenario: ${route} - ${reason} (${Math.round(severity * 100)}%)`);
    
    await this.trafficService.simulateTrafficIncident(route, severity, reason);
    
    // Trigger immediate check for all affected trips
    await this.checkAllTripsForAlerts();
  }

  /**
   * Check all active trips for potential alerts
   */
  private async checkAllTripsForAlerts(): Promise<void> {
    const allUsers = await this.userService.getAllUsers();

    for (const user of allUsers) {
      const userTrips = await this.tripService.getTripsByUserId(user.id);
      const activeTrips = userTrips.filter(trip => trip.isActive);

      for (const trip of activeTrips) {
        try {
          const routes = await this.trafficService.getCurrentTrafficStatus(trip);
          const shouldAlert = await this.notificationService.shouldTriggerAlert(trip, routes);

          if (shouldAlert) {
            // Find the worst route to use as trigger
            const worstRoute = routes.reduce((worst, current) => 
              current.delay > worst.delay ? current : worst
            );
            
            await this.handleTrafficAlert(trip, worstRoute, routes);
          }
        } catch (error) {
          console.error(`Error checking trip ${trip.id} for alerts:`, error);
        }
      }
    }
  }

  /**
   * Start periodic monitoring for new trips and schedule-based activation
   */
  private startPeriodicMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      const now = new Date();
      
      try {
        // Get trips that should be monitored at this time
        const tripsToMonitor = await this.tripService.getActiveTripsForTime(now);
        
        for (const trip of tripsToMonitor) {
          // Check if trip is already being monitored
          const alreadyMonitoring = Array.from(this.activeMonitoringJobs.values())
            .some(job => job.tripId === trip.id && job.status === 'RUNNING');
          
          if (!alreadyMonitoring) {
            try {
              const job = await this.trafficService.startMonitoring(trip);
              this.activeMonitoringJobs.set(job.id, job);
              console.log(`📍 Started monitoring trip: ${trip.name}`);
            } catch (error) {
              console.error(`Failed to auto-start monitoring for trip ${trip.id}:`, error);
            }
          }
        }
        
        // Clean up completed jobs
        for (const [jobId, job] of this.activeMonitoringJobs.entries()) {
          if (job.status === 'COMPLETED' || job.status === 'FAILED') {
            this.activeMonitoringJobs.delete(jobId);
          }
        }

      } catch (error) {
        console.error('Error in periodic monitoring check:', error);
      }
    }, 60000); // Check every minute
  }

  /**
   * Stop all monitoring and cleanup
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down orchestration service...');

    // Stop periodic monitoring
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Stop all active monitoring jobs
    for (const job of this.activeMonitoringJobs.values()) {
      try {
        await this.trafficService.stopMonitoring(job.id);
      } catch (error) {
        console.error(`Error stopping monitoring job ${job.id}:`, error);
      }
    }

    this.activeMonitoringJobs.clear();
    console.log('✅ Orchestration service shut down complete');
  }

  /**
   * Get service instances for direct access if needed
   */
  getServices() {
    return {
      tripService: this.tripService,
      userService: this.userService,
      trafficService: this.trafficService,
      notificationService: this.notificationService
    };
  }

  /**
   * Create a new user with trips
   */
  async createUserWithTrips(email: string, name: string, tripTemplates: any[]): Promise<{ user: User, trips: Trip[] }> {
    const user = await this.userService.createUser(email, name);
    const trips: Trip[] = [];

    for (const template of tripTemplates) {
      if (template.origin && template.destination && template.schedule && template.alertThreshold) {
        const trip = await this.tripService.createTrip(
          user.id,
          template.name,
          template.origin,
          template.destination,
          template.schedule,
          template.alertThreshold
        );
        trips.push(trip);
      }
    }

    return { user, trips };
  }
}