# React Monitor Dashboard

A modern React web application for real-time system monitoring and visualization of ROS2 metrics data.

## Overview

This React application provides a comprehensive dashboard for monitoring system metrics collected from ROS2 nodes and stored in the Django backend. It features real-time updates, interactive charts, and an intuitive interface for managing multiple hosts.

## Features

- **Real-time Monitoring**: Live updates every 5 seconds with automatic data refresh
- **Interactive Dashboard**: Modern Material-UI interface with dark theme
- **Host Management**: View and select individual hosts for detailed monitoring
- **Metrics Visualization**: Interactive charts showing CPU, memory, and disk usage trends
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Performance Optimized**: Efficient data fetching and component rendering

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **Material-UI (MUI)**: Professional UI components with dark theme
- **Recharts**: Interactive charts and data visualization
- **Axios**: HTTP client for API communication
- **TypeScript Ready**: Easy migration to TypeScript if needed

## Prerequisites

- Node.js 16+ and npm
- Running Django Monitor Server (backend)
- ROS2 System Monitor nodes (data source)

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/react-monitor-dashboard.git
cd react-monitor-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Endpoint

TODO(human)

### 4. Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_UPDATE_INTERVAL=5000
REACT_APP_CHART_UPDATE_INTERVAL=30000
```

### API Configuration

The dashboard connects to the Django backend via REST API. Default configuration:

- **API Base URL**: `http://localhost:8000/api`
- **Update Interval**: 5 seconds for dashboard data
- **Chart Update**: 30 seconds for historical charts

## Component Architecture

### Main Components

#### SystemMonitorDashboard
- Root component managing application state
- Handles data fetching and real-time updates
- Coordinates communication between child components

#### HostList
- Displays list of available hosts with status indicators
- Shows CPU, memory usage, and uptime for each host
- Handles host selection for detailed view

#### HostOverview
- Detailed metrics view for selected host
- Real-time CPU, memory, disk, and network statistics
- Progress bars and visual indicators

#### MetricsChart
- Interactive time-series charts using Recharts
- Configurable time ranges (1 hour to 1 week)
- CPU, memory, and disk usage trends

### Data Flow

```
┌─────────────────┐    HTTP GET     ┌──────────────────┐
│ React Dashboard │ ──────────────► │ Django REST API  │
│                 │ ◄────────────── │                  │
└─────────────────┘    JSON Data    └──────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                 ┌──────────────────┐
│ State Management│                 │ Database         │
│ (React Hooks)   │                 │ (SQLite/PostgreSQL)│
└─────────────────┘                 └──────────────────┘
```

## API Integration

### Dashboard Data

```javascript
// Fetch dashboard summary
const response = await axios.get(`${API_BASE_URL}/dashboard/`);
// Returns: { total_hosts, online_hosts, latest_metrics, hosts }
```

### Host Metrics

```javascript
// Get latest metrics for specific host
const response = await axios.get(`${API_BASE_URL}/latest/?hostname=${hostname}`);

// Get historical data
const response = await axios.get(`${API_BASE_URL}/hosts/${hostname}/history/?hours=24`);
```

### Real-time Updates

The dashboard implements polling-based real-time updates:

```javascript
useEffect(() => {
  const interval = setInterval(fetchDashboardData, 5000);
  return () => clearInterval(interval);
}, []);
```

## Development

### Project Structure

```
src/
├── components/
│   ├── SystemMonitorDashboard.js  # Main dashboard component
│   ├── HostList.js                # Host list with status
│   ├── HostOverview.js            # Detailed host metrics
│   └── MetricsChart.js            # Interactive charts
├── App.js                         # App entry point with theme
└── index.js                       # React DOM entry
```

### Adding New Components

1. Create component in `src/components/`
2. Import and use in parent components
3. Add API integration if needed
4. Update this documentation

### Custom Styling

The application uses Material-UI's theming system:

```javascript
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});
```

## Production Deployment

### Build for Production

```bash
npm run build
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/react-monitor-dashboard/build;
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

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment-based Configuration

For different deployment environments:

```javascript
// src/config.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:8000/api',
    UPDATE_INTERVAL: 5000,
  },
  production: {
    API_BASE_URL: 'https://api.your-domain.com/api',
    UPDATE_INTERVAL: 10000,
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

## Performance Optimization

### Implemented Optimizations

1. **Efficient Polling**: Configurable update intervals
2. **Component Memoization**: React.memo where appropriate
3. **Lazy Loading**: Code splitting for better initial load times
4. **Data Caching**: Avoid unnecessary API calls

### Best Practices

- Use React DevTools to monitor component performance
- Implement error boundaries for better error handling
- Consider using React Query for advanced data fetching
- Optimize bundle size with webpack analysis

## Monitoring & Analytics

### Error Tracking

Add error tracking service integration:

```javascript
// src/App.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
});
```

### Performance Monitoring

```javascript
// Monitor API response times
const startTime = performance.now();
const response = await axios.get(url);
const duration = performance.now() - startTime;
console.log(`API call took ${duration.toFixed(2)}ms`);
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Django CORS settings allow frontend domain
2. **API Connection**: Verify Django server is running and accessible
3. **Data Not Loading**: Check browser console for network errors
4. **Performance Issues**: Monitor component re-renders and API call frequency

### Debug Mode

Enable debug logging:

```javascript
// src/App.js
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Dashboard data:', dashboardData);
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Add tests for new functionality
5. Submit a pull request

### Code Style

- Use functional components with hooks
- Follow Material-UI design patterns
- Implement proper error handling
- Add PropTypes or TypeScript types

## License

MIT License

## Related Projects

- [system-monitor-core](https://github.com/yourusername/system-monitor-core) - Core monitoring library
- [ros2-system-monitor](https://github.com/yourusername/ros2-system-monitor) - ROS2 nodes
- [django-monitor-server](https://github.com/yourusername/django-monitor-server) - Backend API

## Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Contact the development team