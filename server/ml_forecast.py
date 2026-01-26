import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
import joblib

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, 'data', 'sales_data.csv')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)


def _load_sales():
    df = pd.read_csv(DATA_PATH)
    if 'Sale Date' in df.columns:
        df['Sale Date'] = pd.to_datetime(df['Sale Date'], errors='coerce')
    else:
        # attempt common alternatives
        df['Sale Date'] = pd.to_datetime(df.iloc[:, -1], errors='coerce')
    # Normalize quantity column name
    if 'Quantity Sold' not in df.columns and 'Quantity' in df.columns:
        df.rename(columns={'Quantity': 'Quantity Sold'}, inplace=True)
    df['Quantity Sold'] = pd.to_numeric(df['Quantity Sold'], errors='coerce').fillna(0)
    return df


def _prepare_series(df, product_name):
    prod = df[df['Product Name'] == product_name][['Sale Date', 'Quantity Sold']].copy()
    prod = prod.groupby('Sale Date').sum().sort_index()
    if prod.empty:
        return None
    # reindex to daily frequency
    idx = pd.date_range(start=prod.index.min(), end=prod.index.max(), freq='D')
    prod = prod.reindex(idx, fill_value=0)
    prod.index.name = 'date'
    return prod['Quantity Sold']


def _create_lag_features(series, n_lags=14):
    df = pd.DataFrame({'y': series})
    for lag in range(1, n_lags + 1):
        df[f'lag_{lag}'] = df['y'].shift(lag)
    df = df.dropna()
    X = df[[f'lag_{lag}' for lag in range(1, n_lags + 1)]].values
    y = df['y'].values
    return X, y


def train_model_for_product(product_name, n_lags=14):
    df = _load_sales()
    series = _prepare_series(df, product_name)
    if series is None:
        raise ValueError(f'No sales records for product: {product_name}')
    X, y = _create_lag_features(series, n_lags=n_lags)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    model_path = os.path.join(MODELS_DIR, f"forecast_{_safe_name(product_name)}.joblib")
    joblib.dump({'model': model, 'last_index': series.index.max(), 'n_lags': n_lags}, model_path)
    return model_path


def _safe_name(name):
    return ''.join(c if c.isalnum() else '_' for c in name)


def predict(product_name, days=7):
    model_path = os.path.join(MODELS_DIR, f"forecast_{_safe_name(product_name)}.joblib")
    df = _load_sales()
    series = _prepare_series(df, product_name)
    if series is None:
        return {'error': 'no_data', 'message': f'No sales data for {product_name}'}
    if os.path.exists(model_path):
        meta = joblib.load(model_path)
        model = meta['model']
        n_lags = meta.get('n_lags', 14)
    else:
        # train on demand
        train_model_for_product(product_name)
        meta = joblib.load(model_path)
        model = meta['model']
        n_lags = meta.get('n_lags', 14)

    # If the series is too short for lag features, fallback to simple average forecast
    if len(series) < 2:
        # not enough history
        preds = [0.0 for _ in range(days)]
        last_date = series.index.max()
        forecast_dates = [(last_date + timedelta(days=i + 1)).strftime('%Y-%m-%d') for i in range(days)]
        return {'product': product_name, 'forecast': [{'date': d, 'predicted': float(v)} for d, v in zip(forecast_dates, preds)], 'model_path': model_path}

    last_window = series[-n_lags:].values if len(series) >= n_lags else series.values
    preds = []
    current_window = last_window.copy()
    for _ in range(days):
        X = current_window.reshape(1, -1)
        p = float(model.predict(X)[0])
        preds.append(max(0.0, p))
        current_window = np.roll(current_window, -1)
        current_window[-1] = p

    last_date = series.index.max()
    forecast_dates = [(last_date + timedelta(days=i + 1)).strftime('%Y-%m-%d') for i in range(days)]
    return {'product': product_name, 'forecast': [{'date': d, 'predicted': float(round(v, 3))} for d, v in zip(forecast_dates, preds)], 'model_path': model_path}


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Train or predict demand for a product')
    parser.add_argument('--train', action='store_true')
    parser.add_argument('--product', type=str, required=True)
    parser.add_argument('--days', type=int, default=7)
    args = parser.parse_args()

    if args.train:
        path = train_model_for_product(args.product)
        print('Trained model saved to', path)
    else:
        out = predict(args.product, days=args.days)
        print(out)
