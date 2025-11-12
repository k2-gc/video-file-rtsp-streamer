# video-file-rtsp-streamer

## Overview
A web-based application for managing video files and streaming them via RTSP protocol. Upload MP4 files through a modern React frontend and stream them using FFmpeg.

## Features
- 📁 Video file upload with drag & drop support
- 📺 RTSP stream management (start/stop)
- 🎨 Professional light/dark theme toggle
- 🗃️ SQLite database for video metadata

## Tech Stack
### Frontend
* React + TypeScript
* Material-UI
* Custom theme system

### Backend
* FastAPI + Python
* SQLite
* FFmpeg for RTSP streaming

### Infrastructure
* Docker & Docker Compose

### Prerequisites
* Docker & Docker Compose

## Screenshots
### Home
![Home](./imgs/home.jpg)
*Video management top page*

### Upload MP4 File
![upload](./imgs/upload.jpg)
*Drag & drop file upload*

### Start Stream 
![start stream](./imgs/start.jpg)
*One-click RTSP stream activation*

### Play Stream
![play stream](./imgs/play.jpg)
*RTSP streaming play with media player*

## Quick Start
```bash
# Clone this repository
cd video-file-rtsp-streamer
docker compose up --build
# or
docker-compose up --build
```

## Access Points
The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API Document**: http://localhost:8000/docs
- **RTSP Streams**: `rtsp://localhost:8554/stream/{video_id}`

## Usage
1. Start all services using docker
1. Access http://localhost:3000 in your browser
1. Upload MP4 files.
1. Start RTSP streams for uploaded videos
1. Play streams via ffplay, VLC or any RTSP client

## Docker Services
- **backend**: FastAPI server with SQLite database
- **frontend**: React development server
- **rtsp-server**: MediaMTX RTSP streaming server


## License
This project is licensed under the MIT License.

**Third-Party Dependencies**:
- **FFmpeg** (LGPL/GPL) - External process for RTSP streaming
  - Not distributed with this project
  - Used as external subprocess (no linking)
- **MediaMTX** (MIT) - Docker container for RTSP server
- No GPL/LGPL code is embedded or statically linked in this project

Users are responsible for complying with FFmpeg's license terms in their own deployments.

## TODO / Roadmap

### High Priority
- [x] **Implement persistent volume for database**
  - ✅ SQLite data persistence across container restarts
  - ✅ Prevent data loss on container recreation

- [x] **Enhanced stream status management**
  - ✅ Check streaming status using database flags
  - ✅ Display real-time stream status in video list
  - ✅ Show RTSP URI for active streams in table

### Medium Priority  
- [ ] **Stream monitoring**
  - Health check for active RTSP streams
  - Auto-restart failed streams
  - Stream analytics and logging

- [ ] **User experience improvements**
  - Video preview thumbnails
  - Batch upload support
  - Download/export functionality

### Infrastructure
- [ ] **Production deployment**
  - CI/CD pipeline setup
  - Docker production optimizations
  - Environment-specific configurations
  - Monitoring and logging setup