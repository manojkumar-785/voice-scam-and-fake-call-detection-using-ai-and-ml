import os
import sqlite3
from datetime import datetime


# ==========================================================
# DATABASE PATH
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

DATABASE = os.path.join(
    BASE_DIR,
    "voice_scam.db"
)


# ==========================================================
# CONNECTION
# ==========================================================

def get_connection():

    conn = sqlite3.connect(
        DATABASE
    )

    conn.row_factory = sqlite3.Row

    return conn


# ==========================================================
# CREATE TABLE
# ==========================================================

def create_table():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS history (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            date TEXT,

            prediction TEXT,

            confidence REAL,

            risk_level TEXT,

            transcript TEXT,

            keywords TEXT,

            caller_number TEXT DEFAULT 'Unknown',

            call_sid TEXT DEFAULT '',

            duration TEXT DEFAULT '',

            recording_url TEXT DEFAULT '',

            audio_filename TEXT DEFAULT '',

            source TEXT DEFAULT 'Upload'

        )
        """
    )

    conn.commit()


    # ======================================================
    # CHECK EXISTING COLUMNS
    # ======================================================

    cursor.execute(
        "PRAGMA table_info(history)"
    )

    columns = cursor.fetchall()

    existing_columns = [
        column["name"]
        for column in columns
    ]


    # ======================================================
    # ADD MISSING COLUMNS
    # ======================================================

    new_columns = {

        "caller_number":
            "TEXT DEFAULT 'Unknown'",

        "call_sid":
            "TEXT DEFAULT ''",

        "duration":
            "TEXT DEFAULT ''",

        "recording_url":
            "TEXT DEFAULT ''",

        "audio_filename":
            "TEXT DEFAULT ''",

        "source":
            "TEXT DEFAULT 'Upload'"

    }


    for column_name, column_type in new_columns.items():

        if column_name not in existing_columns:

            try:

                cursor.execute(
                    f"""
                    ALTER TABLE history
                    ADD COLUMN {column_name}
                    {column_type}
                    """
                )

                print(
                    f"Added database column: {column_name}"
                )

            except Exception as e:

                print(
                    f"Could not add column {column_name}:",
                    e
                )


    conn.commit()

    conn.close()


# ==========================================================
# INSERT HISTORY
# ==========================================================

def insert_history(
    date=None,
    prediction="Unknown",
    confidence=0,
    risk_level="Low",
    transcript="",
    keywords="",
    caller_number="Unknown",
    call_sid="",
    duration="",
    recording_url="",
    audio_filename="",
    source="Upload"
):

    conn = get_connection()

    cursor = conn.cursor()


    if not date:

        date = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )


    cursor.execute(
        """
        INSERT INTO history (

            date,
            prediction,
            confidence,
            risk_level,
            transcript,
            keywords,
            caller_number,
            call_sid,
            duration,
            recording_url,
            audio_filename,
            source

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,

        (
            date,
            prediction,
            confidence,
            risk_level,
            transcript,
            keywords,
            caller_number,
            call_sid,
            duration,
            recording_url,
            audio_filename,
            source
        )
    )


    conn.commit()

    conn.close()


# ==========================================================
# GET HISTORY
# ==========================================================

def get_history():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM history
        ORDER BY id DESC
        """
    )

    rows = cursor.fetchall()

    conn.close()

    return [
        dict(row)
        for row in rows
    ]


# ==========================================================
# GET SINGLE HISTORY RECORD
# ==========================================================

def get_history_by_id(record_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM history
        WHERE id = ?
        """,
        (record_id,)
    )

    row = cursor.fetchone()

    conn.close()

    if row:

        return dict(row)

    return None


# ==========================================================
# DELETE HISTORY
# ==========================================================

def delete_history(record_id):

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM history
        WHERE id = ?
        """,
        (record_id,)
    )

    conn.commit()

    deleted = cursor.rowcount

    conn.close()

    return deleted > 0


# ==========================================================
# CLEAR HISTORY
# ==========================================================

def clear_history():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM history"
    )

    conn.commit()

    conn.close()


# ==========================================================
# GET STATISTICS
# ==========================================================

def get_stats():

    conn = get_connection()

    cursor = conn.cursor()


    # Total

    cursor.execute(
        "SELECT COUNT(*) FROM history"
    )

    total_calls = cursor.fetchone()[0]


    # Scam

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM history
        WHERE LOWER(TRIM(prediction)) = 'scam'
        """
    )

    scam_calls = cursor.fetchone()[0]


    # Genuine

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM history
        WHERE LOWER(TRIM(prediction)) = 'genuine'
        """
    )

    genuine_calls = cursor.fetchone()[0]


    # High risk

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM history
        WHERE LOWER(TRIM(risk_level)) = 'high'
        """
    )

    high_risk = cursor.fetchone()[0]


    # Critical risk

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM history
        WHERE LOWER(TRIM(risk_level)) = 'critical'
        """
    )

    critical_risk = cursor.fetchone()[0]


    # Medium risk

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM history
        WHERE LOWER(TRIM(risk_level)) = 'medium'
        """
    )

    medium_risk = cursor.fetchone()[0]


    # Low risk

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM history
        WHERE LOWER(TRIM(risk_level)) = 'low'
        """
    )

    low_risk = cursor.fetchone()[0]


    conn.close()


    return {

        "total_calls":
            total_calls,

        "scam_calls":
            scam_calls,

        "genuine_calls":
            genuine_calls,

        "high_risk":
            high_risk,

        "critical_risk":
            critical_risk,

        "medium_risk":
            medium_risk,

        "low_risk":
            low_risk

    }