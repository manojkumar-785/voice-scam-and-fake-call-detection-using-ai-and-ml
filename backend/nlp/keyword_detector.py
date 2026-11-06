SCAM_KEYWORDS = [

    "otp",
    "bank",
    "account",
    "kyc",
    "aadhaar",
    "pan",
    "password",
    "cvv",
    "atm",
    "credit card",
    "debit card",
    "verify",
    "update account",
    "upi",
    "payment",
    "transfer",
    "money",
    "pin",
    "loan",
    "lottery",
    "prize",
    "winner",
    "investment",
    "crypto",
    "courier",
    "parcel",
    "delivery",
    "urgent",
    "immediately"

]


def detect_keywords(text):

    if not text:

        return []


    text = str(
        text
    ).lower()


    found = []


    for keyword in SCAM_KEYWORDS:

        if keyword in text:

            found.append(
                keyword
            )


    return found