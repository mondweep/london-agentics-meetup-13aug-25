"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestrationService = void 0;
const tripService_1 = require("./tripService");
const userService_1 = require("./userService");
const trafficMonitoringService_1 = require("./trafficMonitoringService");
const notificationService_1 = require("./notificationService");
const kentLocations_1 = require("../data/kentLocations");
class OrchestrationService {
    constructor() {
        this.activeMonitoringJobs = new Map();
        this.tripService = new tripService_1.TripService();
        this.userService = new userService_1.UserService();
        this.trafficService = new trafficMonitoringService_1.TrafficMonitoringService();
        this.notificationService = new notificationService_1.NotificationService();
    }
    async initializeDemo() {
        console.log('🚀 Initializing Pre-Route demo system...');
        const demoUsers = await this.userService.createDemoUsers();
        console.log(`👥 Created ${demoUsers.length} demo users`);
        const allTrips = [];
        for (let i = 0; i < Math.min(demoUsers.length, kentLocations_1.DEMO_TRIPS.length); i++) {
            const user = demoUsers[i];
            const tripTemplate = kentLocations_1.DEMO_TRIPS[i];
            if (tripTemplate.origin && tripTemplate.destination && tripTemplate.schedule) {
                const trip = await this.tripService.createTrip(user.id, tripTemplate.name, tripTemplate.origin, tripTemplate.destination, tripTemplate.schedule, tripTemplate.alertThreshold);
                allTrips.push(trip);
            }
        }
        console.log(`🚗 Created ${allTrips.length} demo trips`);
        console.log('✅ Demo system initialized successfully');
        return { users: demoUsers, trips: allTrips };
    }
    async startUserMonitoring(userId) {
        const userTrips = await this.tripService.getTripsByUserId(userId);
        const activeTrips = userTrips.filter(trip => trip.isActive);
        const monitoringJobs = [];
        for (const trip of activeTrips) {
            try {
                const job = await this.trafficService.startMonitoring(trip);
                this.activeMonitoringJobs.set(job.id, job);
                monitoringJobs.push(job);
            }
            catch (error) {
                console.error(`Failed to start monitoring for trip ${trip.id}:`, error);
            }
        }
        return monitoringJobs;
    }
    async startSystemWideMonitoring() {
        const allUsers = await this.userService.getAllUsers();
        const allJobs = [];
        for (const user of allUsers) {
            const userJobs = await this.startUserMonitoring(user.id);
            allJobs.push(...userJobs);
        }
        this.startPeriodicMonitoring();
        return allJobs;
    }
    async handleTrafficAlert(trip, triggeredRoute, allRoutes) {
        try {
            const user = await this.userService.getUserById(trip.userId);
            if (!user) {
                console.error(`User not found for trip ${trip.id}`);
                return;
            }
            const shouldCreate = await this.notificationService.shouldCreateAlert(trip.id, triggeredRoute.name);
            if (!shouldCreate) {
                console.log(`🚫 Alert suppressed due to rate limiting for trip ${trip.name}`);
                return;
            }
            const alert = await this.notificationService.createAlert(trip, triggeredRoute, allRoutes);
            const notificationSent = await this.notificationService.sendNotification(user, trip, alert);
            if (notificationSent) {
                console.log(`📱 Alert sent successfully for trip ${trip.name}`);
            }
            else {
                console.log(`📴 Alert created but notification not sent (quiet hours or error)`);
            }
        }
        catch (error) {
            console.error('Error handling traffic alert:', error);
        }
    }
    async getSystemStatus() {
        const totalUsers = await this.userService.getTotalUserCount();
        const allUsers = await this.userService.getAllUsers();
        let totalTrips = 0;
        let activeTrips = 0;
        for (const user of allUsers) {
            const userTrips = await this.tripService.getTripsByUserId(user.id);
            totalTrips += userTrips.length;
            activeTrips += userTrips.filter(trip => trip.isActive).length;
        }
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
    async simulateTrafficScenario(route, severity, reason) {
        console.log(`🚨 Simulating traffic scenario: ${route} - ${reason} (${Math.round(severity * 100)}%)`);
        await this.trafficService.simulateTrafficIncident(route, severity, reason);
        await this.checkAllTripsForAlerts();
    }
    async checkAllTripsForAlerts() {
        const allUsers = await this.userService.getAllUsers();
        for (const user of allUsers) {
            const userTrips = await this.tripService.getTripsByUserId(user.id);
            const activeTrips = userTrips.filter(trip => trip.isActive);
            for (const trip of activeTrips) {
                try {
                    const routes = await this.trafficService.getCurrentTrafficStatus(trip);
                    const shouldAlert = await this.notificationService.shouldTriggerAlert(trip, routes);
                    if (shouldAlert) {
                        const worstRoute = routes.reduce((worst, current) => current.delay > worst.delay ? current : worst);
                        await this.handleTrafficAlert(trip, worstRoute, routes);
                    }
                }
                catch (error) {
                    console.error(`Error checking trip ${trip.id} for alerts:`, error);
                }
            }
        }
    }
    startPeriodicMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.monitoringInterval = setInterval(async () => {
            const now = new Date();
            try {
                const tripsToMonitor = await this.tripService.getActiveTripsForTime(now);
                for (const trip of tripsToMonitor) {
                    const alreadyMonitoring = Array.from(this.activeMonitoringJobs.values())
                        .some(job => job.tripId === trip.id && job.status === 'RUNNING');
                    if (!alreadyMonitoring) {
                        try {
                            const job = await this.trafficService.startMonitoring(trip);
                            this.activeMonitoringJobs.set(job.id, job);
                            console.log(`📍 Started monitoring trip: ${trip.name}`);
                        }
                        catch (error) {
                            console.error(`Failed to auto-start monitoring for trip ${trip.id}:`, error);
                        }
                    }
                }
                for (const [jobId, job] of this.activeMonitoringJobs.entries()) {
                    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
                        this.activeMonitoringJobs.delete(jobId);
                    }
                }
            }
            catch (error) {
                console.error('Error in periodic monitoring check:', error);
            }
        }, 60000);
    }
    async shutdown() {
        console.log('🛑 Shutting down orchestration service...');
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        for (const job of this.activeMonitoringJobs.values()) {
            try {
                await this.trafficService.stopMonitoring(job.id);
            }
            catch (error) {
                console.error(`Error stopping monitoring job ${job.id}:`, error);
            }
        }
        this.activeMonitoringJobs.clear();
        console.log('✅ Orchestration service shut down complete');
    }
    getServices() {
        return {
            tripService: this.tripService,
            userService: this.userService,
            trafficService: this.trafficService,
            notificationService: this.notificationService
        };
    }
    async createUserWithTrips(email, name, tripTemplates) {
        const user = await this.userService.createUser(email, name);
        const trips = [];
        for (const template of tripTemplates) {
            if (template.origin && template.destination && template.schedule && template.alertThreshold) {
                const trip = await this.tripService.createTrip(user.id, template.name, template.origin, template.destination, template.schedule, template.alertThreshold);
                trips.push(trip);
            }
        }
        return { user, trips };
    }
}
exports.OrchestrationService = OrchestrationService;
//# sourceMappingURL=orchestrationService.js.map