"""Basic API tests."""

import pytest
from fastapi.testclient import TestClient
from api.app import app

client = TestClient(app)


def test_health_check():
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "service" in response.json()


def test_model_info():
    """Test model info endpoint."""
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == "LightGBM"
    assert data["threshold"] > 0


def test_predict_legitimate():
    """Test prediction on legitimate transaction."""
    txn = {
        "time": 12345.0,
        "v1": -0.5,
        "v2": 0.2,
        "v3": -0.1,
        "v4": 0.3,
        "v5": -0.2,
        "v6": 0.1,
        "v7": -0.4,
        "v8": 0.2,
        "v9": -0.3,
        "v10": 0.1,
        "v11": -0.2,
        "v12": 0.3,
        "v13": -0.1,
        "v14": 0.2,
        "v15": -0.3,
        "v16": 0.1,
        "v17": -0.2,
        "v18": 0.3,
        "v19": -0.1,
        "v20": 0.2,
        "v21": -0.3,
        "v22": 0.1,
        "v23": -0.2,
        "v24": 0.3,
        "v25": -0.1,
        "v26": 0.2,
        "v27": -0.3,
        "v28": 0.1,
        "amount": 50.0,
    }
    response = client.post("/predict", json=txn)
    assert response.status_code == 200
    data = response.json()
    assert "probability" in data
    assert "is_fraud" in data
    assert "risk_level" in data


def test_predict_missing_fields():
    """Test prediction with missing fields."""
    txn = {"time": 12345.0, "amount": 50.0}
    response = client.post("/predict", json=txn)
    assert response.status_code == 422


def test_batch_predict_empty():
    """Test batch prediction with empty list."""
    request = {"transactions": []}
    response = client.post("/predict/batch", json=request)
    assert response.status_code == 400


def test_batch_predict_too_large():
    """Test batch prediction exceeds limit."""
    txn = {
        "time": 0.0,
        "v1": 0.0,
        "v2": 0.0,
        "v3": 0.0,
        "v4": 0.0,
        "v5": 0.0,
        "v6": 0.0,
        "v7": 0.0,
        "v8": 0.0,
        "v9": 0.0,
        "v10": 0.0,
        "v11": 0.0,
        "v12": 0.0,
        "v13": 0.0,
        "v14": 0.0,
        "v15": 0.0,
        "v16": 0.0,
        "v17": 0.0,
        "v18": 0.0,
        "v19": 0.0,
        "v20": 0.0,
        "v21": 0.0,
        "v22": 0.0,
        "v23": 0.0,
        "v24": 0.0,
        "v25": 0.0,
        "v26": 0.0,
        "v27": 0.0,
        "v28": 0.0,
        "amount": 0.0,
    }
    request = {"transactions": [txn] * 1001}
    response = client.post("/predict/batch", json=request)
    assert response.status_code == 413
