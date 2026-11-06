import os
import traceback
from datetime import datetime


from flask import (
    Blueprint,
    request,
    jsonify,
    send_file
)

from werkzeug.utils import secure_filename

from speech.speech_to_text import convert_audio_to_text
from models.model_loader import predict_text
from nlp.keyword_detector import detect_keywords

from database import (
    insert_history,
    get_history,
    get_stats,
    delete_history,
    clear_history
)


# ==========================================================
# BLUEPRINT
# ==========================================================

detect_bp = Blueprint(
    "detect",
    __name__
)


# ==========================================================
# BASE DIRECTORY
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


# ==========================================================
# UPLOAD DIRECTORY
# ==========================================================

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ==========================================================
# ALLOWED AUDIO EXTENSIONS
# ==========================================================

ALLOWED_EXTENSIONS = ALLOWED_EXTENSIONS = {
    "mp3",
    "mpeg",
    "mpga",
    "wav",
    "m4a",
    "aac",
    "webm",
    "ogg",
    "flac",
}

    


# ==========================================================
# CHECK ALLOWED FILE
# ==========================================================

def allowed_file(filename):

    if not filename:
        return False

    if "." not in filename:
        return False

    extension = (
        filename
        .rsplit(".", 1)[1]
        .lower()
    )

    return extension in ALLOWED_EXTENSIONS


# ==========================================================
# SAVE HISTORY
# ==========================================================

def save_history(
    prediction,
    confidence,
    risk_level,
    transcript,
    keywords,
    audio_filename,
    source
):

    try:

        insert_history(

            date=datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            ),

            prediction=prediction,

            confidence=confidence,

            risk_level=risk_level,

            transcript=transcript,

            keywords=keywords,

            audio_filename=audio_filename,

            source=source

        )

        print(
            "History saved successfully."
        )

        return True

    except Exception as e:

        print(
            "Database save error:",
            e
        )

        traceback.print_exc()

        return False


# ==========================================================
# ANALYZE AUDIO
# ==========================================================

