import os
import json
import argparse

from ml_forecast import predict_all, list_products

BASE_DIR = os.path.dirname(__file__)
FORECASTS_DIR = os.path.join(BASE_DIR, 'forecasts')
os.makedirs(FORECASTS_DIR, exist_ok=True)


def _safe_name(name: str) -> str:
    return ''.join(c if c.isalnum() else '_' for c in name)


def main(days: int = 7, products=None):
    if products:
        prods = [p.strip() for p in products.split(',') if p.strip()]
    else:
        prods = None

    allf = predict_all(products=prods, days=days)
    saved = []
    for pname, pdata in allf.items():
        fname = f"forecast_{_safe_name(pname)}.json"
        path = os.path.join(FORECASTS_DIR, fname)
        try:
            with open(path, 'w', encoding='utf8') as f:
                json.dump(pdata, f, indent=2)
            saved.append((pname, path))
        except Exception as e:
            print('Failed to save', pname, e)

    print(f"Saved {len(saved)} forecasts to {FORECASTS_DIR}")
    for n, p in saved:
        print(' -', n, '->', p)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--days', type=int, default=7)
    parser.add_argument('--products', type=str, default=None, help='Comma-separated product names to limit')
    args = parser.parse_args()
    main(days=args.days, products=args.products)
