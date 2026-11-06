import os
import joblib


# ==========================================================
# MODEL DIRECTORY
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


MODEL_PATH = os.path.join(
    BASE_DIR,
    "scam_classifier.pkl"
)


VECTORIZER_PATH = os.path.join(
    BASE_DIR,
    "vectorizer.pkl"
)


# ==========================================================
# LOAD MODEL
# ==========================================================

print(
    "Loading scam classification model..."
)

model = joblib.load(
    MODEL_PATH
)

print(
    "Loading text vectorizer..."
)

vectorizer = joblib.load(
    VECTORIZER_PATH
)

print(
    "✅ ML model loaded successfully."
)


# ==========================================================
# PREDICT
# ==========================================================

def predict_text(text):

    if not text:

        return (
            "Genuine",
            0,
            "Low",
            "General",
            "Low",
            0,
            0,
            "Low",
            "Low",
            False,
            [],
            []
        )


    text = str(
        text
    ).strip()


    # ======================================================
    # VECTORIZE
    # ======================================================

    text_vector = vectorizer.transform(
        [text]
    )


    # ======================================================
    # MODEL PREDICTION
    # ======================================================

    prediction = model.predict(
        text_vector
    )[0]


    # ======================================================
    # CONFIDENCE
    # ======================================================

    try:

        probabilities = model.predict_proba(
            text_vector
        )[0]

        confidence = round(
            max(probabilities) * 100,
            2
        )

    except Exception:

        confidence = 0


    text_lower = text.lower()


    # ======================================================
    # SCAM TYPE
    # ======================================================

    scam_type = "General"


    if any(
        word in text_lower
        for word in [
            "otp",
            "bank",
            "account",
            "debit card",
            "credit card",
            "atm",
            "net banking"
        ]
    ):

        scam_type = "Banking Fraud"


    elif any(
        word in text_lower
        for word in [
            "upi",
            "google pay",
            "phonepe",
            "paytm",
            "gpay"
        ]
    ):

        scam_type = "UPI Scam"


    elif any(
        word in text_lower
        for word in [
            "kyc",
            "verify account",
            "update kyc"
        ]
    ):

        scam_type = "KYC Scam"


    elif any(
        word in text_lower
        for word in [
            "lottery",
            "winner",
            "prize",
            "jackpot"
        ]
    ):

        scam_type = "Lottery Scam"


    elif any(
        word in text_lower
        for word in [
            "job",
            "interview",
            "salary",
            "offer letter",
            "recruitment"
        ]
    ):

        scam_type = "Job Scam"


    elif any(
        word in text_lower
        for word in [
            "loan",
            "emi",
            "interest"
        ]
    ):

        scam_type = "Loan Scam"


    elif any(
        word in text_lower
        for word in [
            "investment",
            "bitcoin",
            "crypto",
            "share market"
        ]
    ):

        scam_type = "Investment Scam"


    elif any(
        word in text_lower
        for word in [
            "courier",
            "parcel",
            "delivery"
        ]
    ):

        scam_type = "Courier Scam"


    # ======================================================
    # REASONS
    # ======================================================

    reasons = []


    if "otp" in text_lower:

        reasons.append(
            "OTP request detected."
        )


    if "bank" in text_lower:

        reasons.append(
            "Bank-related conversation detected."
        )


    # ======================================================
    # URGENCY
    # ======================================================

    urgency_words = [

        "urgent",
        "immediately",
        "now",
        "quickly",
        "verify",
        "limited time",
        "expire",
        "blocked",
        "suspend",
        "within",
        "today"

    ]


    urgency_score = 0


    for word in urgency_words:

        if word in text_lower:

            urgency_score += 10


    urgency_score = min(
        urgency_score,
        100
    )


    if urgency_score > 0:

        reasons.append(
            "Urgent or pressure-based language detected."
        )


    # ======================================================
    # MONEY
    # ======================================================

    money_words = [

        "payment",
        "transfer",
        "loan",
        "money",
        "account"

    ]


    if any(
        word in text_lower
        for word in money_words
    ):

        reasons.append(
            "Financial keywords detected."
        )


    # ======================================================
    # CONFIDENCE REASON
    # ======================================================

    if confidence >= 90:

        reasons.append(
            "Very high ML model confidence."
        )

    elif confidence >= 70:

        reasons.append(
            "Moderate ML model confidence."
        )

    else:

        reasons.append(
            "Low ML model confidence."
        )


    # ======================================================
    # FRAUD SCORE
    # ======================================================

    fraud_score = confidence


    if scam_type != "General":

        fraud_score += 5


    fraud_score += (
        urgency_score * 0.20
    )


    fraud_score = min(
        round(
            fraud_score,
            2
        ),
        100
    )


    # ======================================================
    # FINANCIAL RISK
    # ======================================================

    if any(
        word in text_lower
        for word in [
            "bank",
            "account",
            "otp",
            "upi",
            "credit card",
            "debit card",
            "payment",
            "money"
        ]
    ):

        financial_risk = "High"

    else:

        financial_risk = "Low"


    # ======================================================
    # SENSITIVE DATA RISK
    # ======================================================

    if any(
        word in text_lower
        for word in [
            "otp",
            "password",
            "pin",
            "cvv",
            "aadhaar",
            "pan"
        ]
    ):

        sensitive_data_risk = "High"

    else:

        sensitive_data_risk = "Low"


    # ======================================================
    # SOCIAL ENGINEERING
    # ======================================================

    social_engineering = any(

        word in text_lower

        for word in [
            "urgent",
            "verify",
            "immediately",
            "reward",
            "lottery",
            "offer"
        ]

    )


    # ======================================================
    # RISK LEVEL
    # ======================================================

    if confidence >= 95 or urgency_score >= 80:

        risk_level = "Critical"
        threat_level = "Extreme"


    elif confidence >= 85:

        risk_level = "High"
        threat_level = "High"


    elif confidence >= 70:

        risk_level = "Medium"
        threat_level = "Moderate"


    else:

        risk_level = "Low"
        threat_level = "Low"


    # ======================================================
    # RECOMMENDATIONS
    # ======================================================

    prediction_text = str(
        prediction
    ).lower()


    if prediction_text == "scam":

        recommendations = [

            "Never share your OTP.",

            "Do not reveal bank details.",

            "Disconnect the call if suspicious.",

            "Verify using the official company number."

        ]

    else:

        recommendations = [

            "No obvious scam indicators detected.",

            "Continue the conversation carefully.",

            "Avoid sharing sensitive information."

        ]


    # ======================================================
    # RETURN
    # ======================================================

    return (

        prediction,

        confidence,

        risk_level,

        scam_type,

        threat_level,

        urgency_score,

        fraud_score,

        financial_risk,

        sensitive_data_risk,

        social_engineering,

        reasons,

        recommendations

    )