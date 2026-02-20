"""Request/response schemas for fraud detection API."""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    """Risk classification levels."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TransactionFeatures(BaseModel):
    """Single transaction features."""
    time: float = Field(..., description="Transaction time in seconds")
    v1: float = Field(..., description="PCA component 1")
    v2: float = Field(..., description="PCA component 2")
    v3: float = Field(..., description="PCA component 3")
    v4: float = Field(..., description="PCA component 4")
    v5: float = Field(..., description="PCA component 5")
    v6: float = Field(..., description="PCA component 6")
    v7: float = Field(..., description="PCA component 7")
    v8: float = Field(..., description="PCA component 8")
    v9: float = Field(..., description="PCA component 9")
    v10: float = Field(..., description="PCA component 10")
    v11: float = Field(..., description="PCA component 11")
    v12: float = Field(..., description="PCA component 12")
    v13: float = Field(..., description="PCA component 13")
    v14: float = Field(..., description="PCA component 14")
    v15: float = Field(..., description="PCA component 15")
    v16: float = Field(..., description="PCA component 16")
    v17: float = Field(..., description="PCA component 17")
    v18: float = Field(..., description="PCA component 18")
    v19: float = Field(..., description="PCA component 19")
    v20: float = Field(..., description="PCA component 20")
    v21: float = Field(..., description="PCA component 21")
    v22: float = Field(..., description="PCA component 22")
    v23: float = Field(..., description="PCA component 23")
    v24: float = Field(..., description="PCA component 24")
    v25: float = Field(..., description="PCA component 25")
    v26: float = Field(..., description="PCA component 26")
    v27: float = Field(..., description="PCA component 27")
    v28: float = Field(..., description="PCA component 28")
    amount: float = Field(..., description="Transaction amount in USD")

    class Config:
        schema_extra = {
            "example": {
                "time": 12345.0,
                "v1": -1.3598071336738,
                "v2": -0.0727811733098,
                "v3": 2.536347261129,
                "v4": 1.378155179128,
                "v5": -0.3383207606948,
                "v6": 0.462388777896,
                "v7": 0.2395986778622,
                "v8": 0.0986979012249,
                "v9": 0.3637870422135,
                "v10": 0.0907941719789,
                "v11": -0.5516007414169,
                "v12": -0.6178068717891,
                "v13": -0.9913936131408,
                "v14": -0.3111735331126,
                "v15": 1.468176972456,
                "v16": -0.4704005692076,
                "v17": 0.2079671573406,
                "v18": 0.0257911047925,
                "v19": 0.4039932639369,
                "v20": 0.2514179864893,
                "v21": -0.0183067735324,
                "v22": 0.2777837630267,
                "v23": -0.110474318794,
                "v24": 0.0669280563987,
                "v25": 0.1285394977154,
                "v26": -0.1891154892036,
                "v27": 0.1335580703639,
                "v28": -0.021052053653,
                "amount": 149.62,
            }
        }


class PredictionResponse(BaseModel):
    """Single prediction response."""
    is_fraud: bool = Field(..., description="Fraud flag (True if fraud)")
    probability: float = Field(..., description="Fraud probability (0-1)")
    risk_level: RiskLevel = Field(..., description="Risk classification")
    confidence: float = Field(..., description="Model confidence")


class BatchPredictionRequest(BaseModel):
    """Request for batch predictions."""
    transactions: List[TransactionFeatures] = Field(..., description="List of transactions")


class BatchPredictionResponse(BaseModel):
    """Batch prediction response."""
    predictions: List[PredictionResponse]
    processed_at: str = Field(..., description="ISO timestamp")
    total_processed: int = Field(..., description="Number of transactions processed")
    fraud_count: int = Field(..., description="Number flagged as fraud")


class ModelInfo(BaseModel):
    """Model metadata."""
    model_type: str = Field(default="LightGBM", description="Model algorithm")
    calibration: str = Field(default="Isotonic", description="Calibration method")
    threshold: float = Field(..., description="Decision threshold")
    cv_pr_auc: float = Field(..., description="Cross-validation PR-AUC")
    test_roc_auc: float = Field(..., description="Test set ROC-AUC")
    test_pr_auc: float = Field(..., description="Test set PR-AUC")
    test_f1: float = Field(..., description="Test set F1 score")
    features: int = Field(default=30, description="Number of input features")
