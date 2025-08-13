// Pre-Route Frontend Application
class PreRouteApp {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.currentUser = null;
        this.trips = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSystemStatus();
        setInterval(() => this.loadSystemStatus(), 30000); // Update every 30 seconds
    }

    bindEvents() {
        document.getElementById('create-alex').addEventListener('click', () => this.createDemoUser('alex'));
        document.getElementById('create-chloe').addEventListener('click', () => this.createDemoUser('chloe'));
        document.getElementById('start-monitoring').addEventListener('click', () => this.startAllMonitoring());
        document.getElementById('simulate-traffic').addEventListener('click', () => this.simulateTrafficIncident());
        document.getElementById('system-status-btn').addEventListener('click', () => this.loadSystemStatus());
        document.getElementById('demo-btn').addEventListener('click', () => this.runFullDemo());
    }

    async createDemoUser(persona) {
        try {
            this.showToast('Creating demo user...', 'info');
            
            const response = await fetch(`${this.apiBase}/demo/create-demo-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ persona })
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentUser = result.data;
                this.trips = result.data.trips;
                this.showToast(`Demo user ${result.data.user.name} created successfully!`, 'success');
                this.renderUser();
                this.renderTrips();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    async startAllMonitoring() {
        if (!this.currentUser) {
            this.showToast('Please create a demo user first', 'warning');
            return;
        }

        try {
            this.showToast('Starting monitoring for all trips...', 'info');
            
            const response = await fetch(`${this.apiBase}/demo/start-monitoring-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: this.currentUser.userId })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast(`Started monitoring ${result.data.monitoringJobs} trips`, 'success');
                setTimeout(() => this.loadSystemStatus(), 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    async simulateTrafficIncident() {
        const incidents = [
            { routeName: 'A21 (London Road)', severity: 0.8, reason: 'Major accident near Junction 5' },
            { routeName: 'A25 (High Street)', severity: 0.4, reason: 'Roadworks with temporary lights' },
            { routeName: 'Via Seal Hollow Road', severity: 0.6, reason: 'School zone congestion' },
            { routeName: 'M25 Junction 5', severity: 0.9, reason: 'Multi-vehicle collision' }
        ];

        const incident = incidents[Math.floor(Math.random() * incidents.length)];

        try {
            this.showToast('Simulating traffic incident...', 'info');
            
            const response = await fetch(`${this.apiBase}/demo/traffic-scenario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(incident)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast(`🚨 Simulated: ${incident.reason} on ${incident.routeName}`, 'warning');
                setTimeout(() => this.loadSystemStatus(), 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    async loadSystemStatus() {
        try {
            const response = await fetch(`${this.apiBase}/demo/system-status`);
            const result = await response.json();
            
            if (result.success) {
                this.renderSystemStatus(result.data);
                this.renderTrafficConditions(result.data.trafficConditions);
                this.renderRecentAlerts(result.data.recentAlerts);
            }
        } catch (error) {
            console.error('Error loading system status:', error);
        }
    }

    async runFullDemo() {
        this.showToast('🎬 Running full Pre-Route demo...', 'info');
        
        // Step 1: Create Alex
        await this.createDemoUser('alex');
        await this.delay(2000);
        
        // Step 2: Start monitoring
        await this.startAllMonitoring();
        await this.delay(3000);
        
        // Step 3: Simulate traffic incident
        await this.simulateTrafficIncident();
        
        this.showToast('✅ Demo sequence completed! Monitor the alerts section.', 'success');
    }

    renderUser() {
        const userSection = document.getElementById('current-user');
        const userInfo = document.getElementById('user-info');
        
        if (this.currentUser) {
            userSection.classList.remove('hidden');
            userInfo.innerHTML = `
                <div class="bg-gray-700 rounded p-4">
                    <h3 class="font-semibold text-lg">${this.currentUser.user.name}</h3>
                    <p class="text-gray-300 text-sm">${this.currentUser.user.email}</p>
                    <p class="text-blue-400 text-sm mt-2">Persona: ${this.currentUser.persona}</p>
                </div>
                <div class="bg-gray-700 rounded p-4">
                    <div class="space-y-2">
                        <div><span class="text-gray-400">Default Nav:</span> ${this.currentUser.user.settings.defaultNavApp}</div>
                        <div><span class="text-gray-400">Trips:</span> ${this.trips.length}</div>
                        <div><span class="text-gray-400">User ID:</span> <span class="text-xs text-gray-500">${this.currentUser.userId.slice(0, 8)}...</span></div>
                    </div>
                </div>
            `;
        } else {
            userSection.classList.add('hidden');
        }
    }

    renderTrips() {
        const container = document.getElementById('trips-container');
        
        if (this.trips.length === 0) {
            container.innerHTML = `
                <div class="text-gray-400 text-center py-8 col-span-full">
                    <i class="fas fa-plus-circle text-4xl mb-4"></i>
                    <p>No trips yet. Create a demo user to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.trips.map(trip => `
            <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-semibold text-lg">${trip.name}</h3>
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full ${trip.isActive ? 'bg-green-400' : 'bg-gray-500'}"></div>
                        <span class="text-sm text-gray-400">${trip.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex items-center text-gray-300">
                        <i class="fas fa-map-marker-alt text-green-400 w-4"></i>
                        <span class="ml-2">${trip.origin.name || 'Origin'}</span>
                    </div>
                    <div class="flex items-center text-gray-300">
                        <i class="fas fa-flag-checkered text-red-400 w-4"></i>
                        <span class="ml-2">${trip.destination.name || 'Destination'}</span>
                    </div>
                    <div class="flex items-center text-gray-300">
                        <i class="fas fa-clock text-blue-400 w-4"></i>
                        <span class="ml-2">${this.formatSchedule(trip.schedule)}</span>
                    </div>
                    <div class="flex items-center text-gray-300">
                        <i class="fas fa-bell text-yellow-400 w-4"></i>
                        <span class="ml-2">Alert: ${trip.alertThreshold.value}${trip.alertThreshold.type === 'MINUTES' ? ' min' : '%'} delay</span>
                    </div>
                </div>
                
                <div class="mt-4 flex space-x-2">
                    <button onclick="app.getTripTraffic('${trip.id}')" 
                            class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs">
                        <i class="fas fa-eye mr-1"></i>Traffic
                    </button>
                    <button onclick="app.monitorTrip('${trip.id}')" 
                            class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs">
                        <i class="fas fa-play mr-1"></i>Monitor
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderSystemStatus(data) {
        document.getElementById('active-jobs-count').textContent = data.activeJobs;
        document.getElementById('total-alerts-count').textContent = data.totalAlerts;
        document.getElementById('traffic-incidents-count').textContent = data.trafficConditions.length;
    }

    renderTrafficConditions(conditions) {
        const container = document.getElementById('traffic-conditions');
        
        if (conditions.length === 0) {
            container.innerHTML = `
                <div class="text-gray-400 text-center py-4">
                    <i class="fas fa-road text-3xl mb-3"></i>
                    <p>All routes clear</p>
                </div>
            `;
            return;
        }

        container.innerHTML = conditions.map(condition => `
            <div class="bg-gray-700 rounded p-3 flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 rounded-full ${this.getTrafficColor(condition.severity)}"></div>
                    <div>
                        <div class="font-medium">${condition.route}</div>
                        ${condition.reason ? `<div class="text-sm text-gray-400">${condition.reason}</div>` : ''}
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium">${Math.round(condition.severity * 100)}% impact</div>
                    <div class="text-xs text-gray-400">${this.getTrafficStatus(condition.severity)}</div>
                </div>
            </div>
        `).join('');
    }

    renderRecentAlerts(alerts) {
        const container = document.getElementById('alerts-container');
        
        if (!alerts || alerts.length === 0) {
            container.innerHTML = `
                <div class="text-gray-400 text-center py-4">
                    <i class="fas fa-bell-slash text-3xl mb-3"></i>
                    <p>No recent alerts</p>
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.slice(0, 5).map(alert => `
            <div class="bg-gray-700 border-l-4 border-red-400 rounded p-4 mb-3">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-semibold text-red-400">Traffic Alert</div>
                        <div class="text-sm mt-1">${alert.reason}</div>
                        <div class="text-xs text-gray-400 mt-2">
                            <i class="fas fa-clock mr-1"></i>
                            ${new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-bold text-red-400">+${alert.delayMinutes}min</div>
                        <div class="text-xs text-gray-400">${alert.triggeredBy}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async getTripTraffic(tripId) {
        try {
            this.showToast('Loading traffic status...', 'info');
            
            const response = await fetch(`${this.apiBase}/trips/${tripId}/traffic`);
            const result = await response.json();
            
            if (result.success) {
                this.showTrafficModal(result.data);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    showTrafficModal(data) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">${data.trip.name} - Current Traffic</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                
                <div class="space-y-3">
                    ${data.routes.map(route => `
                        <div class="bg-gray-700 rounded p-4">
                            <div class="flex justify-between items-center">
                                <div>
                                    <div class="font-medium">${route.name}</div>
                                    <div class="text-sm text-gray-400">${Math.round(route.distance / 1000, 1)} km</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-lg font-bold">${Math.round(route.currentDuration / 60)} min</div>
                                    <div class="text-sm ${route.delay > 0 ? 'text-red-400' : 'text-green-400'}">
                                        ${route.delay > 0 ? '+' : ''}${Math.round(route.delay / 60)} min
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <div class="w-4 h-4 rounded-full ${this.getRouteStatusColor(route.status)}"></div>
                                </div>
                            </div>
                            ${route.reason ? `<div class="text-sm text-yellow-400 mt-2">${route.reason}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div class="text-xs text-gray-400 mt-4">
                    Last updated: ${new Date(data.lastUpdated).toLocaleString()}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async monitorTrip(tripId) {
        try {
            this.showToast('Starting trip monitoring...', 'info');
            
            const response = await fetch(`${this.apiBase}/trips/${tripId}/monitor`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast('Trip monitoring started successfully!', 'success');
                setTimeout(() => this.loadSystemStatus(), 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    // Utility methods
    formatSchedule(schedule) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayNames = schedule.days.map(d => days[d]).join(', ');
        return `${dayNames} ${schedule.windowStart}-${schedule.windowEnd}`;
    }

    getTrafficColor(severity) {
        if (severity > 0.7) return 'bg-red-400';
        if (severity > 0.4) return 'bg-yellow-400';
        if (severity > 0.1) return 'bg-orange-400';
        return 'bg-green-400';
    }

    getTrafficStatus(severity) {
        if (severity > 0.7) return 'Heavy';
        if (severity > 0.4) return 'Moderate';
        if (severity > 0.1) return 'Light';
        return 'Clear';
    }

    getRouteStatusColor(status) {
        switch (status) {
            case 'HEAVY': return 'bg-red-400';
            case 'MODERATE': return 'bg-yellow-400';
            case 'CLEAR': return 'bg-green-400';
            default: return 'bg-gray-400';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-600 border-green-500',
            error: 'bg-red-600 border-red-500',
            warning: 'bg-yellow-600 border-yellow-500',
            info: 'bg-blue-600 border-blue-500'
        };

        toast.className = `${colors[type]} border text-white px-6 py-4 rounded shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-3"></i>
                <span>${message}</span>
            </div>
        `;

        document.getElementById('toast-container').appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PreRouteApp();
});