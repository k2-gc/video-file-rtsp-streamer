import type { Video, UploadVideoResponse, StreamActionResponse } from '../types/video';

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:8000/api';

export const fetchVideos = async (): Promise<Video[]> => {
  const response = await fetch(`${API_URL}/videos/list`);
  if (!response.ok) throw new Error('Failed to fetch videos');
  return response.json();
};

export const uploadVideo = async (file: File): Promise<UploadVideoResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_URL}/videos/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload video');
  return response.json();
};

export const deleteVideo = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/videos/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete video');
};

export const startStream = async (id: number): Promise<StreamActionResponse> => {
  const response = await fetch(`${API_URL}/stream/${id}/start`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to start stream');
  return response.json();
};

export const stopStream = async (id: number): Promise<StreamActionResponse> => {
  const response = await fetch(`${API_URL}/stream/${id}/stop`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to stop stream');
  return response.json();
};
