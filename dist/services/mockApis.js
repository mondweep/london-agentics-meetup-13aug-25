"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockTomTomTrafficAPI = exports.MockGoogleMapsAPI = void 0;
const kentLocations_1 = require("../data/kentLocations");
class MockGoogleMapsAPI {
    static getInstance() {
        if (!MockGoogleMapsAPI.instance) {
            MockGoogleMapsAPI.instance = new MockGoogleMapsAPI();
        }
        return MockGoogleMapsAPI.instance;
    }
    async computeRoutes(origin, destination) {
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
        const distance = this.calculateDistance(origin, destination);
        const baseTime = Math.max(300, distance / 1000 * 120);
        const routes = [];
        const routeCount = Math.min(4, Math.floor(Math.random() * 3) + 2);
        for (let i = 0; i < routeCount; i++) {
            const routeName = this.selectRouteName(i);
            const routeVariation = 1 + (Math.random() - 0.5) * 0.3;
            const routeDistance = distance * routeVariation;
            const staticDuration = baseTime * routeVariation;
            routes.push({
                id: `route_${i + 1}`,
                name: routeName,
                polyline: this.generateMockPolyline(origin, destination, i),
                distance: Math.round(routeDistance),
                staticDuration: Math.round(staticDuration),
                currentDuration: Math.round(staticDuration),
                delay: 0,
                delayPercentage: 0,
                status: 'CLEAR'
            });
        }
        return routes;
    }
    calculateDistance(origin, destination) {
        const R = 6371000;
        const lat1 = origin.latitude * Math.PI / 180;
        const lat2 = destination.latitude * Math.PI / 180;
        const deltaLat = (destination.latitude - origin.latitude) * Math.PI / 180;
        const deltaLng = (destination.longitude - origin.longitude) * Math.PI / 180;
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    selectRouteName(index) {
        const allRoutes = [...kentLocations_1.KENT_ROUTES.PRIMARY_ROADS, ...kentLocations_1.KENT_ROUTES.SECONDARY_ROADS];
        return allRoutes[index % allRoutes.length] || `Route ${index + 1}`;
    }
    generateMockPolyline(origin, destination, routeIndex) {
        const variation = routeIndex * 0.001;
        return `polyline_${origin.latitude}_${origin.longitude}_to_${destination.latitude}_${destination.longitude}_variant_${routeIndex}`;
    }
}
exports.MockGoogleMapsAPI = MockGoogleMapsAPI;
class MockTomTomTrafficAPI {
    static getInstance() {
        if (!MockTomTomTrafficAPI.instance) {
            MockTomTomTrafficAPI.instance = new MockTomTomTrafficAPI();
        }
        return MockTomTomTrafficAPI.instance;
    }
    constructor() {
        this.trafficConditions = new Map();
        this.initializeTrafficConditions();
        setInterval(() => this.updateTrafficConditions(), 30000);
    }
    async getTrafficFlow(route) {
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        const routeKey = this.getRouteKey(route);
        const condition = this.trafficConditions.get(routeKey) || { severity: 0 };
        const trafficMultiplier = 1 + condition.severity;
        const currentDuration = Math.round(route.staticDuration * trafficMultiplier);
        const delay = currentDuration - route.staticDuration;
        const delayPercentage = (delay / route.staticDuration) * 100;
        let status = 'CLEAR';
        if (delayPercentage > 50)
            status = 'HEAVY';
        else if (delayPercentage > 20)
            status = 'MODERATE';
        return {
            ...route,
            currentDuration,
            delay,
            delayPercentage,
            status,
            reason: condition.reason
        };
    }
    async getTrafficIncidents(route) {
        await new Promise(resolve => setTimeout(resolve, 150));
        const incidents = [];
        const routeKey = this.getRouteKey(route);
        const condition = this.trafficConditions.get(routeKey);
        if (condition && condition.severity > 0.3 && condition.reason) {
            incidents.push(condition.reason);
        }
        return incidents;
    }
    initializeTrafficConditions() {
        const scenarios = [
            { route: 'A21 (London Road)', severity: 0.8, reason: 'Accident near Junction 5' },
            { route: 'A25 (High Street)', severity: 0.3, reason: 'Roadworks' },
            { route: 'Via Seal Hollow Road', severity: 0.1, reason: 'Heavy traffic' },
            { route: 'M25 Junction 5', severity: 0.6, reason: 'Vehicle breakdown' }
        ];
        scenarios.forEach(scenario => {
            if (Math.random() < 0.4) {
                this.trafficConditions.set(scenario.route, {
                    severity: scenario.severity,
                    reason: scenario.reason
                });
            }
        });
    }
    updateTrafficConditions() {
        const routes = Array.from(this.trafficConditions.keys());
        routes.forEach(route => {
            if (Math.random() < 0.2) {
                const currentCondition = this.trafficConditions.get(route);
                const newSeverity = Math.max(0, currentCondition.severity + (Math.random() - 0.5) * 0.3);
                this.trafficConditions.set(route, {
                    ...currentCondition,
                    severity: newSeverity
                });
            }
        });
        if (Math.random() < 0.1) {
            const newIncidents = [
                'Temporary traffic lights',
                'Lane closure',
                'Emergency services on scene',
                'School zone congestion'
            ];
            const randomRoute = kentLocations_1.KENT_ROUTES.PRIMARY_ROADS[Math.floor(Math.random() * kentLocations_1.KENT_ROUTES.PRIMARY_ROADS.length)];
            const randomReason = newIncidents[Math.floor(Math.random() * newIncidents.length)];
            this.trafficConditions.set(randomRoute, {
                severity: Math.random() * 0.5 + 0.2,
                reason: randomReason
            });
        }
    }
    getRouteKey(route) {
        return route.name;
    }
    injectTrafficScenario(routeName, severity, reason) {
        this.trafficConditions.set(routeName, { severity, reason });
    }
    getCurrentConditions() {
        return Array.from(this.trafficConditions.entries()).map(([route, condition]) => ({
            route,
            ...condition
        }));
    }
}
exports.MockTomTomTrafficAPI = MockTomTomTrafficAPI;
//# sourceMappingURL=mockApis.js.map