def analyze_audio_file(
    filepath,
    audio_filename,
    source="Upload"
):

    try:

        print(
            "\n=========================================="
        )

        print(
            "AUDIO ANALYSIS STARTED"
        )

        print(
            "=========================================="
        )

        print(
            "File:",
            audio_filename
        )

        print(
            "Source:",
            source
        )


        # ==================================================
        # CHECK FILE
        # ==================================================

        if not os.path.exists(filepath):

            return {

                "success": False,

                "message":
                    "Audio file was not found."

            }


        # ==================================================
        # STEP 1
        # SPEECH TO TEXT
        # ==================================================

        print(
            "\nSTEP 1: SPEECH TO TEXT"
        )

        transcript = convert_audio_to_text(
            filepath
        )

        if transcript is None:

            transcript = ""

        transcript = str(
            transcript
        ).strip()

        print(
            "Transcript:",
            transcript
        )


        # ==================================================
        # NO SPEECH
        # ==================================================

        if not transcript:

            return {

                "success": False,

                "message":
                    "No understandable human speech was detected. Please speak clearly and try again.",

                "prediction":
                    None,

                "confidence":
                    0,

                "risk_level":
                    "Low",

                "scam_type":
                    None,

                "threat_level":
                    "Low",

                "urgency_score":
                    0,

                "fraud_score":
                    0,

                "financial_risk":
                    "Low",

                "sensitive_data_risk":
                    "Low",

                "social_engineering":
                    False,

                "reasons":
                    [],

                "recommendations":
                    [],

                "transcript":
                    "",

                "keywords":
                    [],

                "audio_filename":
                    audio_filename,

                "source":
                    source

            }


        # ==================================================
        # STEP 2
        # KEYWORD DETECTION
        # ==================================================

        print(
            "\nSTEP 2: KEYWORD DETECTION"
        )

        try:

            keywords = detect_keywords(
                transcript
            )

        except Exception as e:

            print(
                "Keyword detection error:",
                e
            )

            keywords = []


        print(
            "Detected keywords:",
            keywords
        )


        # ==================================================
        # STEP 3
        # ML CLASSIFICATION
        # ==================================================

        print(
            "\nSTEP 3: ML CLASSIFICATION"
        )

        prediction_result = predict_text(
            transcript
        )


        # ==================================================
        # CHECK ML RESULT
        # ==================================================

        if not isinstance(
            prediction_result,
            tuple
        ):

            return {

                "success":
                    False,

                "message":
                    "ML model returned an invalid result."

            }


        if len(
            prediction_result
        ) < 12:

            return {

                "success":
                    False,

                "message":
                    "ML model returned incomplete detection data."

            }


        (
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

        ) = prediction_result


        # ==================================================
        # NORMALIZE PREDICTION
        # ==================================================

        prediction_text = str(
            prediction
        ).strip().lower()


        if prediction_text == "scam":

            prediction = "Scam"

        elif prediction_text == "genuine":

            prediction = "Genuine"

        elif "scam" in prediction_text:

            prediction = "Scam"

        else:

            prediction = "Genuine"


        # ==================================================
        # CONFIDENCE
        # ==================================================

        try:

            confidence = float(
                confidence
            )

        except Exception:

            confidence = 0


        confidence = round(

            max(
                0,
                min(
                    100,
                    confidence
                )
            ),

            2

        )


        # ==================================================
        # NORMALIZE VALUES
        # ==================================================

        risk_level = str(
            risk_level or "Low"
        ).strip()


        scam_type = str(
            scam_type or "General"
        ).strip()


        threat_level = str(
            threat_level or "Low"
        ).strip()


        try:

            urgency_score = float(
                urgency_score
            )

        except Exception:

            urgency_score = 0


        try:

            fraud_score = float(
                fraud_score
            )

        except Exception:

            fraud_score = 0


        urgency_score = round(

            max(
                0,
                min(
                    100,
                    urgency_score
                )
            ),

            2

        )


        fraud_score = round(

            max(
                0,
                min(
                    100,
                    fraud_score
                )
            ),

            2

        )


        financial_risk = str(
            financial_risk or "Low"
        ).strip()


        sensitive_data_risk = str(
            sensitive_data_risk or "Low"
        ).strip()


        social_engineering = bool(
            social_engineering
        )


        # ==================================================
        # REASONS
        # ==================================================

        if not isinstance(
            reasons,
            list
        ):

            reasons = []


        reasons = [

            str(reason).strip()

            for reason in reasons

            if str(reason).strip()

        ]


        # ==================================================
        # RECOMMENDATIONS
        # ==================================================

        if not isinstance(
            recommendations,
            list
        ):

            recommendations = []


        recommendations = [

            str(item).strip()

            for item in recommendations

            if str(item).strip()

        ]


        # ==================================================
        # GENUINE CALL
        # ==================================================

        if prediction == "Genuine":

            scam_type = "None"


            if not recommendations:

                recommendations = [

                    "No obvious scam indicators detected.",

                    "Continue the conversation carefully.",

                    "Avoid sharing sensitive information."

                ]


        # ==================================================
        # SCAM CALL
        # ==================================================

        if prediction == "Scam":

            if not recommendations:

                recommendations = [

                    "Never share your OTP.",

                    "Do not reveal bank details.",

                    "Disconnect the call immediately.",

                    "Verify using the official company number."

                ]


        # ==================================================
        # STEP 4
        # SAVE HISTORY
        # ==================================================

        print(
            "\nSTEP 4: SAVING HISTORY"
        )


        history_saved = save_history(

            prediction=prediction,

            confidence=confidence,

            risk_level=risk_level,

            transcript=transcript,

            keywords=",".join(
                keywords
            ),

            audio_filename=audio_filename,

            source=source

        )


        # ==================================================
        # FINAL RESPONSE
        # ==================================================

        result = {

            "success":
                True,

            "prediction":
                prediction,

            "confidence":
                confidence,

            "risk_level":
                risk_level,

            "scam_type":
                scam_type,

            "threat_level":
                threat_level,

            "urgency_score":
                urgency_score,

            "fraud_score":
                fraud_score,

            "financial_risk":
                financial_risk,

            "sensitive_data_risk":
                sensitive_data_risk,

            "social_engineering":
                social_engineering,

            "reasons":
                reasons,

            "recommendations":
                recommendations,

            "transcript":
                transcript,

            "keywords":
                keywords,

            "audio_filename":
                audio_filename,

            "source":
                source,

            "history_saved":
                history_saved

        }


        print(
            "\n=========================================="
        )

        print(
            "ANALYSIS COMPLETE"
        )

        print(
            "=========================================="
        )

        print(
            "Prediction:",
            prediction
        )

        print(
            "Confidence:",
            confidence,
            "%"
        )

        print(
            "Risk:",
            risk_level
        )

        print(
            "Scam type:",
            scam_type
        )

        print(
            "Transcript:",
            transcript
        )

        print(
            "History saved:",
            history_saved
        )

        print(
            "=========================================="
        )


        return result


    except Exception as e:

        print(
            "\nAUDIO ANALYSIS ERROR:"
        )

        print(
            str(e)
        )

        traceback.print_exc()


        return {

            "success":
                False,

            "message":
                str(e),

            "audio_filename":
                audio_filename,

            "source":
                source

        }


