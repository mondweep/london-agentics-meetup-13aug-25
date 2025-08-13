// Traffic monitoring and alert service
import { Trip, Route, TrafficAlert, MonitoringJob } from '../types';
import { MockGoogleMapsAPI, MockTomTomTrafficAPI } from './mockApis';
import { v4 as uuidv4 } from 'uuid';

export class TrafficMonitoringService {
  private googleMapsAPI = MockGoogleMapsAPI.getInstance();
  private tomtomAPI = MockTomTomTrafficAPI.getInstance();
  private activeJobs: Map<string, MonitoringJob> = new Map();
  private alertHistory: Map<string, TrafficAlert[]> = new Map();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  async startMonitoring(trip: Trip): Promise<MonitoringJob> {
    const jobId = uuidv4();
    const now = new Date();

    const job: MonitoringJob = {
      id: jobId,
      tripId: trip.id,
      scheduledFor: now,
      status: 'RUNNING',
      alertSent: false
    };

    this.activeJobs.set(jobId, job);

    try {
      // Fetch initial routes
      console.log(`Starting monitoring for trip: ${trip.name}`);
      const routes = await this.googleMapsAPI.computeRoutes(trip.origin, trip.destination);
      job.routes = routes;
      
      // Start polling for traffic updates
      this.startPolling(job, trip);
      
      job.status = 'RUNNING';
      this.activeJobs.set(jobId, job);
      
      return job;
    } catch (error) {
      console.error(`Failed to start monitoring for trip ${trip.id}:`, error);
      job.status = 'FAILED';
      this.activeJobs.set(jobId, job);
      throw error;
    }
  }

