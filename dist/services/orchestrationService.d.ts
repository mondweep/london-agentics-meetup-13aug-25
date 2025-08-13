import { TripService } from './tripService';
import { UserService } from './userService';
import { TrafficMonitoringService } from './trafficMonitoringService';
import { NotificationService } from './notificationService';
import { Trip, User, MonitoringJob } from '../types';
export declare class OrchestrationService {
    private tripService;
    private userService;
    private trafficService;
    private notificationService;
    private activeMonitoringJobs;
    private monitoringInterval?;
    constructor();
    initializeDemo(): Promise<{
        users: User[];
        trips: Trip[];
    }>;
    startUserMonitoring(userId: string): Promise<MonitoringJob[]>;
    startSystemWideMonitoring(): Promise<MonitoringJob[]>;
    handleTrafficAlert(trip: Trip, triggeredRoute: any, allRoutes: any[]): Promise<void>;
    getSystemStatus(): Promise<{
        users: {
            total: number;
        };
        trips: {
            total: number;
            active: number;
        };
        monitoring: {
            activeJobs: number;
            totalAlerts: number;
        };
        traffic: {
            currentConditions: any[];
        };
    }>;
    simulateTrafficScenario(route: string, severity: number, reason: string): Promise<void>;
    private checkAllTripsForAlerts;
    private startPeriodicMonitoring;
    shutdown(): Promise<void>;
    getServices(): {
        tripService: TripService;
        userService: UserService;
        trafficService: TrafficMonitoringService;
        notificationService: NotificationService;
    };
    createUserWithTrips(email: string, name: string, tripTemplates: any[]): Promise<{
        user: User;
        trips: Trip[];
    }>;
}
//# sourceMappingURL=orchestrationService.d.ts.map