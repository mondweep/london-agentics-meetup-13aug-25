"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficMonitoringService = void 0;
const mockApis_1 = require("./mockApis");
const uuid_1 = require("uuid");
class TrafficMonitoringService {
    constructor() {
        this.googleMapsAPI = mockApis_1.MockGoogleMapsAPI.getInstance();
        this.tomtomAPI = mockApis_1.MockTomTomTrafficAPI.getInstance();
        this.activeJobs = new Map();
        this.alertHistory = new Map();
        this.monitoringIntervals = new Map();
    }
    async startMonitoring(trip) {
        const jobId = (0, uuid_1.v4)();
        const now = new Date();
        const job = {
            id: jobId,
            tripId: trip.id,
            scheduledFor: now,
            status: 'RUNNING',
            alertSent: false
        };
        this.activeJobs.set(jobId, job);
        try {
            console.log(`Starting monitoring for trip: ${trip.name}`);
            const routes = await this.googleMapsAPI.computeRoutes(trip.origin, trip.destination);
            job.routes = routes;
            this.startPolling(job, trip);
            job.status = 'RUNNING';
            this.activeJobs.set(jobId, job);
            return job;
        }
        catch (error) {
            console.error(`Failed to start monitoring for trip ${trip.id}:`, error);
            job.status = 'FAILED';
            this.activeJobs.set(jobId, job);
            throw error;
        }
    }
    async stopMonitoring(jobId) {
        const job = this.activeJobs.get(jobId);
        if (!job) {
            return false;
        }
        const interval = this.monitoringIntervals.get(jobId);
        if (interval) {
            clearInterval(interval);
            this.monitoringIntervals.delete(jobId);
        }
        job.status = 'COMPLETED';
        this.activeJobs.set(jobId, job);
        console.log(`Stopped monitoring job: ${jobId}`);
        return true;
    }
    async getCurrentTrafficStatus(trip) {
        try {
            const routes = await this.googleMapsAPI.computeRoutes(trip.origin, trip.destination);
            const updatedRoutes = [];
            for (const route of routes) {
                const trafficRoute = await this.tomtomAPI.getTrafficFlow(route);
                updatedRoutes.push(trafficRoute);
            }
            return updatedRoutes;
        }
        catch (error) {
            console.error(`Failed to get traffic status for trip ${trip.id}:`, error);
            throw error;
        }
    }
    async getMonitoringJob(jobId) {
        return this.activeJobs.get(jobId) || null;
    }
    async getActiveJobs() {
        return Array.from(this.activeJobs.values()).filter(job => job.status === 'RUNNING');
    }
    async getAlertHistory(tripId) {
        return this.alertHistory.get(tripId) || [];
    }
    async startPolling(job, trip) {
        const pollInterval = 2 * 60 * 1000;
        let pollCount = 0;
        const maxPolls = 15;
        const poll = async () => {
            try {
                if (pollCount >= maxPolls || job.status !== 'RUNNING') {
                    this.stopMonitoring(job.id);
                    return;
                }
                console.log(`Polling traffic data for trip: ${trip.name} (poll ${pollCount + 1}/${maxPolls})`);
                const routes = await this.getCurrentTrafficStatus(trip);
                job.routes = routes;
                const shouldAlert = await this.shouldTriggerAlert(routes, trip);
                if (shouldAlert && !job.alertSent) {
                    const alert = await this.createAlert(trip, routes, shouldAlert.route, shouldAlert.reason);
                    await this.sendAlert(alert);
                    job.alertSent = true;
                    const tripAlerts = this.alertHistory.get(trip.id) || [];
                    tripAlerts.push(alert);
                    this.alertHistory.set(trip.id, tripAlerts);
                    console.log(`Alert sent for trip: ${trip.name} - ${shouldAlert.reason}`);
                }
                pollCount++;
            }
            catch (error) {
                console.error(`Error during traffic polling for job ${job.id}:`, error);
                job.status = 'FAILED';
            }
        };
        await poll();
        const intervalId = setInterval(poll, pollInterval);
        this.monitoringIntervals.set(job.id, intervalId);
    }
    async shouldTriggerAlert(routes, trip) {
        for (const route of routes) {
            let exceedsThreshold = false;
            let reason = '';
            if (trip.alertThreshold.type === 'MINUTES') {
                if (route.delay >= trip.alertThreshold.value * 60) {
                    exceedsThreshold = true;
                    reason = `${Math.round(route.delay / 60)} min delay via ${route.name}`;
                }
            }
            else {
                if (route.delayPercentage >= trip.alertThreshold.value) {
                    exceedsThreshold = true;
                    reason = `${Math.round(route.delayPercentage)}% slower via ${route.name}`;
                }
            }
            if (exceedsThreshold) {
                if (route.reason) {
                    reason += ` due to ${route.reason.toLowerCase()}`;
                }
                return { route, reason };
            }
        }
        return null;
    }
    async createAlert(trip, routes, triggeredRoute, reason) {
        const alert = {
            id: (0, uuid_1.v4)(),
            tripId: trip.id,
            timestamp: new Date(),
            triggeredBy: triggeredRoute.name,
            delayMinutes: Math.round(triggeredRoute.delay / 60),
            reason,
            routes: routes.map(r => ({ ...r }))
        };
        return alert;
    }
    async sendAlert(alert) {
        console.log('🚨 TRAFFIC ALERT SENT 🚨');
        console.log(`Trip: ${alert.tripId}`);
        console.log(`Alert: ${alert.reason}`);
        console.log(`Time: ${alert.timestamp.toLocaleTimeString()}`);
        const clearRoutes = alert.routes.filter(r => r.status === 'CLEAR');
        if (clearRoutes.length > 0) {
            const bestAlternative = clearRoutes.sort((a, b) => a.currentDuration - b.currentDuration)[0];
            console.log(`Recommended alternative: ${bestAlternative.name} (${Math.round(bestAlternative.currentDuration / 60)} min)`);
        }
        console.log('---');
        this.storeAlertForDisplay(alert);
    }
    storeAlertForDisplay(alert) {
        if (!global.recentAlerts) {
            global.recentAlerts = [];
        }
        global.recentAlerts.unshift(alert);
        global.recentAlerts = global.recentAlerts.slice(0, 10);
    }
    async simulateTrafficIncident(routeName, severity, reason) {
        console.log(`🔧 Simulating traffic incident: ${reason} on ${routeName} (severity: ${severity})`);
        this.tomtomAPI.injectTrafficScenario(routeName, severity, reason);
    }
    async getSystemStatus() {
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
exports.TrafficMonitoringService = TrafficMonitoringService;
//# sourceMappingURL=trafficMonitoringService.js.map