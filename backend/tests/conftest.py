# backend/tests/conftest.py
from fastapi.testclient import TestClient
from main import app  # ✅ works inside backend/

import pytest

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
