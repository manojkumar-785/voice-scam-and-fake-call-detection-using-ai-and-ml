from flask import Flask, request, Response, jsonify
from flask_cors import CORS

from routes.detect import detect_bp

from database import (
    create_table,
    get_history,
    get_stats,
    delete_history,
    clear_history
)


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# CREATE DATABASE
# ============================================================

create_table()


# ============================================================
# REGISTER DETECTION ROUTES
# ============================================================

app.register_blueprint(
    detect_bp
)


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():

    return jsonify({

        "success": True,

        "message":
            "Voice Scam Detection API Running"

    })


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/health")
def health():

    return jsonify({

        "success": True,

        "status": "online"

    })


# ============================================================
# GET HISTORY
# ============================================================

@app.route("/history", methods=["GET"])
def history():

    try:

        print(
            "\n📋 HISTORY REQUEST RECEIVED"
        )

        records = get_history()

        print(
            "History records:",
            len(records)
        )

        return jsonify(records)

    except Exception as e:

        print(
            "❌ History error:",
            e
        )

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500


# ============================================================
# GET DASHBOARD STATS
# ============================================================

@app.route("/stats", methods=["GET"])
def stats():

    try:

        print(
            "\n📊 STATS REQUEST RECEIVED"
        )

        statistics = get_stats()

        print(
            "Statistics:",
            statistics
        )

        return jsonify(statistics)

    except Exception as e:

        print(
            "❌ Stats error:",
            e
        )

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500


# ============================================================
# DELETE ONE HISTORY RECORD
# ============================================================

@app.route(
    "/history/<int:id>",
    methods=["DELETE"]
)
def remove_history(id):

    try:

        delete_history(id)

        return jsonify({

            "success": True,

            "message":
                "History record deleted."

        })

    except Exception as e:

        print(
            "❌ Delete error:",
            e
        )

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500


# ============================================================
# CLEAR ALL HISTORY
# ============================================================

@app.route(
    "/history",
    methods=["DELETE"]
)
def remove_all_history():

    try:

        clear_history()

        return jsonify({

            "success": True,

            "message":
                "All history deleted."

        })

    except Exception as e:

        print(
            "❌ Clear history error:",
            e
        )

        return jsonify({

            "success": False,

            "message":
                str(e)

        }), 500


# ============================================================
# INCOMING PHONE CALL
# ============================================================

@app.route(
    "/incoming-call",
    methods=["POST", "GET"]
)
def incoming_call():

    print(
        "\n==================================="
    )

    print(
        "📞 INCOMING CALL"
    )

    print(
        "==================================="
    )

    caller = request.values.get(
        "From",
        "Unknown"
    )

    receiver = request.values.get(
        "To",
        "Unknown"
    )

    call_sid = request.values.get(
        "CallSid",
        "Unknown"
    )

    print(
        "Caller:",
        caller
    )

    print(
        "Receiver:",
        receiver
    )

    print(
        "Call SID:",
        call_sid
    )


    # ========================================================
    # TWILIO RESPONSE
    # ========================================================

    twiml = """

    <Response>

        <Say>
            Welcome to Voice Scam AI.
            This call may be recorded for security analysis.
        </Say>

        <Record
            recordingStatusCallback="/recording-complete"
            recordingStatusCallbackMethod="POST"
            recordingStatusCallbackEvent="completed"
        />

    </Response>

    """


    return Response(
        twiml,
        mimetype="text/xml"
    )


# ============================================================
# RECORDING COMPLETED
# ============================================================

@app.route(
    "/recording-complete",
    methods=["POST"]
)
def recording_complete():

    print(
        "\n==================================="
    )

    print(
        "🎙️ RECORDING COMPLETED"
    )

    print(
        "==================================="
    )


    recording_url = request.values.get(
        "RecordingUrl",
        ""
    )

    recording_sid = request.values.get(
        "RecordingSid",
        ""
    )

    call_sid = request.values.get(
        "CallSid",
        ""
    )

    caller = request.values.get(
        "From",
        "Unknown"
    )

    duration = request.values.get(
        "RecordingDuration",
        "0"
    )


    print(
        "Caller:",
        caller
    )

    print(
        "Call SID:",
        call_sid
    )

    print(
        "Recording SID:",
        recording_sid
    )

    print(
        "Duration:",
        duration
    )

    print(
        "Recording URL:",
        recording_url
    )


    return jsonify({

        "success": True,

        "message":
            "Recording received",

        "caller":
            caller,

        "call_sid":
            call_sid,

        "recording_url":
            recording_url

    })


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    print(
        "\n=========================================="
    )

    print(
        "🚀 VOICE SCAM AI BACKEND"
    )

    print(
        "=========================================="
    )

    print(
        "📊 Stats   : http://127.0.0.1:5000/stats"
    )

    print(
        "📋 History : http://127.0.0.1:5000/history"
    )

    print(
        "🎤 Detect  : http://127.0.0.1:5000/detect"
    )

    print(
        "==========================================\n"
    )


    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )