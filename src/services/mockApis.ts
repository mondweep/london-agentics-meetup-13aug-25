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
    const routeCount = Math.min(4, Math.floor(Math.random() * 3) + 2);
    
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

  // Simulate dynamic traffic conditions
  private initializeTrafficConditions(): void {
    const scenarios = [
      { route: 'A21 (London Road)', severity: 0.8, reason: 'Accident near Junction 5' },
      { route: 'A25 (High Street)', severity: 0.3, reason: 'Roadworks' },
      { route: 'Via Seal Hollow Road', severity: 0.1, reason: 'Heavy traffic' },
      { route: 'M25 Junction 5', severity: 0.6, reason: 'Vehicle breakdown' }
    ];

    // Apply some random scenarios for demo
    scenarios.forEach(scenario => {
      if (Math.random() < 0.4) { // 40% chance of each scenario being active
        this.trafficConditions.set(scenario.route, {
          severity: scenario.severity,
          reason: scenario.reason
        });
      }
    });
  }

  private updateTrafficConditions(): void {
    // Randomly update traffic conditions to simulate real-time changes
    const routes = Array.from(this.trafficConditions.keys());
    
    routes.forEach(route => {
      if (Math.random() < 0.2) { // 20% chance of condition change
        const currentCondition = this.trafficConditions.get(route)!;
        const newSeverity = Math.max(0, currentCondition.severity + (Math.random() - 0.5) * 0.3);
        
        this.trafficConditions.set(route, {
          ...currentCondition,
          severity: newSeverity
        });
      }
    });

    // Occasionally add new incidents
    if (Math.random() < 0.1) {
      const newIncidents = [
        'Temporary traffic lights',
        'Lane closure',
        'Emergency services on scene',
        'School zone congestion'
      ];
      
      const randomRoute = KENT_ROUTES.PRIMARY_ROADS[Math.floor(Math.random() * KENT_ROUTES.PRIMARY_ROADS.length)];
      const randomReason = newIncidents[Math.floor(Math.random() * newIncidents.length)];
      
      this.trafficConditions.set(randomRoute, {
        severity: Math.random() * 0.5 + 0.2,
        reason: randomReason
      });
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