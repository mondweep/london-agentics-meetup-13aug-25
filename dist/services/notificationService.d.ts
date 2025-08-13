import { Trip, TrafficAlert, Route, User } from '../types';
export declare class NotificationService {
    private alertHistory;
    private recentAlerts;
    private readonly alertCooldownMinutes;
    constructor();
    shouldTriggerAlert(trip: Trip, routes: Route[]): Promise<boolean>;
    createAlert(trip: Trip, triggeredByRoute: Route, allRoutes: Route[]): Promise<TrafficAlert>;
    sendNotification(user: User, trip: Trip, alert: TrafficAlert): Promise<boolean>;
    getAlertHistory(tripId: string): Promise<TrafficAlert[]>;
    updateAlertAction(alertId: string, action: 'DISMISSED' | 'NAVIGATED_ALTERNATIVE' | 'NAVIGATED_ORIGINAL'): Promise<TrafficAlert | null>;
    getTotalAlertCount(): Promise<number>;
    getUserAlertCount(userId: string): Promise<number>;
    getRecentAlerts(limit?: number): Promise<TrafficAlert[]>;
    shouldCreateAlert(tripId: string, routeName: string): Promise<boolean>;
    private validateTripData;
    private validateRouteData;
    private isInQuietHours;
    private logNotification;
    private cleanOldRateLimitEntries;
    sendNotificationDirect(userId: string, notification: {
        type: string;
        title: string;
        message: string;
        data: any;
    }): Promise<boolean>;
    sendTrafficAlert(userId: string, tripId: string, routeName: string, delayMinutes: number, reason: string, alternativeRoutes?: any[]): Promise<boolean>;
    getNotificationHistory(userId: string, limit?: number, type?: string): Promise<any[]>;
    markNotificationsAsRead(userId: string, notificationIds: string[]): Promise<boolean>;
    getUnreadCount(userId: string): Promise<number>;
    clearNotificationHistory(userId: string, olderThanDays?: number): Promise<boolean>;
    testNotification(userId: string, channel?: string): Promise<boolean>;
}
//# sourceMappingURL=notificationService.d.ts.map