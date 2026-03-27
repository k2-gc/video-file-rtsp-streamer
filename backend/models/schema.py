import os

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, func
from sqlalchemy.orm import sessionmaker, declarative_base, Session

DATABASE_PATH = os.getenv("DATABASE_PATH", "sqlite:///./data/videos.db")

engine = create_engine(DATABASE_PATH)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    status = Column(String, default="uploading")
    upload_time = Column(DateTime, default=func.now())
    file_path = Column(String)
    is_deleted = Column(Boolean, default=False)
    proc = Column(Integer, nullable=True)  # Process ID for streaming, if any


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()