
import { useEffect } from "react";

type Props = {
  play: boolean;
  result: any;
};

function VoiceWarning({ play, result }: Props) {
  useEffect(() => {
    if (!play || !result) return;

    const prediction = String(
      result.prediction || ""
    ).trim().toLowerCase();

    let message = "";

    if (prediction === "scam") {
      const scamType = String(
        result.scam_type || ""
      ).toLowerCase();

      if (scamType.includes("bank")) {
        message =
          "Warning. Banking fraud detected. Never share your OTP, PIN, CVV, password or bank account details.";
      } else if (
        scamType.includes("upi") ||
        scamType.includes("payment")
      ) {
        message =
          "Warning. UPI or payment scam suspected. Never approve unknown payment requests or scan suspicious QR codes.";
      } else if (
        scamType.includes("lottery") ||
        scamType.includes("prize")
      ) {
        message =
          "Warning. Lottery or prize scam suspected. Never pay unexpected fees to claim an unverified prize.";
      } else if (
        scamType.includes("job") ||
        scamType.includes("employment")
      ) {
        message =
          "Warning. Job scam suspected. Verify the employer and never pay suspicious recruitment fees.";
      } else if (
        scamType.includes("investment") ||
        scamType.includes("trading")
      ) {
        message =
          "Warning. Investment scam suspected. Be cautious of guaranteed returns and verify the provider independently.";
      } else if (scamType.includes("loan")) {
        message =
          "Warning. Loan scam suspected. Verify the lender and never disclose your OTP, banking password or PIN.";
      } else if (scamType.includes("insurance")) {
        message =
          "Warning. Insurance scam suspected. Verify the agent and policy directly with the insurance company.";
      } else if (
        scamType.includes("police") ||
        scamType.includes("digital arrest") ||
        scamType.includes("government")
      ) {
        message =
          "Warning. Possible impersonation scam. Do not transfer money because of threats. Verify the caller independently.";
      } else if (
        scamType.includes("otp") ||
        scamType.includes("verification")
      ) {
        message =
          "Warning. OTP theft scam suspected. Never share verification codes with callers.";
      } else if (
        scamType.includes("phishing") ||
        scamType.includes("link")
      ) {
        message =
          "Warning. Possible phishing scam. Avoid suspicious links and never enter sensitive information on unverified websites.";
      } else if (
        scamType.includes("tech support") ||
        scamType.includes("technical support")
      ) {
        message =
          "Warning. Technical support scam suspected. Never give remote access to your device to an unverified caller.";
      } else if (
        scamType.includes("charity") ||
        scamType.includes("donation")
      ) {
        message =
          "Warning. Possible charity scam. Verify the organization before donating.";
      } else if (
        scamType.includes("romance") ||
        scamType.includes("relationship")
      ) {
        message =
          "Warning. Possible romance scam. Be cautious if someone online requests money or financial information.";
      } else if (
        scamType.includes("delivery") ||
        scamType.includes("courier")
      ) {
        message =
          "Warning. Possible delivery scam. Verify delivery messages through the official courier website.";
      } else if (
        scamType.includes("electricity") ||
        scamType.includes("utility")
      ) {
        message =
          "Warning. Possible utility payment scam. Verify the notice with your provider using official contact details.";
      } else {
        message =
          "Warning. A potential scam has been detected. Do not share your OTP, passwords or bank details. Do not transfer money under pressure. Verify the caller independently.";
      }
    } else if (prediction === "genuine") {
      message =
        "No scam indicators were detected. Please remain cautious and never share sensitive information with an unverified caller.";
    } else {
      return;
    }

    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "en-IN";
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [play, result]);

  return null;
}

export default VoiceWarning;
