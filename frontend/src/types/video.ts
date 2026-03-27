export type VideoStatus = 'uploading' | 'completed' | 'error';

/** Matches backend VideoListItem */
export type Video = {
  id: number;
  title: string | null;
  status: VideoStatus;
  time: string;
  file_path: string;
  proc: number | null;
};

/** Matches backend VideoResponse */
export type VideoDetail = {
  id: number;
  title: string | null;
  status: VideoStatus;
  upload_time: string;
  file_path: string;
};

/** Matches backend UploadVideoResponse */
export type UploadVideoResponse = VideoDetail & {
  error_msg: string;
};

/** Matches backend StreamActionResponse */
export type StreamActionResponse = {
  status: string;
  id: number;
  message: string;
};
