// Simple Node.js server for demo
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simple in-memory storage for demo
let users = new Map();
let trips = new Map();
let alerts = [];

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
      service: 'Pre-Route Traffic Monitoring API'
    },
    message: 'Service is running normally'
  });
});

// Demo: Create user
app.post('/api/demo/create-demo-user', (req, res) => {
  const { persona } = req.body;
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  
  const user = {
    userId,
    persona,
    user: {
      id: userId,
      name: persona === 'chloe' ? 'Chloe Williams' : 'Alex Thompson',
      email: `${persona}-demo@example.com`,
      settings: {
        defaultNavApp: persona === 'chloe' ? 'google_maps' : 'tesla'
      }
    },
    trips: []
  };

  // Create demo trips
  if (persona === 'alex') {
    user.trips = [
      {
        id: 'trip_' + Math.random().toString(36).substr(2, 9),
        name: "Leo's Tuition",
        origin: { latitude: 51.2689, longitude: 0.1845, address: 'Home, Sevenoaks', name: 'Home' },
        destination: { latitude: 51.2745, longitude: 0.1967, address: 'Kumon Centre, Sevenoaks', name: 'Tuition Centre' },
        schedule: { days: [2], windowStart: '16:30', windowEnd: '16:45' },
        alertThreshold: { type: 'MINUTES', value: 10 },
        isActive: true
      },
      {
        id: 'trip_' + Math.random().toString(36).substr(2, 9),
        name: 'School Run',
        origin: { latitude: 51.2689, longitude: 0.1845, address: 'Home, Sevenoaks', name: 'Home' },
        destination: { latitude: 51.2834, longitude: 0.1756, address: 'Knole Academy, Sevenoaks', name: 'School' },
        schedule: { days: [1,2,3,4,5], windowStart: '08:15', windowEnd: '08:30' },
        alertThreshold: { type: 'PERCENTAGE', value: 25 },
        isActive: true
      }
    ];
  } else {
    user.trips = [
      {
        id: 'trip_' + Math.random().toString(36).substr(2, 9),
        name: 'London Commute',
        origin: { latitude: 51.1167, longitude: 0.2267, address: 'Home, Tunbridge Wells', name: 'Home' },
        destination: { latitude: 51.1321, longitude: 0.2634, address: 'TW Station', name: 'Station' },
        schedule: { days: [1,2,4], windowStart: '08:00', windowEnd: '08:15' },
        alertThreshold: { type: 'MINUTES', value: 5 },
        isActive: true
      }
    ];
  }

  users.set(userId, user);
  user.trips.forEach(trip => trips.set(trip.id, { ...trip, userId }));

  res.json({
    success: true,
    data: user,
    message: 'Demo user created successfully'
  });
});

// Start monitoring
app.post('/api/demo/start-monitoring-all', (req, res) => {
  const { userId } = req.body;
  const user = users.get(userId);
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Simulate monitoring jobs
  const jobs = user.trips.length;
  
  // Simulate finding some traffic after 5 seconds
  setTimeout(() => {
    if (Math.random() > 0.5) {
      alerts.push({
        id: 'alert_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        reason: 'Heavy traffic on A21 due to accident near Junction 5',
        delayMinutes: 15,
        triggeredBy: 'A21 (London Road)',
        tripId: user.trips[0].id
      });
    }
  }, 5000);

  res.json({
    success: true,
    data: { monitoringJobs: jobs, userId, activeTrips: jobs },
    message: `Started monitoring ${jobs} active trips`
  });
});

// Traffic scenario simulation
app.post('/api/demo/traffic-scenario', (req, res) => {
  const { routeName, severity, reason } = req.body;
  
  alerts.push({
    id: 'alert_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    reason: `${reason} on ${routeName}`,
    delayMinutes: Math.round(severity * 20),
    triggeredBy: routeName,
    severity
  });

  res.json({
    success: true,
    data: { routeName, severity, reason, timestamp: new Date() },
    message: 'Traffic scenario simulated successfully'
  });
});

// System status
app.get('/api/demo/system-status', (req, res) => {
  const activeJobs = Array.from(users.values()).reduce((sum, user) => sum + user.trips.length, 0);
  const trafficConditions = [
    { route: 'A21 (London Road)', severity: Math.random() * 0.8, reason: 'Variable traffic flow' },
    { route: 'A25 (High Street)', severity: Math.random() * 0.4, reason: 'Light congestion' },
    { route: 'M25 Junction 5', severity: Math.random() * 0.6, reason: 'Moderate delays' }
  ].filter(c => c.severity > 0.2);

  res.json({
    success: true,
    data: {
      activeJobs,
      totalAlerts: alerts.length,
      trafficConditions,
      recentAlerts: alerts.slice(-10).reverse(),
      timestamp: new Date()
    },
    message: 'System status retrieved successfully'
  });
});

// Trip traffic status
app.get('/api/trips/:id/traffic', (req, res) => {
  const trip = trips.get(req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
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
      status: Math.random() > 0.6 ? 'MODERATE' : 'CLEAR'
    },
    {
      id: 'route_2',
      name: 'Via High Street',
      distance: 4800,
      staticDuration: 720,
      currentDuration: 720 + Math.random() * 200,
      delay: Math.random() * 200,
      delayPercentage: Math.random() * 30,
      status: 'CLEAR'
    }
  ];

  res.json({
    success: true,
    data: { trip, routes, lastUpdated: new Date() }
  });
});

// Start monitoring single trip
app.post('/api/trips/:id/monitor', (req, res) => {
  const trip = trips.get(req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  res.json({
    success: true,
    data: { id: 'job_' + Math.random().toString(36).substr(2, 9), tripId: trip.id, status: 'RUNNING' },
    message: 'Monitoring started successfully'
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('🚗 Pre-Route Traffic Monitoring API');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('🇬🇧 Monitoring Kent traffic for proactive route intelligence');
  console.log('\n🎬 Demo Ready! Open browser to http://localhost:3000 and click Demo button');
});