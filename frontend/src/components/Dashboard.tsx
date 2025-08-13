import React, { useState, useEffect } from 'react';
import TripCard from './TripCard';
import { TripWithStatus, DemoPersona } from '../types';

interface DashboardProps {
  onAddTrip: () => void;
  onSelectTrip: (trip: TripWithStatus) => void;
  demoMode: boolean;
}

// Demo personas with sample trips
const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'alex',
    name: 'Alex',
    email: 'alex@example.com',
    trips: [
      {
        id: 'alex-commute',
        userId: 'alex',
        name: 'Daily Commute',
        origin: {
          latitude: 51.2867,
          longitude: 0.3173,
          address: 'Dartford, Kent',
          name: 'Home'
        },
        destination: {
          latitude: 51.5074,
          longitude: -0.1278,
          address: 'London, UK',
          name: 'Office'
        },
        schedule: {
          days: [1, 2, 3, 4, 5], // Weekdays
          windowStart: '08:00',
          windowEnd: '09:00'
        },
        alertThreshold: {
          type: 'PERCENTAGE',
          value: 25
        },
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        currentRoutes: [
          {
            id: 'route-1',
            name: 'M25 via A282',
            polyline: 'dummy_polyline_1',
            distance: 45000,
            staticDuration: 2400, // 40 minutes
            currentDuration: 3600, // 60 minutes
            delay: 1200, // 20 minutes
            delayPercentage: 50,
            status: 'HEAVY',
            reason: 'Accident on M25'
          },
          {
            id: 'route-2',
            name: 'A2 via Blackwall Tunnel',
            polyline: 'dummy_polyline_2',
            distance: 48000,
            staticDuration: 2700, // 45 minutes
            currentDuration: 3300, // 55 minutes
            delay: 600, // 10 minutes
            delayPercentage: 22,
            status: 'MODERATE',
            reason: 'Heavy traffic'
          }
        ],
        lastUpdate: new Date(),
        isMonitoring: true
      },
      {
        id: 'alex-weekend',
        userId: 'alex',
        name: 'Weekend Shopping',
        origin: {
          latitude: 51.2867,
          longitude: 0.3173,
          address: 'Dartford, Kent',
          name: 'Home'
        },
        destination: {
          latitude: 51.4545,
          longitude: -0.9781,
          address: 'Reading, Berkshire',
          name: 'Shopping Centre'
        },
        schedule: {
          days: [6], // Saturday
          windowStart: '10:00',
          windowEnd: '12:00'
        },
        alertThreshold: {
          type: 'MINUTES',
          value: 15
        },
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        currentRoutes: [
          {
            id: 'route-3',
            name: 'M4 Direct',
            polyline: 'dummy_polyline_3',
            distance: 65000,
            staticDuration: 3600, // 60 minutes
            currentDuration: 3720, // 62 minutes
            delay: 120, // 2 minutes
            delayPercentage: 3,
            status: 'CLEAR',
            reason: 'Light traffic'
          }
        ],
        lastUpdate: new Date(),
        isMonitoring: false
      }
    ]
  },
  {
    id: 'chloe',
    name: 'Chloe',
    email: 'chloe@example.com',
    trips: [
      {
        id: 'chloe-work',
        userId: 'chloe',
        name: 'Morning Shift',
        origin: {
          latitude: 51.3707,
          longitude: 0.1090,
          address: 'Bromley, Kent',
          name: 'Home'
        },
        destination: {
          latitude: 51.5074,
          longitude: -0.1278,
          address: 'Central London',
          name: 'Hospital'
        },
        schedule: {
          days: [1, 3, 5], // Monday, Wednesday, Friday
          windowStart: '06:30',
          windowEnd: '07:30'
        },
        alertThreshold: {
          type: 'PERCENTAGE',
          value: 20
        },
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
        currentRoutes: [
          {
            id: 'route-4',
            name: 'A21 to A205',
            polyline: 'dummy_polyline_4',
            distance: 28000,
            staticDuration: 1800, // 30 minutes
            currentDuration: 2400, // 40 minutes
            delay: 600, // 10 minutes
            delayPercentage: 33,
            status: 'MODERATE',
            reason: 'Roadworks on A21'
          }
        ],
        lastUpdate: new Date(),
        isMonitoring: true
      },
      {
        id: 'chloe-gym',
        userId: 'chloe',
        name: 'Evening Gym',
        origin: {
          latitude: 51.3707,
          longitude: 0.1090,
          address: 'Bromley, Kent',
          name: 'Home'
        },
        destination: {
          latitude: 51.4040,
          longitude: 0.0174,
          address: 'Greenwich, London',
          name: 'Fitness Center'
        },
        schedule: {
          days: [2, 4], // Tuesday, Thursday
          windowStart: '18:30',
          windowEnd: '19:30'
        },
        alertThreshold: {
          type: 'MINUTES',
          value: 10
        },
        isActive: true,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date(),
        currentRoutes: [
          {
            id: 'route-5',
            name: 'A222 Direct',
            polyline: 'dummy_polyline_5',
            distance: 12000,
            staticDuration: 900, // 15 minutes
            currentDuration: 900, // 15 minutes
            delay: 0,
            delayPercentage: 0,
            status: 'CLEAR'
          }
        ],
        lastUpdate: new Date(),
        isMonitoring: false
      }
    ]
  }
];