  async stopMonitoring(jobId: string): Promise<boolean> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      return false;
    }

    // Clear polling interval
    const interval = this.monitoringIntervals.get(jobId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(jobId);
    }

    // Update job status
    job.status = 'COMPLETED';
    this.activeJobs.set(jobId, job);
    
    console.log(`Stopped monitoring job: ${jobId}`);
    return true;
  }

  async getCurrentTrafficStatus(trip: Trip): Promise<Route[]> {
    try {
      // Get routes from Google Maps API
      const routes = await this.googleMapsAPI.computeRoutes(trip.origin, trip.destination);
      
      // Update each route with current traffic data
      const updatedRoutes: Route[] = [];
      for (const route of routes) {
        const trafficRoute = await this.tomtomAPI.getTrafficFlow(route);
        updatedRoutes.push(trafficRoute);
      }

      return updatedRoutes;
    } catch (error) {
      console.error(`Failed to get traffic status for trip ${trip.id}:`, error);
      throw error;
    }
  }

  async getMonitoringJob(jobId: string): Promise<MonitoringJob | null> {
    return this.activeJobs.get(jobId) || null;
  }

  async getActiveJobs(): Promise<MonitoringJob[]> {
    return Array.from(this.activeJobs.values()).filter(job => job.status === 'RUNNING');
  }

  async getAlertHistory(tripId: string): Promise<TrafficAlert[]> {
    return this.alertHistory.get(tripId) || [];
  }

  private async startPolling(job: MonitoringJob, trip: Trip): Promise<void> {
    const pollInterval = 2 * 60 * 1000; // 2 minutes
    let pollCount = 0;
    const maxPolls = 15; // Stop after 30 minutes

    const poll = async () => {
      try {
        if (pollCount >= maxPolls || job.status !== 'RUNNING') {
          this.stopMonitoring(job.id);
          return;
        }

        console.log(`Polling traffic data for trip: ${trip.name} (poll ${pollCount + 1}/${maxPolls})`);
        
        // Get current traffic status
        const routes = await this.getCurrentTrafficStatus(trip);
        job.routes = routes;

        // Check if alert should be triggered
        const shouldAlert = await this.shouldTriggerAlert(routes, trip);
        
        if (shouldAlert && !job.alertSent) {
          const alert = await this.createAlert(trip, routes, shouldAlert.route, shouldAlert.reason);
          await this.sendAlert(alert);
          job.alertSent = true;
          
          // Store alert in history
          const tripAlerts = this.alertHistory.get(trip.id) || [];
          tripAlerts.push(alert);
          this.alertHistory.set(trip.id, tripAlerts);
          
          console.log(`Alert sent for trip: ${trip.name} - ${shouldAlert.reason}`);
        }

        pollCount++;
      } catch (error) {
        console.error(`Error during traffic polling for job ${job.id}:`, error);
        job.status = 'FAILED';
      }
    };

    // Start immediate poll
    await poll();

    // Set up interval for subsequent polls
    const intervalId = setInterval(poll, pollInterval);
    this.monitoringIntervals.set(job.id, intervalId);
  }

  private async shouldTriggerAlert(
    routes: Route[], 
    trip: Trip
  ): Promise<{ route: Route; reason: string } | null> {
    for (const route of routes) {
      let exceedsThreshold = false;
      let reason = '';

      if (trip.alertThreshold.type === 'MINUTES') {
        if (route.delay >= trip.alertThreshold.value * 60) { // Convert to seconds
          exceedsThreshold = true;
          reason = `${Math.round(route.delay / 60)} min delay via ${route.name}`;
        }
      } else { // PERCENTAGE
        if (route.delayPercentage >= trip.alertThreshold.value) {
          exceedsThreshold = true;
          reason = `${Math.round(route.delayPercentage)}% slower via ${route.name}`;
        }
      }

      if (exceedsThreshold) {
        // Add specific reason if available
        if (route.reason) {
          reason += ` due to ${route.reason.toLowerCase()}`;
        }
        
        return { route, reason };
      }
    }

    return null;
  }

  private async createAlert(
    trip: Trip,
    routes: Route[],
    triggeredRoute: Route,
    reason: string
  ): Promise<TrafficAlert> {
    const alert: TrafficAlert = {
      id: uuidv4(),
      tripId: trip.id,
      timestamp: new Date(),
      triggeredBy: triggeredRoute.name,
      delayMinutes: Math.round(triggeredRoute.delay / 60),
      reason,
      routes: routes.map(r => ({ ...r })) // Create copy
    };

    return alert;
  }

  private async sendAlert(alert: TrafficAlert): Promise<void> {
    // In a real implementation, this would send push notifications
    // For demo purposes, we'll log and potentially show in UI
    
    console.log('🚨 TRAFFIC ALERT SENT 🚨');
    console.log(`Trip: ${alert.tripId}`);
    console.log(`Alert: ${alert.reason}`);
    console.log(`Time: ${alert.timestamp.toLocaleTimeString()}`);
    
    // Find alternative routes
    const clearRoutes = alert.routes.filter(r => r.status === 'CLEAR');
    if (clearRoutes.length > 0) {
      const bestAlternative = clearRoutes.sort((a, b) => a.currentDuration - b.currentDuration)[0];
      console.log(`Recommended alternative: ${bestAlternative.name} (${Math.round(bestAlternative.currentDuration / 60)} min)`);
    }
    
    console.log('---');

    // Store alert for potential UI display
    this.storeAlertForDisplay(alert);
  }

  private storeAlertForDisplay(alert: TrafficAlert): void {
    // In a real app, this might trigger UI notifications or store in a notification center
    // For demo, we'll keep recent alerts accessible
    if (!(global as any).recentAlerts) {
      (global as any).recentAlerts = [];
    }
    (global as any).recentAlerts.unshift(alert);
    // Keep only the last 10 alerts
    (global as any).recentAlerts = (global as any).recentAlerts.slice(0, 10);
  }

  // Demo helper methods
  async simulateTrafficIncident(routeName: string, severity: number, reason: string): Promise<void> {
    console.log(`🔧 Simulating traffic incident: ${reason} on ${routeName} (severity: ${severity})`);
    this.tomtomAPI.injectTrafficScenario(routeName, severity, reason);
  }

  async getSystemStatus(): Promise<{
    activeJobs: number;
    totalAlerts: number;
    trafficConditions: Array<{route: string, severity: number, reason?: string}>;
  }> {
    const activeJobs = Array.from(this.activeJobs.values()).filter(j => j.status === 'RUNNING').length;
    const totalAlerts = Array.from(this.alertHistory.values()).reduce((sum, alerts) => sum + alerts.length, 0);
    const trafficConditions = this.tomtomAPI.getCurrentConditions();

    return {
      activeJobs,
      totalAlerts,
      trafficConditions
    };
  }
}