import os
import pytest


@pytest.fixture(scope="session")
def base_url():
    return os.getenv("E2E_BASE_URL", "http://localhost")
