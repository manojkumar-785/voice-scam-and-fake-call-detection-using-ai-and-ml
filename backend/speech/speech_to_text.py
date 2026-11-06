import os
import subprocess
import tempfile

import speech_recognition as sr


# ==========================================================
# RECOGNIZER
# ==========================================================

recognizer = sr.Recognizer()


# ==========================================================
# SPEECH TO TEXT
# ==========================================================

def convert_audio_to_text(audio_path):

    wav_path = None


    try:

        print(
            "\n=============================="
        )

        print(
            "🎤 SPEECH TO TEXT"
        )

        print(
            "=============================="
        )

        print(
            "Input audio:",
            audio_path
        )


        # ==================================================
        # CHECK AUDIO
        # ==================================================

        if not os.path.exists(
            audio_path
        ):

            print(
                "❌ Audio file does not exist"
            )

            return ""


        # ==================================================
        # CREATE TEMP WAV
        # ==================================================

        temp_file = tempfile.NamedTemporaryFile(
            suffix=".wav",
            delete=False
        )

        wav_path = temp_file.name

        temp_file.close()


        # ==================================================
        # FFMPEG CONVERSION
        # ==================================================

        print(
            "🔄 Converting audio to WAV..."
        )


        command = [

            "ffmpeg",

            "-y",

            "-i",
            audio_path,

            "-ac",
            "1",

            "-ar",
            "16000",

            "-sample_fmt",
            "s16",

            wav_path

        ]


        result = subprocess.run(

            command,

            stdout=subprocess.PIPE,

            stderr=subprocess.PIPE,

            text=True

        )


        if result.returncode != 0:

            print(
                "❌ FFmpeg conversion failed"
            )

            print(
                result.stderr
            )

            return ""


        print(
            "✅ WAV conversion successful"
        )


        # ==================================================
        # CHECK WAV
        # ==================================================

        if not os.path.exists(
            wav_path
        ):

            print(
                "❌ WAV file was not created"
            )

            return ""


        wav_size = os.path.getsize(
            wav_path
        )


        print(
            "WAV size:",
            wav_size,
            "bytes"
        )


        if wav_size < 1000:

            print(
                "❌ WAV file is too small"
            )

            return ""


        # ==================================================
        # READ AUDIO
        # ==================================================

        with sr.AudioFile(
            wav_path
        ) as source:

            print(
                "🎧 Reading audio..."
            )


            audio_data = recognizer.record(
                source
            )


        # ==================================================
        # GOOGLE SPEECH RECOGNITION
        # ==================================================

        print(
            "🧠 Sending audio for speech recognition..."
        )


        try:

            text = recognizer.recognize_google(

                audio_data,

                language="en-IN"

            )


            print(
                "✅ TRANSCRIPT:"
            )

            print(
                text
            )


            return text.strip()


        except sr.UnknownValueError:

            print(
                "⚠️ Speech could not be understood."
            )

            return ""


        except sr.RequestError as e:

            print(
                "❌ Speech Recognition service error:"
            )

            print(
                e
            )

            return ""


    except Exception as e:

        print(
            "❌ SPEECH ERROR:"
        )

        print(
            str(e)
        )

        return ""


    finally:

        # ==================================================
        # DELETE TEMP WAV
        # ==================================================

        if wav_path:

            try:

                if os.path.exists(
                    wav_path
                ):

                    os.remove(
                        wav_path
                    )

                    print(
                        "🧹 Temporary WAV deleted"
                    )

            except Exception as e:

                print(
                    "Could not delete temp WAV:",
                    e
                )