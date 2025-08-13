import { Trip, Route, TrafficAlert, MonitoringJob } from '../types';
export declare class TrafficMonitoringService {
    private googleMapsAPI;
    private tomtomAPI;
    private activeJobs;
    private alertHistory;
    private monitoringIntervals;
    startMonitoring(trip: Trip): Promise<MonitoringJob>;
    stopMonitoring(jobId: string): Promise<boolean>;
    getCurrentTrafficStatus(trip: Trip): Promise<Route[]>;
    getMonitoringJob(jobId: string): Promise<MonitoringJob | null>;
    getActiveJobs(): Promise<MonitoringJob[]>;
    getAlertHistory(tripId: string): Promise<TrafficAlert[]>;
    private startPolling;
    private shouldTriggerAlert;
    private createAlert;
    private sendAlert;
    private storeAlertForDisplay;
    simulateTrafficIncident(routeName: string, severity: number, reason: string): Promise<void>;
    getSystemStatus(): Promise<{
        activeJobs: number;
        totalAlerts: number;
        trafficConditions: Array<{
            route: string;
            severity: number;
            reason?: string;
        }>;
    }>;
}
//# sourceMappingURL=trafficMonitoringService.d.ts.map