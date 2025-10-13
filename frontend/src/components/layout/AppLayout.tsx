import React from 'react';
import { Box, ThemeProvider } from '@mui/material';
import Header from './Header';
import Dashboard from '../pages/Dashboard';
import { ThemeProviderWrapper, useTheme } from '../../contexts/ThemeContext';

const WholeContent: React.FC = () => {
  const { currentTheme } = useTheme();
  return (
    <ThemeProvider theme={currentTheme}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Header
          sx={{
            zIndex: 1,
            borderBottom: '1px solid',
            backgroundColor: 'background.paper',
            color: 'primary.main',
          }}
          title="RTSP Management App"
        />
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
          <Dashboard sx={{ height: '100%', flexGrow: 1 }} />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const AppLayout: React.FC = () => {
  return (
    <ThemeProviderWrapper>
      <WholeContent />
    </ThemeProviderWrapper>
  );
};

export default AppLayout;
