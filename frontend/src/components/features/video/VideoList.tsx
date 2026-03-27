import React, { useState, useEffect } from 'react';
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
  IconButton,
} from '@mui/material';
import { PlayArrow, StopCircle, ContentCopy } from '@mui/icons-material';
import type { Video } from '../../../types/video';
import { fetchVideos, deleteVideo, startStream, stopStream } from '../../../utils/api';

const RTSP_HOST = process.env.REACT_APP_RTSP_HOST ?? 'localhost';

type VideoListProps = {
  refreshFlag?: number;
};

const VideoList: React.FC<VideoListProps> = ({ refreshFlag }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [copySuccess, setCopySuccess] = useState<number | null>(null);

  const loadVideos = async () => {
    try {
      const data = await fetchVideos();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVideo(id);
      setVideos(videos.filter((video) => video.id !== id));
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  useEffect(() => {
    loadVideos();
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

  const handlePlay = async (id: number) => {
    try {
      await startStream(id);
      loadVideos();
    } catch (error) {
      console.error('Error starting RTSP stream:', error);
    }
  };

  const handleStop = async (id: number) => {
    try {
      await stopStream(id);
      loadVideos();
    } catch (error) {
      console.error('Error stopping RTSP stream:', error);
    }
  };

  const handleCopy = async (videoId: number, streamUrl: string) => {
    try {
      await navigator.clipboard.writeText(streamUrl);
      setCopySuccess(videoId);
      setTimeout(() => setCopySuccess(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Error copying RTSP URL:', error);
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
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Upload</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', width: '200px' }}>
                RTSP URL
              </TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Time</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.map((video, index) => (
              <TableRow
                key={video.id}
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
                <TableCell>
                  <Chip
                    label={video.proc !== null ? 'RTSP Playing' : 'RTSP Stopped'}
                    color={video.proc !== null ? 'success' : 'default'}
                    size="small"
                    icon={video.proc !== null ? <PlayArrow /> : <StopCircle />}
                    sx={{ width: '140px' }}
                  />
                </TableCell>
                <TableCell sx={{ width: '200px' }}>
                  {video.proc !== null ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.75rem',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        rtsp://{RTSP_HOST}:8554/stream/{video.id}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleCopy(video.id, `rtsp://${RTSP_HOST}:8554/stream/${video.id}`)
                        }
                        sx={{
                          color: copySuccess === video.id ? 'success.main' : 'text.primary',
                        }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      ----
                    </Typography>
                  )}
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
