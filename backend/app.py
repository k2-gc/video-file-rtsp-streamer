from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import logging
import os
import subprocess
import signal
import uuid

logger = logging.getLogger(__name__)

from models import (
    VideoCRUD,
    get_db,
    cleanup_orphaned_processes,
    SessionLocal,
    Base,
    engine,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and clean up stale stream processes
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        cleanup_orphaned_processes(db)
    finally:
        db.close()
    yield


MAX_UPLOAD_SIZE = 2 * 1024 * 1024 * 1024  # 2 GB


# --- Response Models ---


class VideoResponse(BaseModel):
    id: int
    title: Optional[str]
    status: str
    upload_time: datetime
    file_path: str


class UploadVideoResponse(VideoResponse):
    error_msg: str


class VideoListItem(BaseModel):
    id: int
    title: Optional[str]
    status: str
    time: datetime
    file_path: str
    proc: Optional[int]


class MessageResponse(BaseModel):
    message: str


class StreamActionResponse(BaseModel):
    status: str
    id: int
    message: str


class UploadSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/api/videos/upload" and request.method == "POST":
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > MAX_UPLOAD_SIZE:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "File too large (max 2GB)"},
                )
        return await call_next(request)


app = FastAPI(lifespan=lifespan)

app.add_middleware(UploadSizeLimitMiddleware)

_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rtsp_host = os.getenv("RTSP_SERVER_HOST", "localhost")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/api/videos/upload", response_model=UploadVideoResponse)
async def upload_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    safe_name = f"{uuid.uuid4().hex}_{os.path.basename(file.filename or 'video')}"
    file_location = os.path.join(UPLOAD_DIR, safe_name)
    status = "uploading"
    error_msg = ""
    try:
        with open(file_location, "wb") as f:
            # f.write(await file.read())
            content = await file.read()
            f.write(content)
        status = "completed"
    except Exception as e:
        status = "failed"
        error_msg = str(e)
    video_crud = VideoCRUD(db)
    video = video_crud.create(
        title=file.filename, file_path=file_location, status=status
    )
    return {
        "id": video.id,
        "title": video.title,
        "status": video.status,
        "upload_time": video.upload_time,
        "file_path": video.file_path,
        "error_msg": error_msg,
    }


@app.get("/api/videos/list", response_model=list[VideoListItem])
def list_videos(db: Session = Depends(get_db)):
    video_crud = VideoCRUD(db)
    videos = video_crud.list()
    videos = [
        {
            "id": video.id,
            "title": video.title,
            "status": video.status,
            "time": video.upload_time,
            "file_path": video.file_path,
            "proc": video.proc,
        }
        for video in videos
    ]
    return videos


@app.get("/api/videos/{video_id}", response_model=VideoResponse)
def get_video(video_id: int, db: Session = Depends(get_db)):
    video_crud = VideoCRUD(db)
    video = video_crud.get(video_id)
    if video:
        return {
            "id": video.id,
            "title": video.title,
            "status": video.status,
            "upload_time": video.upload_time,
            "file_path": video.file_path,
        }
    raise HTTPException(status_code=404, detail="Video not found")


@app.delete("/api/videos/{video_id}", response_model=MessageResponse)
def delete_video(video_id: int, db: Session = Depends(get_db)):
    video_crud = VideoCRUD(db)
    success = video_crud.delete(video_id)
    if success:
        return {"message": "Video deleted successfully"}
    raise HTTPException(
        status_code=404, detail="Video not found or could not be deleted"
    )


@app.post("/api/stream/{video_id}/start", response_model=StreamActionResponse)
def start_rtsp_stream(video_id: int, db: Session = Depends(get_db)):
    logger.info("Starting RTSP stream for video ID %d", video_id)
    video_crud = VideoCRUD(db)
    video = video_crud.get(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if video.proc is not None:
        raise HTTPException(
            status_code=409, detail="Stream already running for this video"
        )
    try:
        video_path = video.file_path
        cmd = [
            "ffmpeg",
            "-re",
            "-stream_loop",
            "-1",
            "-i",
            video_path,
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-tune",
            "zerolatency",
            "-f",
            "rtsp",
            f"rtsp://{rtsp_host}:8554/stream/{video_id}",
        ]
        if os.name == "nt":
            proc = subprocess.Popen(
                cmd, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
            )
        else:
            proc = subprocess.Popen(cmd)
        video_crud.update(video_id, proc=proc.pid)
        logger.info(
            "Started RTSP stream for video ID %d with PID %d", video_id, proc.pid
        )
        return {
            "status": "success",
            "id": video_id,
            "message": f"RTSP stream started for video ID {video_id}",
        }
    except Exception as e:
        video_crud.update(video_id, proc=None)
        logger.error("Error starting RTSP stream: %s", e)
        return {"status": "error", "id": video_id, "message": str(e)}


@app.post("/api/stream/{video_id}/stop", response_model=StreamActionResponse)
def stop_rtsp_stream(video_id: int, db: Session = Depends(get_db)):
    video_crud = VideoCRUD(db)
    video = video_crud.get(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if video.proc is None:
        raise HTTPException(
            status_code=409, detail="Stream already stopped for this video"
        )
    try:
        # Terminate the process
        if os.name == "nt":  # Windows
            os.kill(video.proc, signal.CTRL_BREAK_EVENT)
        else:  # Unix系
            os.kill(video.proc, signal.SIGTERM)
        video_crud.update(video_id, proc=None)
        return {
            "status": "success",
            "id": video_id,
            "message": f"RTSP stream stopped for video ID {video_id}",
        }
    except ProcessLookupError:
        # Process already gone — clean up the stale PID
        video_crud.update(video_id, proc=None)
        return {
            "status": "success",
            "id": video_id,
            "message": f"RTSP stream stopped for video ID {video_id}",
        }
    except Exception as e:
        logger.error("Error stopping RTSP stream: %s", e)
        return {"status": "error", "id": video_id, "message": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
