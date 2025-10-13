import React, { useState } from 'react';
import { Box, Fab, Dialog, SxProps, Theme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileUpload from '../features/upload/FileUpload';
import VideoList from '../features/video/VideoList';

type DashboardProps = {
  sx?: SxProps<Theme>;
};

const Dashboard: React.FC<DashboardProps> = ({ sx }) => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);

  return (
    <Box
      sx={{
        m: 2,
        p: 2,
        ...sx,
      }}
    >
      {/* <h1>Dashboard Component</h1> */}
      <VideoList refreshFlag={refreshFlag} />
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
          color: 'background.paper',
        }}
        onClick={() => setOpenUploadDialog(true)}
      >
        <AddIcon />
      </Fab>
      <Dialog
        open={openUploadDialog}
        onClose={() => {
          setOpenUploadDialog(false);
          setRefreshFlag((prev) => prev + 1); // Trigger refresh
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'secondary.light',
            },
          },
        }}
      >
        <FileUpload />
      </Dialog>
    </Box>
  );
};

export default Dashboard;
