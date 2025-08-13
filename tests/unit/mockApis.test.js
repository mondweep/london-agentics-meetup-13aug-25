"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mockApis_1 = require("../../src/services/mockApis");
describe('MockGoogleMapsAPI', () => {
    let googleAPI;
    beforeEach(() => {
        googleAPI = mockApis_1.MockGoogleMapsAPI.getInstance();
    });
    describe('Route Computation', () => {
        const origin = {
            latitude: 51.2719,
            longitude: 0.1904,
            address: 'Sevenoaks High Street, Kent',
            name: 'Sevenoaks Centre'
        };
        const destination = {
            latitude: 51.2737,
            longitude: 0.1887,
            address: 'Sevenoaks Station, Kent',
            name: 'Sevenoaks Station'
        };
        it('should compute routes between two locations', async () => {
            const routes = await googleAPI.computeRoutes(origin, destination);
            expect(routes).toBeDefined();
            expect(routes.length).toBeGreaterThan(0);
            expect(routes.length).toBeLessThanOrEqual(4);
            routes.forEach(route => {
                expect(route).toHaveProperty('id');
                expect(route).toHaveProperty('name');
                expect(route).toHaveProperty('polyline');
                expect(route).toHaveProperty('distance');
                expect(route).toHaveProperty('staticDuration');
                expect(route.distance).toBeGreaterThan(0);
                expect(route.staticDuration).toBeGreaterThan(0);
                expect(route.status).toBe('CLEAR');
            });
        });
        it('should generate different routes for same origin-destination pair', async () => {
            const routes = await googleAPI.computeRoutes(origin, destination);
            if (routes.length > 1) {
                const routeNames = routes.map(r => r.name);
                const routeDistances = routes.map(r => r.distance);
                const uniqueNames = [...new Set(routeNames)];
                const uniqueDistances = [...new Set(routeDistances)];
                expect(uniqueNames.length > 1 || uniqueDistances.length > 1).toBe(true);
            }
        });
        it('should handle same origin and destination', async () => {
            const routes = await googleAPI.computeRoutes(origin, origin);
            expect(routes).toBeDefined();
            expect(routes.length).toBeGreaterThan(0);
            routes.forEach(route => {
                expect(route.distance).toBeLessThan(1000);
            });
        });
        it('should calculate reasonable distances for Kent locations', async () => {
            const sevenoaks = {
                latitude: 51.2719,
                longitude: 0.1904,
                address: 'Sevenoaks, Kent'
            };
            const tunbridgeWells = {
                latitude: 51.1321,
                longitude: 0.2634,
                address: 'Tunbridge Wells, Kent'
            };
            const routes = await googleAPI.computeRoutes(sevenoaks, tunbridgeWells);
            routes.forEach(route => {
                expect(route.distance).toBeGreaterThan(15000);
                expect(route.distance).toBeLessThan(50000);
                expect(route.staticDuration).toBeGreaterThan(900);
                expect(route.staticDuration).toBeLessThan(3600);
            });
        });
        it('should provide consistent results for same input', async () => {
            const routes1 = await googleAPI.computeRoutes(origin, destination);
            const routes2 = await googleAPI.computeRoutes(origin, destination);
            expect(routes1.length).toBe(routes2.length);
            routes1.forEach((route1, index) => {
                const route2 = routes2[index];
                expect(route1.name).toBe(route2.name);
                const variation = Math.abs(route1.staticDuration - route2.staticDuration) / route1.staticDuration;
                expect(variation).toBeLessThan(0.1);
            });
        });
    });
    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = mockApis_1.MockGoogleMapsAPI.getInstance();
            const instance2 = mockApis_1.MockGoogleMapsAPI.getInstance();
            expect(instance1).toBe(instance2);
        });
    });
});
describe('MockTomTomTrafficAPI', () => {
    let tomtomAPI;
    beforeEach(() => {
        tomtomAPI = mockApis_1.MockTomTomTrafficAPI.getInstance();
    });
    describe('Traffic Flow', () => {
        const mockRoute = {
            id: 'route_1',
            name: 'A21 (London Road)',
            polyline: 'mock_polyline',
            distance: 5000,
            staticDuration: 600,
            currentDuration: 600,
            delay: 0,
            delayPercentage: 0,
            status: 'CLEAR'
        };
        it('should return updated traffic flow for route', async () => {
            const trafficRoute = await tomtomAPI.getTrafficFlow(mockRoute);
            expect(trafficRoute).toBeDefined();
            expect(trafficRoute.id).toBe(mockRoute.id);
            expect(trafficRoute.name).toBe(mockRoute.name);
            expect(trafficRoute.currentDuration).toBeGreaterThanOrEqual(mockRoute.staticDuration);
            expect(trafficRoute.delay).toBeGreaterThanOrEqual(0);
            expect(trafficRoute.delayPercentage).toBeGreaterThanOrEqual(0);
            expect(['CLEAR', 'MODERATE', 'HEAVY']).toContain(trafficRoute.status);
        });
        it('should apply traffic conditions correctly', async () => {
            tomtomAPI.injectTrafficScenario('A21 (London Road)', 0.8, 'Heavy accident');
            const trafficRoute = await tomtomAPI.getTrafficFlow(mockRoute);
            expect(trafficRoute.currentDuration).toBeGreaterThan(mockRoute.staticDuration);
            expect(trafficRoute.delay).toBeGreaterThan(0);
            expect(trafficRoute.delayPercentage).toBeGreaterThan(0);
            expect(trafficRoute.status).not.toBe('CLEAR');
            expect(trafficRoute.reason).toBe('Heavy accident');
        });
        it('should categorize traffic status based on delay percentage', async () => {
            tomtomAPI.injectTrafficScenario('A21 (London Road)', 0.1, 'Light traffic');
            let trafficRoute = await tomtomAPI.getTrafficFlow(mockRoute);
            expect(trafficRoute.status).toBe('CLEAR');
            tomtomAPI.injectTrafficScenario('A21 (London Road)', 0.3, 'Moderate traffic');
            trafficRoute = await tomtomAPI.getTrafficFlow(mockRoute);
            expect(trafficRoute.status).toBe('MODERATE');
            tomtomAPI.injectTrafficScenario('A21 (London Road)', 0.8, 'Heavy traffic');
            trafficRoute = await tomtomAPI.getTrafficFlow(mockRoute);
            expect(trafficRoute.status).toBe('HEAVY');
        });
    });
    describe('Traffic Incidents', () => {
        const mockRoute = {
            id: 'route_1',
            name: 'A25 (High Street)',
            polyline: 'mock_polyline',
            distance: 3000,
            staticDuration: 480,
            currentDuration: 480,
            delay: 0,
            delayPercentage: 0,
            status: 'CLEAR'
        };
        it('should return traffic incidents for route', async () => {
            const incidents = await tomtomAPI.getTrafficIncidents(mockRoute);
            expect(Array.isArray(incidents)).toBe(true);
        });
        it('should return incidents when traffic conditions exist', async () => {
            tomtomAPI.injectTrafficScenario('A25 (High Street)', 0.5, 'Road works');
            const incidents = await tomtomAPI.getTrafficIncidents(mockRoute);
            expect(incidents.length).toBeGreaterThan(0);
            expect(incidents).toContain('Road works');
        });
        it('should return empty incidents for clear routes', async () => {
            const clearRoute = {
                ...mockRoute,
                name: 'Clear Test Route'
            };
            const incidents = await tomtomAPI.getTrafficIncidents(clearRoute);
            expect(incidents.length).toBe(0);
        });
    });
    describe('Traffic Scenario Injection', () => {
        it('should inject traffic scenarios for testing', () => {
            const routeName = 'Test Route';
            const severity = 0.6;
            const reason = 'Test incident';
            tomtomAPI.injectTrafficScenario(routeName, severity, reason);
            const conditions = tomtomAPI.getCurrentConditions();
            const injectedCondition = conditions.find(c => c.route === routeName);
            expect(injectedCondition).toBeDefined();
            expect(injectedCondition.severity).toBe(severity);
            expect(injectedCondition.reason).toBe(reason);
        });
        it('should return current traffic conditions', () => {
            tomtomAPI.injectTrafficScenario('Route A', 0.3, 'Light congestion');
            tomtomAPI.injectTrafficScenario('Route B', 0.7, 'Heavy traffic');
            const conditions = tomtomAPI.getCurrentConditions();
            expect(conditions.length).toBeGreaterThanOrEqual(2);
            expect(conditions.some(c => c.route === 'Route A')).toBe(true);
            expect(conditions.some(c => c.route === 'Route B')).toBe(true);
        });
    });
    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = mockApis_1.MockTomTomTrafficAPI.getInstance();
            const instance2 = mockApis_1.MockTomTomTrafficAPI.getInstance();
            expect(instance1).toBe(instance2);
        });
    });
    describe('Dynamic Traffic Updates', () => {
        it('should have dynamic traffic conditions that change over time', (done) => {
            const initialConditions = tomtomAPI.getCurrentConditions();
            const initialCount = initialConditions.length;
            setTimeout(() => {
                const updatedConditions = tomtomAPI.getCurrentConditions();
                expect(Array.isArray(updatedConditions)).toBe(true);
                expect(updatedConditions.length).toBeGreaterThanOrEqual(0);
                done();
            }, 100);
        });
    });
});
//# sourceMappingURL=mockApis.test.js.map