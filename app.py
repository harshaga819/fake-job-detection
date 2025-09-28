from flask import Flask, request, jsonify, render_template
import pickle

app = Flask(__name__)

# Load ML model and vectorizer
model = pickle.load(open("models/model.pkl", "rb"))
vectorizer = pickle.load(open("models/tfidf.pkl", "rb"))

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    # Get text from request
    job_text = request.form.get("job_description") or request.json.get("job_description")

    # Convert text to features
    features = vectorizer.transform([job_text])

    # Predict
    prediction = model.predict(features)[0]

    return jsonify({
        "isGenuine": bool(prediction)
    })

if __name__ == "__main__":
    app.run(debug=True)
