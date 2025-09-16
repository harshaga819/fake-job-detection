# Fake Job Detection

Fake job postings are a growing problem in online recruitment platforms, causing loss of time, money, and trust for job seekers.  
This project uses **Machine Learning** to detect and classify job postings as **real** or **fake**, helping users and platforms stay safe.

---

##  Features
- Preprocessing of job posting datasets (cleaning, handling missing values, feature engineering).
- Exploratory Data Analysis (EDA) to understand job posting patterns.
- Machine Learning models for classification (Logistic Regression, Random Forest, SVM, etc.).
- Model evaluation using metrics like Accuracy, Precision, Recall, and F1-Score.
- Easy to extend with new datasets and additional models.

---

##  Project Structure
```

fake-job-detection/
│
├── data/                # Dataset files
├── notebooks/           # Jupyter notebooks (EDA, model building)
├── src/                 # Source code (preprocessing, training, utils)
├── models/              # Saved ML models
│
├── web/                 # Frontend files
│ ├── index.html         # Main HTML file
│ ├── css/
│ │ └── style.css        # Stylesheet
│ └── js/
│   └── script.js        # JavaScript for interactivity
│
├── requirements.txt     # Dependencies
└── README.md            # Project documentation

````
---

##  Algorithms Used

* Logistic Regression
* Random Forest
* Support Vector Machine (SVM)
* Gradient Boosting

---

##  Results

* The model achieved **98.6% accuracy** with the best algorithm.
* Precision, Recall, and F1-Score indicate strong performance in detecting fake jobs.


---

##  Future Work

* Use deep learning (LSTMs, Transformers) for text-based job descriptions.
* Real-time fake job posting detection system.
