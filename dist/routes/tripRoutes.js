"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tripService_1 = require("../services/tripService");
const trafficMonitoringService_1 = require("../services/trafficMonitoringService");
const router = (0, express_1.Router)();
const tripService = new tripService_1.TripService();
const trafficService = new trafficMonitoringService_1.TrafficMonitoringService();
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            const response = {
                success: false,
                error: 'User ID is required'
            };
            return res.status(400).json(response);
        }
        const trips = await tripService.getTripsByUserId(userId);
        const response = {
            success: true,
            data: trips
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching trips:', error);
        const response = {
            success: false,
            error: 'Failed to fetch trips'
        };
        res.status(500).json(response);
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await tripService.getTripById(id);
        if (!trip) {
            const response = {
                success: false,
                error: 'Trip not found'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: trip
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching trip:', error);
        const response = {
            success: false,
            error: 'Failed to fetch trip'
        };
        res.status(500).json(response);
    }
});
router.post('/', async (req, res) => {
    try {
        const { userId, name, origin, destination, schedule, alertThreshold } = req.body;
        const errors = tripService.validateTripData(req.body);
        if (errors.length > 0) {
            const response = {
                success: false,
                error: 'Validation failed',
                message: errors.join(', ')
            };
            return res.status(400).json(response);
        }
        const trip = await tripService.createTrip(userId, name, origin, destination, schedule, alertThreshold);
        const response = {
            success: true,
            data: trip,
            message: 'Trip created successfully'
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating trip:', error);
        const response = {
            success: false,
            error: 'Failed to create trip'
        };
        res.status(500).json(response);
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (Object.keys(updates).length > 0) {
            const errors = tripService.validateTripData(updates);
            if (errors.length > 0) {
                const response = {
                    success: false,
                    error: 'Validation failed',
                    message: errors.join(', ')
                };
                return res.status(400).json(response);
            }
        }
        const updatedTrip = await tripService.updateTrip(id, updates);
        if (!updatedTrip) {
            const response = {
                success: false,
                error: 'Trip not found'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: updatedTrip,
            message: 'Trip updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating trip:', error);
        const response = {
            success: false,
            error: 'Failed to update trip'
        };
        res.status(500).json(response);
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await tripService.deleteTrip(id);
        if (!success) {
            const response = {
                success: false,
                error: 'Trip not found'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            message: 'Trip deleted successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error deleting trip:', error);
        const response = {
            success: false,
            error: 'Failed to delete trip'
        };
        res.status(500).json(response);
    }
});
router.post('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTrip = await tripService.toggleTripActive(id);
        if (!updatedTrip) {
            const response = {
                success: false,
                error: 'Trip not found'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: updatedTrip,
            message: `Trip ${updatedTrip.isActive ? 'activated' : 'deactivated'} successfully`
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error toggling trip status:', error);
        const response = {
            success: false,
            error: 'Failed to toggle trip status'
        };
        res.status(500).json(response);
    }
});
router.get('/:id/traffic', async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await tripService.getTripById(id);
        if (!trip) {
            const response = {
                success: false,
                error: 'Trip not found'
            };
            return res.status(404).json(response);
        }
        const routes = await trafficService.getCurrentTrafficStatus(trip);
        const response = {
            success: true,
            data: {
                trip,
                routes,
                lastUpdated: new Date()
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching traffic status:', error);
        const response = {
            success: false,
            error: 'Failed to fetch traffic status'
        };
        res.status(500).json(response);
    }
});
router.post('/:id/monitor', async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await tripService.getTripById(id);
        if (!trip) {
            const response = {
                success: false,
                error: 'Trip not found'
            };
            return res.status(404).json(response);
        }
        const job = await trafficService.startMonitoring(trip);
        const response = {
            success: true,
            data: job,
            message: 'Monitoring started successfully'
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
router.get('/:id/alerts', async (req, res) => {
    try {
        const { id } = req.params;
        const alerts = await trafficService.getAlertHistory(id);
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
//# sourceMappingURL=tripRoutes.js.map