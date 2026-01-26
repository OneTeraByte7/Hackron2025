from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_forecast import predict, list_products, predict_all
import os
import json

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(__file__)
FORECASTS_DIR = os.path.join(BASE_DIR, 'forecasts')
os.makedirs(FORECASTS_DIR, exist_ok=True)


@app.route('/api/forecast')
def forecast():
    product = request.args.get('product')
    days = int(request.args.get('days', 7))
    if not product:
        return jsonify({'error': 'missing_parameter', 'message': 'Please provide ?product=PRODUCT_NAME'}), 400
    try:
        out = predict(product, days=days)
        if out.get('error'):
            return jsonify(out), 404
        return jsonify(out)
    except Exception as e:
        return jsonify({'error': 'server_error', 'message': str(e)}), 500


def _safe_name(name):
    return ''.join(c if c.isalnum() else '_' for c in name)


def _normalize(name):
    # lowercase and keep only alphanumeric for fuzzy matching
    return ''.join(c.lower() for c in name if c.isalnum())


def _find_forecast_file(product_name):
    """Return path to a saved forecast file that best matches product_name, or None."""
    target = _normalize(product_name)
    files = [f for f in os.listdir(FORECASTS_DIR) if f.startswith('forecast_') and f.endswith('.json')]
    # exact safe-name match first
    exact = f"forecast_{_safe_name(product_name)}.json"
    if exact in files:
        return os.path.join(FORECASTS_DIR, exact)

    # try substring matching on normalized names
    candidates = []
    for fn in files:
        base = fn.replace('forecast_', '').replace('.json', '')
        norm = _normalize(base)
        # if target appears in candidate or candidate appears in target, it's a match
        if target in norm or norm in target:
            candidates.append((fn, norm))

    if not candidates:
        return None

    # prefer shortest candidate (more specific) or first match
    candidates.sort(key=lambda x: len(x[1]))
    return os.path.join(FORECASTS_DIR, candidates[0][0])


@app.route('/api/forecasts/save')
def save_forecast():
    product = request.args.get('product')
    days = int(request.args.get('days', 7))
    if not product:
        return jsonify({'error': 'missing_parameter', 'message': 'Please provide ?product=PRODUCT_NAME'}), 400
    try:
        out = predict(product, days=days)
        if out.get('error'):
            return jsonify(out), 404
        fname = f"forecast_{_safe_name(product)}.json"
        path = os.path.join(FORECASTS_DIR, fname)
        with open(path, 'w', encoding='utf8') as f:
            json.dump(out, f, indent=2)
        return jsonify({'saved': path})
    except Exception as e:
        return jsonify({'error': 'server_error', 'message': str(e)}), 500


@app.route('/api/forecasts/latest')
def latest_forecast():
    product = request.args.get('product')
    if not product:
        return jsonify({'error': 'missing_parameter', 'message': 'Please provide ?product=PRODUCT_NAME'}), 400
    # try to find a matching saved forecast file robustly
    path = _find_forecast_file(product)
    if not path or not os.path.exists(path):
        return jsonify({'error': 'not_found', 'message': 'No saved forecast for this product'}), 404
    with open(path, 'r', encoding='utf8') as f:
        data = json.load(f)
    return jsonify(data)



@app.route('/api/forecasts/all')
def forecasts_all():
    """Return forecasts for all known products as a mapping product -> forecast dict."""
    days = int(request.args.get('days', 7))
    try:
        # Use predict_all which will load products from the sales CSV if none provided
        allf = predict_all(days=days)
        return jsonify(allf)
    except Exception as e:
        return jsonify({'error': 'server_error', 'message': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('ML_API_PORT', 6000))
    app.run(host='0.0.0.0', port=port)
