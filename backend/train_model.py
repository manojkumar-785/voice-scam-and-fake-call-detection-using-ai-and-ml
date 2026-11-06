import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

data = pd.read_csv("../dataset/scam_dataset.csv")

X = data["text"]
y = data["label"]

vectorizer = TfidfVectorizer()

X_vectorized = vectorizer.fit_transform(X)

model = LogisticRegression()

model.fit(X_vectorized, y)

joblib.dump(model, "models/scam_classifier.pkl")
joblib.dump(vectorizer, "models/vectorizer.pkl")

print("Model Trained Successfully")