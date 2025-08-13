"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const tripRoutes_1 = __importDefault(require("./routes/tripRoutes"));
const demoRoutes_1 = __importDefault(require("./routes/demoRoutes"));
const statusRoutes_1 = __importDefault(require("./routes/statusRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
app.get('/health', (req, res) => {
    const response = {
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date(),
            version: '1.0.0',
            service: 'Pre-Route Traffic Monitoring API'
        },
        message: 'Service is running normally'
    };
    res.json(response);
});
app.use('/api/trips', tripRoutes_1.default);
app.use('/api/status', statusRoutes_1.default);
app.use('/api/demo', demoRoutes_1.default);
app.get('/api-docs', (req, res) => {
    const response = {
        success: true,
        data: {
            service: 'Pre-Route Traffic Monitoring API',
            version: '1.0.0',
            endpoints: {
                health: 'GET /health',
                trips: {
                    list: 'GET /api/trips?userId={id}',
                    get: 'GET /api/trips/{id}',
                    create: 'POST /api/trips',
                    update: 'PUT /api/trips/{id}',
                    delete: 'DELETE /api/trips/{id}',
                    toggle: 'POST /api/trips/{id}/toggle',
                    traffic: 'GET /api/trips/{id}/traffic',
                    monitor: 'POST /api/trips/{id}/monitor',
                    alerts: 'GET /api/trips/{id}/alerts'
                },
                users: {
                    list: 'GET /api/users',
                    get: 'GET /api/users/{id}',
                    create: 'POST /api/users',
                    update: 'PUT /api/users/{id}',
                    delete: 'DELETE /api/users/{id}',
                    settings: 'GET /api/users/{id}/settings',
                    updateSettings: 'PUT /api/users/{id}/settings'
                },
                monitoring: {
                    start: 'POST /api/monitoring/start',
                    stop: 'POST /api/monitoring/stop',
                    status: 'GET /api/monitoring/status',
                    jobs: 'GET /api/monitoring/jobs',
                    simulate: 'POST /api/monitoring/simulate',
                    alerts: 'GET /api/monitoring/alerts'
                },
                notifications: {
                    send: 'POST /api/notifications/send',
                    alert: 'POST /api/notifications/alert',
                    history: 'GET /api/notifications/{userId}',
                    markRead: 'POST /api/notifications/{userId}/mark-read',
                    unread: 'GET /api/notifications/{userId}/unread',
                    clear: 'DELETE /api/notifications/{userId}',
                    test: 'POST /api/notifications/test'
                },
                status: {
                    overview: 'GET /api/status',
                    health: 'GET /api/status/health',
                    monitoring: 'GET /api/status/monitoring',
                    database: 'GET /api/status/database',
                    endpoints: 'GET /api/status/api-endpoints'
                },
                demo: {
                    locations: 'GET /api/demo/locations',
                    setup: 'POST /api/demo/setup',
                    createUser: 'POST /api/demo/create-demo-user',
                    trafficScenario: 'POST /api/demo/traffic-scenario',
                    systemStatus: 'GET /api/demo/system-status',
                    startMonitoringAll: 'POST /api/demo/start-monitoring-all'
                }
            },
            documentation: 'This API provides proactive traffic monitoring for routine journeys in Kent, UK'
        },
        message: 'Pre-Route API v1.0.0 - Ready for traffic intelligence'
    };
    res.json(response);
});
app.use((req, res) => {
    const response = {
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    };
    res.status(404).json(response);
});
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    const response = {
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    };
    res.status(500).json(response);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
app.listen(PORT, () => {
    console.log('🚗 Pre-Route Traffic Monitoring API');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 API documentation: http://localhost:${PORT}/api-docs`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log('🇬🇧 Monitoring Kent traffic for proactive route intelligence');
    if (process.env.NODE_ENV === 'development') {
        console.log('\n📋 Quick Start for Demo:');
        console.log(`   1. Create demo user: POST http://localhost:${PORT}/api/demo/create-demo-user`);
        console.log(`   2. Get locations: GET http://localhost:${PORT}/api/demo/locations`);
        console.log(`   3. Check system status: GET http://localhost:${PORT}/api/demo/system-status`);
        console.log(`   4. Simulate traffic: POST http://localhost:${PORT}/api/demo/traffic-scenario`);
    }
});
exports.default = app;
//# sourceMappingURL=server.js.map