import React, { useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Button,
} from '@mui/material';

type Video = {
  id: number;
  title: string;
  status: 'uploading' | 'completed' | 'error';
  time: string;
  proc: number | null; // For display "Start RTSP" or "Stop RTSP"
  file_path?: string; // Just for backend compatibility
};

type VideoListProps = {
  refreshFlag?: number;
};

const VideoList: React.FC<VideoListProps> = ({ refreshFlag }) => {
  const [videos, setVideos] = React.useState<Video[]>([]);

  const url = 'http://localhost:8000/api';
  const fetchVideos = async () => {
    const fetchUrl = `${url}/videos/list`;
    try {
      const response = await fetch(fetchUrl);
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const deleteVideo = async (id: number) => {
    const deleteUrl = `${url}/videos/${id}`;
    try {
      const response = await fetch(deleteUrl, { method: 'DELETE' });
      if (response.ok) {
        setVideos(videos.filter((video) => video.id !== id));
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [refreshFlag]);

  const getStatusColor = (status: Video['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'uploading':
        return 'primary';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString();
  };

  const handleDelete = (id: number) => {
    deleteVideo(id);
  };

  const handlePlay = async (id: number) => {
    console.log(`Playing video with id: ${id}`);
    // Implement RTSP play logic here
    const rtspUrl = `${url}/stream/${id}/start`;
    try {
      const response = await fetch(rtspUrl, { method: 'GET' });
      if (response.ok) {
        console.log(`RTSP stream started for video id: ${id}`);
        fetchVideos(); // Refresh the list to update proc status
      }
    } catch (error) {
      console.error('Error starting RTSP stream:', error);
    }
  };

  const handleStop = async (id: number) => {
    console.log(`Stopping video with id: ${id}`);
    // Implement RTSP stop logic here
    const rtspUrl = `${url}/stream/${id}/stop`;
    try {
      const response = await fetch(rtspUrl, { method: 'GET' });
      if (response.ok) {
        console.log(`RTSP stream stopped for video id: ${id}`);
        fetchVideos(); // Refresh the list to update proc status
      }
    } catch (error) {
      console.error('Error stopping RTSP stream:', error);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        mb: 2,
        border: '1px solid',
        borderColor: 'secondary.light',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h4" gutterBottom color="primary.main">
        Video List
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          border: '1px solid',
          bgcolor: 'background.paper',
          borderColor: 'secondary.light',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>No.</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Time</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.map((video, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <TableCell sx={{ color: 'text.primary' }}>{index + 1}</TableCell>
                <TableCell sx={{ color: 'text.primary' }}>{video.id}</TableCell>
                <TableCell sx={{ color: 'text.primary' }}>{video.title}</TableCell>
                <TableCell>
                  <Chip label={video.status} color={getStatusColor(video.status)} />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{formatTime(video.time)}</TableCell>
                <TableCell>
                  {video.proc ? (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        mr: 1,
                        bgcolor: 'secondary.main',
                        '&:hover': {
                          bgcolor: 'secondary.dark',
                        },
                      }}
                      onClick={() => handleStop(video.id)}
                      disabled={video.status !== 'completed'}
                    >
                      Stop RTSP
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        mr: 1,
                        bgcolor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                      onClick={() => handlePlay(video.id)}
                      disabled={video.status !== 'completed'}
                    >
                      Play RTSP
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    sx={{
                      borderColor: 'error.main',
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: 'error.light',
                        borderColor: 'error.dark',
                      },
                    }}
                    onClick={() => handleDelete(video.id)}
                    disabled={video.status === 'uploading'}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {videos.length === 0 && (
        <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
          No videos available.
        </Typography>
      )}
    </Box>
  );
};

export default VideoList;
