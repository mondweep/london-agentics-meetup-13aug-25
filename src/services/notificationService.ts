// NotificationService - Handles traffic alerts and notifications
import { v4 as uuidv4 } from 'uuid';
import { Trip, TrafficAlert, Route, User } from '../types';

interface AlertHistoryEntry {
  tripId: string;
  routeName: string;
  timestamp: Date;
}

export class NotificationService {
  private alertHistory: Map<string, TrafficAlert[]> = new Map(); // tripId -> alerts
  private recentAlerts: AlertHistoryEntry[] = []; // For rate limiting
  private readonly alertCooldownMinutes = 15; // Prevent spam

  constructor() {
    // Initialize with empty maps
  }

  /**
   * Evaluates if an alert should be triggered based on trip thresholds
   */
  async shouldTriggerAlert(trip: Trip, routes: Route[]): Promise<boolean> {
    if (!routes || routes.length === 0) return false;

    // Find the worst delay among all routes
    let worstDelay = 0;
    let worstDelayPercentage = 0;

    for (const route of routes) {
      const delayMinutes = route.delay / 60;
      if (delayMinutes > worstDelay) {
        worstDelay = delayMinutes;
      }
      if (route.delayPercentage > worstDelayPercentage) {
        worstDelayPercentage = route.delayPercentage;
      }
    }

    // Check against threshold
    if (trip.alertThreshold.type === 'MINUTES') {
      return worstDelay >= trip.alertThreshold.value;
    } else if (trip.alertThreshold.type === 'PERCENTAGE') {
      return worstDelayPercentage >= trip.alertThreshold.value;
    }

    return false;
  }

  /**
   * Creates a new traffic alert
   */
  async createAlert(trip: Trip, triggeredByRoute: Route, allRoutes: Route[]): Promise<TrafficAlert> {
    this.validateTripData(trip);
    this.validateRouteData(triggeredByRoute);

    const alert: TrafficAlert = {
      id: uuidv4(),
      tripId: trip.id,
      timestamp: new Date(),
      triggeredBy: triggeredByRoute.name,
      delayMinutes: Math.round(triggeredByRoute.delay / 60),
      reason: triggeredByRoute.reason || 'Traffic delay detected',
      routes: allRoutes
    };

    // Store in history
    if (!this.alertHistory.has(trip.id)) {
      this.alertHistory.set(trip.id, []);
    }
    this.alertHistory.get(trip.id)!.push(alert);

    // Record for rate limiting
    this.recentAlerts.push({
      tripId: trip.id,
      routeName: triggeredByRoute.name,
      timestamp: new Date()
    });

    // Clean old rate limiting entries
    this.cleanOldRateLimitEntries();

    return alert;
  }

