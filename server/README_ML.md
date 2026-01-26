Python ML additions

Files added:
- `ml_forecast.py`: per-product demand forecasting (RandomForest on lag features). Use `predict(product, days)` or run from CLI.
- `flask_api.py`: small Flask app exposing `/api/forecast?product=...&days=...`.

Quick start (from `server/` directory):

Install requirements (use a venv):

```bash
pip install -r requirements.txt
```

Run the API:

```bash
python flask_api.py
```

Example request:

```bash
curl "http://localhost:6000/api/forecast?product=Milk&days=7"
```

Notes:
- Models are saved under `server/models/` as `forecast_<product>.joblib`.
- The script trains a model on demand if none exists for the product.
- The code expects `server/data/sales_data.csv` with columns `Product Name`, `Quantity Sold`, `Sale Date`.
