"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trafficMonitoringService_1 = require("../services/trafficMonitoringService");
const tripService_1 = require("../services/tripService");
const router = (0, express_1.Router)();
const trafficService = new trafficMonitoringService_1.TrafficMonitoringService();
const tripService = new tripService_1.TripService();
router.post('/start', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            const response = {
                success: false,
                error: 'User ID is required'
            };
            return res.status(400).json(response);
        }
        const trips = await tripService.getTripsByUserId(userId);
        const activeTrips = trips.filter(trip => trip.isActive);
        const monitoringJobs = [];
        for (const trip of activeTrips) {
            try {
                const job = await trafficService.startMonitoring(trip);
                monitoringJobs.push(job);
            }
            catch (error) {
                console.error(`Failed to start monitoring for trip ${trip.id}:`, error);
            }
        }
        const response = {
            success: true,
            data: {
                userId,
                tripsFound: trips.length,
                activeTrips: activeTrips.length,
                monitoringJobs: monitoringJobs.length,
                jobs: monitoringJobs
            },
            message: `Started monitoring ${monitoringJobs.length} active trips`
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error starting monitoring:', error);
        const response = {
            success: false,
            error: 'Failed to start monitoring'
        };
        res.status(500).json(response);
    }
});
router.post('/stop', async (req, res) => {
    try {
        const { userId, tripId } = req.body;
        let stoppedJobs = 0;
        if (tripId) {
            const success = await trafficService.stopMonitoring(tripId);
            if (success) {
                stoppedJobs = 1;
            }
        }
        else if (userId) {
            const trips = await tripService.getTripsByUserId(userId);
            for (const trip of trips) {
                try {
                    const success = await trafficService.stopMonitoring(trip.id);
                    if (success) {
                        stoppedJobs++;
                    }
                }
                catch (error) {
                    console.error(`Failed to stop monitoring for trip ${trip.id}:`, error);
                }
            }
        }
        else {
            const activeJobs = await trafficService.getActiveJobs();
            for (const job of activeJobs) {
                try {
                    const success = await trafficService.stopMonitoring(job.id);
                    if (success) {
                        stoppedJobs++;
                    }
                }
                catch (error) {
                    console.error(`Failed to stop monitoring job ${job.id}:`, error);
                }
            }
        }
        const response = {
            success: true,
            data: {
                stoppedJobs
            },
            message: `Stopped monitoring ${stoppedJobs} jobs`
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error stopping monitoring:', error);
        const response = {
            success: false,
            error: 'Failed to stop monitoring'
        };
        res.status(500).json(response);
    }
});
router.get('/status', async (req, res) => {
    try {
        const systemStatus = await trafficService.getSystemStatus();
        const activeJobs = await trafficService.getActiveJobs();
        const response = {
            success: true,
            data: {
                ...systemStatus,
                activeJobsDetails: activeJobs,
                timestamp: new Date()
            },
            message: 'Monitoring status retrieved successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching monitoring status:', error);
        const response = {
            success: false,
            error: 'Failed to fetch monitoring status'
        };
        res.status(500).json(response);
    }
});
router.get('/jobs', async (req, res) => {
    try {
        const { userId } = req.query;
        let jobs;
        if (userId) {
            const trips = await tripService.getTripsByUserId(userId);
            const tripIds = trips.map(trip => trip.id);
            const allJobs = await trafficService.getActiveJobs();
            jobs = allJobs.filter(job => tripIds.includes(job.tripId));
        }
        else {
            jobs = await trafficService.getActiveJobs();
        }
        const response = {
            success: true,
            data: jobs
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching monitoring jobs:', error);
        const response = {
            success: false,
            error: 'Failed to fetch monitoring jobs'
        };
        res.status(500).json(response);
    }
});
router.post('/simulate', async (req, res) => {
    try {
        const { routeName, severity, reason } = req.body;
        if (!routeName || severity === undefined || !reason) {
            const response = {
                success: false,
                error: 'Route name, severity, and reason are required'
            };
            return res.status(400).json(response);
        }
        await trafficService.simulateTrafficIncident(routeName, severity, reason);
        const response = {
            success: true,
            data: {
                routeName,
                severity,
                reason,
                timestamp: new Date()
            },
            message: 'Traffic incident simulated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error simulating traffic incident:', error);
        const response = {
            success: false,
            error: 'Failed to simulate traffic incident'
        };
        res.status(500).json(response);
    }
});
router.get('/alerts', async (req, res) => {
    try {
        const { userId, tripId, limit } = req.query;
        let alerts = [];
        if (tripId) {
            alerts = await trafficService.getAlertHistory(tripId);
        }
        else if (userId) {
            const trips = await tripService.getTripsByUserId(userId);
            for (const trip of trips) {
                const tripAlerts = await trafficService.getAlertHistory(trip.id);
                alerts.push(...tripAlerts);
            }
            alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        else {
            alerts = global.recentAlerts || [];
        }
        if (limit) {
            const limitNum = parseInt(limit, 10);
            alerts = alerts.slice(0, limitNum);
        }
        const response = {
            success: true,
            data: alerts
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching alerts:', error);
        const response = {
            success: false,
            error: 'Failed to fetch alerts'
        };
        res.status(500).json(response);
    }
});
exports.default = router;
//# sourceMappingURL=monitoringRoutes.js.map