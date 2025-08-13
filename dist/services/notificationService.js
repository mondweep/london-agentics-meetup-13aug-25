"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const uuid_1 = require("uuid");
class NotificationService {
    constructor() {
        this.alertHistory = new Map();
        this.recentAlerts = [];
        this.alertCooldownMinutes = 15;
    }
    async shouldTriggerAlert(trip, routes) {
        if (!routes || routes.length === 0)
            return false;
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
        if (trip.alertThreshold.type === 'MINUTES') {
            return worstDelay >= trip.alertThreshold.value;
        }
        else if (trip.alertThreshold.type === 'PERCENTAGE') {
            return worstDelayPercentage >= trip.alertThreshold.value;
        }
        return false;
    }
    async createAlert(trip, triggeredByRoute, allRoutes) {
        this.validateTripData(trip);
        this.validateRouteData(triggeredByRoute);
        const alert = {
            id: (0, uuid_1.v4)(),
            tripId: trip.id,
            timestamp: new Date(),
            triggeredBy: triggeredByRoute.name,
            delayMinutes: Math.round(triggeredByRoute.delay / 60),
            reason: triggeredByRoute.reason || 'Traffic delay detected',
            routes: allRoutes
        };
        if (!this.alertHistory.has(trip.id)) {
            this.alertHistory.set(trip.id, []);
        }
        this.alertHistory.get(trip.id).push(alert);
        this.recentAlerts.push({
            tripId: trip.id,
            routeName: triggeredByRoute.name,
            timestamp: new Date()
        });
        this.cleanOldRateLimitEntries();
        return alert;
    }
    async sendNotification(user, trip, alert) {
        try {
            if (this.isInQuietHours(user)) {
                console.log(`📴 Notification suppressed due to quiet hours for user ${user.email}`);
                return false;
            }
            if (!user.email || user.email.trim() === '') {
                console.error('❌ Cannot send notification: Invalid user email');
                return false;
            }
            this.logNotification(user, trip, alert);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to send notification:', error);
            return false;
        }
    }
    async getAlertHistory(tripId) {
        const alerts = this.alertHistory.get(tripId) || [];
        return [...alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    async updateAlertAction(alertId, action) {
        for (const alerts of this.alertHistory.values()) {
            const alert = alerts.find(a => a.id === alertId);
            if (alert) {
                alert.userAction = action;
                return alert;
            }
        }
        return null;
    }
    async getTotalAlertCount() {
        let total = 0;
        for (const alerts of this.alertHistory.values()) {
            total += alerts.length;
        }
        return total;
    }
    async getUserAlertCount(userId) {
        return this.getTotalAlertCount();
    }
    async getRecentAlerts(limit = 10) {
        const allAlerts = [];
        for (const alerts of this.alertHistory.values()) {
            allAlerts.push(...alerts);
        }
        return allAlerts
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    async shouldCreateAlert(tripId, routeName) {
        const now = new Date();
        const cooldownMs = this.alertCooldownMinutes * 60 * 1000;
        const recentAlert = this.recentAlerts.find(entry => entry.tripId === tripId &&
            entry.routeName === routeName &&
            (now.getTime() - entry.timestamp.getTime()) < cooldownMs);
        return !recentAlert;
    }
    validateTripData(trip) {
        if (!trip || !trip.id || !trip.name) {
            throw new Error('Invalid trip data');
        }
    }
    validateRouteData(route) {
        if (!route || !route.id || !route.name) {
            throw new Error('Invalid route data');
        }
    }
    isInQuietHours(user) {
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
        if (startTime > endTime) {
            return currentTime >= startTime || currentTime <= endTime;
        }
        else {
            return currentTime >= startTime && currentTime <= endTime;
        }
    }
    logNotification(user, trip, alert) {
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
    cleanOldRateLimitEntries() {
        const now = new Date();
        const cooldownMs = this.alertCooldownMinutes * 60 * 1000;
        this.recentAlerts = this.recentAlerts.filter(entry => (now.getTime() - entry.timestamp.getTime()) < cooldownMs * 2);
    }
    async sendNotificationDirect(userId, notification) {
        try {
            console.log(`📤 Sending notification to user ${userId}:`);
            console.log(`   Type: ${notification.type}`);
            console.log(`   Title: ${notification.title}`);
            console.log(`   Message: ${notification.message}`);
            return true;
        }
        catch (error) {
            console.error('Failed to send notification:', error);
            return false;
        }
    }
    async sendTrafficAlert(userId, tripId, routeName, delayMinutes, reason, alternativeRoutes = []) {
        try {
            console.log(`🚨 Sending traffic alert to user ${userId}:`);
            console.log(`   Trip ID: ${tripId}`);
            console.log(`   Route: ${routeName}`);
            console.log(`   Delay: ${delayMinutes} minutes`);
            console.log(`   Reason: ${reason}`);
            return true;
        }
        catch (error) {
            console.error('Failed to send traffic alert:', error);
            return false;
        }
    }
    async getNotificationHistory(userId, limit, type) {
        console.log(`📋 Fetching notification history for user ${userId}`);
        return [];
    }
    async markNotificationsAsRead(userId, notificationIds) {
        console.log(`✅ Marking ${notificationIds.length} notifications as read for user ${userId}`);
        return true;
    }
    async getUnreadCount(userId) {
        console.log(`🔢 Getting unread count for user ${userId}`);
        return 0;
    }
    async clearNotificationHistory(userId, olderThanDays) {
        console.log(`🗑️  Clearing notification history for user ${userId} ${olderThanDays ? `(older than ${olderThanDays} days)` : ''}`);
        return true;
    }
    async testNotification(userId, channel) {
        console.log(`🧪 Sending test notification to user ${userId} via ${channel || 'all channels'}`);
        return true;
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map