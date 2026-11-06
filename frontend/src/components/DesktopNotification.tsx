import { useEffect } from "react";

type Props = {
  show: boolean;
  result: any;
};

function DesktopNotification({ show, result }: Props) {

  useEffect(() => {

    if (!show || !result) return;

    if (String(result.prediction).toLowerCase() !== "scam")
      return;

    if (!("Notification" in window))
      return;

    const sendNotification = () => {

      new Notification(
        "🚨 Voice Scam AI",
        {
          body:
            `Scam Type: ${result.scam_type}\n` +
            `Confidence: ${result.confidence}%\n\n` +
            `Do NOT share OTP or bank details.`,
          icon: "/favicon.ico"
        }
      );

    };

    if (Notification.permission === "granted") {

      sendNotification();

    }

    else if (Notification.permission !== "denied") {

      Notification.requestPermission().then(permission => {

        if (permission === "granted") {

          sendNotification();

        }

      });

    }

  }, [show, result]);

  return null;

}

export default DesktopNotification;