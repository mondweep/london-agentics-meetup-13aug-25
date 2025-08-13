

# **Product Requirements Document: Pre-Route**

## **1\. Introduction and Product Vision**

### **1.1 The Problem: The Unpredictability of the Familiar Journey**

The modern suburban landscape, particularly in affluent, car-dependent regions like Kent, presents a unique and frustrating travel paradox. While long-distance commutes are often well-understood and planned for, it is the frequent, short, and seemingly simple local journeys that introduce the most unpredictable friction into daily life. This issue is encapsulated by the common experience of a parent, running on a tight schedule, who gets into their car for a routine 15-minute trip to a child's tuition, only to find themselves stationary in an unexpected traffic jam for twenty minutes. The destination is familiar, the route is second nature, yet the outcome is suddenly and frustratingly out of their control.

This is not an isolated incident but a systemic problem rooted in regional demographics and infrastructure usage. In Kent, known as the "Garden of England," a significant majority of residents—over 71%—use a car as their primary mode of transport for work.1 In commuter towns like Sevenoaks, car ownership is significantly higher than regional and national averages, reflecting a lifestyle built around personal vehicle transport.2 While these towns are popular for their excellent train links to London for long-distance commuters 3, a substantial portion of the workforce also lives and works within the county.1 This creates a high density of local car journeys for work, school runs, shopping, and other personal errands. The result is that major and minor roads are frequently congested not just during traditional rush hours, but throughout the day, making even familiar routes unreliable.

The core pain point extends beyond the mere loss of time. It is the erosion of predictability and the stress induced by a loss of agency over one's own schedule. Research has established links between commuting, stress, and negative impacts on well-being, including risk of depression and difficult family life.4 When this stress is injected into what should be a low-anxiety, routine task, the frustration is amplified. Existing navigation tools are primarily reactive; they are activated at the moment of departure and are designed to find the best route through existing traffic. They do not address the user's need to know

*before they even leave the house* whether their intended route is compromised. This leaves a critical gap for a service that can restore a sense of control by proactively monitoring these vital, routine journeys.

### **1.2 Product Vision: From Reactive Navigation to Proactive Assurance**

The vision for Pre-Route is to fundamentally shift the paradigm of personal travel management from a reactive exercise to a proactive, automated service.

**Vision Statement:** To empower drivers by transforming traffic information from a reactive tool into a proactive, automated travel assistant, eliminating the stress of unexpected delays on familiar journeys.

**Product Mission:** Pre-Route will proactively monitor a user's scheduled, recurring trips. By intelligently fusing real-time traffic data with planned disruption information, it will provide timely, glanceable alerts that recommend *routes to avoid*, giving users the power to make informed decisions *before* they get in the car.

The application is not intended to replace existing in-car navigation systems like Google Maps, Waze, or integrated solutions like Tesla's. Instead, it acts as an intelligent pre-flight check. It offloads the cognitive burden of remembering to check traffic conditions for every trip, automating the process and delivering concise, actionable intelligence at the precise moment it is needed. Its primary output is not a complex set of turn-by-turn directions, but a simple, powerful recommendation: which paths are clear and which should be avoided, and why. This focus on avoidance is a deliberate choice to provide clarity and decisiveness, empowering the user to start their journey with confidence and a pre-selected, reliable route.

### **1.3 Strategic Fit and Opportunity**

The market for digital navigation is mature and dominated by established players. However, their focus remains on on-demand, A-to-B routing for unfamiliar or long-distance travel. Pre-Route identifies and targets a distinct, underserved niche: the automated monitoring of routine, scheduled trips for time-poor, tech-savvy suburbanites.

The opportunity is defined by the specific lifestyle of residents in areas like the Kent commuter belt.3 This demographic, characterized by higher incomes, professional occupations, and family-oriented schedules, places a premium on efficiency and predictability.2 Their daily lives are a series of time-sensitive appointments: school drop-offs, client meetings, train departures, and after-school activities. The failure of existing tools to automate monitoring for these specific, recurring events creates a clear market opening. Pre-Route's value proposition is not about discovering a new city, but about ensuring the five-mile drive to the train station or the local school is as stress-free and predictable as possible. By focusing on this high-value use case, Pre-Route can establish a loyal user base for whom the service becomes an indispensable part of their daily planning routine.

The application's design philosophy—"Building is the new Talking"—means it is conceived from the ground up to be implementation-ready. This document serves as the direct blueprint for an AI-driven or traditional development workflow, enabling the rapid creation of a high-fidelity prototype that can quickly validate the product's strategic fit and user value.

## **2\. User Personas and Key Scenarios**

To ensure the product is laser-focused on solving real-world problems, two primary user personas have been developed based on the demographic and lifestyle data of residents in Kent's commuter towns.

### **2.1 Primary Persona: Alex, The Tech-Savvy Parent**

