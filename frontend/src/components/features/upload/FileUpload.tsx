import React, { useState, useRef } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { VideoFile } from '@mui/icons-material';

type Video = {
  title: string;
  status: 'uploading' | 'completed' | 'error';
  time: string;
};

const FileUpload: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const url = 'http://localhost:8000/api/videos/upload';
  const uploadVideo = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        const is_completed = data.status === 'completed';
        setCurrentVideo({
          title: file.name,
          status: is_completed ? 'completed' : 'error',
          time: new Date().toISOString(),
        });
      } else {
        setCurrentVideo({
          title: file.name,
          status: 'error',
          time: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      setCurrentVideo({
        title: file.name,
        status: 'error',
        time: new Date().toISOString(),
      });
    }
  };

  const handleFile = (file: File) => {
    uploadVideo(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid ',
        borderColor: 'secondary.light',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Video Upload
      </Typography>
      {!currentVideo ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            border: isDragOver ? '2px dashed' : '2px dashed',
            borderColor: isDragOver ? 'info.main' : 'secondary.light',
            bgcolor: isDragOver ? 'info.light' : 'background.default',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'info.dark',
              bgcolor: 'action.hover',
            },
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragOver(false)}
          onClick={handleClick}
        >
          <VideoFile
            sx={{
              fontSize: 50,
              color: isDragOver ? 'info.main' : 'secondary.main',
              mb: 2,
            }}
          />
          <Typography variant="h6" gutterBottom>
            {isDragOver
              ? 'Drop the video file here...'
              : 'Drag & drop a video file here, or click to select'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            or
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{
              mt: 2,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="video/*"
            onChange={handleFileChange}
          />
          <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
            Supported formats: MP4, AVI, MOV, MKV
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" color="text.primay">
            Uploading: {currentVideo.title}
          </Typography>
          <Typography
            variant="body2"
            color={currentVideo.status === 'completed' ? 'success.main' : 'error.main'}
          >
            Status: {currentVideo.status}
          </Typography>
          <Button
            onClick={() => setCurrentVideo(null)}
            sx={{
              mt: 2,
              color: 'primary.main',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            Upload Another Video
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
