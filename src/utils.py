"""Utility functions for fraud detection API."""

import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict
from src.models import TransactionFeatures, RiskLevel, PredictionResponse


def transaction_to_dataframe(txn: TransactionFeatures) -> pd.DataFrame:
    """Convert TransactionFeatures to DataFrame row."""
    data = {
        'Time': txn.time,
        'V1': txn.v1,
        'V2': txn.v2,
        'V3': txn.v3,
        'V4': txn.v4,
        'V5': txn.v5,
        'V6': txn.v6,
        'V7': txn.v7,
        'V8': txn.v8,
        'V9': txn.v9,
        'V10': txn.v10,
        'V11': txn.v11,
        'V12': txn.v12,
        'V13': txn.v13,
        'V14': txn.v14,
        'V15': txn.v15,
        'V16': txn.v16,
        'V17': txn.v17,
        'V18': txn.v18,
        'V19': txn.v19,
        'V20': txn.v20,
        'V21': txn.v21,
        'V22': txn.v22,
        'V23': txn.v23,
        'V24': txn.v24,
        'V25': txn.v25,
        'V26': txn.v26,
        'V27': txn.v27,
        'V28': txn.v28,
        'Amount': txn.amount,
    }
    return pd.DataFrame([data])


def calculate_risk_level(probability: float) -> RiskLevel:
    """Classify risk level based on fraud probability."""
    if probability < 0.1:
        return RiskLevel.LOW
    elif probability < 0.5:
        return RiskLevel.MEDIUM
    else:
        return RiskLevel.HIGH


def build_prediction_response(
    probability: float, prediction: int, threshold: float
) -> PredictionResponse:
    """Build structured prediction response."""
    is_fraud = prediction == 1
    risk_level = calculate_risk_level(probability)

    # Confidence decreases as probability approaches 0.5
    if is_fraud:
        confidence = min(probability, 1.0)
    else:
        confidence = 1.0 - probability

    return PredictionResponse(
        is_fraud=is_fraud,
        probability=float(probability),
        risk_level=risk_level,
        confidence=float(confidence),
    )


def get_timestamp() -> str:
    """Get current timestamp in ISO format."""
    return datetime.utcnow().isoformat() + "Z"


def log_prediction(
    probability: float,
    prediction: int,
    risk_level: str,
    amount: float,
    logger_func=None,
) -> None:
    """Log prediction for monitoring/audit."""
    log_msg = (
        f"[FRAUD_PREDICTION] amount={amount:.2f} "
        f"prob={probability:.4f} "
        f"pred={prediction} "
        f"risk={risk_level}"
    )
    if logger_func:
        logger_func(log_msg)
    else:
        print(log_msg)
