// Pre-Route Frontend Application with TomTom Integration
class PreRouteApp {
    constructor() {
        this.apiBase = '/api';
        this.currentUser = null;
        this.trips = [];
        this.tomtomKey = null;
        this.map = null;
        this.routeLayers = [];
        this.markers = [];
        this.tripRoutes = new Map();
        this.liveIncidents = [];
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadConfig();
        if (this.tomtomKey) {
            this.initMap();
        }
        this.loadSystemStatus();
        setInterval(() => this.loadSystemStatus(), 30000);
    }

    async loadConfig() {
        try {
            const response = await fetch(`${this.apiBase}/config`);
            const result = await response.json();
            if (result.success && result.data.tomtomApiKey) {
                this.tomtomKey = result.data.tomtomApiKey;
            }
        } catch (error) {
            console.warn('Could not load config, map features disabled:', error);
        }
    }

    initMap() {
        try {
            this.map = tt.map({
                key: this.tomtomKey,
                container: 'map',
                center: [0.19, 51.27],
                zoom: 12,
                stylesVisibility: {
                    trafficFlow: true,
                    trafficIncidents: true
                }
            });

            this.map.addControl(new tt.NavigationControl());

            this.map.on('load', () => {
                document.getElementById('map-status').textContent = 'Live traffic active';
                document.getElementById('map-status').classList.replace('text-gray-400', 'text-green-400');
            });
        } catch (error) {
            console.error('Failed to initialize TomTom map:', error);
            document.getElementById('map-status').textContent = 'Map unavailable';
        }
    }

    bindEvents() {
        document.getElementById('create-alex').addEventListener('click', () => this.createDemoUser('alex'));
        document.getElementById('create-chloe').addEventListener('click', () => this.createDemoUser('chloe'));
        document.getElementById('start-monitoring').addEventListener('click', () => this.startAllMonitoring());
        document.getElementById('simulate-traffic').addEventListener('click', () => this.simulateTrafficIncident());
        document.getElementById('system-status-btn').addEventListener('click', () => this.loadSystemStatus());
        document.getElementById('demo-btn').addEventListener('click', () => this.runFullDemo());
    }

    // --- TomTom Routing ---

    async calculateTripRoute(trip) {
        if (!this.tomtomKey) return null;

        try {
            const locations = `${trip.origin.latitude},${trip.origin.longitude}:${trip.destination.latitude},${trip.destination.longitude}`;
            const response = await tt.services.calculateRoute({
                key: this.tomtomKey,
                locations: locations,
                travelMode: 'car',
                traffic: true,
                computeTravelTimeFor: 'all'
            });

            if (response.routes && response.routes.length > 0) {
                const route = response.routes[0];
                const routeData = {
                    summary: route.summary,
                    points: route.legs[0].points,
                    geojson: response.toGeoJson()
                };
                this.tripRoutes.set(trip.id, routeData);
                return routeData;
            }
        } catch (error) {
            console.error(`Route calculation failed for ${trip.name}:`, error);
        }
        return null;
    }

    async showTripsOnMap() {
        if (!this.map || !this.tomtomKey) return;

        this.clearMap();

        const bounds = new tt.LngLatBounds();
        let hasRoutes = false;

        for (const trip of this.trips) {
            const routeData = await this.calculateTripRoute(trip);
            if (routeData) {
                this.addRouteToMap(trip, routeData);
                routeData.points.forEach(p => bounds.extend([p.longitude, p.latitude]));
                hasRoutes = true;
            }
        }

        if (hasRoutes) {
            this.map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
        }
    }

