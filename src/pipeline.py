"""
Fraud detection pipeline with LightGBM and isotonic calibration.
Handles extreme class imbalance (0.17% positive rate).
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Tuple

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    f1_score,
    precision_recall_curve,
    confusion_matrix,
    classification_report,
)
from sklearn.calibration import CalibratedClassifierCV
import lightgbm as lgb

RANDOM_STATE = 42
CALIBRATION_METHOD = "isotonic"
N_SPLITS = 5


def build_pipeline(random_state: int = RANDOM_STATE) -> Pipeline:
    """Construct sklearn pipeline: scaler -> LightGBM -> calibration."""
    scaler = StandardScaler()

    lgb_clf = lgb.LGBMClassifier(
        boosting_type="gbdt",
        objective="binary",
        metric="auc",
        learning_rate=0.03,
        num_leaves=31,
        max_depth=-1,
        min_child_samples=20,
        feature_fraction=0.8,
        bagging_fraction=0.8,
        bagging_freq=1,
        n_estimators=1000,
        random_state=random_state,
        verbose=-1,
        n_jobs=-1,
        importance_type="gain",
    )

    calibrated_clf = CalibratedClassifierCV(
        estimator=lgb_clf, method=CALIBRATION_METHOD, cv=5
    )

    return Pipeline(
        steps=[("scaler", scaler), ("model", calibrated_clf)]
    )


def compute_crossval_metrics(
    X: pd.DataFrame,
    y: pd.Series,
    n_splits: int = N_SPLITS,
    random_state: int = RANDOM_STATE,
) -> Dict:
    """Compute PR-AUC via stratified k-fold cross-validation."""
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    pr_auc_scores = []

    for train_idx, val_idx in skf.split(X, y):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

        pipeline = build_pipeline(random_state=random_state)
        pipeline.fit(X_train, y_train)

        y_val_proba = pipeline.predict_proba(X_val)[:, 1]
        pr_auc = average_precision_score(y_val, y_val_proba)
        pr_auc_scores.append(pr_auc)

    return {
        "fold_scores": pr_auc_scores,
        "mean": np.mean(pr_auc_scores),
        "std": np.std(pr_auc_scores),
    }


def find_optimal_threshold(y_true: np.ndarray, y_proba: np.ndarray) -> Tuple[float, float]:
    """Find threshold that maximizes F1 score."""
    thresholds = np.arange(0.01, 0.99, 0.01)
    f1_scores = [
        f1_score(y_true, (y_proba >= t).astype(int), zero_division=0) for t in thresholds
    ]
    best_idx = np.argmax(f1_scores)
    return thresholds[best_idx], f1_scores[best_idx]


def train_model(
    X_train: pd.DataFrame, y_train: pd.Series, random_state: int = RANDOM_STATE
) -> Tuple[Pipeline, float]:
    """Train model and return pipeline with optimal threshold."""
    pipeline = build_pipeline(random_state=random_state)
    pipeline.fit(X_train, y_train)

    y_train_proba = pipeline.predict_proba(X_train)[:, 1]
    threshold, _ = find_optimal_threshold(y_train.values, y_train_proba)

    return pipeline, threshold


def evaluate(
    pipeline: Pipeline,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    threshold: float,
) -> Dict:
    """Evaluate model on test set."""
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    y_pred = (y_proba >= threshold).astype(int)

    metrics = {
        "roc_auc": roc_auc_score(y_test, y_proba),
        "pr_auc": average_precision_score(y_test, y_proba),
        "f1": f1_score(y_test, y_pred, zero_division=0),
        "confusion_matrix": confusion_matrix(y_test, y_pred),
        "threshold": threshold,
    }

    return metrics


def save_model(pipeline: Pipeline, threshold: float, path: str = "models/production_model.pkl") -> None:
    """Serialize pipeline and threshold."""
    bundle = {
        "pipeline": pipeline,
        "threshold": threshold,
        "random_state": RANDOM_STATE,
    }
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, path)


def load_model(path: str = "models/production_model.pkl") -> Tuple[Pipeline, float]:
    """Load serialized model."""
    bundle = joblib.load(path)
    return bundle["pipeline"], bundle["threshold"]


def predict_batch(
    X: pd.DataFrame, pipeline: Pipeline = None, threshold: float = None
) -> pd.DataFrame:
    """Predict fraud probability and class for batch of transactions."""
    if pipeline is None or threshold is None:
        pipeline, threshold = load_model()

    proba = pipeline.predict_proba(X)[:, 1]
    predictions = (proba >= threshold).astype(int)

    return pd.DataFrame(
        {
            "probability": proba,
            "prediction": predictions,
            "threshold": threshold,
        }
    )


def predict_single(
    x: pd.Series, pipeline: Pipeline = None, threshold: float = None
) -> Dict:
    """Predict fraud for single transaction."""
    if pipeline is None or threshold is None:
        pipeline, threshold = load_model()

    X = x.to_frame().T
    proba = pipeline.predict_proba(X)[0, 1]
    prediction = int(proba >= threshold)

    return {
        "probability": float(proba),
        "prediction": int(prediction),
        "threshold": float(threshold),
    }
