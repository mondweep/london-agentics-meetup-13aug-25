// Mock implementations of Google Maps and TomTom Traffic APIs
import { Location, Route, MockGoogleRoutesResponse, MockTomTomTrafficResponse } from '../types';
import { KENT_ROUTES } from '../data/kentLocations';

export class MockGoogleMapsAPI {
  private static instance: MockGoogleMapsAPI;
  
  public static getInstance(): MockGoogleMapsAPI {
    if (!MockGoogleMapsAPI.instance) {
      MockGoogleMapsAPI.instance = new MockGoogleMapsAPI();
    }
    return MockGoogleMapsAPI.instance;
  }

  async computeRoutes(origin: Location, destination: Location): Promise<Route[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    const distance = this.calculateDistance(origin, destination);
    const baseTime = Math.max(300, distance / 1000 * 120); // ~2 minutes per km minimum
    
    const routes: Route[] = [];
    // Use consistent route count based on distance to avoid test flakiness
    const routeCount = distance > 20000 ? 4 : distance > 10000 ? 3 : 2;
    
    for (let i = 0; i < routeCount; i++) {
      const routeName = this.selectRouteName(i);
      const routeVariation = 1 + (Math.random() - 0.5) * 0.3; // ±15% variation
      const routeDistance = distance * routeVariation;
      const staticDuration = baseTime * routeVariation;
      
      routes.push({
        id: `route_${i + 1}`,
        name: routeName,
        polyline: this.generateMockPolyline(origin, destination, i),
        distance: Math.round(routeDistance),
        staticDuration: Math.round(staticDuration),
        currentDuration: Math.round(staticDuration), // Will be updated by traffic API
        delay: 0,
        delayPercentage: 0,
        status: 'CLEAR'
      });
    }

    return routes;
  }

  private calculateDistance(origin: Location, destination: Location): number {
    // Haversine formula for approximate distance in meters
    const R = 6371000; // Earth's radius in meters
    const lat1 = origin.latitude * Math.PI / 180;
    const lat2 = destination.latitude * Math.PI / 180;
    const deltaLat = (destination.latitude - origin.latitude) * Math.PI / 180;
    const deltaLng = (destination.longitude - origin.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private selectRouteName(index: number): string {
    const allRoutes = [...KENT_ROUTES.PRIMARY_ROADS, ...KENT_ROUTES.SECONDARY_ROADS];
    return allRoutes[index % allRoutes.length] || `Route ${index + 1}`;
  }

  private generateMockPolyline(origin: Location, destination: Location, routeIndex: number): string {
    // Generate a simple mock polyline (in real implementation, this would come from Google)
    const variation = routeIndex * 0.001;
    return `polyline_${origin.latitude}_${origin.longitude}_to_${destination.latitude}_${destination.longitude}_variant_${routeIndex}`;
  }
}

export class MockTomTomTrafficAPI {
  private static instance: MockTomTomTrafficAPI;
  private trafficConditions: Map<string, { severity: number; reason?: string }> = new Map();

  public static getInstance(): MockTomTomTrafficAPI {
    if (!MockTomTomTrafficAPI.instance) {
      MockTomTomTrafficAPI.instance = new MockTomTomTrafficAPI();
    }
    return MockTomTomTrafficAPI.instance;
  }

  constructor() {
    this.initializeTrafficConditions();
    // Update traffic conditions every 30 seconds to simulate real-time changes
    setInterval(() => this.updateTrafficConditions(), 30000);
  }

  async getTrafficFlow(route: Route): Promise<Route> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    const routeKey = this.getRouteKey(route);
    const condition = this.trafficConditions.get(routeKey) || { severity: 0 };
    
    // Apply traffic condition to the route
    const trafficMultiplier = 1 + condition.severity;
    const currentDuration = Math.round(route.staticDuration * trafficMultiplier);
    const delay = currentDuration - route.staticDuration;
    const delayPercentage = (delay / route.staticDuration) * 100;
    
    let status: 'CLEAR' | 'MODERATE' | 'HEAVY' = 'CLEAR';
    if (delayPercentage > 50) status = 'HEAVY';
    else if (delayPercentage > 20) status = 'MODERATE';

    return {
      ...route,
      currentDuration,
      delay,
      delayPercentage,
      status,
      reason: condition.reason
    };
  }

  async getTrafficIncidents(route: Route): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const incidents: string[] = [];
    const routeKey = this.getRouteKey(route);
    const condition = this.trafficConditions.get(routeKey);
    
    if (condition && condition.severity > 0.3 && condition.reason) {
      incidents.push(condition.reason);
    }
    
    return incidents;
  }

