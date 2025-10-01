# Monitor Dashboard

Real-time system monitoring dashboard built with React

## Overview

Web application for visualizing system metrics collected from ROS2 nodes via Django REST API backend.

## Features

- **Real-time Monitoring**: Auto-refresh every 5 seconds
- **Multi-host Management**: Monitor and select multiple hosts
- **Metrics Visualization**: CPU, memory, and disk usage charts
- **Responsive Design**: Dark theme Material-UI interface
- **Live Updates**: Automatic polling-based data refresh

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create `.env` file based on `.env.example`:

```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_UPDATE_INTERVAL=5000
REACT_APP_CHART_UPDATE_INTERVAL=30000
```

### 3. Run Development Server

```bash
npm start
```

Open `http://localhost:3000` in your browser

### 4. Production Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── SystemMonitorDashboard.js  # Main dashboard
│   ├── HostList.js                # Host list
│   ├── HostOverview.js            # Host detail metrics
│   └── MetricsChart.js            # Metrics chart
├── App.js                         # App entry point with theme
├── App.css                        # App styles
├── index.js                       # React DOM rendering
└── index.css                      # Global styles
```

## Components

### SystemMonitorDashboard
- Application state management
- Dashboard data fetching (5s interval)
- Host selection and component coordination

### HostList
- Host list display (online/offline status)
- CPU, memory usage and uptime display
- Host selection handler

### HostOverview
- Selected host detailed metrics
- CPU, memory, disk, network statistics
- Real-time updates (3s interval)

### MetricsChart
- Time-series charts (Recharts)
- Configurable time ranges (1h/6h/24h/1w)
- CPU, memory, disk usage trends

## API Integration

### Dashboard API
```javascript
GET /api/dashboard/
// Returns: { total_hosts, online_hosts, total_metrics, latest_metrics, hosts }
```

### Latest Metrics API
```javascript
GET /api/latest/?hostname={hostname}
// Returns: { cpu_percent, memory_percent, disk_percent, ... }
```

### History API
```javascript
GET /api/hosts/{hostname}/history/?hours=24
// Returns: { metrics: [...] }
```

## Deployment

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name monitor.example.com;
    root /var/www/monitor-dashboard/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker Build

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```