import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TripForm from './components/TripForm';
import TripDetail from './components/TripDetail';
import NotificationBanner from './components/NotificationBanner';
import { AppState, TripWithStatus, TripFormData, NotificationState } from './types';
import './styles/main.css';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'dashboard',
    notifications: [],
    isLoading: false,
    demoMode: true, // Start in demo mode
    currentUser: {
      id: 'demo-user',
      email: 'demo@preroute.com',
      name: 'Demo User',
      createdAt: new Date(),
      settings: {
        defaultNavApp: 'Google Maps'
      }
    }
  });

  // Load initial state and check if backend is available
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/health');
      if (response.ok) {
        setAppState(prev => ({ ...prev, demoMode: false }));
        addNotification({
          type: 'success',
          title: 'Connected',
          message: 'Successfully connected to Pre-Route backend'
        });
      }
    } catch (error) {
      // Backend not available, stay in demo mode
      addNotification({
        type: 'info',
        title: 'Demo Mode',
        message: 'Running in demo mode. Start the backend server to enable full functionality.'
      });
    }
  };

  const addNotification = (notification: Omit<NotificationState, 'id' | 'timestamp'>) => {
    const newNotification: NotificationState = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setAppState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));
  };

  const removeNotification = (id: string) => {
    setAppState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  const handleAddTrip = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'trip-form',
      selectedTrip: undefined
    }));
  };

  const handleEditTrip = () => {
    if (appState.selectedTrip) {
      setAppState(prev => ({
        ...prev,
        currentView: 'trip-form'
      }));
    }
  };

  const handleSelectTrip = (trip: TripWithStatus) => {
    setAppState(prev => ({
      ...prev,
      currentView: 'trip-detail',
      selectedTrip: trip
    }));
  };

  const handleBackToDashboard = () => {
    setAppState(prev => ({
      ...prev,
      currentView: 'dashboard',
      selectedTrip: undefined
    }));
  };

  const handleTripSubmit = async (tripData: TripFormData) => {
    setAppState(prev => ({ ...prev, isLoading: true }));

    try {
      if (appState.demoMode) {
        // Demo mode - simulate success
        addNotification({
          type: 'success',
          title: 'Trip Created',
          message: `Successfully created trip "${tripData.name}"`
        });
      } else {
        // Real mode - submit to backend
        const method = appState.selectedTrip ? 'PUT' : 'POST';
        const url = appState.selectedTrip 
          ? `http://localhost:3000/api/trips/${appState.selectedTrip.id}`
          : 'http://localhost:3000/api/trips';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tripData)
        });

        if (response.ok) {
          addNotification({
            type: 'success',
            title: appState.selectedTrip ? 'Trip Updated' : 'Trip Created',
            message: `Successfully ${appState.selectedTrip ? 'updated' : 'created'} trip "${tripData.name}"`
          });
        } else {
          throw new Error('Failed to save trip');
        }
      }

      handleBackToDashboard();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save trip. Please try again.'
      });
    } finally {
      setAppState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleNavigate = (routeId: string) => {
    // In a real app, this would open the user's preferred navigation app
    addNotification({
      type: 'info',
      title: 'Navigation',
      message: 'Opening navigation app...',
      actions: [
        {
          label: 'Google Maps',
          action: () => {
            addNotification({
              type: 'success',
              title: 'Navigation Started',
              message: 'Route opened in Google Maps'
            });
          },
          primary: true
        },
        {
          label: 'Waze',
          action: () => {
            addNotification({
              type: 'success',
              title: 'Navigation Started', 
              message: 'Route opened in Waze'
            });
          }
        }
      ]
    });
  };

  const toggleDemoMode = () => {
    setAppState(prev => ({
      ...prev,
      demoMode: !prev.demoMode,
      currentView: 'dashboard',
      selectedTrip: undefined
    }));

    addNotification({
      type: 'info',
      title: appState.demoMode ? 'Live Mode' : 'Demo Mode',
      message: appState.demoMode 
        ? 'Switched to live mode - connecting to backend'
        : 'Switched to demo mode with sample data'
    });
  };

  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'trip-form':
        return (
          <TripForm
            onSubmit={handleTripSubmit}
            onCancel={handleBackToDashboard}
            initialData={appState.selectedTrip}
            isEditing={!!appState.selectedTrip}
          />
        );

      case 'trip-detail':
        return appState.selectedTrip ? (
          <TripDetail
            trip={appState.selectedTrip}
            onBack={handleBackToDashboard}
            onEdit={handleEditTrip}
            onNavigate={handleNavigate}
          />
        ) : (
          <Dashboard
            onAddTrip={handleAddTrip}
            onSelectTrip={handleSelectTrip}
            demoMode={appState.demoMode}
          />
        );

      case 'dashboard':
      default:
        return (
          <Dashboard
            onAddTrip={handleAddTrip}
            onSelectTrip={handleSelectTrip}
            demoMode={appState.demoMode}
          />
        );
    }
  };

  return (
    <div className="app">
      {/* Notifications */}
      {appState.notifications.map(notification => (
        <NotificationBanner
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      {/* Header */}
      <header className="header">
        <h1>Pre-Route</h1>
        <div className="header-actions">
          {appState.demoMode && (
            <span className="demo-mode">Demo Mode</span>
          )}
          <button 
            className="btn btn-secondary"
            onClick={toggleDemoMode}
          >
            {appState.demoMode ? 'Try Live Mode' : 'Demo Mode'}
          </button>
          {appState.currentUser && (
            <span className="user-info">
              Welcome, {appState.currentUser.name}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {appState.isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          renderCurrentView()
        )}
      </main>
    </div>
  );
};

export default App;