  // Simulate dynamic traffic conditions with Kent-specific patterns
  private initializeTrafficConditions(): void {
    const timeBasedScenarios = this.getTimeBasedTrafficScenarios();
    const randomScenarios = this.getRandomTrafficScenarios();
    
    // Apply time-based scenarios (rush hour, school times, etc.)
    timeBasedScenarios.forEach(scenario => {
      this.trafficConditions.set(scenario.route, {
        severity: scenario.severity,
        reason: scenario.reason
      });
    });
    
    // Apply some random scenarios for variety
    randomScenarios.forEach(scenario => {
      if (Math.random() < 0.3) { // 30% chance of each scenario being active
        this.trafficConditions.set(scenario.route, {
          severity: scenario.severity,
          reason: scenario.reason
        });
      }
    });
  }

  // Get time-based traffic scenarios for Kent
  private getTimeBasedTrafficScenarios() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const scenarios = [];

    // Rush hour patterns (7-9 AM, 5-7 PM on weekdays)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        scenarios.push(
          { route: 'A21 (London Road)', severity: 0.4, reason: 'Rush hour congestion' },
          { route: 'M25 Junction 5', severity: 0.6, reason: 'Heavy commuter traffic' },
          { route: 'A225 (Dartford Road)', severity: 0.3, reason: 'Morning/evening rush' },
          { route: 'A26 (Tonbridge Road)', severity: 0.2, reason: 'Increased traffic volume' }
        );
      }
    }

    // School run times (8:15-8:45 AM, 3:00-3:30 PM on weekdays)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if ((hour === 8) || (hour === 15)) {
        scenarios.push(
          { route: 'Via Bradbourne Park Road', severity: 0.3, reason: 'School drop-off/pick-up' },
          { route: 'A25 (High Street)', severity: 0.2, reason: 'School traffic' },
          { route: 'Seal Hollow Road', severity: 0.4, reason: 'Parents dropping children at school' }
        );
      }
    }

    // Weekend leisure traffic patterns
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      if (hour >= 10 && hour <= 16) {
        scenarios.push(
          { route: 'A21 towards Hastings', severity: 0.2, reason: 'Weekend leisure traffic' },
          { route: 'Via Knole Park', severity: 0.1, reason: 'Visitors to Knole House' }
        );
      }
    }

    return scenarios;
  }

  // Get random traffic scenarios typical for Kent
  private getRandomTrafficScenarios() {
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

  private updateTrafficConditions(): void {
    // Simulate realistic traffic condition changes
    const routes = Array.from(this.trafficConditions.keys());
    
    routes.forEach(route => {
      const currentCondition = this.trafficConditions.get(route)!;
      
      // Incidents tend to clear over time
      if (currentCondition.severity > 0.1) {
        if (Math.random() < 0.15) { // 15% chance of improvement
          const newSeverity = Math.max(0, currentCondition.severity - Math.random() * 0.2);
          this.trafficConditions.set(route, {
            ...currentCondition,
            severity: newSeverity,
            reason: newSeverity > 0.1 ? this.updateIncidentReason(currentCondition.reason, 'improving') : undefined
          });
        }
      }
      
      // Some incidents can worsen
      if (currentCondition.severity > 0 && currentCondition.severity < 0.8) {
        if (Math.random() < 0.08) { // 8% chance of worsening
          const newSeverity = Math.min(1.0, currentCondition.severity + Math.random() * 0.3);
          this.trafficConditions.set(route, {
            ...currentCondition,
            severity: newSeverity,
            reason: this.updateIncidentReason(currentCondition.reason, 'worsening')
          });
        }
      }
    });

    // Add new realistic incidents
    if (Math.random() < 0.08) { // 8% chance of new incident
      this.addNewIncident();
    }

    // Clear resolved incidents
    for (const [route, condition] of this.trafficConditions.entries()) {
      if (condition.severity < 0.05) {
        this.trafficConditions.delete(route);
      }
    }
  }

  private addNewIncident(): void {
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

  private updateIncidentReason(currentReason: string | undefined, trend: 'improving' | 'worsening'): string {
    if (!currentReason) return 'Traffic incident';
    
    if (trend === 'improving') {
      if (currentReason.includes('accident')) return currentReason + ' - vehicles being moved';
      if (currentReason.includes('breakdown')) return currentReason + ' - recovery vehicle on route';
      if (currentReason.includes('roadworks')) return currentReason + ' - work progressing';
      return currentReason + ' - situation improving';
    } else {
      if (currentReason.includes('accident')) return currentReason + ' - causing further delays';
      if (currentReason.includes('breakdown')) return currentReason + ' - affecting multiple lanes';
      if (currentReason.includes('roadworks')) return currentReason + ' - extended closure';
      return currentReason + ' - delays increasing';
    }
  }

  private getRouteKey(route: Route): string {
    return route.name;
  }

  // Method to manually inject traffic scenarios for demo purposes
  public injectTrafficScenario(routeName: string, severity: number, reason: string): void {
    this.trafficConditions.set(routeName, { severity, reason });
  }

  public getCurrentConditions(): Array<{route: string, severity: number, reason?: string}> {
    return Array.from(this.trafficConditions.entries()).map(([route, condition]) => ({
      route,
      ...condition
    }));
  }
}