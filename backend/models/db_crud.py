from .schema import Base, Video, SessionLocal, engine
from datetime import datetime
import os
from typing import List, Optional


class VideoCRUD:
    @staticmethod
    def create_tables():
        Base.metadata.create_all(bind=engine)

    def __init__(self):
        self.db = SessionLocal()
    
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
    
    def close(self):
        self.db.close()

    def update(self, video_id: int, **kwargs) -> bool:
        video = self.get(video_id)
        if video:
            for key, value in kwargs.items():
                setattr(video, key, value)
            self.db.commit()
            return True
        return False