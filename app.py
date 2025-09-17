from flask import Flask, request, jsonify, render_template
import pickle

# Load model
model = pickle.load(open("model.pkl", "rb"))

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    job_desc = data.get("jobDescription")

    # ---- Preprocess job_desc (same as in training) ----
    # Example: vectorizer.transform([job_desc])
    # Here I'm assuming you trained with a vectorizer
    vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
    features = vectorizer.transform([job_desc])

    prediction = model.predict(features)[0]
    confidence = model.predict_proba(features).max()

    return jsonify({
        "isGenuine": bool(prediction),  # True = Genuine, False = Fake
        "confidence": float(confidence)
    })

if __name__ == "__main__":
    app.run(debug=True)




from flask import Flask, request, jsonify, render_template
import pickle

app = Flask(__name__)

# Load model and vectorizer
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

@app.route("/")
def home():
    return render_template("index.html")   # your frontend page

@app.route("/predict", methods=["POST"])
def predict():
    job_description = request.form.get("job_description")

    if not job_description:
        return jsonify({"error": "No job description provided"}), 400

    # Preprocess text
    input_features = vectorizer.transform([job_description])

    # Prediction
    prediction = model.predict(input_features)[0]   # 0 = Fake, 1 = Genuine
    confidence = max(model.predict_proba(input_features)[0]) * 100

    return jsonify({
        "isGenuine": bool(prediction),  
        "confidence": round(confidence, 2)
    })


if __name__ == "__main__":
    app.run(debug=True)




from flask import Flask, request, jsonify, render_template
import pickle

app = Flask(__name__)

# Load the trained model
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

@app.route("/")
def home():
    return render_template("index.html")  # Your webpage

@app.route("/predict", methods=["POST"])
def predict():
    job_description = request.form.get("job_description")  # Get input from frontend

    if not job_description:
        return jsonify({"error": "No job description provided"}), 400

    # Preprocess text (⚠️ must be same as during training)
    # Example: transform into vector if you used CountVectorizer/TfidfVectorizer
    # Assuming you saved vectorizer also as vectorizer.pkl
    with open("vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)

    input_features = vectorizer.transform([job_description])

    # Model prediction
    prediction = model.predict(input_features)[0]   # 0 = Fake, 1 = Genuine
    confidence = max(model.predict_proba(input_features)[0]) * 100  # Confidence %

    # Send result to frontend
    result = {
        "isGenuine": bool(prediction),  # True if genuine
        "confidence": round(confidence, 2)
    }
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)






from flask import Flask, request, jsonify, render_template
import pickle

app = Flask(__name__)

# Load your ML model (model.pkl is in same folder as app.py)
with open("model.pkl", "rb") as f:
    model = pickle.load(f)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Parse JSON data from frontend
        data = request.get_json()

        if not data or "description" not in data:
            return jsonify({"error": "No job description provided"}), 400

        description = data["description"]

        # Make prediction (you may need to preprocess description here)
        prediction = model.predict([description])[0]

        result = "Fake Job" if prediction == 1 else "Legitimate Job"

        return jsonify({"prediction": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)