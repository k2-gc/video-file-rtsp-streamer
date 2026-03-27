import io
from unittest.mock import patch, MagicMock


# --- Upload ---


def test_upload_video(client):
    file_content = b"fake video content"
    response = client.post(
        "/api/videos/upload",
        files={"file": ("test.mp4", io.BytesIO(file_content), "video/mp4")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "test.mp4"
    assert data["status"] == "completed"
    assert "id" in data
    assert "upload_time" in data


def test_upload_path_traversal(client):
    """Malicious filename should be sanitized, not used as-is."""
    response = client.post(
        "/api/videos/upload",
        files={"file": ("../../etc/passwd", io.BytesIO(b"evil"), "video/mp4")},
    )
    assert response.status_code == 200
    data = response.json()
    # file_path should not contain ".."
    assert ".." not in data["file_path"]
    assert "passwd" in data["file_path"]


# --- List ---


def test_list_videos_empty(client):
    response = client.get("/api/videos/list")
    assert response.status_code == 200
    assert response.json() == []


def test_list_videos_after_upload(client):
    client.post(
        "/api/videos/upload",
        files={"file": ("vid1.mp4", io.BytesIO(b"data1"), "video/mp4")},
    )
    client.post(
        "/api/videos/upload",
        files={"file": ("vid2.mp4", io.BytesIO(b"data2"), "video/mp4")},
    )
    response = client.get("/api/videos/list")
    assert response.status_code == 200
    videos = response.json()
    assert len(videos) == 2
    titles = {v["title"] for v in videos}
    assert "vid1.mp4" in titles
    assert "vid2.mp4" in titles


# --- Get ---


def test_get_video(client):
    upload = client.post(
        "/api/videos/upload",
        files={"file": ("get_me.mp4", io.BytesIO(b"data"), "video/mp4")},
    )
    video_id = upload.json()["id"]

    response = client.get(f"/api/videos/{video_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == video_id
    assert data["title"] == "get_me.mp4"


def test_get_video_not_found(client):
    response = client.get("/api/videos/9999")
    assert response.status_code == 200
    assert "error" in response.json()


# --- Delete ---


def test_delete_video(client):
    upload = client.post(
        "/api/videos/upload",
        files={"file": ("delete_me.mp4", io.BytesIO(b"data"), "video/mp4")},
    )
    video_id = upload.json()["id"]

    response = client.delete(f"/api/videos/{video_id}")
    assert response.status_code == 200
    assert "message" in response.json()

    # Should no longer appear in list
    videos = client.get("/api/videos/list").json()
    assert all(v["id"] != video_id for v in videos)


def test_delete_video_not_found(client):
    response = client.delete("/api/videos/9999")
    assert response.status_code == 200
    assert "error" in response.json()


# --- Stream Start ---


@patch("app.subprocess.Popen")
def test_start_stream(mock_popen, client):
    mock_proc = MagicMock()
    mock_proc.pid = 12345
    mock_popen.return_value = mock_proc

    upload = client.post(
        "/api/videos/upload",
        files={"file": ("stream.mp4", io.BytesIO(b"data"), "video/mp4")},
    )
    video_id = upload.json()["id"]

    response = client.get(f"/api/stream/{video_id}/start")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    mock_popen.assert_called_once()


@patch("models.db_crud.psutil")
@patch("app.subprocess.Popen")
def test_start_stream_already_running(mock_popen, mock_psutil, client):
    mock_proc = MagicMock()
    mock_proc.pid = 12345
    mock_popen.return_value = mock_proc
    # Make psutil think the PID is a valid ffmpeg process
    mock_psutil.pid_exists.return_value = True
    mock_process = MagicMock()
    mock_process.name.return_value = "ffmpeg"
    mock_psutil.Process.return_value = mock_process

    upload = client.post(
        "/api/videos/upload",
        files={"file": ("stream2.mp4", io.BytesIO(b"data"), "video/mp4")},
    )
    video_id = upload.json()["id"]

    client.get(f"/api/stream/{video_id}/start")
    response = client.get(f"/api/stream/{video_id}/start")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "error"
    assert "already running" in data["message"].lower()


def test_start_stream_not_found(client):
    response = client.get("/api/stream/9999/start")
    assert response.status_code == 200
    assert response.json()["status"] == "error"


# --- Stream Stop ---


@patch("models.db_crud.psutil")
@patch("app.os.kill")
@patch("app.subprocess.Popen")
def test_stop_stream(mock_popen, mock_kill, mock_psutil, client):
    mock_proc = MagicMock()
    mock_proc.pid = 12345
    mock_popen.return_value = mock_proc
    # Make psutil think the PID is a valid ffmpeg process
    mock_psutil.pid_exists.return_value = True
    mock_process = MagicMock()
    mock_process.name.return_value = "ffmpeg"
    mock_psutil.Process.return_value = mock_process

    upload = client.post(
        "/api/videos/upload",
        files={"file": ("stop.mp4", io.BytesIO(b"data"), "video/mp4")},
    )
    video_id = upload.json()["id"]

    client.get(f"/api/stream/{video_id}/start")
    response = client.get(f"/api/stream/{video_id}/stop")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    # os.kill called once for SIGTERM in stop endpoint
    assert any(
        call.args[1] == __import__("signal").SIGTERM
        for call in mock_kill.call_args_list
    )


def test_stop_stream_not_running(client):
    upload = client.post(
        "/api/videos/upload",
        files={"file": ("nostp.mp4", io.BytesIO(b"data"), "video/mp4")},
    )
    video_id = upload.json()["id"]

    response = client.get(f"/api/stream/{video_id}/stop")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "error"
    assert "already stopped" in data["message"].lower()


def test_stop_stream_not_found(client):
    response = client.get("/api/stream/9999/stop")
    assert response.status_code == 200
    assert response.json()["status"] == "error"
