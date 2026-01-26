import argparse
import json
import os
from ml_forecast import predict

BASE_DIR = os.path.dirname(__file__)
FORECASTS_DIR = os.path.join(BASE_DIR, 'forecasts')
os.makedirs(FORECASTS_DIR, exist_ok=True)


def _safe_name(name):
    return ''.join(c if c.isalnum() else '_' for c in name)


def save(product, days=7):
    out = predict(product, days=days)
    if out.get('error'):
        raise RuntimeError(out.get('message', 'unknown error'))
    fname = f"forecast_{_safe_name(product)}.json"
    path = os.path.join(FORECASTS_DIR, fname)
    with open(path, 'w', encoding='utf8') as f:
        json.dump(out, f, indent=2)
    return path


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--product', required=True)
    parser.add_argument('--days', type=int, default=7)
    args = parser.parse_args()
    p = save(args.product, days=args.days)
    print('Saved forecast to', p)
