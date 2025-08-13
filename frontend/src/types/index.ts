// Import types from main types file
import { Trip, Route, TrafficAlert, User } from '../../../src/types';

// Re-export main types
export { Trip, Route, TrafficAlert, User };

// Additional frontend-specific types
export interface TripWithStatus extends Trip {
  currentRoutes?: Route[];
  lastUpdate?: Date;
  isMonitoring?: boolean;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

export interface AppState {
  currentView: 'dashboard' | 'trip-form' | 'trip-detail';
  selectedTrip?: TripWithStatus;
  notifications: NotificationState[];
  isLoading: boolean;
  demoMode: boolean;
  currentUser?: User;
}

export interface TripFormData {
  name: string;
  origin: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };
  schedule: {
    days: number[];
    windowStart: string;
    windowEnd: string;
  };
  alertThreshold: {
    type: 'PERCENTAGE' | 'MINUTES';
    value: number;
  };
}

export interface DemoPersona {
  id: string;
  name: string;
  email: string;
  trips: TripWithStatus[];
}

// Day names for schedule display
export const DAY_NAMES = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// Status colors
export const STATUS_COLORS = {
  CLEAR: '#28a745',
  MODERATE: '#ffc107', 
  HEAVY: '#dc3545'
} as const;