const Dashboard: React.FC<DashboardProps> = ({ onAddTrip, onSelectTrip, demoMode }) => {
  const [trips, setTrips] = useState<TripWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<string>('alex');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Load trips based on demo mode or API
  useEffect(() => {
    const loadTrips = async () => {
      setLoading(true);
      
      if (demoMode) {
        // Use demo data
        const persona = DEMO_PERSONAS.find(p => p.id === selectedPersona);
        setTrips(persona?.trips || []);
      } else {
        // Load from API
        try {
          const response = await fetch('http://localhost:3000/api/trips');
          if (response.ok) {
            const data = await response.json();
            setTrips(data.trips || []);
          }
        } catch (error) {
          console.error('Failed to load trips:', error);
        }
      }
      
      setLoading(false);
    };

    loadTrips();
  }, [demoMode, selectedPersona]);

  // Update trip status periodically
  useEffect(() => {
    if (!demoMode) return; // Only simulate updates in demo mode
    
    const interval = setInterval(() => {
      setTrips(currentTrips => 
        currentTrips.map(trip => ({
          ...trip,
          currentRoutes: trip.currentRoutes?.map(route => ({
            ...route,
            // Simulate minor traffic changes
            currentDuration: route.staticDuration + Math.floor(Math.random() * 600), // +0-10 minutes
            delay: Math.max(0, Math.floor(Math.random() * 900)), // 0-15 minutes
            status: Math.random() > 0.7 ? 'MODERATE' : 
                   Math.random() > 0.9 ? 'HEAVY' : 'CLEAR'
          })),
          lastUpdate: new Date()
        }))
      );
      setLastUpdateTime(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [demoMode]);

  const getTotalTrips = () => trips.length;
  const getActiveTrips = () => trips.filter(trip => trip.isActive).length;
  const getMonitoringTrips = () => trips.filter(trip => trip.isMonitoring).length;

  if (loading) {
    return <div className="loading">Loading trips...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Your Trips</h2>
          <div className="dashboard-stats">
            <span>{getTotalTrips()} trips</span>
            <span>{getActiveTrips()} active</span>
            <span>{getMonitoringTrips()} monitoring</span>
          </div>
        </div>
        
        <div className="dashboard-actions">
          {demoMode && (
            <div className="persona-selector">
              <label>Persona: </label>
              <select 
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="form-input"
                style={{ width: 'auto', marginLeft: '0.5rem' }}
              >
                {DEMO_PERSONAS.map(persona => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button className="btn" onClick={onAddTrip}>
            + Add Trip
          </button>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="empty-state">
          <h3>No trips configured</h3>
          <p>Add your first trip to start monitoring traffic conditions.</p>
          <button className="btn" onClick={onAddTrip}>
            Add Your First Trip
          </button>
        </div>
      ) : (
        <>
          <div className="trips-grid">
            {trips.map(trip => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onClick={onSelectTrip}
              />
            ))}
          </div>
          
          <div className="dashboard-footer">
            <p className="last-update">
              Last updated: {lastUpdateTime.toLocaleTimeString()}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;