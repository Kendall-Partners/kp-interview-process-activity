from flask import Flask, jsonify, render_template
import json
import os

app = Flask(__name__)

@app.get("/api/records")
def get_records():
    # You requested: ../data/records.json
    # We'll resolve it safely from this file's directory.
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Primary: ../data/records.json relative to routes.py directory
    candidate_path = os.path.normpath(os.path.join(base_dir, os.pardir, "data", "records.json"))

    # Fallback: ./data/records.json (common repo layout)
    fallback_path = os.path.join(base_dir, "data", "records.json")

    data_path = candidate_path if os.path.exists(candidate_path) else fallback_path

    with open(data_path, "r", encoding="utf-8") as f:
        payload = json.load(f)

    return jsonify(payload)

@app.route("/")
def home():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)

