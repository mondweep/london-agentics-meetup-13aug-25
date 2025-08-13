import React from 'react';
import { TripWithStatus, DAY_NAMES } from '../types';

interface TripDetailProps {
  trip: TripWithStatus;
  onBack: () => void;
  onEdit: () => void;
  onNavigate: (routeId: string) => void;
}

const TripDetail: React.FC<TripDetailProps> = ({ trip, onBack, onEdit, onNavigate }) => {
  const formatScheduleDays = () => {
    const days = trip.schedule.days.sort();
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    
    return days.map(day => DAY_NAMES[day]).join(', ');
  };

  const formatTimeWindow = () => {
    return `${trip.schedule.windowStart} - ${trip.schedule.windowEnd}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEAR': return '#28a745';
      case 'MODERATE': return '#ffc107';
      case 'HEAVY': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  return (
    <div className="trip-detail">
      <div className="trip-detail-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <button className="btn btn-secondary" onClick={onEdit}>
          Edit Trip
        </button>
      </div>

      <div className="trip-detail-content">
        <h1 className="trip-name">{trip.name}</h1>
        
        <div className="trip-route-info">
          <p className="route-text">
            <strong>From:</strong> {trip.origin.name || trip.origin.address}
          </p>
          <p className="route-text">
            <strong>To:</strong> {trip.destination.name || trip.destination.address}
          </p>
        </div>

        <div className="trip-schedule-info">
          <h3>Schedule</h3>
          <p><strong>Days:</strong> {formatScheduleDays()}</p>
          <p><strong>Time:</strong> {formatTimeWindow()}</p>
          <p><strong>Alert Threshold:</strong> {trip.alertThreshold.value}
            {trip.alertThreshold.type === 'PERCENTAGE' ? '% increase' : ' minutes delay'}
          </p>
        </div>

        <div className="map-section">
          <h3>Route Map</h3>
          <div className="map-placeholder">
            Map visualization would be displayed here
            <br />
            <small>Integration with Google Maps or similar mapping service</small>
          </div>
        </div>

        <div className="routes-section">
          <h3>Available Routes</h3>
          {trip.currentRoutes && trip.currentRoutes.length > 0 ? (
            <div className="routes-list">
              {trip.currentRoutes.map((route) => (
                <div key={route.id} className="route-item">
                  <div className="route-info">
                    <div className="route-header">
                      <h4 className="route-name">{route.name}</h4>
                      <span 
                        className={`route-status ${route.status.toLowerCase()}`}
                        style={{ backgroundColor: getStatusColor(route.status) }}
                      >
                        {route.status}
                      </span>
                    </div>
                    
                    <div className="route-details">
                      <span>{formatDistance(route.distance)}</span>
                      <span>•</span>
                      <span>
                        {formatDuration(route.currentDuration)}
                        {route.delay > 0 && (
                          <span className="delay-text">
                            {' '}(+{formatDuration(route.delay)} delay)
                          </span>
                        )}
                      </span>
                      {route.reason && (
                        <>
                          <span>•</span>
                          <span className="route-reason">{route.reason}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    className="btn"
                    onClick={() => onNavigate(route.id)}
                  >
                    Navigate
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-routes">
              <p>No route information available at this time.</p>
              <p><small>Routes will be calculated during your scheduled travel window.</small></p>
            </div>
          )}
        </div>

        {trip.lastUpdate && (
          <div className="last-update-info">
            <p><small>Last updated: {new Date(trip.lastUpdate).toLocaleString()}</small></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetail;