"""FastAPI application for fraud detection service."""

import logging
import asyncio
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status, Request
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
        "https://guardian-upi.vercel.app",
        "https://*.vercel.app",
        "https://mrpravin000.vercel.app"
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

@app.post("/predict/csv")
async def predict_csv(request: Request):
    """Accept comma-separated values directly"""
    try:
        body = await request.body()
        csv_string = body.decode('utf-8').strip()
        
        # Parse comma-separated values
        values = [float(v.strip()) for v in csv_string.split(',')]
        
        if len(values) != 30:
            raise HTTPException(
                status_code=422,
                detail=f"Expected 30 values, got {len(values)}"
            )
        
        # Map to feature names (match uppercase as expected by utils)
        # Wait, the prompt specified lowercase keys. I'll use exactly what they requested but will pass it to a DataFrame.
        # However, earlier I found that the pipeline expects capitalized keys (Time, V1, V2, Amount).
        # Actually, in their snippet, they gave lowercase. I will map them as requested:
        feature_names = [
            'time', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7',
            'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15',
            'v16', 'v17', 'v18', 'v19', 'v20', 'v21', 'v22', 'v23',
            'v24', 'v25', 'v26', 'v27', 'v28', 'amount'
        ]
        
        features = dict(zip(feature_names, values))
        
        # Use existing prediction logic
        import pandas as pd
        # Map to uppercase keys since pipeline expects them:
        df_features = {
            'Time': features['time'],
            'V1': features['v1'], 'V2': features['v2'], 'V3': features['v3'],
            'V4': features['v4'], 'V5': features['v5'], 'V6': features['v6'],
            'V7': features['v7'], 'V8': features['v8'], 'V9': features['v9'],
            'V10': features['v10'], 'V11': features['v11'], 'V12': features['v12'],
            'V13': features['v13'], 'V14': features['v14'], 'V15': features['v15'],
            'V16': features['v16'], 'V17': features['v17'], 'V18': features['v18'],
            'V19': features['v19'], 'V20': features['v20'], 'V21': features['v21'],
            'V22': features['v22'], 'V23': features['v23'], 'V24': features['v24'],
            'V25': features['v25'], 'V26': features['v26'], 'V27': features['v27'],
            'V28': features['v28'], 'Amount': features['amount']
        }
        df = pd.DataFrame([df_features])
        prediction = _pipeline.predict(df)[0]
        probability = _pipeline.predict_proba(df)[0][1]
        
        risk_level = "HIGH" if probability > 0.7 else "MEDIUM" if probability > 0.3 else "LOW"
        
        return {
            "is_fraud": bool(prediction),
            "probability": float(probability),
            "confidence": float(probability if prediction else 1 - probability),
            "risk_level": risk_level,
            "message": "Fraud detected" if prediction else "Transaction legitimate"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Invalid values: {str(e)}")


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
