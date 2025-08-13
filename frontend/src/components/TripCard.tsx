import React from 'react';
import { TripWithStatus, DAY_NAMES } from '../types';

interface TripCardProps {
  trip: TripWithStatus;
  onClick: (trip: TripWithStatus) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onClick }) => {
  // Calculate current status based on routes
  const getCurrentStatus = () => {
    if (!trip.currentRoutes || trip.currentRoutes.length === 0) {
      return 'CLEAR';
    }
    
    const heavyRoutes = trip.currentRoutes.filter(route => route.status === 'HEAVY');
    const moderateRoutes = trip.currentRoutes.filter(route => route.status === 'MODERATE');
    
    if (heavyRoutes.length > 0) return 'HEAVY';
    if (moderateRoutes.length > 0) return 'MODERATE';
    return 'CLEAR';
  };

  // Get best route travel time
  const getBestTravelTime = () => {
    if (!trip.currentRoutes || trip.currentRoutes.length === 0) {
      return 'N/A';
    }
    
    const bestRoute = trip.currentRoutes.reduce((best, current) => 
      current.currentDuration < best.currentDuration ? current : best
    );
    
    const minutes = Math.round(bestRoute.currentDuration / 60);
    return `${minutes} min`;
  };

  // Get delay information
  const getDelayInfo = () => {
    if (!trip.currentRoutes || trip.currentRoutes.length === 0) {
      return null;
    }
    
    const bestRoute = trip.currentRoutes.reduce((best, current) => 
      current.currentDuration < best.currentDuration ? current : best
    );
    
    if (bestRoute.delay <= 0) {
      return null;
    }
    
    const delayMinutes = Math.round(bestRoute.delay / 60);
    const delayClass = delayMinutes > 15 ? 'delay-critical' : 'delay-warning';
    
    return (
      <span className={`delay-info ${delayClass}`}>
        +{delayMinutes} min delay
      </span>
    );
  };

  // Format schedule days
  const formatScheduleDays = () => {
    const days = trip.schedule.days.sort();
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    
    return days.map(day => DAY_NAMES[day].substring(0, 3)).join(', ');
  };

  // Format time window
  const formatTimeWindow = () => {
    return `${trip.schedule.windowStart} - ${trip.schedule.windowEnd}`;
  };

  const currentStatus = getCurrentStatus();
  const statusClass = `status-${currentStatus.toLowerCase()}`;

  return (
    <div className="trip-card" onClick={() => onClick(trip)}>
      <div className="trip-card-header">
        <div>
          <h3 className="trip-name">{trip.name}</h3>
          <p className="trip-route">
            {trip.origin.name || trip.origin.address} → {trip.destination.name || trip.destination.address}
          </p>
        </div>
        <div className={`status-indicator ${statusClass}`} />
      </div>
      
      <div className="trip-schedule">
        <div className="schedule-days">{formatScheduleDays()}</div>
        <div className="schedule-time">{formatTimeWindow()}</div>
      </div>
      
      <div className="trip-status">
        <div>
          <div className="current-time">{getBestTravelTime()}</div>
          {getDelayInfo()}
        </div>
        <div>
          {trip.isMonitoring && (
            <span className="monitoring-status">Monitoring</span>
          )}
          {!trip.isActive && (
            <span className="inactive-status">Inactive</span>
          )}
        </div>
      </div>
      
      {trip.lastUpdate && (
        <div className="last-update">
          Last updated: {new Date(trip.lastUpdate).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default TripCard;