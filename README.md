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
* Docker & Docker Compose **(recommended)**
* Manually: Node.js + npm, Python 3.8+, FFmpeg and Docker (For RTSP server)

## Quick Start
### Option 1: Docker Compose
```bash
# Clone this repository
cd video-file-rtsp-streamer
docker compose up --build
# or
docker-compose up --build
```

### Option 2: Manual Setup
#### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
> **Note**: In this repo, we use dev mode.

#### 3. RTSP Server Setup
We use `bluenviron/mediamtx` to stream RTSP from ffmpeg.
```bash
docker run --rm -it \
-e MTX_RTSPTRANSPORTS=tcp \
-e MTX_WEBRTCADDITIONALHOSTS=192.168.x.x \
-p 8554:8554 \
-p 1935:1935 \
-p 8888:8888 \
-p 8889:8889 \
-p 8890:8890/udp \
-p 8189:8189/udp \
bluenviron/mediamtx
```

## Access Points
The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API Document**: http://localhost:8000/docs
- **RTSP Streams**: `rtsp://localhost:8554/stream/{video_id}`

## Usage
1. Start all services using docker or manually
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
- FFmpeg (LGPL/GPL) - External process for RTSP streaming
- MediaMTX (MIT) - Docker container for RTSP server
- No third-party code is embedded or statically linked in this project

## TODO / Roadmap

### High Priority
- [ ] **Implement persistent volume for database**
  - SQLite data persistence across container restarts
  - Prevent data loss on container recreation

- [ ] **Enhanced stream status management**
  - Check streaming status using database flags
  - Display real-time stream status in video list
  - Show RTSP URI for active streams in table

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