    addRouteToMap(trip, routeData) {
        const routeId = `route-${trip.id}`;
        const delay = routeData.summary.trafficDelayInSeconds || 0;
        const color = delay > 300 ? '#ef4444' : delay > 120 ? '#f59e0b' : '#22c55e';

        if (this.map.getSource(routeId)) {
            this.map.removeLayer(routeId);
            this.map.removeSource(routeId);
        }

        this.map.addLayer({
            id: routeId,
            type: 'line',
            source: {
                type: 'geojson',
                data: routeData.geojson
            },
            paint: {
                'line-color': color,
                'line-width': 6,
                'line-opacity': 0.8
            }
        });
        this.routeLayers.push(routeId);

        const travelMin = Math.round(routeData.summary.travelTimeInSeconds / 60);
        const delayMin = Math.round(delay / 60);
        const distKm = (routeData.summary.lengthInMeters / 1000).toFixed(1);

        // Origin marker
        const originEl = document.createElement('div');
        originEl.innerHTML = '<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>';
        const originMarker = new tt.Marker({ element: originEl })
            .setLngLat([trip.origin.longitude, trip.origin.latitude])
            .setPopup(new tt.Popup({ offset: 20 }).setHTML(
                `<div style="color:#e5e7eb;padding:4px"><strong>${trip.origin.name}</strong><br><span style="color:#9ca3af;font-size:12px">${trip.origin.address}</span></div>`
            ))
            .addTo(this.map);
        this.markers.push(originMarker);

        // Destination marker
        const destEl = document.createElement('div');
        destEl.innerHTML = '<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>';
        const destMarker = new tt.Marker({ element: destEl })
            .setLngLat([trip.destination.longitude, trip.destination.latitude])
            .setPopup(new tt.Popup({ offset: 20 }).setHTML(
                `<div style="color:#e5e7eb;padding:4px">` +
                `<strong>${trip.destination.name}</strong><br>` +
                `<span style="color:#9ca3af;font-size:12px">${trip.destination.address}</span><br>` +
                `<span style="color:#60a5fa;font-size:12px;margin-top:4px;display:block">` +
                `${travelMin} min &bull; ${distKm} km` +
                (delayMin > 0 ? ` &bull; <span style="color:#f87171">+${delayMin} min delay</span>` : '') +
                `</span></div>`
            ))
            .addTo(this.map);
        this.markers.push(destMarker);
    }

    clearMap() {
        this.routeLayers.forEach(id => {
            if (this.map.getLayer(id)) this.map.removeLayer(id);
            if (this.map.getSource(id)) this.map.removeSource(id);
        });
        this.routeLayers = [];

        this.markers.forEach(m => m.remove());
        this.markers = [];

        this.tripRoutes.clear();
    }

    // --- Live Traffic Data ---

    async loadLiveTrafficFlow() {
        if (!this.tomtomKey) return [];

        const monitoredRoads = [
            { name: 'A21 (London Road)', lat: 51.2715, lon: 0.1900 },
            { name: 'A25 (High Street)', lat: 51.2680, lon: 0.1750 },
            { name: 'M25 Junction 5', lat: 51.2900, lon: 0.1700 },
            { name: 'A21 (Tonbridge Road)', lat: 51.2200, lon: 0.2100 }
        ];

        const results = [];
        for (const road of monitoredRoads) {
            try {
                const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?key=${this.tomtomKey}&point=${road.lat},${road.lon}&unit=KMPH`;
                const response = await fetch(url);
                const data = await response.json();
                if (data.flowSegmentData) {
                    const flow = data.flowSegmentData;
                    const ratio = flow.currentSpeed / flow.freeFlowSpeed;
                    results.push({
                        route: road.name,
                        currentSpeed: Math.round(flow.currentSpeed),
                        freeFlowSpeed: Math.round(flow.freeFlowSpeed),
                        severity: 1 - ratio,
                        confidence: flow.confidence,
                        roadClosure: flow.roadClosure,
                        reason: flow.roadClosure
                            ? 'Road closed'
                            : ratio < 0.3 ? 'Standstill traffic'
                            : ratio < 0.5 ? 'Heavy congestion'
                            : ratio < 0.75 ? 'Moderate congestion'
                            : 'Flowing normally'
                    });
                }
            } catch (error) {
                console.warn(`Flow data failed for ${road.name}:`, error);
            }
        }
        return results;
    }

    async loadLiveIncidents() {
        if (!this.tomtomKey) return [];

        try {
            const bbox = '0.05,51.10,0.35,51.35';
            const fields = encodeURIComponent('{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code,iconCategory},from,to,length,delay,roadNumbers}}}');
            const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${this.tomtomKey}&bbox=${bbox}&fields=${fields}&language=en-GB&timeValidityFilter=present&categoryFilter=0,1,2,3,4,5,6,7,8,9,10,11,14`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.incidents) {
                this.liveIncidents = data.incidents
                    .filter(i => i.properties && i.properties.events && i.properties.events.length > 0)
                    .map(incident => {
                        const props = incident.properties;
                        const delayMin = props.delay ? Math.round(props.delay / 60) : 0;
                        const roads = props.roadNumbers ? props.roadNumbers.join(', ') : '';
                        const desc = props.events.map(e => e.description).join('; ');
                        const categoryNames = [
                            'Unknown', 'Accident', 'Fog', 'Dangerous Conditions',
                            'Rain', 'Ice', 'Jam', 'Lane Closed', 'Road Closed',
                            'Road Works', 'Wind', 'Flooding', '', '', 'Broken Down Vehicle'
                        ];
                        const category = categoryNames[props.iconCategory] || 'Incident';
                        const magnitude = ['Unknown', 'Minor', 'Moderate', 'Major', 'Undefined'];
                        const severity = magnitude[props.magnitudeOfDelay] || 'Unknown';

                        return {
                            id: `incident_${Math.random().toString(36).substr(2, 6)}`,
                            category,
                            severity,
                            magnitudeOfDelay: props.magnitudeOfDelay || 0,
                            description: desc,
                            from: props.from || '',
                            to: props.to || '',
                            roads,
                            delayMinutes: delayMin,
                            timestamp: new Date()
                        };
                    })
                    .sort((a, b) => b.magnitudeOfDelay - a.magnitudeOfDelay);

                return this.liveIncidents;
            }
        } catch (error) {
            console.warn('Failed to load incidents:', error);
        }
        return [];
    }