* **Demographics:** Alex is 45 years old, married with two school-aged children, and lives in a detached home in Sevenoaks. As is typical for the area, his household income is significantly higher than the national average, and he works in a managerial or professional occupation.2 The family owns multiple cars, including a Tesla, reflecting both their affluence and appreciation for technology. Alex is well-educated, holding a university degree, a characteristic common among Sevenoaks residents.2  
* **Goals:** Alex's primary goal is to maintain a smoothly running household schedule. Punctuality for family commitments—school, tuition, sports—is paramount. He seeks to minimize daily stress and maximize personal efficiency, leveraging technology to automate tasks and feel in control of his time.  
* **Frustrations:** His main frustration is the unpredictability of local traffic. A journey that takes 10 minutes one day can take 30 the next, causing a cascade of delays. He is annoyed by the mental overhead of having to manually check traffic conditions on his phone before every single departure, a task he often forgets in the rush to get out of the door. He feels that his existing, sophisticated tools (like his Tesla's navigation) are great once he's on the road but fail to provide the proactive, pre-departure warnings he truly needs.  
* **Technical Aptitude:** High. Alex is an early adopter, comfortable with complex applications, and understands concepts like APIs and AI. He expects a polished, reliable, and aesthetically pleasing user experience that integrates seamlessly into his digital life.

### **2.2 Secondary Persona: Chloe, The Hybrid Professional**

* **Demographics:** Chloe is a 32-year-old single professional who rents a modern apartment in Tunbridge Wells, a vibrant town known for its culture and amenities that attract young professionals.3 She works in a high-demand field, which involves a hybrid schedule: two or three days a week, she commutes by train to her London office, a journey of around 45-55 minutes. On other days, she works from home or drives to local client meetings across Kent.  
* **Goals:** Chloe's main goal is to successfully balance a demanding career with an active social life. This requires meticulous time management. She needs to be on time for her train to London to avoid disrupting her workday, and equally punctual for in-person meetings with local clients. She is conscious of the negative lifestyle impacts of commuting, such as stress and reduced leisure time, and actively seeks ways to optimize her travel.4  
* **Frustrations:** Chloe's key frustration is the "last mile" problem. Getting stuck in an unexpected traffic jam on the way to Tunbridge Wells station can mean missing her peak-time train, causing significant stress and inconvenience. Similarly, unpredictable traffic for local meetings can make her appear unprofessional and disrupt a tightly packed hybrid work schedule. She needs a tool that understands the nuances of her varied travel patterns.

### **2.3 Key Scenario: "The Tuition Run" (Detailed User Journey)**

This scenario illustrates the ideal end-to-end experience for Alex, the primary persona, demonstrating how Pre-Route delivers on its core value proposition.

1. **Setup (One-time Action):** Upon first using Pre-Route, Alex is guided through a quick setup. He creates a new "Monitored Trip."  
   * **Name:** "Leo's Tuition"  
   * **Origin:** "Home" (pre-saved location)  
   * **Destination:** The tuition center's address, entered via search.  
   * **Schedule:** He sets a departure window of Tuesday, 4:30 PM to 4:45 PM.  
   * **Alerts:** He configures the alert threshold to "Notify me if any primary route is more than 15% slower than usual." This entire process takes less than two minutes.  
2. **Monitoring (Automated Background Process):** On Tuesday at 4:15 PM, 15 minutes before the start of Alex's departure window, Pre-Route's backend services automatically initiate a monitoring job for the "Leo's Tuition" trip. The system fetches the three most plausible routes from its routing API and begins polling real-time traffic data sources.  
3. **Alert (Proactive Value Delivery):** At 4:20 PM, the system detects a newly reported accident on the A21, a key artery on one of the primary routes. The real-time travel data shows that the journey time for this route has increased by 35% compared to its historical baseline for this time of day. A rich push notification is immediately sent to Alex's phone:  
   * **Title:** Pre-Route Alert: Leo's Tuition  
   * **Body:** Heads up: Heavy traffic on the A21 due to an accident. Route A is now 25 mins slower. Routes B and C are clear.  
   * **Visual:** The notification includes a small, static map preview showing the congested route highlighted in red and the clear alternatives in green.  
4. **Decision (User Empowerment):** Alex is getting his son ready to leave when he glances at the notification. The information is instantly digestible. He doesn't need to unlock his phone, open an app, and type in a destination. He immediately understands the situation and knows to avoid his usual route. He taps the notification, which opens the Pre-Route app directly to the Trip Detail screen.  
5. **Action (Seamless Handoff):** The Trip Detail screen displays a live map confirming the situation. Below the map are three cards for Route A, B, and C, showing their current travel times. Alex taps the "Navigate with Tesla" button on the card for Route B. Pre-Route uses a deep link to pass the destination and selected route information directly to his car's navigation system.  
6. **Outcome:** Alex and his son get in the car, and the navigation is already set for the optimal, uncongested route. They leave on time, completely bypass the traffic jam, and arrive at the tuition center relaxed and on schedule. The app has successfully prevented a moment of high stress and frustration, delivering its core value proposition perfectly.

### **2.4 Tables to Include**

To provide a clear, scannable reference for the development and design teams, the following table summarizes the key attributes of the target personas.

**Table 2.1: User Persona Summary**

| Persona Name | Key Demographics (Age, Location, Occupation) | Goals | Frustrations | Relevant Data Points |
| :---- | :---- | :---- | :---- | :---- |
| **Alex, The Tech-Savvy Parent** | 45, Sevenoaks, Managerial/Professional | Punctuality for family commitments; minimizing daily stress; maximizing efficiency; feeling in control. | Unpredictable local traffic on short, routine trips; mental overhead of manual traffic checks; lack of proactive warnings from existing tools. | Lives in Sevenoaks 3, high income, well-educated, high car ownership.2 Represents affluent family demographic. |
| **Chloe, The Hybrid Professional** | 32, Tunbridge Wells, Professional | Balancing a demanding job with social life; punctuality for trains and local meetings; reducing commute-related stress. | The "last mile" problem of getting to the station on time; unpredictable traffic disrupting a hybrid work schedule. | Lives in Tunbridge Wells 3, commutes to London by train 1, but also relies on a car for local travel. |

## **3\. Product Epics, Features, and User Stories**

The functionality of the Pre-Route application is organized using the Agile development framework of Epics, Features, and User Stories. This structure ensures that development work is tied directly to user value and provides clear, testable requirements.

### **3.1 Epic 1: Proactive Trip Management**

**Description:** This epic encompasses the core functionalities that allow users to define, schedule, and automate the monitoring of their routine journeys. This is the foundation upon which the application's intelligence is built.

**Feature 1.1: Create and Manage Monitored Trips**

* **User Story:** As Alex, I want to create, save, and name recurring trips (e.g., 'School Run', 'Office Commute', 'Weekly Shop') with a specific origin and destination, so I don't have to enter them manually each time I need to check traffic.  
* **Acceptance Criteria (AC):**  
  1. The user can initiate a "New Trip" creation flow from the main dashboard.  
  2. The user can set an origin and destination by typing an address (with autocomplete), dropping a pin on a map, or selecting from a list of saved "Favorite Places."  
  3. The user must assign a custom name to the trip for easy identification.  
  4. Upon saving, the new trip appears as a distinct card on the main dashboard.  
  5. The user can edit or delete any existing trip from its detail screen or a long-press menu on the dashboard.

**Feature 1.2: Flexible Departure Window Scheduling**

* **User Story:** As Chloe, I want to set a flexible departure window (e.g., 'I need to leave between 8:00 AM and 8:15 AM') and specify the days of the week for each trip, so the app only monitors traffic and sends alerts when it's directly relevant to my hybrid work schedule.  
* **Acceptance Criteria (AC):**  
  1. Within the trip creation/editing flow, the user can access a scheduling screen.  
  2. The user can select a "Departure Window" with a specific start time and end time.  
  3. The user can select the days of the week (Monday through Sunday) on which this trip schedule is active.  
  4. The schedule information (e.g., "Mon, Wed, Fri | 8:00 \- 8:15 AM") is clearly and concisely displayed on the trip's card on the dashboard.  
  5. The system correctly interprets the schedule to trigger automated monitoring only on the selected days and before the specified window.

**Feature 1.3: Automated Traffic Scanning**

* **User Story:** As a user, I want the application to automatically begin scanning for traffic issues a configurable amount of time (e.g., 30 minutes) before my scheduled departure window, so I receive timely alerts with enough time to react without feeling rushed.  
* **Acceptance Criteria (AC):**  
  1. A backend process is reliably triggered for a specific trip based on its schedule (e.g., via a cron job or scheduled serverless function).  
  2. The trigger time is calculated as DepartureWindow.StartTime \- UserDefined.PreScanDuration.  
  3. Upon triggering, the backend service fetches multiple distinct route options from the primary routing API for the trip's origin and destination.  
  4. The service then enters a polling loop, querying the designated real-time traffic and disruption data APIs at a defined interval (e.g., every 2 minutes) until the end of the departure window or until an alert is sent.

### **3.2 Epic 2: Traffic Intelligence & Avoidance Notifications**

**Description:** This epic represents the "brains" of the application. It focuses on analyzing the fused data streams and communicating actionable intelligence to the user in a clear, effective, and non-intrusive manner.

**Feature 2.1: Multi-Route Traffic Visualization**

* **User Story:** As Alex, when I tap on a trip from my dashboard, I want to see a map that clearly displays the top 3-4 plausible routes between my origin and destination, with each route's path color-coded to show its current traffic status (e.g., green for clear, amber for moderate, red for heavy), so I can quickly and visually assess all my options at a glance.  
* **Acceptance Criteria (AC):**  
  1. The Trip Detail screen is dominated by a map view.  
  2. The map displays up to four distinct route polylines fetched from the routing API.  
  3. The color of each polyline is dynamically updated based on the latest traffic data, reflecting congestion levels.  
  4. Below or overlaid on the map, a summary card for each route displays its name (e.g., "Via A21"), the current estimated travel time, and the delay compared to normal (e.g., "+15 min").  
  5. The view is interactive, allowing the user to pan, zoom, and tap on a route to highlight it.

**Feature 2.2: "Routes to Avoid" Recommendations**

* **User Story:** As a user, I want the application's primary recommendation to be an explicit instruction on which routes to *avoid* and a simple reason why (e.g., 'Avoid A21 due to accident, 20 min delay'), so the app's advice is direct, unambiguous, and builds my trust.  
* **Acceptance Criteria (AC):**  
  1. The core backend algorithm compares the current real-time travel time for each route against a stored historical baseline for that specific route at that time of day and day of the week.  
  2. An alert condition is met if the calculated delay (RealTimeTravelTime \- HistoricalBaseline) exceeds a user-configurable threshold for that trip.  
  3. The notification text is dynamically generated to be specific and informative, incorporating the route name and the reason for the delay if available from the incident data API (e.g., "accident," "roadworks," "congestion").  
  4. In the Trip Detail view, the congested route is visually de-emphasized or clearly marked with a warning icon, while the recommended alternative is highlighted.

**Feature 2.3: Smart Notification System**

* **User Story:** As Alex, I want to configure the sensitivity of alerts for each individual trip (e.g., 'For the school run, only notify me for delays over 10 minutes, but for the airport trip, notify me for any delay over 2 minutes'), so I am not bothered by minor, inconsequential fluctuations in traffic and only receive alerts that are truly meaningful to me.  
* **Acceptance Criteria (AC):**  
  1. In the trip settings, the user can set a delay threshold using a simple interface (e.g., a slider or dropdown).  
  2. The threshold can be defined as an absolute value (e.g., 5, 10, 15 minutes) or a percentage increase over the normal travel time (e.g., 20%, 50%).  
  3. The user can configure global "quiet hours" (e.g., 10 PM to 7 AM) to suppress all non-critical notifications.  
  4. Notifications are delivered as rich push notifications on both iOS and Android, including a title, body text, and a small map preview image where supported by the OS.

### **3.3 Epic 3: User Onboarding and Settings**

**Description:** This epic covers the features necessary to ensure a smooth and intuitive first-time user experience, as well as providing users with the control and customization options they need to tailor the app to their specific preferences.

**Feature 3.1: Simplified First-Time Setup**

* **User Story:** As a new user, I want a simple, guided onboarding process that helps me understand the app's purpose and set up my first Monitored Trip in less than two minutes, so I can experience the app's value immediately without a steep learning curve.  
* **Acceptance Criteria (AC):**  
  1. The onboarding flow is initiated on the first launch of the app.  
  2. The flow clearly explains the value proposition and requests necessary permissions (Location Services, Notification Permissions) with a brief explanation of why they are needed.  
  3. The flow guides the user through the process of creating their first trip, potentially pre-filling "Home" or "Work" based on common usage patterns.  
  4. The onboarding process can be skipped and revisited later from the settings menu.

**Feature 3.2: User Profile and Location Management**

* **User Story:** As a user, I want to save key locations like 'Home', 'Work', and 'Kids' School' as named favorites, so I can select them with a single tap when creating new trips instead of typing the address every time.  
* **Acceptance Criteria (AC):**  
  1. A dedicated "Settings" or "Profile" screen is accessible from the main dashboard.  
  2. Within settings, there is a "Favorite Places" section.  
  3. Users can add, name, edit, and delete locations in this list.  
  4. When setting an origin or destination for a trip, these saved favorites appear at the top of the search results for quick access.

**Feature 3.3: Navigation Handoff Configuration**

* **User Story:** As Alex, I want to be able to tap a 'Navigate' button within Pre-Route that seamlessly passes the selected route to my preferred navigation app (Tesla, Google Maps, Waze), so I don't have to manually re-enter the destination and can start my journey immediately.  
* **Acceptance Criteria (AC):**  
  1. The app's settings include a "Default Navigation App" preference.  
  2. The list of available apps is dynamically populated based on the applications installed on the user's device.  
  3. When the user taps the "Navigate" button on a route card, the system constructs and executes the appropriate deep link or intent to open the chosen application with the destination (and if possible, the route) pre-loaded.  
  4. The system gracefully handles cases where the selected default app is no longer installed.

## **4\. Technical Specifications and Data Integration**

The technical architecture of Pre-Route is designed for scalability, reliability, and intelligence. Its effectiveness hinges on a sophisticated data fusion strategy that combines information from multiple best-in-class API sources to create a uniquely comprehensive view of road conditions.

### **4.1 System Architecture**

The system is designed as a classic three-tier architecture, which separates concerns and allows for independent scaling of its components.

1. **Mobile Client (iOS/Android):** This is the user-facing component, built natively for each platform to ensure optimal performance and integration with system features like rich notifications and location services. Its primary responsibilities are rendering the user interface, capturing user input for trip creation and settings, and receiving and displaying push notifications sent from the backend.  
2. **Backend Server (Cloud-Native):** The core logic of the application resides in a serverless, cloud-based backend (e.g., using AWS Lambda, Google Cloud Functions, or similar). This approach is cost-effective and highly scalable, as computational resources are only consumed when monitoring jobs are active. The backend is responsible for:  
   * Secure user authentication and profile management.  
   * Storing and managing user-defined trips, schedules, and preferences in a database (e.g., DynamoDB, Firestore).  
   * Scheduling and executing the automated traffic monitoring jobs.  
   * Interfacing with all external third-party APIs.  
   * Executing the core data fusion and analysis algorithm.  
   * Triggering push notifications via services like Firebase Cloud Messaging (FCM) or Apple Push Notification service (APNs).  
3. **External APIs:** These are the third-party data sources that fuel the application's intelligence. A multi-vendor strategy is employed to leverage the specific strengths of each provider.

### **4.2 API Integration Strategy: A Data Fusion Approach**

The technical centerpiece of Pre-Route is its ability to fuse data from disparate sources into a single, actionable insight. A single API provider is insufficient to deliver the proactive warnings that define the product. The strategy is as follows:

* **Primary Mapping, Geocoding, and Routing:** **Google Maps Platform** will be utilized for its foundational geospatial services. The **Geocoding API** and **Places Autocomplete API** will provide robust address search and validation during trip setup.6 The  
  **Routes API** (computeRoutes endpoint) will be used to generate the initial set of plausible routes for any given origin-destination pair, providing high-quality polylines and, crucially, a staticDuration which serves as the historical baseline for travel time.8 Map tiles from the  
  **Map Tiles API** will be used to render the in-app maps, ensuring a familiar and high-quality visual experience for the user.6  
* **Primary Real-Time Traffic Data:** The **TomTom Traffic API** is selected as the primary source for real-time traffic conditions.11 Its key advantages are a high update frequency (data refreshed every 30 seconds), predictive capabilities based on its vast network of floating car data, and distinct endpoints for Traffic Flow (speeds) and Traffic Incidents (jams, accidents).11 This allows for a granular analysis of current conditions. Furthermore, its generous free tier of 50,000 tile and 2,500 non-tile requests per day is ideal for the initial development, testing, and scaling phases of the application.11  
* **Supplementary Planned Disruption Data:** The **one.network API** provides a critical, forward-looking data layer that sets Pre-Route apart.15 This API aggregates information on planned roadworks, public events, and other scheduled closures from hundreds of UK public authorities and utility companies. By querying this API for disruptions along a planned route, Pre-Route can warn a user about a lane closure scheduled to start at 4:00 PM  
  *before* it has any impact on real-time traffic flow, preventing a predictable delay.  
* **Supplementary Live Disruption Data:** The **National Highways API** offers authoritative, real-time data specifically for England's strategic road network (SRN), which includes motorways and major A-roads.16 This complements the other data sources by providing definitive information on major incidents, full closures, and official diversion routes on the country's most critical transport arteries.

### **4.3 Core Algorithm: Proactive Route Analysis**

The backend logic for a single monitoring job follows a precise, multi-step process:

1. **Trigger:** A scheduled function is invoked for a specific TripID at T-30 minutes (where T is the start of the user's departure window).  
2. **Route Fetching:** The system makes a call to the Google Routes API (computeRoutes) with the trip's origin and destination coordinates. The request specifies provideRouteAlternatives=true. The response contains an array of Route objects. The system stores the polyline and staticDuration for the top 3-4 routes. The staticDuration represents the average travel time independent of current traffic and serves as the crucial baseline for comparison.  
3. **Historical Baseline Establishment:** The fetched staticDuration for each route is stored as the "normal" travel time for this trip at this specific time of day and week. Over time, the system can build its own, more nuanced baseline by averaging these values.  
4. **Data Fusion Polling Loop:** The system initiates a loop that runs every two minutes for the next 25 minutes. In each iteration, it performs the following for each of the stored routes:  
   * **Real-Time Query:** It queries the **TomTom Traffic API** (specifically the Flow and Incident endpoints) using the route's geographic boundaries to get the current, real-time estimated travel time.  
   * **Disruption Query:** It queries the **one.network** and **National Highways** APIs, checking for any active or imminently-starting incidents, roadworks, or closures that spatially intersect with the route's polyline.  
5. **Analysis and Alerting Logic:** After each polling cycle, the system analyzes the newly fetched data:  
   * It calculates the current delay for each route: Delay \= RealTimeTravelTime\_TomTom \- staticDuration\_Google.  
   * It calculates the delay percentage: DelayPercentage=staticDuration(RealTimeTravelTime−staticDuration)​×100.  
   * It checks if the DelayPercentage for any route has crossed the user-defined AlertThreshold for that trip.  
   * **If an alert condition is met and no notification has been sent for this trip instance:**  
     * A push notification is triggered.  
     * The payload for the notification is dynamically constructed, including the name of the congested route, the delay in minutes, the cause (if known from incident data), and the status of the best alternative route.  
     * A flag is set to prevent duplicate notifications for the same event.

### **4.4 Data Models**

The following JSON-like structures define the core data objects to be stored in the application's database.

**User:**

JSON

{  
  "userID": "string (UUID)",  
  "email": "string",  
  "name": "string",  
  "createdAt": "timestamp",  
  "settings": {  
    "defaultNavApp": "string (e.g., 'google\_maps', 'waze', 'tesla')",  
    "quietHours": {  
      "enabled": "boolean",  
      "start": "string (HH:MM)",  
      "end": "string (HH:MM)"  
    }  
  }  
}

**Location (Favorite Place):**

JSON

{  
  "locationID": "string (UUID)",  
  "userID": "string (FK to User)",  
  "name": "string (e.g., 'Home', 'Work')",  
  "address": "string",  
  "latitude": "number",  
  "longitude": "number"  
}

**Trip:**

JSON

{  
  "tripID": "string (UUID)",  
  "userID": "string (FK to User)",  
  "name": "string",  
  "origin": { "lat": "number", "lon": "number", "address": "string" },  
  "destination": { "lat": "number", "lon": "number", "address": "string" },  
  "schedule": {  
    "days":,  
    "windowStart": "string (HH:MM)",  
    "windowEnd": "string (HH:MM)"  
  },  
  "alertThreshold": {  
    "type": "string ('PERCENTAGE' or 'MINUTES')",  
    "value": "number"  
  }  
}

**TrafficAlert (Log):**

JSON

{  
  "alertID": "string (UUID)",  
  "tripID": "string (FK to Trip)",  
  "timestamp": "timestamp",  
  "triggeredBy": "string (Route Name)",  
  "delayMinutes": "number",  
  "reason": "string (e.g., 'ACCIDENT', 'ROADWORKS', 'CONGESTION')",  
  "userAction": "string ('DISMISSED', 'NAVIGATED\_ALTERNATIVE', 'NAVIGATED\_ORIGINAL')"  
}

### **4.5 Tables to Include**

This table formally documents the selection process for the core technology stack, providing a clear rationale for each choice.

**Table 4.1: API Selection and Justification Matrix**

| API Provider | API Function | Data Quality / Update Frequency | UK Coverage | Free Tier / Cost Model | Chosen (Y/N) | Justification & Relevant Data Points |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Google Maps Platform** | Mapping, Geocoding, Routing, Baselines | Excellent, real-time traffic available | Excellent | Freemium model with monthly credits. Routes API is competitive. 6 | **Y** | Industry standard for maps, geocoding, and generating high-quality initial routes. staticDuration is key for baseline. 8 |
| **TomTom** | Real-Time Traffic Flow & Incidents | Excellent, updated every 30 seconds, predictive. 11 | Excellent (80+ countries) 11 | Generous free tier (2,500 non-tile requests/day) ideal for startup phase. 11 | **Y** | Best-in-class for frequent, granular real-time traffic data, which is the core of the analysis loop. 12 |
| **HERE** | Full Suite (Maps, Routing, Traffic) | Good, real-time data updated every 1-2 minutes. 19 | Good | Freemium model available. | **N** | TomTom's higher update frequency and more generous initial free tier were deemed more suitable for the core real-time loop. |
| **Ordnance Survey (OS)** | Mapping, Static Road Network | Authoritative for UK geography, but data is static (updated every 6 months). 20 | UK Only | Free and premium tiers available. 21 | **N** | Lacks the real-time traffic data essential for the application's core function. Not suitable for dynamic routing. 20 |
| **one.network** | Planned Disruptions (Roadworks, Events) | Unique, authoritative source for future/planned works. | Great Britain | Enterprise/Commercial API. | **Y** | Critical differentiator. Provides the proactive, forward-looking data that standard traffic APIs lack. 15 |
| **National Highways** | Live SRN Incidents, Closures, Flow | Authoritative for major UK roads. Real-time. 17 | England's Strategic Road Network | Free, open data API. 16 | **Y** | Provides a definitive, official data layer for major incidents on the most important roads, complementing other sources. 17 |

## **5\. User Experience (UX) and Interface (UI) Design**

The design of Pre-Route must be meticulously crafted to deliver information with extreme clarity and efficiency. The user is often in a transitional state—preparing to leave home or the office—and does not have the time or attention for a complex interface. The UX and UI will therefore be guided by principles of minimalism and directness.

### **5.1 Design Principles**

* **Glanceable:** The most critical information must be understood in under five seconds. This will be achieved through a strong visual hierarchy, clear iconography, and a simple color-coding system (Red/Amber/Green). The design will prioritize scannability over data density, adhering to best practices for dashboards that lead with key data.23  
* **Action-Oriented:** Every screen and every notification must guide the user toward a clear, simple decision. The primary call-to-action will always be prominent, whether it's "Add a Trip," "View Details," or "Navigate with...".  
* **Trustworthy:** The design must project an aura of professionalism, reliability, and data-driven accuracy. A clean, modern aesthetic, consistent typography, and fluid animations will contribute to a perception of quality and build user trust in the app's recommendations.  
* **Minimalist:** Clutter is the enemy. The interface will be stripped of all non-essential elements. Ample white space will be used to allow the important data to stand out, preventing cognitive overload for a user who is likely multitasking.23

### **5.2 Information Architecture**

The application's structure will be simple and shallow, allowing users to access any key function within two taps from the main screen.

* Launch \-\> **Dashboard Screen** (Primary View)  
  * Tap 'Add Trip' Button \-\> **New Trip Screen**  
  * Tap Trip Card \-\> **Trip Detail Screen**  
  * Tap Settings Icon \-\> **Settings Screen**  
    * Settings \-\> Favorite Places  
    * Settings \-\> Default Navigation App  
* Push Notification \-\> **Trip Detail Screen** (Deep Link)

This flat hierarchy ensures that users can quickly navigate to the information they need without getting lost in complex menus, a key principle of good mobile UI design.24

### **5.3 Wireframes and Mockups**

The following descriptions outline the visual design and layout of the application's key screens, drawing inspiration from clean, modern traffic and route planning app designs.25 A dark theme will be prioritized to reduce glare and improve readability, a common feature in navigation-related UIs.29

**Screen 5.3.1: The Dashboard**

* **Layout:** A clean, vertically scrolling list of large, tappable cards against a dark background. A prominent floating action button (+) at the bottom right allows for the creation of a new trip. A settings icon is in the top-right corner.  
* **Trip Card Content:** Each card represents one "Monitored Trip."  
  * **Top Left:** The trip name in a bold, large font (e.g., "Leo's Tuition").  
  * **Below Name:** The trip schedule in a smaller, lighter font (e.g., "Tuesdays, 4:30 PM \- 4:45 PM").  
  * **Right Side:** A large, circular status indicator, which is the most dominant element on the card. Its color instantly communicates the trip's status:  
    * **Green:** All clear. Estimated travel times are within normal range.  
    * **Amber:** Minor delays. One route is congested, but good alternatives are available.  
    * **Red:** Significant delays. Action is recommended.  
  * **Bottom:** A subtle text label showing the best current travel time (e.g., "Currently 12 mins via A264").

**Screen 5.3.2: The Trip Detail Screen**

* **Layout:** A map-centric design. The top 60% of the screen is a live map view (using Google Maps tiles). The bottom 40% is a slidable panel containing route details.  
* **Map View:**  
  * Displays the origin and destination pins.  
  * The top 3-4 routes are rendered as polylines.  
  * The polylines are color-coded based on real-time traffic data from TomTom, providing a visual representation of congestion. The congested route is shown in red, while clear alternatives are green or blue.  
* **Detail Panel:**  
  * A vertically scrolling list of cards, one for each route.  
  * Each route card clearly displays:  
    * **Route Name:** A simple identifier (e.g., "Via A21" or "Main Street").  
    * **Travel Time:** The current estimated travel time in a large, bold font.  
    * **Delay Information:** A colored label showing the delay vs. normal (e.g., "+15 min" in red text).  
    * **Call to Action:** A prominent button labeled "Navigate with" that initiates the handoff.

**Screen 5.3.3: Notification Design**

* **Type:** Rich Push Notifications for both iOS and Android to leverage visual previews.  
* **Structure:**  
  * **App Icon & Name:** Pre-Route  
  * **Title:** Alert: (e.g., "Alert: Leo's Tuition")  
  * **Body:** is slower due to. is clear. (e.g., "A21 is 25 min slower due to an accident. Route via A264 is clear.")  
  * **Attachment:** A small, static map image generated by the backend, visually showing the congested route in red and the clear route in green. This provides immediate context without requiring the user to open the app.

**Screen 5.3.4: Onboarding Flow**

* **Layout:** A simple, full-screen, multi-page carousel that the user swipes through.  
* **Screen 1: Welcome.** A clean screen with the app logo and a concise value proposition: "Never get stuck in unexpected traffic again. Pre-Route proactively monitors your trips for you."  
* **Screen 2: Permissions.** A clear explanation of why Location and Notification permissions are essential for the app to function, followed by the native OS permission prompts.  
* **Screen 3: First Trip Setup.** A guided, step-by-step form to create the first Monitored Trip, with helpful tooltips and pre-filled suggestions to make the process as frictionless as possible.

## **6\. Measurement, KPIs, and Success Metrics**

### **6.1 Guiding Philosophy: Measuring Value, Not Just Usage**

The success of Pre-Route will not be measured by vanity metrics like downloads or daily active users alone. While these are important health indicators, the primary focus will be on quantifying the core value delivered to the user: demonstrably saving them time and reducing travel-related stress. The Key Performance Indicator (KPI) framework is designed to measure this value directly, blending behavioral metrics (what users do) with attitudinal metrics (how users feel).30

### **6.2 Product Success & User Value KPIs**

These are the most important metrics, as they directly reflect the app's ability to solve the user's problem.

* **Primary (Value) KPIs:**  
  * **Alert Efficacy Rate (Custom KPI):** This is the ultimate measure of whether users trust the app's recommendations. It is calculated as the percentage of "Red" or "Amber" alerts that result in the user tapping the "Navigate" button for a *recommended alternative* route. A high rate indicates that the alerts are timely, credible, and actionable.  
    * *Calculation:* (Number of 'Navigate Alternative' Clicks / Total 'Red' or 'Amber' Alerts Sent) \* 100  
    * *Target (First 6 Months):* \> 60%  
  * **Estimated Time Saved (Custom KPI):** This metric quantifies the tangible benefit for the user. For every instance where the Alert Efficacy Rate is positive (i.e., the user chose an alternative), the backend will log the estimated time saved. This value is aggregated to provide a powerful demonstration of the app's utility.  
    * *Calculation:* Σ (Travel Time of Avoided Congested Route \- Actual Travel Time of Chosen Route)  
    * *Target (First 6 Months):* Average \> 5 minutes saved per active user per week.  
  * **Customer Satisfaction (CSAT):** A simple, direct measure of user sentiment. Periodically, the app will present a non-intrusive, single-question survey: "Did Pre-Route help you avoid traffic this week?" with "Yes" or "No" options.  
    * *Calculation:* (Number of 'Yes' Responses / Total Responses) \* 100  
    * *Target (First 6 Months):* \> 80% "Yes" responses.30  
  * **Net Promoter Score (NPS):** This measures user loyalty and the likelihood of organic growth. Users are asked, "On a scale of 0-10, how likely are you to recommend Pre-Route to a friend or colleague?"  
    * *Calculation:* (% Promoters) \- (% Detractors)  
    * *Target (First 6 Months):* \> 40\.30  
* **Secondary (Health) KPIs:**  
  * **Retention Rate (Day 7, Day 30):** This is the ultimate indicator of sustained product value. If users continue to use the app after the first week and first month, it has become part of their routine.  
    * *Target:* D7 \> 40%, D30 \> 25%.32  
  * **Stickiness Ratio (DAU/MAU):** This measures the frequency of engagement. For a utility app like Pre-Route, a user might not open it every day, but a healthy ratio indicates it is being used regularly for its intended purpose.  
    * *Calculation:* (Daily Active Users / Monthly Active Users) \* 100  
    * *Target:* \> 20%.31  
  * **Churn Rate:** The percentage of users who stop using the app per month. This must be kept low to ensure sustainable growth.  
    * *Target:* \< 5% per month.32

### **6.3 Technical Performance KPIs**

The user's trust in the app is directly tied to its technical performance. Sluggishness or instability will quickly erode confidence in its recommendations.

* **API Latency:** The average response time for all calls made to external APIs (TomTom, Google, etc.). This is critical for the speed of the analysis loop.  
  * *Target:* \< 500ms.34  
* **App Load Time:** The time from the user tapping the app icon to the dashboard being fully rendered and interactive.  
  * *Target:* \< 2 seconds.33  
* **Crash-Free Session Rate:** The percentage of user sessions that complete without a crash. This is a fundamental measure of app stability.  
  * *Target:* \> 99.5%.33  
* **Notification Delivery Latency:** The time elapsed from the backend system triggering an alert to the notification appearing on the user's device. This must be minimal for the alert to be timely.  
  * *Target:* \< 10 seconds.

### **6.4 Tables to Include**

This table provides an actionable plan for tracking success from launch, ensuring the entire team is aligned on what defines a successful product.

**Table 6.1: KPI Measurement and Goal Plan**

| KPI Name | KPI Category | Definition | Calculation Formula | Target (First 6 Months) | Measurement Tool |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Alert Efficacy Rate** | Primary Value | % of actionable alerts that result in the user choosing an alternative route. | (Alternative Navigations / Actionable Alerts) \* 100 | \> 60% | Custom Backend Analytics |
| **Estimated Time Saved** | Primary Value | Aggregate time saved by users who acted on alerts. | Σ (Avoided Delay \- Actual Delay) | \> 5 min/user/week | Custom Backend Analytics |
| **CSAT** | Attitudinal Value | % of users reporting the app helped them avoid traffic. | (Positive Responses / Total Responses) \* 100 | \> 80% | In-App Survey Tool |
| **NPS** | Attitudinal Value | User likelihood to recommend the app. | (% Promoters) \- (% Detractors) | \> 40 | In-App Survey Tool |
| **Day 30 Retention Rate** | Product Health | % of users who return 30 days after first launch. | (Users active on D30 / Users on D0) \* 100 | \> 25% | Firebase / Mixpanel |
| **Stickiness Ratio** | Product Health | Frequency of use by monthly active users. | (DAU / MAU) \* 100 | \> 20% | Firebase / Mixpanel |
| **Crash-Free Rate** | Technical Performance | % of sessions without a crash. | (1 \- (Crashes / Sessions)) \* 100 | \> 99.5% | Firebase Crashlytics |
| **API Latency** | Technical Performance | Average response time from third-party APIs. | Average(Response Time) | \< 500ms | Backend Monitoring (e.g., CloudWatch) |

## **7\. Future Roadmap (Post-Launch)**

### **7.1 Vision for V2.0: The Complete Travel Co-pilot**

While the initial version of Pre-Route is laser-focused on solving the problem of unexpected traffic for routine car journeys, the long-term vision is to evolve the application into a comprehensive, proactive travel co-pilot. This involves expanding its intelligence, increasing its level of automation, and incorporating multi-modal transport options to provide holistic travel advice.

### **7.2 Potential Features**

The following features represent potential avenues for development post-launch, to be prioritized based on user feedback and the achievement of initial KPIs.

* **Calendar Integration:**  
  * **Description:** Granting the app permission to read the user's calendar would enable a new level of proactive assistance. The app could automatically identify events with location data and prompt the user to create a Monitored Trip for them.  
  * **User Value:** This further reduces the cognitive load on the user. Instead of manually creating a trip for a one-off doctor's appointment, the app would ask, "I see you have an appointment at \[Address\] at 3:00 PM. Would you like me to monitor traffic for you?"  
* **Multi-Modal Suggestions:**  
  * **Description:** For certain journeys, particularly those into major metropolitan centers like London, driving may not be the optimal mode of transport, especially during severe traffic incidents. By integrating with public transport APIs like **TransportAPI** 35 or the  
    **TfL Unified API** 36, the app could offer alternative travel suggestions.  
  * **User Value:** This provides a powerful new dimension of problem-solving. For a user like Chloe, if Pre-Route detects a complete gridlock on all routes to the train station, it could instead suggest a bus route. For a trip into Central London, it could proactively state, "All major roads into London are heavily congested. The 8:32 AM train from Sevenoaks is currently the fastest route." This aligns with the travel patterns of many Kent residents who use the train for London commutes.1  
* **Machine Learning for Predictive Traffic:**  
  * **Description:** As Pre-Route accumulates historical data on traffic patterns for its users' specific routes, it can begin to train its own proprietary machine learning models. These models could identify recurring, non-obvious patterns (e.g., "This specific intersection always gets congested on the third Friday of the month") and predict delays *before* they are reflected in real-time API data.  
  * **User Value:** This would represent a significant competitive advantage, moving the app from being proactive based on current data to being truly predictive based on learned intelligence.  
* **"Smart Departure" Time Recommendations:**  
  * **Description:** Evolving beyond simply alerting users to problems, the app could offer prescriptive advice on *when* to leave. By analyzing the traffic flow data and its predicted evolution, the app could provide recommendations like, "Heavy traffic expected on the A21 from 4:30 PM. Leave by 4:25 PM to miss the worst of it."  
  * **User Value:** This elevates the app from an information tool to a personal travel scheduler, offering a higher level of optimization and control.  
* **Social and Crowdsourced Data Layer:**  
  * **Description:** Allow users to submit simple, real-time reports (e.g., "New accident here," "Road blocked by fallen tree"). This crowdsourced information can temporarily augment the formal API data, providing hyper-local, up-to-the-second intelligence that official sources may not have registered yet.  
  * **User Value:** This increases the robustness and responsiveness of the data fusion model, potentially catching incidents minutes before they appear on other services and fostering a sense of community among users.

#### **Works cited**

1. Travel to Work Analysis – Kent County \- Kent County Council, accessed on August 13, 2025, [https://www.kent.gov.uk/\_\_data/assets/pdf\_file/0007/8197/Travel-to-work-patterns-in-Kent.pdf](https://www.kent.gov.uk/__data/assets/pdf_file/0007/8197/Travel-to-work-patterns-in-Kent.pdf)  
2. Population and Social Profile May 2010 \- Sevenoaks District Council, accessed on August 13, 2025, [https://www.sevenoaks.gov.uk/download/downloads/id/37/sevenoaks\_population\_and\_social\_profile\_may\_2010.pdf](https://www.sevenoaks.gov.uk/download/downloads/id/37/sevenoaks_population_and_social_profile_may_2010.pdf)  
3. Commuter Towns in Kent: An Informative Guide for Homebuyers \- Property finders, accessed on August 13, 2025, [https://garringtonsoutheast.co.uk/commuter-towns-in-kent/](https://garringtonsoutheast.co.uk/commuter-towns-in-kent/)  
4. Health of People who Travel to Work. The effect of travel time and mode of transport on health: What have we learnt from the Kent and Medway \- Kent Academic Repository, accessed on August 13, 2025, [https://kar.kent.ac.uk/id/document/3919](https://kar.kent.ac.uk/id/document/3919)  
5. The case for Kent: Commuter towns market analysis Q2 2025 \- Shojin Property Partners, accessed on August 13, 2025, [https://www.shojin.co.uk/insights/the-case-for-kent-commuter-towns-market-analysis-q2-2025](https://www.shojin.co.uk/insights/the-case-for-kent-commuter-towns-market-analysis-q2-2025)  
6. Maps API, accessed on August 13, 2025, [https://mapsplatform.google.com/lp/maps-apis/](https://mapsplatform.google.com/lp/maps-apis/)  
7. Geoapify Location Platform: Maps, Geocoding, Routing, and APIs, accessed on August 13, 2025, [https://www.geoapify.com/](https://www.geoapify.com/)  
8. Directions API (Legacy) overview | Google for Developers, accessed on August 13, 2025, [https://developers.google.com/maps/documentation/directions/overview](https://developers.google.com/maps/documentation/directions/overview)  
9. A developer's guide to the Google Routes API \- The Afi Labs Blog, accessed on August 13, 2025, [https://blog.afi.io/blog/a-developers-guide-to-the-google-routes-api/](https://blog.afi.io/blog/a-developers-guide-to-the-google-routes-api/)  
10. Blog: Routes API is now generally available \- Google Maps Platform, accessed on August 13, 2025, [https://mapsplatform.google.com/resources/blog/routes-api-now-generally-available/](https://mapsplatform.google.com/resources/blog/routes-api-now-generally-available/)  
11. Traffic APIs \- TomTom, accessed on August 13, 2025, [https://www.tomtom.com/products/traffic-apis/](https://www.tomtom.com/products/traffic-apis/)  
12. TomTom Developer Portal: Home, accessed on August 13, 2025, [https://developer.tomtom.com/](https://developer.tomtom.com/)  
13. API Explorer | Traffic API | TomTom Developer Portal, accessed on August 13, 2025, [https://developer.tomtom.com/traffic-api/api-explorer](https://developer.tomtom.com/traffic-api/api-explorer)  
14. Pricing \- TomTom Developer Portal, accessed on August 13, 2025, [https://developer.tomtom.com/pricing](https://developer.tomtom.com/pricing)  
15. Data APIs | uk.one.network, accessed on August 13, 2025, [https://uk.one.network/analyse/data-apis](https://uk.one.network/analyse/data-apis)  
16. Open data services \- National Highways, accessed on August 13, 2025, [https://nationalhighways.co.uk/our-work/digital-data-and-technology/open-data-services/](https://nationalhighways.co.uk/our-work/digital-data-and-technology/open-data-services/)  
17. Data-lab \- National Highways, accessed on August 13, 2025, [https://nationalhighways.co.uk/our-work/digital-lab/data-lab/](https://nationalhighways.co.uk/our-work/digital-lab/data-lab/)  
18. National Highways \- Developer Portal: Home, accessed on August 13, 2025, [https://developer.data.nationalhighways.co.uk/](https://developer.data.nationalhighways.co.uk/)  
19. Real-Time Traffic \- HERE Technologies, accessed on August 13, 2025, [https://www.here.com/docs/bundle/traffic-api-developer-guide-v7/page/topics/concepts/real-time-traffic.html](https://www.here.com/docs/bundle/traffic-api-developer-guide-v7/page/topics/concepts/real-time-traffic.html)  
20. OS Open Roads | Data Products | OS, accessed on August 13, 2025, [https://www.ordnancesurvey.co.uk/products/os-open-roads](https://www.ordnancesurvey.co.uk/products/os-open-roads)  
21. OS Data Hub | Free Maps & API Data for Developers, accessed on August 13, 2025, [https://osdatahub.os.uk/](https://osdatahub.os.uk/)  
22. API \- National Highways \- WebTRIS, accessed on August 13, 2025, [https://webtris.highwaysengland.co.uk/api/swagger/ui/index](https://webtris.highwaysengland.co.uk/api/swagger/ui/index)  
23. Dashboard Design: best practices and examples \- Justinmind, accessed on August 13, 2025, [https://www.justinmind.com/ui-design/dashboard-design-best-practices-ux](https://www.justinmind.com/ui-design/dashboard-design-best-practices-ux)  
24. Mobile | UI Design | Android Developers, accessed on August 13, 2025, [https://developer.android.com/design/ui/mobile](https://developer.android.com/design/ui/mobile)  
25. Traffic Alert designs, themes, templates and downloadable graphic elements on Dribbble, accessed on August 13, 2025, [https://dribbble.com/tags/traffic-alert](https://dribbble.com/tags/traffic-alert)  
26. Traffic App designs, themes, templates and downloadable graphic elements on Dribbble, accessed on August 13, 2025, [https://dribbble.com/tags/traffic-app](https://dribbble.com/tags/traffic-app)  
27. Route Planner designs, themes, templates and downloadable graphic elements on Dribbble, accessed on August 13, 2025, [https://dribbble.com/tags/route-planner](https://dribbble.com/tags/route-planner)  
28. Route Planning designs, themes, templates and downloadable graphic elements on Dribbble, accessed on August 13, 2025, [https://dribbble.com/tags/route-planning](https://dribbble.com/tags/route-planning)  
29. Route Map App Ui Dark royalty-free images \- Shutterstock, accessed on August 13, 2025, [https://www.shutterstock.com/search/route-map-app-ui-dark](https://www.shutterstock.com/search/route-map-app-ui-dark)  
30. The 7 Most Important User Experience (UX) KPIs (and How To Measure Them), accessed on August 13, 2025, [https://www.uxdesigninstitute.com/blog/ux-kpis-and-how-to-measure-them/](https://www.uxdesigninstitute.com/blog/ux-kpis-and-how-to-measure-them/)  
31. Mobile App Metrics: 50+ Key KPIs to Track for App Success and Why \- CleverTap, accessed on August 13, 2025, [https://clevertap.com/blog/mobile-app-metrics/](https://clevertap.com/blog/mobile-app-metrics/)  
32. Top 51 Important Mobile App KPIs to Measure Performance 2025 \- UXCam, accessed on August 13, 2025, [https://uxcam.com/blog/top-50-mobile-app-kpis/](https://uxcam.com/blog/top-50-mobile-app-kpis/)  
33. Unlocking Success: Key KPIs for Measuring Mobile App Performance \- Techstack, accessed on August 13, 2025, [https://tech-stack.com/blog/mobile-app-kpis-engagement-metrics/](https://tech-stack.com/blog/mobile-app-kpis-engagement-metrics/)  
34. 30 Important App KPIs to Track in 2024 \- Stream, accessed on August 13, 2025, [https://getstream.io/blog/app-kpis/](https://getstream.io/blog/app-kpis/)  
35. TransportAPI \- the managed services provider for UK transport data, accessed on August 13, 2025, [https://www.transportapi.com/](https://www.transportapi.com/)  
36. TfL Unified API, accessed on August 13, 2025, [https://api.tfl.gov.uk/](https://api.tfl.gov.uk/)  
37. Transport for London Unified API \- APILayer, accessed on August 13, 2025, [https://apilayer.com/marketplace/transport\_for\_london\_unified-api](https://apilayer.com/marketplace/transport_for_london_unified-api)