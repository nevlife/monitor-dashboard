import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  NetworkCheck as NetworkIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const HostOverview = ({ hostname }) => {
  const [latestMetrics, setLatestMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestMetrics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/latest/?hostname=${hostname}`);
        setLatestMetrics(response.data);
        setError(null);
      } catch (err) {
        setError(`Failed to fetch metrics for ${hostname}: ${err.message}`);
        console.error('Metrics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (hostname) {
      fetchLatestMetrics();
      const interval = setInterval(fetchLatestMetrics, 3000); // Update every 3 seconds
      return () => clearInterval(interval);
    }
  }, [hostname]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatUptime = (uptime) => {
    if (!uptime) return 'Unknown';

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  const getProgressColor = (percentage) => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!latestMetrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color="text.secondary">
          No metrics available for {hostname}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h6" color="primary">
          {hostname}
        </Typography>
        <Box>
          <Chip
            label={`${latestMetrics.cpu_cores} cores`}
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip
            label={formatUptime(latestMetrics.uptime)}
            size="small"
            color="info"
          />
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* CPU Usage */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <SpeedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">CPU Usage</Typography>
              </Box>
              <Typography variant="h4" color="primary" gutterBottom>
                {latestMetrics.cpu_percent.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={latestMetrics.cpu_percent}
                color={getProgressColor(latestMetrics.cpu_percent)}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                Load Average: {latestMetrics.load_average?.map(l => l.toFixed(2)).join(', ') || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Memory Usage */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <MemoryIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Memory Usage</Typography>
              </Box>
              <Typography variant="h4" color="secondary" gutterBottom>
                {latestMetrics.memory_percent.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={latestMetrics.memory_percent}
                color={getProgressColor(latestMetrics.memory_percent)}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                {formatBytes(latestMetrics.memory_used)} / {formatBytes(latestMetrics.memory_total)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Disk Usage */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <StorageIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Disk Usage</Typography>
              </Box>
              <Typography variant="h4" color="success.main" gutterBottom>
                {latestMetrics.disk_percent.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={latestMetrics.disk_percent}
                color={getProgressColor(latestMetrics.disk_percent)}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                {formatBytes(latestMetrics.disk_used)} / {formatBytes(latestMetrics.disk_total)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Network */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <NetworkIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Network</Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                Sent: {formatBytes(latestMetrics.network_bytes_sent)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Received: {formatBytes(latestMetrics.network_bytes_recv)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Packets: {latestMetrics.network_packets_sent?.toLocaleString()} sent,{' '}
                {latestMetrics.network_packets_recv?.toLocaleString()} received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary" display="block" mt={2}>
        Last updated: {new Date(latestMetrics.timestamp).toLocaleString()}
      </Typography>
    </Box>
  );
};

export default HostOverview;