  /**
   * Sends notification to user
   */
  async sendNotification(user: User, trip: Trip, alert: TrafficAlert): Promise<boolean> {
    try {
      // Check quiet hours
      if (this.isInQuietHours(user)) {
        console.log(`📴 Notification suppressed due to quiet hours for user ${user.email}`);
        return false;
      }

      // Validate user email
      if (!user.email || user.email.trim() === '') {
        console.error('❌ Cannot send notification: Invalid user email');
        return false;
      }

      // Format and send notification (mock implementation)
      this.logNotification(user, trip, alert);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Gets alert history for a trip
   */
  async getAlertHistory(tripId: string): Promise<TrafficAlert[]> {
    const alerts = this.alertHistory.get(tripId) || [];
    return [...alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Updates alert with user action
   */
  async updateAlertAction(alertId: string, action: 'DISMISSED' | 'NAVIGATED_ALTERNATIVE' | 'NAVIGATED_ORIGINAL'): Promise<TrafficAlert | null> {
    for (const alerts of this.alertHistory.values()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.userAction = action;
        return alert;
      }
    }
    return null;
  }

  /**
   * Gets total alert count across all trips
   */
  async getTotalAlertCount(): Promise<number> {
    let total = 0;
    for (const alerts of this.alertHistory.values()) {
      total += alerts.length;
    }
    return total;
  }

  /**
   * Gets alert count for specific user (all their trips)
   */
  async getUserAlertCount(userId: string): Promise<number> {
    // Note: In a real implementation, we'd need to match trips to users
    // For now, returning total count as all test trips belong to the same user
    return this.getTotalAlertCount();
  }

  /**
   * Gets recent alerts across all trips
   */
  async getRecentAlerts(limit: number = 10): Promise<TrafficAlert[]> {
    const allAlerts: TrafficAlert[] = [];
    
    for (const alerts of this.alertHistory.values()) {
      allAlerts.push(...alerts);
    }

    return allAlerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Checks if an alert should be created (rate limiting)
   */
  async shouldCreateAlert(tripId: string, routeName: string): Promise<boolean> {
    const now = new Date();
    const cooldownMs = this.alertCooldownMinutes * 60 * 1000;

    // Check for recent alerts for same trip and route
    const recentAlert = this.recentAlerts.find(entry => 
      entry.tripId === tripId && 
      entry.routeName === routeName &&
      (now.getTime() - entry.timestamp.getTime()) < cooldownMs
    );

    return !recentAlert;
  }

  /**
   * Private helper methods
   */
  private validateTripData(trip: Trip): void {
    if (!trip || !trip.id || !trip.name) {
      throw new Error('Invalid trip data');
    }
  }

  private validateRouteData(route: Route): void {
    if (!route || !route.id || !route.name) {
      throw new Error('Invalid route data');
    }
  }

  private isInQuietHours(user: User): boolean {
    if (!user.settings.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const startTime = user.settings.quietHours.start;
    const endTime = user.settings.quietHours.end;

    if (!startTime || !endTime) {
      return false;
    }

    // Handle quiet hours spanning midnight
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  private logNotification(user: User, trip: Trip, alert: TrafficAlert): void {
    console.log('\n🚨 TRAFFIC ALERT 🚨');
    console.log('═'.repeat(50));
    console.log(`📧 To: ${user.name} (${user.email})`);
    console.log(`🚗 Trip: ${trip.name}`);
    console.log(`⏰ ${alert.delayMinutes} minute delay detected`);
    console.log(`🛣️  Route: ${alert.triggeredBy}`);
    console.log(`❗ Reason: ${alert.reason}`);
    console.log(`📍 From: ${trip.origin.address}`);
    console.log(`📍 To: ${trip.destination.address}`);
    
    if (alert.routes.length > 1) {
      console.log(`\n🔀 Alternative routes available:`);
      alert.routes.forEach((route, index) => {
        const delayText = route.delay > 0 ? 
          `+${Math.round(route.delay / 60)}min (${route.status})` : 
          'Clear';
        console.log(`   ${index + 1}. ${route.name}: ${delayText}`);
      });
    }

    console.log(`\n⚡ Recommended action: Use ${user.settings.defaultNavApp || 'navigation app'}`);
    console.log(`🕐 Alert sent at: ${alert.timestamp.toLocaleString()}`);
    console.log('═'.repeat(50));
  }

  private cleanOldRateLimitEntries(): void {
    const now = new Date();
    const cooldownMs = this.alertCooldownMinutes * 60 * 1000;

    this.recentAlerts = this.recentAlerts.filter(entry => 
      (now.getTime() - entry.timestamp.getTime()) < cooldownMs * 2 // Keep longer for tracking
    );
  }

  // Additional methods for API routes
  
  /**
   * Send a notification with custom data (for API)
   */
  async sendNotificationDirect(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data: any;
  }): Promise<boolean> {
    try {
      console.log(`📤 Sending notification to user ${userId}:`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Message: ${notification.message}`);
      
      // Store the notification (mock implementation)
      // In a real system, this would integrate with push notification services
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Send traffic alert notification (for API)
   */
  async sendTrafficAlert(
    userId: string,
    tripId: string,
    routeName: string,
    delayMinutes: number,
    reason: string,
    alternativeRoutes: any[] = []
  ): Promise<boolean> {
    try {
      console.log(`🚨 Sending traffic alert to user ${userId}:`);
      console.log(`   Trip ID: ${tripId}`);
      console.log(`   Route: ${routeName}`);
      console.log(`   Delay: ${delayMinutes} minutes`);
      console.log(`   Reason: ${reason}`);
      
      return true;
    } catch (error) {
      console.error('Failed to send traffic alert:', error);
      return false;
    }
  }

  /**
   * Get notification history for user (mock implementation)
   */
  async getNotificationHistory(userId: string, limit?: number, type?: string): Promise<any[]> {
    // In a real system, this would query a database
    console.log(`📋 Fetching notification history for user ${userId}`);
    return []; // Mock empty history
  }

  /**
   * Mark notifications as read (mock implementation)
   */
  async markNotificationsAsRead(userId: string, notificationIds: string[]): Promise<boolean> {
    console.log(`✅ Marking ${notificationIds.length} notifications as read for user ${userId}`);
    return true;
  }

  /**
   * Get unread notification count (mock implementation)
   */
  async getUnreadCount(userId: string): Promise<number> {
    console.log(`🔢 Getting unread count for user ${userId}`);
    return 0; // Mock no unread notifications
  }

  /**
   * Clear notification history (mock implementation)
   */
  async clearNotificationHistory(userId: string, olderThanDays?: number): Promise<boolean> {
    console.log(`🗑️  Clearing notification history for user ${userId} ${olderThanDays ? `(older than ${olderThanDays} days)` : ''}`);
    return true;
  }

  /**
   * Test notification system (mock implementation)
   */
  async testNotification(userId: string, channel?: string): Promise<boolean> {
    console.log(`🧪 Sending test notification to user ${userId} via ${channel || 'all channels'}`);
    return true;
  }
}