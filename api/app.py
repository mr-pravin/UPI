"""FastAPI application for fraud detection service."""

import logging
import asyncio
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
import pandas as pd

from src.pipeline import load_model, predict_batch, predict_single
from src.models import (
    TransactionFeatures,
    BatchPredictionRequest,
    BatchPredictionResponse,
    PredictionResponse,
    ModelInfo,
)
from src.utils import (
    transaction_to_dataframe,
    build_prediction_response,
    get_timestamp,
    log_prediction,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model state
_pipeline = None
_threshold = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, cleanup on shutdown."""
    global _pipeline, _threshold
    try:
        _pipeline, _threshold = load_model()
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise RuntimeError("Model initialization failed")
    yield
    logger.info("Shutting down")


app = FastAPI(
    title="Fraud Detection API",
    description="Real-time fraud detection for financial transactions",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8081",
        "https://guardian-ai.vercel.app",
        "https://*.vercel.app",
        "https://mrpravin000.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": get_timestamp(),
        "model_loaded": _pipeline is not None,
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Predictions"])
async def predict_transaction(txn: TransactionFeatures):
    """
    Predict fraud for a single transaction.

    Returns fraud probability, classification, and risk level.
    """
    if _pipeline is None or _threshold is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded",
        )

    try:
        X = transaction_to_dataframe(txn)
        proba = _pipeline.predict_proba(X)[0, 1]
        prediction = int(proba >= _threshold)

        response = build_prediction_response(proba, prediction, _threshold)

        # Log for monitoring
        log_prediction(
            proba,
            prediction,
            response.risk_level.value,
            txn.amount,
            logger.info,
        )

        return response

    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prediction failed",
        )


@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Predictions"])
async def predict_batch_transactions(request: BatchPredictionRequest):
    """
    Predict fraud for multiple transactions.

    Processes batch of transactions and returns structured results.
    """
    if _pipeline is None or _threshold is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded",
        )

    if len(request.transactions) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty transaction list",
        )

    if len(request.transactions) > 1000:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Maximum 1000 transactions per request",
        )

    try:
        # Convert to DataFrame
        dfs = [transaction_to_dataframe(txn) for txn in request.transactions]
        X = pd.concat(dfs, ignore_index=True)

        # Get predictions
        proba = _pipeline.predict_proba(X)[:, 1]
        predictions = (proba >= _threshold).astype(int)

        # Build responses
        results = []
        fraud_count = 0

        for i, txn in enumerate(request.transactions):
            response = build_prediction_response(
                float(proba[i]), int(predictions[i]), _threshold
            )
            results.append(response)

            if response.is_fraud:
                fraud_count += 1
                log_prediction(
                    proba[i],
                    predictions[i],
                    response.risk_level.value,
                    txn.amount,
                    logger.warning,
                )

        return BatchPredictionResponse(
            predictions=results,
            processed_at=get_timestamp(),
            total_processed=len(request.transactions),
            fraud_count=fraud_count,
        )

    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid request data",
        )
    except Exception as e:
        logger.error(f"Batch prediction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch prediction failed",
        )


@app.get("/model/info", response_model=ModelInfo, tags=["Model"])
async def get_model_info():
    """Get model metadata and performance metrics."""
    return ModelInfo(
        model_type="LightGBM",
        calibration="Isotonic",
        threshold=_threshold or 0.0,
        cv_pr_auc=0.856,
        test_roc_auc=0.983,
        test_pr_auc=0.877,
        test_f1=0.854,
        features=30,
    )


@app.get("/", tags=["System"])
async def root():
    """Root endpoint with basic info."""
    return {
        "service": "Fraud Detection API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
