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
        const routeCount = distance > 20000 ? 4 : distance > 10000 ? 3 : 2;
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
        const timeBasedScenarios = this.getTimeBasedTrafficScenarios();
        const randomScenarios = this.getRandomTrafficScenarios();
        timeBasedScenarios.forEach(scenario => {
            this.trafficConditions.set(scenario.route, {
                severity: scenario.severity,
                reason: scenario.reason
            });
        });
        randomScenarios.forEach(scenario => {
            if (Math.random() < 0.3) {
                this.trafficConditions.set(scenario.route, {
                    severity: scenario.severity,
                    reason: scenario.reason
                });
            }
        });
    }
    getTimeBasedTrafficScenarios() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        const scenarios = [];
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
                scenarios.push({ route: 'A21 (London Road)', severity: 0.4, reason: 'Rush hour congestion' }, { route: 'M25 Junction 5', severity: 0.6, reason: 'Heavy commuter traffic' }, { route: 'A225 (Dartford Road)', severity: 0.3, reason: 'Morning/evening rush' }, { route: 'A26 (Tonbridge Road)', severity: 0.2, reason: 'Increased traffic volume' });
            }
        }
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            if ((hour === 8) || (hour === 15)) {
                scenarios.push({ route: 'Via Bradbourne Park Road', severity: 0.3, reason: 'School drop-off/pick-up' }, { route: 'A25 (High Street)', severity: 0.2, reason: 'School traffic' }, { route: 'Seal Hollow Road', severity: 0.4, reason: 'Parents dropping children at school' });
            }
        }
        if (dayOfWeek === 6 || dayOfWeek === 0) {
            if (hour >= 10 && hour <= 16) {
                scenarios.push({ route: 'A21 towards Hastings', severity: 0.2, reason: 'Weekend leisure traffic' }, { route: 'Via Knole Park', severity: 0.1, reason: 'Visitors to Knole House' });
            }
        }
        return scenarios;
    }
    getRandomTrafficScenarios() {
        return [
            { route: 'A21 (London Road)', severity: 0.7, reason: 'Multi-vehicle accident near Sevenoaks bypass' },
            { route: 'M25 Junction 5', severity: 0.8, reason: 'Overturned lorry blocking two lanes' },
            { route: 'A25 (High Street)', severity: 0.4, reason: 'Roadworks - temporary traffic lights' },
            { route: 'A225 (Dartford Road)', severity: 0.5, reason: 'Broken down vehicle in outside lane' },
            { route: 'Via Seal Hollow Road', severity: 0.3, reason: 'Tree fallen across carriageway' },
            { route: 'A26 (Tonbridge Road)', severity: 0.6, reason: 'Police incident - lane restrictions' },
            { route: 'Via Bradbourne Park Road', severity: 0.2, reason: 'Utility work causing delays' },
            { route: 'A224 (Polhill)', severity: 0.4, reason: 'Emergency services on scene' },
            { route: 'Via Riverhead', severity: 0.1, reason: 'Local event causing minor delays' },
            { route: 'A21 towards Hastings', severity: 0.5, reason: 'Contraflow system in operation' }
        ];
    }
    updateTrafficConditions() {
        const routes = Array.from(this.trafficConditions.keys());
        routes.forEach(route => {
            const currentCondition = this.trafficConditions.get(route);
            if (currentCondition.severity > 0.1) {
                if (Math.random() < 0.15) {
                    const newSeverity = Math.max(0, currentCondition.severity - Math.random() * 0.2);
                    this.trafficConditions.set(route, {
                        ...currentCondition,
                        severity: newSeverity,
                        reason: newSeverity > 0.1 ? this.updateIncidentReason(currentCondition.reason, 'improving') : undefined
                    });
                }
            }
            if (currentCondition.severity > 0 && currentCondition.severity < 0.8) {
                if (Math.random() < 0.08) {
                    const newSeverity = Math.min(1.0, currentCondition.severity + Math.random() * 0.3);
                    this.trafficConditions.set(route, {
                        ...currentCondition,
                        severity: newSeverity,
                        reason: this.updateIncidentReason(currentCondition.reason, 'worsening')
                    });
                }
            }
        });
        if (Math.random() < 0.08) {
            this.addNewIncident();
        }
        for (const [route, condition] of this.trafficConditions.entries()) {
            if (condition.severity < 0.05) {
                this.trafficConditions.delete(route);
            }
        }
    }
    addNewIncident() {
        const kentIncidents = [
            {
                routes: ['A21 (London Road)', 'M25 Junction 5', 'A225 (Dartford Road)'],
                reasons: [
                    'Vehicle breakdown in outside lane',
                    'Minor collision - debris on road',
                    'Police stopping vehicle',
                    'Broken down HGV causing delays'
                ],
                severityRange: [0.2, 0.6]
            },
            {
                routes: ['A25 (High Street)', 'Via Bradbourne Park Road', 'Seal Hollow Road'],
                reasons: [
                    'Temporary traffic lights installed',
                    'Emergency gas leak - road partially closed',
                    'Water main repair causing delays',
                    'Local event - increased pedestrian activity'
                ],
                severityRange: [0.1, 0.4]
            },
            {
                routes: ['A26 (Tonbridge Road)', 'A224 (Polhill)', 'Via Riverhead'],
                reasons: [
                    'Fallen tree blocking carriageway',
                    'Surface water flooding',
                    'Emergency services attending incident',
                    'Abnormal load requiring escort'
                ],
                severityRange: [0.3, 0.8]
            }
        ];
        const incidentType = kentIncidents[Math.floor(Math.random() * kentIncidents.length)];
        const route = incidentType.routes[Math.floor(Math.random() * incidentType.routes.length)];
        const reason = incidentType.reasons[Math.floor(Math.random() * incidentType.reasons.length)];
        const severity = incidentType.severityRange[0] +
            Math.random() * (incidentType.severityRange[1] - incidentType.severityRange[0]);
        this.trafficConditions.set(route, {
            severity,
            reason
        });
        console.log(`🚨 New traffic incident: ${route} - ${reason} (Severity: ${Math.round(severity * 100)}%)`);
    }
    updateIncidentReason(currentReason, trend) {
        if (!currentReason)
            return 'Traffic incident';
        if (trend === 'improving') {
            if (currentReason.includes('accident'))
                return currentReason + ' - vehicles being moved';
            if (currentReason.includes('breakdown'))
                return currentReason + ' - recovery vehicle on route';
            if (currentReason.includes('roadworks'))
                return currentReason + ' - work progressing';
            return currentReason + ' - situation improving';
        }
        else {
            if (currentReason.includes('accident'))
                return currentReason + ' - causing further delays';
            if (currentReason.includes('breakdown'))
                return currentReason + ' - affecting multiple lanes';
            if (currentReason.includes('roadworks'))
                return currentReason + ' - extended closure';
            return currentReason + ' - delays increasing';
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