    // --- Demo Operations ---

    async createDemoUser(persona) {
        try {
            this.showToast('Creating demo user...', 'info');

            const response = await fetch(`${this.apiBase}/demo/create-demo-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ persona })
            });

            const result = await response.json();

            if (result.success) {
                this.currentUser = result.data;
                this.trips = result.data.trips;
                this.showToast(`Demo user ${result.data.user.name} created successfully!`, 'success');
                this.renderUser();
                this.renderTrips();
                await this.showTripsOnMap();
                this.renderTrips(); // Re-render with real ETAs
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.currentUser.userId })
            });

            const result = await response.json();

            if (result.success) {
                this.showToast(`Started monitoring ${result.data.monitoringJobs} trips`, 'success');
                await this.showTripsOnMap();
                this.renderTrips();
                this.loadSystemStatus();
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(incident)
            });

            const result = await response.json();

            if (result.success) {
                this.showToast(`Simulated: ${incident.reason} on ${incident.routeName}`, 'warning');
                this.loadSystemStatus();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    async loadSystemStatus() {
        try {
            // Fetch live TomTom data in parallel with backend status
            const [flowData, incidents] = await Promise.all([
                this.loadLiveTrafficFlow(),
                this.loadLiveIncidents()
            ]);

            // Render live data
            if (flowData.length > 0) {
                this.renderTrafficConditions(flowData);
            }
            if (incidents.length > 0) {
                this.renderLiveIncidents(incidents);
            }

            // Update system info counts
            const activeTrips = this.trips.filter(t => t.isActive).length;
            document.getElementById('active-jobs-count').textContent = activeTrips;
            document.getElementById('total-alerts-count').textContent = incidents.length;
            document.getElementById('traffic-incidents-count').textContent =
                flowData.filter(f => f.severity > 0.25).length;
            document.getElementById('api-calls-count').textContent =
                this.tomtomKey ? 'Live' : 'Demo';
        } catch (error) {
            console.error('Error loading system status:', error);
        }
    }

    async runFullDemo() {
        this.showToast('Running full Pre-Route demo...', 'info');

        await this.createDemoUser('alex');
        await this.delay(2000);

        await this.startAllMonitoring();
        await this.delay(3000);

        await this.simulateTrafficIncident();

        this.showToast('Demo sequence completed! Check the map and alerts.', 'success');
    }

    // --- Rendering ---

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

        container.innerHTML = this.trips.map(trip => {
            const routeData = this.tripRoutes.get(trip.id);
            let etaHtml = '';

            if (routeData) {
                const travelMin = Math.round(routeData.summary.travelTimeInSeconds / 60);
                const noTrafficMin = Math.round(routeData.summary.noTrafficTravelTimeInSeconds / 60);
                const delayMin = Math.round((routeData.summary.trafficDelayInSeconds || 0) / 60);
                const distKm = (routeData.summary.lengthInMeters / 1000).toFixed(1);
                const delayColor = delayMin > 5 ? 'text-red-400' : delayMin > 2 ? 'text-yellow-400' : 'text-green-400';

                etaHtml = `
                    <div class="mt-3 p-2 bg-gray-600 rounded text-xs">
                        <div class="flex justify-between">
                            <span class="text-gray-300"><i class="fas fa-car mr-1"></i> ${travelMin} min (${distKm} km)</span>
                            <span class="${delayColor}">${delayMin > 0 ? '+' + delayMin + ' min delay' : 'No delay'}</span>
                        </div>
                        <div class="text-gray-500 mt-1">Without traffic: ${noTrafficMin} min</div>
                        <div class="text-gray-500">Source: TomTom Live Traffic</div>
                    </div>
                `;
            }

            return `
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

                    ${etaHtml}

                    <div class="mt-4 flex space-x-2">
                        <button onclick="app.getTripTraffic('${trip.id}')"
                                class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs">
                            <i class="fas fa-eye mr-1"></i>Traffic
                        </button>
                        <button onclick="app.showTripOnMap('${trip.id}')"
                                class="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-xs">
                            <i class="fas fa-map-pin mr-1"></i>Show on Map
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTrafficConditions(conditions) {
        const container = document.getElementById('traffic-conditions');

        if (!conditions || conditions.length === 0) {
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
                        <div class="text-sm text-gray-400">${condition.reason}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium">${condition.currentSpeed} / ${condition.freeFlowSpeed} km/h</div>
                    <div class="text-xs text-gray-400">${this.getTrafficStatus(condition.severity)}</div>
                    ${condition.roadClosure ? '<div class="text-xs text-red-400 font-bold">CLOSED</div>' : ''}
                </div>
            </div>
        `).join('');
    }

    renderLiveIncidents(incidents) {
        const container = document.getElementById('alerts-container');

        if (!incidents || incidents.length === 0) {
            container.innerHTML = `
                <div class="text-gray-400 text-center py-4">
                    <i class="fas fa-bell-slash text-3xl mb-3"></i>
                    <p>No active incidents in Kent area</p>
                </div>
            `;
            return;
        }

        container.innerHTML = incidents.slice(0, 8).map(incident => {
            const borderColor = incident.magnitudeOfDelay >= 3 ? 'border-red-400'
                : incident.magnitudeOfDelay >= 2 ? 'border-yellow-400'
                : 'border-blue-400';
            const textColor = incident.magnitudeOfDelay >= 3 ? 'text-red-400'
                : incident.magnitudeOfDelay >= 2 ? 'text-yellow-400'
                : 'text-blue-400';

            return `
                <div class="bg-gray-700 border-l-4 ${borderColor} rounded p-4 mb-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-semibold ${textColor}">${incident.category} - ${incident.severity}</div>
                            <div class="text-sm mt-1">${incident.description}</div>
                            ${incident.from ? `<div class="text-xs text-gray-400 mt-1">From: ${incident.from}${incident.to ? ' to ' + incident.to : ''}</div>` : ''}
                            ${incident.roads ? `<div class="text-xs text-gray-500 mt-1">${incident.roads}</div>` : ''}
                        </div>
                        <div class="text-right ml-4 flex-shrink-0">
                            ${incident.delayMinutes > 0 ? `<div class="text-lg font-bold ${textColor}">+${incident.delayMinutes}min</div>` : ''}
                            <div class="text-xs text-gray-500">TomTom Live</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderSystemStatus(data) {
        document.getElementById('active-jobs-count').textContent = data.activeJobs;
        document.getElementById('total-alerts-count').textContent = data.totalAlerts;
        document.getElementById('traffic-incidents-count').textContent = data.trafficConditions.length;
    }

    // --- Trip Actions ---

    showTripOnMap(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip || !this.map) return;

        const routeData = this.tripRoutes.get(tripId);
        if (routeData) {
            const bounds = new tt.LngLatBounds();
            routeData.points.forEach(p => bounds.extend([p.longitude, p.latitude]));
            this.map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
        } else {
            this.map.flyTo({
                center: [trip.origin.longitude, trip.origin.latitude],
                zoom: 14
            });
        }

        document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
    }

    async getTripTraffic(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) return;

        this.showToast('Loading live traffic for route...', 'info');

        const routeData = this.tripRoutes.get(tripId) || await this.calculateTripRoute(trip);

        if (routeData) {
            this.showTrafficModal(trip, routeData);
        } else {
            this.showToast('Could not load traffic data', 'error');
        }
    }

    showTrafficModal(trip, routeData) {
        const summary = routeData.summary;
        const travelMin = Math.round(summary.travelTimeInSeconds / 60);
        const noTrafficMin = Math.round(summary.noTrafficTravelTimeInSeconds / 60);
        const delayMin = Math.round((summary.trafficDelayInSeconds || 0) / 60);
        const distKm = (summary.lengthInMeters / 1000).toFixed(1);
        const delayPct = noTrafficMin > 0 ? Math.round((delayMin / noTrafficMin) * 100) : 0;

        const departureFmt = summary.departureTime ? new Date(summary.departureTime).toLocaleTimeString() : 'Now';
        const arrivalFmt = summary.arrivalTime ? new Date(summary.arrivalTime).toLocaleTimeString() : '--';

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">${trip.name}</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()"
                            class="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center text-sm text-gray-300">
                        <i class="fas fa-map-marker-alt text-green-400 mr-2"></i>
                        ${trip.origin.name} <i class="fas fa-arrow-right mx-2 text-gray-500"></i> ${trip.destination.name}
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-gray-700 rounded p-3 text-center">
                            <div class="text-2xl font-bold text-blue-400">${travelMin} min</div>
                            <div class="text-xs text-gray-400">Current travel time</div>
                        </div>
                        <div class="bg-gray-700 rounded p-3 text-center">
                            <div class="text-2xl font-bold ${delayMin > 5 ? 'text-red-400' : delayMin > 0 ? 'text-yellow-400' : 'text-green-400'}">
                                ${delayMin > 0 ? '+' + delayMin + ' min' : 'None'}
                            </div>
                            <div class="text-xs text-gray-400">Traffic delay</div>
                        </div>
                        <div class="bg-gray-700 rounded p-3 text-center">
                            <div class="text-2xl font-bold text-gray-300">${distKm} km</div>
                            <div class="text-xs text-gray-400">Distance</div>
                        </div>
                        <div class="bg-gray-700 rounded p-3 text-center">
                            <div class="text-2xl font-bold text-gray-300">${noTrafficMin} min</div>
                            <div class="text-xs text-gray-400">Without traffic</div>
                        </div>
                    </div>

                    <div class="bg-gray-700 rounded p-3">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Departure</span>
                            <span>${departureFmt}</span>
                        </div>
                        <div class="flex justify-between text-sm mt-1">
                            <span class="text-gray-400">Est. Arrival</span>
                            <span>${arrivalFmt}</span>
                        </div>
                        ${delayPct > 0 ? `
                        <div class="mt-2">
                            <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Delay impact</span>
                                <span>${delayPct}% slower</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-2">
                                <div class="h-2 rounded-full ${delayPct > 50 ? 'bg-red-400' : delayPct > 20 ? 'bg-yellow-400' : 'bg-green-400'}"
                                     style="width: ${Math.min(delayPct, 100)}%"></div>
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <div class="text-xs text-gray-500 text-center">
                        Source: TomTom Real-Time Traffic &bull; Updated ${new Date().toLocaleTimeString()}
                    </div>
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
                this.loadSystemStatus();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    // --- Utilities ---

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

        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 100);

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
