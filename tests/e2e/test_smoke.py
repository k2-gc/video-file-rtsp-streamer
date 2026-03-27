import io
import httpx


# --- nginx SPA routing ---


def test_spa_root_serves_html(base_url):
    """nginx serves the React index.html for the root path."""
    r = httpx.get(f"{base_url}/")
    assert r.status_code == 200
    assert '<div id="root">' in r.text


def test_spa_deep_path_fallback(base_url):
    """nginx falls back to index.html for unknown paths (client-side routing)."""
    r = httpx.get(f"{base_url}/dashboard/something/unknown")
    assert r.status_code == 200
    assert '<div id="root">' in r.text


# --- nginx → backend proxy ---


def test_api_proxy_returns_json(base_url):
    """nginx proxies /api/ requests to the backend and returns JSON."""
    r = httpx.get(f"{base_url}/api/videos/list")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("application/json")
    assert isinstance(r.json(), list)


# --- upload → list flow ---


def test_upload_appears_in_list(base_url):
    """Upload a video through nginx proxy and verify it appears in the list."""
    upload_r = httpx.post(
        f"{base_url}/api/videos/upload",
        files={"file": ("e2e_smoke.mp4", io.BytesIO(b"fake video data"), "video/mp4")},
    )
    assert upload_r.status_code == 200
    uploaded = upload_r.json()
    assert uploaded["title"] == "e2e_smoke.mp4"
    assert uploaded["status"] == "completed"
    assert "id" in uploaded

    list_r = httpx.get(f"{base_url}/api/videos/list")
    assert list_r.status_code == 200
    titles = [v["title"] for v in list_r.json()]
    assert "e2e_smoke.mp4" in titles
