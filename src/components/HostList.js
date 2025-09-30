import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Typography
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Circle as CircleIcon
} from '@mui/icons-material';

const HostList = ({ hosts, onHostSelect, selectedHost }) => {
  const formatUptime = (uptime) => {
    if (!uptime) return 'Unknown';

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (!hosts || hosts.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
        <ComputerIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No hosts available
        </Typography>
      </Box>
    );
  }

  return (
    <List dense>
      {hosts.map((host) => (
        <ListItem key={host.hostname} disablePadding>
          <ListItemButton
            selected={selectedHost === host.hostname}
            onClick={() => onHostSelect(host.hostname)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.dark',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemIcon>
              <Box position="relative">
                <ComputerIcon />
                <CircleIcon
                  sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    fontSize: 12,
                    color: host.is_online ? 'success.main' : 'error.main',
                  }}
                />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontWeight="medium">
                    {host.hostname}
                  </Typography>
                  <Chip
                    label={host.is_online ? 'Online' : 'Offline'}
                    size="small"
                    color={host.is_online ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="caption" display="block">
                    CPU: {host.latest_cpu_percent?.toFixed(1) || 'N/A'}% |
                    Mem: {host.latest_memory_percent?.toFixed(1) || 'N/A'}%
                  </Typography>
                  <Typography variant="caption" display="block">
                    Uptime: {formatUptime(host.latest_uptime)}
                  </Typography>
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default HostList;