# ==========================================================
# POST /detect
# ==========================================================

@detect_bp.route(
    "/detect",
    methods=["POST"]
)
def detect_call():

    try:

        print(
            "\n=========================================="
        )

        print(
            "NEW AUDIO RECEIVED"
        )

        print(
            "=========================================="
        )


        # ==================================================
        # CHECK AUDIO
        # ==================================================

        if "audio" not in request.files:

            return jsonify({

                "success":
                    False,

                "message":
                    "No audio file was uploaded."

            }), 400


        audio_file = request.files[
            "audio"
        ]


        if not audio_file:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid audio file."

            }), 400


        original_filename = (
            audio_file.filename
            or ""
        )


        if not original_filename:

            return jsonify({

                "success":
                    False,

                "message":
                    "Audio filename is missing."

            }), 400


        # ==================================================
        # EXTENSION
        # ==================================================

        if not allowed_file(
            original_filename
        ):

            return jsonify({

                "success":
                    False,

                "message":
                    "Unsupported audio format."

            }), 400


        # ==================================================
        # SECURE NAME
        # ==================================================

        filename = secure_filename(
            original_filename
        )


        if not filename:

            filename = (
                "live_recording.webm"
            )


        # ==================================================
        # PREVENT OVERWRITE
        # ==================================================

        name, extension = os.path.splitext(
            filename
        )


        counter = 1


        filepath = os.path.join(
            UPLOAD_FOLDER,
            filename
        )


        while os.path.exists(
            filepath
        ):

            filename = (
                f"{name}_{counter}{extension}"
            )

            filepath = os.path.join(
                UPLOAD_FOLDER,
                filename
            )

            counter += 1


        # ==================================================
        # SAVE AUDIO
        # ==================================================

        audio_file.save(
            filepath
        )


        print(
            "Saved:",
            filepath
        )


        # ==================================================
        # CHECK SIZE
        # ==================================================

        file_size = os.path.getsize(
            filepath
        )


        print(
            "File size:",
            file_size,
            "bytes"
        )


        if file_size < 1000:

            return jsonify({

                "success":
                    False,

                "message":
                    "The recording is empty or too short.",

                "audio_filename":
                    filename

            }), 400


        # ==================================================
        # SOURCE
        # ==================================================

        source = request.form.get(
            "source",
            "Upload"
        )


        source = str(
            source
        ).strip()


        if not source:

            source = "Upload"


        # ==================================================
        # ANALYZE
        # ==================================================

        result = analyze_audio_file(

            filepath=filepath,

            audio_filename=filename,

            source=source

        )


        # ==================================================
        # KEEP AUDIO
        # ==================================================

        print(
            "Recording retained:",
            filename
        )


        return jsonify(
            result
        )


    except Exception as e:

        print(
            "\n/detect ERROR:"
        )

        print(
            str(e)
        )

        traceback.print_exc()


        return jsonify({

            "success":
                False,

            "message":
                str(e)

        }), 500


