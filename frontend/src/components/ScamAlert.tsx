import React from "react";

type Props = {
  show: boolean;
  result: any;
  onClose: () => void;
};

function ScamAlert({
  show,
  result,
  onClose,
}: Props) {

  if (!show || !result) {
    return null;
  }

  const prediction =
    String(result.prediction || "")
      .trim()
      .toLowerCase();

  const isScam =
    prediction === "scam";

  const isGenuine =
    prediction === "genuine";

  // Ignore unknown results
  if (!isScam && !isGenuine) {
    return null;
  }

  // ==========================================================
  // GENUINE CALL
  // ==========================================================

  if (isGenuine) {

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "rgba(15, 23, 42, 0.68)",
          backdropFilter: "blur(8px)",
        }}
      >

        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            background: "#ffffff",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow:
              "0 30px 80px rgba(15, 23, 42, 0.30)",
            animation:
              "scamAlertPop 0.25s ease-out",
          }}
        >

          {/* ==================================================
              TOP STATUS
          ================================================== */}

          <div
            style={{
              padding: "28px 30px 24px",
              background:
                "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
              borderBottom:
                "1px solid #bbf7d0",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
              }}
            >

              <div
                style={{
                  width: "68px",
                  height: "68px",
                  flexShrink: 0,
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #22c55e, #16a34a)",
                  boxShadow:
                    "0 10px 25px rgba(34,197,94,0.25)",
                  fontSize: "34px",
                }}
              >
                🛡️
              </div>

              <div>

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    letterSpacing: "1.2px",
                    color: "#16a34a",
                    marginBottom: "5px",
                  }}
                >
                  AI CALL ANALYSIS
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "27px",
                    lineHeight: 1.15,
                    color: "#14532d",
                  }}
                >
                  Genuine Call
                </h1>

                <p
                  style={{
                    margin:
                      "7px 0 0",
                    color: "#166534",
                    fontSize: "14px",
                  }}
                >
                  No major scam indicators detected
                </p>

              </div>

            </div>

          </div>


          {/* ==================================================
              BODY
          ================================================== */}

          <div
            style={{
              padding: "28px 30px",
            }}
          >

            {/* SUCCESS MESSAGE */}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "16px",
                borderRadius: "14px",
                background: "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
                marginBottom: "22px",
              }}
            >

              <span
                style={{
                  fontSize: "21px",
                }}
              >
                ✓
              </span>

              <div>

                <strong
                  style={{
                    color: "#166534",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  This call appears to be genuine
                </strong>

                <span
                  style={{
                    color: "#4b5563",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  The AI analysis did not identify
                  significant suspicious patterns.
                </span>

              </div>

            </div>


            {/* ==================================================
                METRICS
            ================================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "12px",
                marginBottom: "24px",
              }}
            >

              <div
                style={{
                  padding: "17px",
                  borderRadius: "15px",
                  background: "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                }}
              >

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#64748b",
                    marginBottom: "6px",
                    textTransform:
                      "uppercase",
                    letterSpacing: ".5px",
                  }}
                >
                  Confidence
                </div>

                <div
                  style={{
                    fontSize: "25px",
                    fontWeight: "800",
                    color: "#0f172a",
                  }}
                >
                  {result.confidence}%
                </div>

              </div>


              <div
                style={{
                  padding: "17px",
                  borderRadius: "15px",
                  background: "#f0fdf4",
                  border:
                    "1px solid #bbf7d0",
                }}
              >

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#64748b",
                    marginBottom: "6px",
                    textTransform:
                      "uppercase",
                    letterSpacing: ".5px",
                  }}
                >
                  Risk Level
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    fontSize: "22px",
                    fontWeight: "800",
                    color: "#16a34a",
                  }}
                >

                  <span>●</span>

                  {result.risk_level || "Low"}

                </div>

              </div>

            </div>


            {/* ==================================================
                SAFETY STATUS
            ================================================== */}

            <div>

              <h3
                style={{
                  margin:
                    "0 0 14px",
                  color: "#0f172a",
                  fontSize: "17px",
                }}
              >
                🛡️ Safety Status
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  <span
                    style={{
                      color: "#16a34a",
                      fontWeight: "800",
                    }}
                  >
                    ✓
                  </span>

                  No major scam indicators
                  were detected.
                </div>


                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  <span
                    style={{
                      color: "#16a34a",
                      fontWeight: "800",
                    }}
                  >
                    ✓
                  </span>

                  Conversation appears
                  legitimate.
                </div>


                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  <span
                    style={{
                      color: "#16a34a",
                      fontWeight: "800",
                    }}
                  >
                    ✓
                  </span>

                  Continue to remain cautious
                  with sensitive information.
                </div>

              </div>

            </div>


            {/* ==================================================
                CLOSE BUTTON
            ================================================== */}

            <button
              onClick={onClose}
              style={{
                width: "100%",
                marginTop: "28px",
                padding: "14px 20px",
                border: "none",
                borderRadius: "13px",
                background:
                  "linear-gradient(135deg, #16a34a, #22c55e)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow:
                  "0 8px 20px rgba(34,197,94,0.20)",
              }}
            >
              ✓ Close
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // SCAM CALL
  // ==========================================================

  return (

    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(15, 23, 42, 0.72)",
        backdropFilter: "blur(8px)",
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: "24px",
          overflowX: "hidden",
          boxShadow:
            "0 30px 80px rgba(15, 23, 42, 0.35)",
          animation:
            "scamAlertPop 0.25s ease-out",
        }}
      >

        {/* ==================================================
            SCAM HEADER
        ================================================== */}

        <div
          style={{
            padding: "28px 30px 24px",
            background:
              "linear-gradient(135deg, #fef2f2, #fff7ed)",
            borderBottom:
              "1px solid #fecaca",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >

            <div
              style={{
                width: "68px",
                height: "68px",
                flexShrink: 0,
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, #ef4444, #dc2626)",
                boxShadow:
                  "0 10px 25px rgba(239,68,68,0.28)",
                fontSize: "34px",
              }}
            >
              🚨
            </div>

            <div>

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "800",
                  letterSpacing: "1.2px",
                  color: "#dc2626",
                  marginBottom: "5px",
                }}
              >
                SECURITY ALERT
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "27px",
                  lineHeight: 1.15,
                  color: "#991b1b",
                }}
              >
                Potential Scam
              </h1>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  color: "#b91c1c",
                  fontSize: "14px",
                }}
              >
                Suspicious indicators detected
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            BODY
        ================================================== */}

        <div
          style={{
            padding: "28px 30px",
          }}
        >

          {/* WARNING */}

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "16px",
              borderRadius: "14px",
              background: "#fef2f2",
              border:
                "1px solid #fecaca",
              marginBottom: "22px",
            }}
          >

            <span
              style={{
                fontSize: "21px",
              }}
            >
              ⚠️
            </span>

            <div>

              <strong
                style={{
                  color: "#991b1b",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                This call appears suspicious
              </strong>

              <span
                style={{
                  color: "#4b5563",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                The AI identified patterns that
                may indicate fraudulent activity.
              </span>

            </div>

          </div>


          {/* ==================================================
              METRICS
          ================================================== */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >

            <div
              style={{
                padding: "17px",
                borderRadius: "15px",
                background: "#f8fafc",
                border:
                  "1px solid #e2e8f0",
              }}
            >

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#64748b",
                  marginBottom: "6px",
                  textTransform:
                    "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                Confidence
              </div>

              <div
                style={{
                  fontSize: "25px",
                  fontWeight: "800",
                  color: "#0f172a",
                }}
              >
                {result.confidence}%
              </div>

            </div>


            <div
              style={{
                padding: "17px",
                borderRadius: "15px",
                background: "#fef2f2",
                border:
                  "1px solid #fecaca",
              }}
            >

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#64748b",
                  marginBottom: "6px",
                  textTransform:
                    "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                Risk Level
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "22px",
                  fontWeight: "800",
                  color: "#dc2626",
                }}
              >

                <span>●</span>

                {result.risk_level || "High"}

              </div>

            </div>

          </div>


          {/* ==================================================
              SCAM TYPE
          ================================================== */}

          <div
            style={{
              marginTop: "12px",
              padding: "16px 17px",
              borderRadius: "15px",
              background: "#fff7ed",
              border:
                "1px solid #fed7aa",
            }}
          >

            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#9a3412",
                textTransform:
                  "uppercase",
                letterSpacing: ".5px",
                marginBottom: "5px",
              }}
            >
              Detected Scam Type
            </div>

            <div
              style={{
                fontSize: "17px",
                fontWeight: "800",
                color: "#7c2d12",
              }}
            >
              {result.scam_type ||
                "Suspicious Activity"}
            </div>

          </div>


          {/* ==================================================
              RECOMMENDATIONS
          ================================================== */}

          <div
            style={{
              marginTop: "24px",
            }}
          >

            <h3
              style={{
                margin:
                  "0 0 14px",
                color: "#0f172a",
                fontSize: "17px",
              }}
            >
              ⚠️ Recommended Actions
            </h3>


            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "9px",
              }}
            >

              {
                result.recommendations &&
                result.recommendations.length > 0

                  ?

                  result.recommendations.map(
                    (
                      item: string,
                      index: number
                    ) => (

                      <div
                        key={index}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems:
                            "flex-start",
                          padding:
                            "11px 12px",
                          borderRadius:
                            "10px",
                          background:
                            "#f8fafc",
                          color:
                            "#475569",
                          fontSize:
                            "13px",
                          lineHeight:
                            1.45,
                        }}
                      >

                        <span
                          style={{
                            color:
                              "#ef4444",
                            fontWeight:
                              "900",
                          }}
                        >
                          !
                        </span>

                        <span>
                          {item}
                        </span>

                      </div>

                    )
                  )

                  :

                  <>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        padding: "11px 12px",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        color: "#475569",
                        fontSize: "13px",
                      }}
                    >
                      <span>!</span>
                      Never share your OTP.
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        padding: "11px 12px",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        color: "#475569",
                        fontSize: "13px",
                      }}
                    >
                      <span>!</span>
                      Do not reveal bank details.
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        padding: "11px 12px",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        color: "#475569",
                        fontSize: "13px",
                      }}
                    >
                      <span>!</span>
                      Verify the caller through
                      an official number.
                    </div>

                  </>

              }

            </div>

          </div>


          {/* ==================================================
              CLOSE BUTTON
          ================================================== */}

          <button
            onClick={onClose}
            style={{
              width: "100%",
              marginTop: "28px",
              padding: "14px 20px",
              border: "none",
              borderRadius: "13px",
              background:
                "linear-gradient(135deg, #dc2626, #ef4444)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow:
                "0 8px 20px rgba(239,68,68,0.22)",
            }}
          >
            Close Security Alert
          </button>

        </div>

      </div>

      {/* ======================================================
          POPUP ANIMATION
      ====================================================== */}

      <style>
        {`
          @keyframes scamAlertPop {
            from {
              opacity: 0;
              transform: translateY(15px) scale(0.96);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 600px) {
            .scam-alert-box {
              max-width: 100%;
            }
          }
        `}
      </style>

    </div>

  );
}

export default ScamAlert;