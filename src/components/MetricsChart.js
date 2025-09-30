import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const MetricsChart = ({ hostname }) => {
  const [metricsData, setMetricsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(24); // hours

  useEffect(() => {
    const fetchMetricsHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/hosts/${hostname}/history/?hours=${timeRange}`
        );

        // Process the data for the chart
        const processedData = response.data.metrics.map(metric => ({
          timestamp: new Date(metric.timestamp).toLocaleTimeString(),
          fullTimestamp: metric.timestamp,
          cpu_percent: metric.cpu_percent,
          memory_percent: metric.memory_percent,
          disk_percent: metric.disk_percent,
        })).reverse(); // Reverse to show oldest first

        setMetricsData(processedData);
        setError(null);
      } catch (err) {
        setError(`Failed to fetch metrics history: ${err.message}`);
        console.error('Metrics history fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (hostname) {
      fetchMetricsHistory();
      const interval = setInterval(fetchMetricsHistory, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [hostname, timeRange]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1,
          }}
        >
          <Typography variant="body2" gutterBottom>
            {new Date(data.fullTimestamp).toLocaleString()}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value.toFixed(1)}%
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          System Metrics Timeline
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value={1}>Last Hour</MenuItem>
            <MenuItem value={6}>Last 6 Hours</MenuItem>
            <MenuItem value={24}>Last 24 Hours</MenuItem>
            <MenuItem value={168}>Last Week</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={metricsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 12 }}
            interval={Math.floor(metricsData.length / 6)} // Show ~6 labels
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="cpu_percent"
            stroke="#1976d2"
            strokeWidth={2}
            name="CPU Usage"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="memory_percent"
            stroke="#dc004e"
            strokeWidth={2}
            name="Memory Usage"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="disk_percent"
            stroke="#2e7d32"
            strokeWidth={2}
            name="Disk Usage"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
        Showing {metricsData.length} data points over the last {timeRange} hour{timeRange !== 1 ? 's' : ''}
      </Typography>
    </Box>
  );
};

export default MetricsChart;