# ==========================================================
# GET /history
# ==========================================================

@detect_bp.route(
    "/history",
    methods=["GET"]
)
def history():

    try:

        records = get_history()

        # IMPORTANT:
        # Return the array directly.
        # The React frontend expects /history
        # to be an array.

        return jsonify(
            records
        )


    except Exception as e:

        print(
            "HISTORY ERROR:",
            e
        )

        traceback.print_exc()


        return jsonify({

            "success":
                False,

            "message":
                str(e)

        }), 500


# ==========================================================
# GET /stats
# ==========================================================

@detect_bp.route(
    "/stats",
    methods=["GET"]
)
def stats():

    try:

        statistics = get_stats()

        # IMPORTANT:
        # Return the statistics object directly.
        # The React dashboard expects:
        # stats.total_calls
        # stats.scam_calls
        # stats.genuine_calls
        # etc.

        return jsonify(
            statistics
        )


    except Exception as e:

        print(
            "STATS ERROR:",
            e
        )

        traceback.print_exc()


        return jsonify({

            "success":
                False,

            "message":
                str(e)

        }), 500


# ==========================================================
# DELETE /history/<id>
# ==========================================================

@detect_bp.route(
    "/history/<int:record_id>",
    methods=["DELETE"]
)
def delete_history_record(
    record_id
):

    try:

        deleted = delete_history(
            record_id
        )


        if not deleted:

            return jsonify({

                "success":
                    False,

                "message":
                    "History record not found."

            }), 404


        return jsonify({

            "success":
                True,

            "message":
                "History record deleted."

        })


    except Exception as e:

        print(
            "DELETE HISTORY ERROR:",
            e
        )

        traceback.print_exc()


        return jsonify({

            "success":
                False,

            "message":
                str(e)

        }), 500


# ==========================================================
# DELETE ALL HISTORY
# ==========================================================

@detect_bp.route(
    "/history",
    methods=["DELETE"]
)
def delete_all_history():

    try:

        clear_history()


        return jsonify({

            "success":
                True,

            "message":
                "All history deleted."

        })


    except Exception as e:

        print(
            "CLEAR HISTORY ERROR:",
            e
        )

        traceback.print_exc()


        return jsonify({

            "success":
                False,

            "message":
                str(e)

        }), 500


# ==========================================================
# GET SAVED AUDIO
# ==========================================================

@detect_bp.route(
    "/history/audio/<filename>",
    methods=["GET"]
)
def get_history_audio(
    filename
):

    try:

        filename = secure_filename(
            filename
        )


        if not filename:

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid filename."

            }), 400


        filepath = os.path.join(
            UPLOAD_FOLDER,
            filename
        )


        # ==================================================
        # SECURITY CHECK
        # ==================================================

        upload_folder_real = os.path.realpath(
            UPLOAD_FOLDER
        )


        filepath_real = os.path.realpath(
            filepath
        )


        if not filepath_real.startswith(
            upload_folder_real + os.sep
        ):

            return jsonify({

                "success":
                    False,

                "message":
                    "Invalid audio path."

            }), 403


        # ==================================================
        # CHECK FILE
        # ==================================================

        if not os.path.exists(
            filepath_real
        ):

            return jsonify({

                "success":
                    False,

                "message":
                    "Audio recording not found."

            }), 404


        return send_file(
            filepath_real,
            as_attachment=False
        )


    except Exception as e:

        print(
            "Audio playback error:",
            e
        )

        traceback.print_exc()


        return jsonify({

            "success":
                False,

            "message":
                str(e)

        }), 500
        