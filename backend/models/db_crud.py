from .schema import Base, Video, engine
from datetime import datetime
import os
from typing import List, Optional
from sqlalchemy.orm import Session
import psutil


class VideoCRUD:
    @staticmethod
    def create_tables():
        Base.metadata.create_all(bind=engine)

    def __init__(self, db: Session):
        self.db = db
    
    def cleanup_orphaned_processes(self) -> None:
        try:
            videos_with_proc = self.db.query(Video).filter(
                Video.proc.isnot(None),
                Video.is_deleted == False
            ).all()

            for video in videos_with_proc:
                proc_id = video.proc
                if not psutil.pid_exists(proc_id):
                    print(f"Cleaning up orphaned process ID {proc_id} for video ID {video.id}")
                    video.proc = None
                else:
                    process = psutil.Process(proc_id)
                    process_name = process.name().lower()
                    if "ffmpeg" not in process_name:
                        print(f"Process ID {proc_id} for video ID {video.id} is not ffmpeg. Cleaning up.")
                        video.proc = None
            self.db.commit()
            print("Orphaned process cleanup completed.")
        except Exception as e:
            print(f"Error during orphaned process cleanup: {e}")
            self.db.rollback()

    def create(self, title: str, file_path: str, status: str = "completed") -> Video:
        new_video = Video(
            title=title,
            file_path=file_path,
            status=status,
            upload_time=datetime.now()
        )
        self.db.add(new_video)
        self.db.commit()
        self.db.refresh(new_video)
        return new_video
    
    def list(self) -> List[Video]:
        return self.db.query(Video).filter(Video.is_deleted == False).all()
    
    def get(self, video_id: int) -> Optional[Video]:
        return self.db.query(Video).filter(Video.id == video_id, Video.is_deleted == False).first()
    
    def delete(self, video_id: int) -> bool:
        video = self.get(video_id)
        if video:
            try:
                os.remove(video.file_path)
            except Exception as e:
                print(f"Error deleting file: {e}")
                pass
            video.is_deleted = True
            self.db.commit()
            return True
        return False
    
    def update(self, video_id: int, **kwargs) -> bool:
        video = self.get(video_id)
        if video:
            for key, value in kwargs.items():
                setattr(video, key, value)
            self.db.commit()
            return True
        return False