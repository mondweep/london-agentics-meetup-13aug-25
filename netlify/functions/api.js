// Netlify serverless function handling all API routes
// Mirrors the logic from server-simple.js for stateless deployment

// In-memory storage (persists across warm invocations only)
let users = new Map();
let trips = new Map();
let alerts = [];

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  };
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

function extractPath(event) {
  // event.path comes as /.netlify/functions/api/... after redirect
  const prefix = '/.netlify/functions/api/';
  if (event.path.startsWith(prefix)) {
    return event.path.slice(prefix.length);
  }
  // Fallback: try rawUrl
  if (event.rawUrl) {
    const url = new URL(event.rawUrl);
    const apiPrefix = '/api/';
    if (url.pathname.startsWith(apiPrefix)) {
      return url.pathname.slice(apiPrefix.length);
    }
    if (url.pathname === '/health') {
      return 'health';
    }
  }
  return event.path.replace(/^\/+/, '');
}

// Route handlers
function handleHealth() {
  return json(200, {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
      service: 'Pre-Route Traffic Monitoring API',
      hosting: 'Netlify',
    },
    message: 'Service is running normally',
  });
}

function handleCreateDemoUser(body) {
  const { persona } = body;
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);

  const user = {
    userId,
    persona,
    user: {
      id: userId,
      name: persona === 'chloe' ? 'Chloe Williams' : 'Alex Thompson',
      email: `${persona}-demo@example.com`,
      settings: {
        defaultNavApp: persona === 'chloe' ? 'google_maps' : 'tesla',
      },
    },
    trips: [],
  };

  if (persona === 'alex') {
    user.trips = [
      {
        id: 'trip_' + Math.random().toString(36).substr(2, 9),
        name: "Leo's Tuition",
        origin: { latitude: 51.2689, longitude: 0.1845, address: 'Home, Sevenoaks', name: 'Home' },
        destination: { latitude: 51.2745, longitude: 0.1967, address: 'Kumon Centre, Sevenoaks', name: 'Tuition Centre' },
        schedule: { days: [2], windowStart: '16:30', windowEnd: '16:45' },
        alertThreshold: { type: 'MINUTES', value: 10 },
        isActive: true,
      },
      {
        id: 'trip_' + Math.random().toString(36).substr(2, 9),
        name: 'School Run',
        origin: { latitude: 51.2689, longitude: 0.1845, address: 'Home, Sevenoaks', name: 'Home' },
        destination: { latitude: 51.2834, longitude: 0.1756, address: 'Knole Academy, Sevenoaks', name: 'School' },
        schedule: { days: [1, 2, 3, 4, 5], windowStart: '08:15', windowEnd: '08:30' },
        alertThreshold: { type: 'PERCENTAGE', value: 25 },
        isActive: true,
      },
    ];
  } else {
    user.trips = [
      {
        id: 'trip_' + Math.random().toString(36).substr(2, 9),
        name: 'London Commute',
        origin: { latitude: 51.1167, longitude: 0.2267, address: 'Home, Tunbridge Wells', name: 'Home' },
        destination: { latitude: 51.1321, longitude: 0.2634, address: 'TW Station', name: 'Station' },
        schedule: { days: [1, 2, 4], windowStart: '08:00', windowEnd: '08:15' },
        alertThreshold: { type: 'MINUTES', value: 5 },
        isActive: true,
      },
    ];
  }

  users.set(userId, user);
  user.trips.forEach((trip) => trips.set(trip.id, { ...trip, userId }));

  return json(200, {
    success: true,
    data: user,
    message: 'Demo user created successfully',
  });
}

function handleStartMonitoringAll(body) {
  const { userId } = body;
  const user = users.get(userId);

  if (!user) {
    return json(404, { success: false, error: 'User not found' });
  }

  const jobs = user.trips.length;

  // Simulate alert generation
  if (Math.random() > 0.5 && user.trips.length > 0) {
    alerts.push({
      id: 'alert_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      reason: 'Heavy traffic on A21 due to accident near Junction 5',
      delayMinutes: 15,
      triggeredBy: 'A21 (London Road)',
      tripId: user.trips[0].id,
    });
  }

  return json(200, {
    success: true,
    data: { monitoringJobs: jobs, userId, activeTrips: jobs },
    message: `Started monitoring ${jobs} active trips`,
  });
}

function handleTrafficScenario(body) {
  const { routeName, severity, reason } = body;

  alerts.push({
    id: 'alert_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    reason: `${reason} on ${routeName}`,
    delayMinutes: Math.round(severity * 20),
    triggeredBy: routeName,
    severity,
  });

  return json(200, {
    success: true,
    data: { routeName, severity, reason, timestamp: new Date() },
    message: 'Traffic scenario simulated successfully',
  });
}

