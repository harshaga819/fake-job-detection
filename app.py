from flask import Flask, request, jsonify, render_template
import pickle
import os

app = Flask(__name__)

# Absolute paths (VERY IMPORTANT for deployment)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model_path = os.path.join(BASE_DIR, "models", "model.pkl")
vectorizer_path = os.path.join(BASE_DIR, "models", "tfidf.pkl")

# Load ML model and vectorizer
model = pickle.load(open(model_path, "rb"))
vectorizer = pickle.load(open(vectorizer_path, "rb"))


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    job_text = request.form.get("job_description") or request.json.get("job_description")

    if not job_text:
        return jsonify({"error": "No job description provided"}), 400

    features = vectorizer.transform([job_text])
    prediction = model.predict(features)[0]

    return jsonify({
        "isGenuine": bool(prediction)
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)