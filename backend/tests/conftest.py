import os
import tempfile
import shutil

# Must be set before any app/model imports
_test_tmpdir = tempfile.mkdtemp()
os.environ["DATABASE_PATH"] = f"sqlite:///{_test_tmpdir}/test.db"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from models.schema import Base, engine  # noqa: E402
from app import app  # noqa: E402


@pytest.fixture(autouse=True)
def reset_db():
    """Create fresh tables for each test, then tear down."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def pytest_sessionfinish(session, exitstatus):
    """Clean up temp dir after all tests."""
    shutil.rmtree(_test_tmpdir, ignore_errors=True)
