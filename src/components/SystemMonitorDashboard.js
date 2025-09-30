import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';
import axios from 'axios';
import HostOverview from './HostOverview';
import MetricsChart from './MetricsChart';
import HostList from './HostList';

const API_BASE_URL = 'http://localhost:8000/api';

const SystemMonitorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHost, setSelectedHost] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/dashboard/`);
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch dashboard data: ${err.message}`);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleHostSelect = (hostname) => {
    setSelectedHost(hostname === selectedHost ? null : hostname);
  };

  if (loading && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const { total_hosts, online_hosts, total_metrics, latest_metrics, hosts } = dashboardData || {};

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <ComputerIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ROS2 System Monitor Dashboard
          </Typography>
          <Typography variant="body2">
            {online_hosts}/{total_hosts} Hosts Online
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <ComputerIcon color="primary" sx={{ mr: 1 }} />
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Total Hosts
                </Typography>
              </Box>
              <Typography component="p" variant="h4">
                {total_hosts || 0}
              </Typography>
              <Typography color="text.secondary">
                {online_hosts || 0} online
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <MemoryIcon color="secondary" sx={{ mr: 1 }} />
                <Typography component="h2" variant="h6" color="secondary" gutterBottom>
                  Total Metrics
                </Typography>
              </Box>
              <Typography component="p" variant="h4">
                {total_metrics?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">
                Records stored
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <StorageIcon color="success" sx={{ mr: 1 }} />
                <Typography component="h2" variant="h6" color="success.main" gutterBottom>
                  Avg CPU Usage
                </Typography>
              </Box>
              <Typography component="p" variant="h4">
                {latest_metrics?.length > 0
                  ? `${(latest_metrics.reduce((sum, m) => sum + m.cpu_percent, 0) / latest_metrics.length).toFixed(1)}%`
                  : '0%'
                }
              </Typography>
              <Typography color="text.secondary">
                Across all hosts
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <NetworkIcon color="warning" sx={{ mr: 1 }} />
                <Typography component="h2" variant="h6" color="warning.main" gutterBottom>
                  Avg Memory Usage
                </Typography>
              </Box>
              <Typography component="p" variant="h4">
                {latest_metrics?.length > 0
                  ? `${(latest_metrics.reduce((sum, m) => sum + m.memory_percent, 0) / latest_metrics.length).toFixed(1)}%`
                  : '0%'
                }
              </Typography>
              <Typography color="text.secondary">
                Across all hosts
              </Typography>
            </Paper>
          </Grid>

          {/* Host List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                System Hosts
              </Typography>
              <HostList
                hosts={hosts || []}
                onHostSelect={handleHostSelect}
                selectedHost={selectedHost}
              />
            </Paper>
          </Grid>

          {/* Host Overview */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: 400 }}>
              {selectedHost ? (
                <HostOverview hostname={selectedHost} />
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                  <ComputerIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select a host to view detailed metrics
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Metrics Chart */}
          {selectedHost && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Metrics History - {selectedHost}
                </Typography>
                <MetricsChart hostname={selectedHost} />
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default SystemMonitorDashboard;