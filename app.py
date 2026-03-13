from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np
import os
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "models", "model2.pkl")

# Load Model

with open(model_path, "rb") as f:
    model = pickle.load(f)

# Load SentenceTransformer
encoder = SentenceTransformer("all-MiniLM-L6-v2")

@app.route("/")
def home():
    return render_template("index.html")

# Feature Engineering

def create_numeric_features(text, has_logo):
    description_length = len(text)
    caps_count = sum(1 for c in text if c.isupper())
    caps_ratio = caps_count / len(text) if len(text) > 0 else 0
    return np.array([has_logo, caps_ratio, description_length])

# Prediction API

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    description = data.get("description", "")
    has_logo = int(data.get("has_logo", 0))

    if len(description.split()) < 10:
        return jsonify({
          "error": "Job description too short"
        })

    combined_text = description

    # SentenceTransformer Embedding

    embedding = encoder.encode([combined_text])
    embedding = np.array(embedding)

    # Numeric Features

    numeric_features = create_numeric_features(description, has_logo)
    numeric_features = numeric_features.reshape(1, -1)

    # Combine Features

    final_features = np.hstack([embedding, numeric_features])

    # Model Prediction

    prob = model.predict_proba(final_features)[0][1]
    prediction = model.predict(final_features)[0]

    # Convert NumPy types to Python types
    prob = float(prob)
    prediction = int(prediction)

    return jsonify({
        "prediction": prediction,
        "probability": prob
    })


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 10000))

    app.run(host="0.0.0.0", port=port)