function handleSystemStatus() {
  const activeJobs = Array.from(users.values()).reduce(
    (sum, user) => sum + user.trips.length,
    0
  );

  const trafficConditions = [
    { route: 'A21 (London Road)', severity: Math.random() * 0.8, reason: 'Variable traffic flow' },
    { route: 'A25 (High Street)', severity: Math.random() * 0.4, reason: 'Light congestion' },
    { route: 'M25 Junction 5', severity: Math.random() * 0.6, reason: 'Moderate delays' },
  ].filter((c) => c.severity > 0.2);

  return json(200, {
    success: true,
    data: {
      activeJobs,
      totalAlerts: alerts.length,
      trafficConditions,
      recentAlerts: alerts.slice(-10).reverse(),
      timestamp: new Date(),
    },
    message: 'System status retrieved successfully',
  });
}

function handleTripTraffic(tripId) {
  const trip = trips.get(tripId);
  if (!trip) {
    return json(404, { success: false, error: 'Trip not found' });
  }

  const routes = [
    {
      id: 'route_1',
      name: 'A21 (London Road)',
      distance: 5200,
      staticDuration: 600,
      currentDuration: 600 + Math.random() * 300,
      delay: Math.random() * 300,
      delayPercentage: Math.random() * 50,
      status: Math.random() > 0.6 ? 'MODERATE' : 'CLEAR',
    },
    {
      id: 'route_2',
      name: 'Via High Street',
      distance: 4800,
      staticDuration: 720,
      currentDuration: 720 + Math.random() * 200,
      delay: Math.random() * 200,
      delayPercentage: Math.random() * 30,
      status: 'CLEAR',
    },
  ];

  return json(200, {
    success: true,
    data: { trip, routes, lastUpdated: new Date() },
  });
}

function handleTripMonitor(tripId) {
  const trip = trips.get(tripId);
  if (!trip) {
    return json(404, { success: false, error: 'Trip not found' });
  }

  return json(200, {
    success: true,
    data: {
      id: 'job_' + Math.random().toString(36).substr(2, 9),
      tripId: trip.id,
      status: 'RUNNING',
    },
    message: 'Monitoring started successfully',
  });
}

// Main handler
exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return json(204, '');
  }

  const path = extractPath(event);
  const method = event.httpMethod;
  const body = parseBody(event);

  // Route matching
  if (path === 'config') {
    return json(200, {
      success: true,
      data: {
        tomtomApiKey: process.env.TOMTOM_API_KEY || '',
      },
    });
  }

  if (path === 'health') {
    return handleHealth();
  }

  if (path === 'demo/create-demo-user' && method === 'POST') {
    return handleCreateDemoUser(body);
  }

  if (path === 'demo/start-monitoring-all' && method === 'POST') {
    return handleStartMonitoringAll(body);
  }

  if (path === 'demo/traffic-scenario' && method === 'POST') {
    return handleTrafficScenario(body);
  }

  if (path === 'demo/system-status' && method === 'GET') {
    return handleSystemStatus();
  }

  // Trip routes with path parameters: trips/:id/traffic, trips/:id/monitor
  const tripTrafficMatch = path.match(/^trips\/([^/]+)\/traffic$/);
  if (tripTrafficMatch && method === 'GET') {
    return handleTripTraffic(tripTrafficMatch[1]);
  }

  const tripMonitorMatch = path.match(/^trips\/([^/]+)\/monitor$/);
  if (tripMonitorMatch && method === 'POST') {
    return handleTripMonitor(tripMonitorMatch[1]);
  }

  // API docs
  if (path === '' || path === 'docs') {
    return json(200, {
      success: true,
      data: {
        service: 'Pre-Route Traffic Monitoring API',
        version: '1.0.0',
        hosting: 'Netlify Functions',
        endpoints: {
          health: 'GET /health',
          demo: {
            createUser: 'POST /api/demo/create-demo-user',
            startMonitoring: 'POST /api/demo/start-monitoring-all',
            trafficScenario: 'POST /api/demo/traffic-scenario',
            systemStatus: 'GET /api/demo/system-status',
          },
          trips: {
            traffic: 'GET /api/trips/:id/traffic',
            monitor: 'POST /api/trips/:id/monitor',
          },
        },
      },
      message: 'Pre-Route API v1.0.0 - Hosted on Netlify',
    });
  }

  return json(404, {
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${method} /api/${path}`,
  });
};
