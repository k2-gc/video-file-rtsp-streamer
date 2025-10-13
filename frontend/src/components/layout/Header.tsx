import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, SxProps, Theme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

type HeaderProps = {
  sx?: SxProps<Theme>;
  title?: string;
};

const Header: React.FC<HeaderProps> = ({ sx, title }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <AppBar position="static" sx={{ mb: 2, ...sx }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title || 'My Application Header'}
        </Typography>
        <IconButton
          color="inherit"
          onClick={toggleTheme}
          sx={{
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
