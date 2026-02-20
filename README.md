# Guardian AI — UPI Fraud Detection System

A machine learning-powered web application that detects fraudulent 
UPI transactions in real time using an ensemble of ML models.

---

## Live Demo

> Frontend hosted on Vercel | Backend hosted on Render

---

## Performance Metrics

| Metric | Score |
|--------|-------|
| ROC-AUC | 0.983 |
| PR-AUC | 0.877 |
| F1 Score | 0.854 |
| Precision | 87.2% |
| Recall | 83.7% |

---

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

**Backend**
- FastAPI
- Python 3.12
- LightGBM (primary model)
- Scikit-learn (Random Forest, Logistic Regression, AdaBoost)
- CatBoost
- Joblib

**Dataset**
- Credit Card Fraud Detection (Kaggle)
- 284,807 transactions | 492 fraud cases
- Source: https://www.kaggle.com/datasets/rehanliaqat17/creidct-card

---

## Project Structure
```
UPI-Fraud-Detection/
├── api/                  # FastAPI backend
│   └── app.py
├── frontend/             # React frontend
│   └── src/
├── models/               # Trained ML model
│   └── production_model.pkl
├── src/                  # ML pipeline
│   ├── pipeline.py
│   ├── models.py
│   └── utils.py
├── DATASET/              # Sample data
├── DOCUMENT/             # Project documentation
└── UPI-FRAUD-DETECTION.ipynb
```

---

## Local Setup

**Backend**
```bash
pip install -r requirements.txt
python -m uvicorn api.app:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /model/info | Model metadata |
| POST | /predict | Single prediction |
| POST | /predict/batch | Batch prediction |
| GET | /docs | Swagger UI |

---

## Author

**Pravin MR**  
MCA Student — SRM Institute of Science and Technology  
Register: RA2332241010304  

- Email: mrpravin000@gmail.com  
- Phone: +91 6380555595  
- LinkedIn: https://linkedin.com/in/mr-pravin  
- GitHub: https://github.com/mr-pravin  
- Portfolio: https://mrpravin000.vercel.app  

---

## License

MIT License — see LICENSE file for details.

---

*Project duration: Jan 2025 – Mar 2025 | DLK Career Development, Chennai*
