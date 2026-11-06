import { useState, useEffect } from "react";

import ScamAlert from "../components/ScamAlert";
import StatsCard from "../components/StatsCard";
import UploadAudio from "../components/UploadAudio";
import AnalysisCard from "../components/AnalysisCard";
import ResultCard from "../components/ResultCard";
import ChartsSection from "../components/ChartsSection";
import AIInsights from "../components/AIInsights";
import AlertSound from "../components/AlertSound";
import VoiceWarning from "../components/VoiceWarning";
import DesktopNotification from "../components/DesktopNotification";

function Dashboard() {

  // ==========================================================
  // RESULT
  // ==========================================================

  const [result, setResult] =
    useState<any>(null);

  // ==========================================================
  // POPUP
  // ==========================================================

  const [showAlert, setShowAlert] =
    useState(false);

  // ==========================================================
  // HISTORY
  // ==========================================================

  const [history, setHistory] =
    useState<any[]>([]);

  // ==========================================================
  // DASHBOARD STATS
  // ==========================================================

  const [stats, setStats] = useState({
    total_calls: 0,
    scam_calls: 0,
    genuine_calls: 0,
    high_risk: 0,
    medium_risk: 0,
    low_risk: 0
  });

  // ==========================================================
  // AI PIPELINE
  // ==========================================================

  const [currentStep, setCurrentStep] =
    useState(-1);

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  useEffect(() => {

    loadDashboard();

  }, []);

  // ==========================================================
  // REFRESH AFTER NEW RESULT
  // ==========================================================

  useEffect(() => {

    if (!result) {
      return;
    }

    loadDashboard();

  }, [result]);

  // ==========================================================
  // SHOW POPUP FOR SCAM + GENUINE
  // ==========================================================

  useEffect(() => {

    if (!result) {
      return;
    }

    if (result.success === false) {
      return;
    }

    const prediction =
      String(
        result.prediction || ""
      )
        .trim()
        .toLowerCase();

    console.log(
      "================================"
    );

    console.log(
      "DASHBOARD AI RESULT:"
    );

    console.log(result);

    console.log(
      "Prediction:",
      prediction
    );

    console.log(
      "Showing popup..."
    );

    console.log(
      "================================"
    );

    if (
      prediction === "scam" ||
      prediction === "genuine"
    ) {

      setShowAlert(true);

    }

  }, [result]);

  // ==========================================================
  // AI PIPELINE ANIMATION
  // ==========================================================

  useEffect(() => {

    if (!result) {
      return;
    }

    setCurrentStep(0);

    const timers = [

      setTimeout(
        () => setCurrentStep(1),
        700
      ),

      setTimeout(
        () => setCurrentStep(2),
        1400
      ),

      setTimeout(
        () => setCurrentStep(3),
        2100
      ),

      setTimeout(
        () => setCurrentStep(4),
        2800
      ),

      setTimeout(
        () => setCurrentStep(5),
        3500
      ),

      setTimeout(
        () => setCurrentStep(6),
        4200
      )

    ];

    return () =>
      timers.forEach(clearTimeout);

  }, [result]);

  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  const loadDashboard =
    async () => {

      try {

        // ====================================================
        // HISTORY
        // ====================================================

        const historyResponse =
          await fetch(
            "http://127.0.0.1:5000/history"
          );

        const historyData =
          await historyResponse.json();

        if (
          Array.isArray(historyData)
        ) {

          historyData.forEach(
            (item: any) => {

              item.keywords =
                item.keywords
                  ? item.keywords.split(",")
                  : [];

            }
          );

          setHistory(
            historyData
          );

        }

        // ====================================================
        // STATS
        // ====================================================

        const statsResponse =
          await fetch(
            "http://127.0.0.1:5000/stats"
          );

        const statsData =
          await statsResponse.json();

        if (
          statsData &&
          typeof statsData === "object"
        ) {

          setStats(
            statsData
          );

        }

      }

      catch (error) {

        console.error(
          "Dashboard loading error:",
          error
        );

      }

    };

  // ==========================================================
  // ACCURACY
  // ==========================================================

  const accuracy =

    stats.total_calls > 0

      ? (
          (
            stats.genuine_calls /
            stats.total_calls
          ) * 100
        ).toFixed(1)

      : "0";

  // ==========================================================
  // CLOSE POPUP
  // ==========================================================

  const closeAlert = () => {

    setShowAlert(false);

  };

  // ==========================================================
  // RECENT HISTORY
  // ==========================================================

  const recentHistory =
    history.slice(0, 5);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="dashboard-container">

      {/* ======================================================
          HERO / HEADER
      ====================================================== */}

      <section
        className="dashboard-hero"
        style={{
          marginBottom: "30px",
          padding: "28px 30px",
          borderRadius: "24px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)",
          color: "white",
          boxShadow:
            "0 18px 45px rgba(15, 23, 42, 0.16)",
          position: "relative",
          overflow: "hidden"
        }}
      >

        {/* Decorative circles */}

        <div
          style={{
            position: "absolute",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background:
              "rgba(255,255,255,0.05)",
            right: "-60px",
            top: "-80px"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            background:
              "rgba(56,189,248,0.08)",
            right: "160px",
            bottom: "-80px"
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "25px",
            flexWrap: "wrap"
          }}
        >

          <div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px"
              }}
            >

              <span
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "13px",
                  background:
                    "rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "23px"
                }}
              >
                🛡️
              </span>

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  opacity: 0.85
                }}
              >
                VOICEGUARD AI
              </span>

            </div>

            <h1
              className="dashboard-title"
              style={{
                margin: 0,
                color: "white",
                fontSize: "34px",
                lineHeight: 1.15
              }}
            >
              Voice Scam Intelligence
            </h1>

            <p
              style={{
                margin:
                  "10px 0 0",
                color:
                  "rgba(255,255,255,0.78)",
                fontSize: "15px"
              }}
            >
              AI-powered analysis of prerecorded voice recordings.
            </p>

          </div>


          {/* SYSTEM STATUS */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 17px",
              borderRadius: "999px",
              background:
                "rgba(255,255,255,0.10)",
              border:
                "1px solid rgba(255,255,255,0.15)",
              backdropFilter:
                "blur(10px)"
            }}
          >

            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow:
                  "0 0 0 5px rgba(74,222,128,.15)"
              }}
            />

            <span
              style={{
                fontSize: "13px",
                fontWeight: "700"
              }}
            >
              AI Engine Online
            </span>

          </div>

        </div>

      </section>


      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      <section
        style={{
          marginBottom: "32px"
        }}
      >

        <div
          style={{
            marginBottom: "15px"
          }}
        >

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "22px"
            }}
          >
            Security Overview
          </h2>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            Real-time statistics from analyzed calls
          </p>

        </div>


        <div className="stats-container">

          <StatsCard
            title="Total Calls"
            value={
              String(
                stats.total_calls
              )
            }
            icon="📞"
          />

          <StatsCard
            title="Scam Calls"
            value={
              String(
                stats.scam_calls
              )
            }
            icon="🚨"
          />

          <StatsCard
            title="Genuine Calls"
            value={
              String(
                stats.genuine_calls
              )
            }
            icon="🛡️"
          />

          <StatsCard
            title="Detection Accuracy"
            value={
              `${accuracy}%`
            }
            icon="🎯"
          />

          <StatsCard
            title="High Risk"
            value={
              String(
                stats.high_risk
              )
            }
            icon="🔴"
          />

          <StatsCard
            title="Medium Risk"
            value={
              String(
                stats.medium_risk
              )
            }
            icon="🟠"
          />

        </div>

      </section>


      {/* ======================================================
          QUICK STATUS STRIP
      ====================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "32px"
        }}
      >

        <div
          style={{
            padding: "18px",
            borderRadius: "17px",
            background: "#eff6ff",
            border:
              "1px solid #dbeafe"
          }}
        >

          <div
            style={{
              fontSize: "24px",
              marginBottom: "8px"
            }}
          >
            🤖
          </div>

          <strong
            style={{
              color: "#1e3a8a"
            }}
          >
            AI Detection
          </strong>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "13px"
            }}
          >
            Automated voice analysis
          </p>

        </div>


        <div
          style={{
            padding: "18px",
            borderRadius: "17px",
            background: "#f0fdf4",
            border:
              "1px solid #dcfce7"
          }}
        >

          <div
            style={{
              fontSize: "24px",
              marginBottom: "8px"
            }}
          >
            🛡️
          </div>

          <strong
            style={{
              color: "#166534"
            }}
          >
            Protection Active
          </strong>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "13px"
            }}
          >
            Scam monitoring is active
          </p>

        </div>


        <div
          style={{
            padding: "18px",
            borderRadius: "17px",
            background: "#fff7ed",
            border:
              "1px solid #fed7aa"
          }}
        >

          <div
            style={{
              fontSize: "24px",
              marginBottom: "8px"
            }}
          >
            ⚡
          </div>

          <strong
            style={{
              color: "#9a3412"
            }}
          >
            Real-Time Analysis
          </strong>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "13px"
            }}
          >
            Fast voice classification
          </p>

        </div>


        <div
          style={{
            padding: "18px",
            borderRadius: "17px",
            background: "#f5f3ff",
            border:
              "1px solid #ddd6fe"
          }}
        >

          <div
            style={{
              fontSize: "24px",
              marginBottom: "8px"
            }}
          >
            🔐
          </div>

          <strong
            style={{
              color: "#5b21b6"
            }}
          >
            Privacy Focused
          </strong>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "13px"
            }}
          >
            Secure call analysis
          </p>

        </div>

      </section>


      {/* ======================================================
          ANALYTICS
      ====================================================== */}

      <section
        style={{
          marginBottom: "32px"
        }}
      >

        <div
          style={{
            marginBottom: "15px"
          }}
        >

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "22px"
            }}
          >
            Security Analytics
          </h2>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            Visual overview of call detection activity
          </p>

        </div>

        <ChartsSection />

      </section>


      {/* ======================================================
          AI INSIGHTS
      ====================================================== */}

      <section
        style={{
          marginBottom: "32px"
        }}
      >

        <div
          style={{
            marginBottom: "15px"
          }}
        >

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "22px"
            }}
          >
            AI Insights
          </h2>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            Intelligent observations from your call data
          </p>

        </div>

        <AIInsights />

      </section>


      {/* ======================================================
          DETECTION CENTER
      ====================================================== */}

      <section
        style={{
          marginBottom: "32px"
        }}
      >

        <div
          style={{
            padding: "22px",
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, #f8fafc, #eff6ff)",
            border:
              "1px solid #dbeafe"
          }}
        >

          <div
            style={{
              marginBottom: "20px"
            }}
          >

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding:
                  "7px 12px",
                borderRadius:
                  "999px",
                background:
                  "#dbeafe",
                color:
                  "#1d4ed8",
                fontSize:
                  "12px",
                fontWeight:
                  "800",
                marginBottom:
                  "10px"
              }}
            >
              🎙️ DETECTION CENTER
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "24px"
              }}
            >
              Analyze a Voice Call
            </h2>

            <p
              style={{
                margin:
                  "6px 0 0",
                color: "#64748b",
                fontSize: "14px"
              }}
            >
              Upload and play a complete recorded audio file
              before performing AI scam detection.
            </p>

          </div>


          {/* ==================================================
              UPLOAD
          ================================================== */}

          <div
            style={{
              marginBottom: "22px"
            }}
          >

            <UploadAudio
              setResult={
                setResult
              }
            />

          </div>


          {/* ==================================================
              LIVE RECORDER
          ================================================== */}

          

        </div>

      </section>


      {/* ======================================================
          AI ANALYSIS PIPELINE
      ====================================================== */}

      <section
        style={{
          marginBottom: "32px"
        }}
      >

        <div
          style={{
            marginBottom: "15px"
          }}
        >

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "22px"
            }}
          >
            AI Analysis Pipeline
          </h2>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            Track the stages used to analyze the call
          </p>

        </div>

        <AnalysisCard
          currentStep={
            currentStep
          }
        />

      </section>


      {/* ======================================================
          DETECTION RESULT
      ====================================================== */}

      {result && (

        <section
          style={{
            marginBottom: "32px"
          }}
        >

          <div
            style={{
              marginBottom: "15px"
            }}
          >

            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "22px"
              }}
            >
              Latest Detection
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",
                color: "#64748b",
                fontSize: "14px"
              }}
            >
              Most recent AI classification result
            </p>

          </div>

          <ResultCard
            result={
              result
            }
          />

        </section>

      )}


      {/* ======================================================
          RECENT ACTIVITY
      ====================================================== */}

      <section
        style={{
          marginBottom: "32px"
        }}
      >

        <div
          style={{
            marginBottom: "15px"
          }}
        >

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "22px"
            }}
          >
            Recent Activity
          </h2>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            Latest analyzed calls
          </p>

        </div>


        {recentHistory.length === 0 ? (

          <div
            style={{
              padding: "30px",
              borderRadius: "18px",
              background: "#f8fafc",
              border:
                "1px solid #e2e8f0",
              textAlign: "center",
              color: "#64748b"
            }}
          >

            <div
              style={{
                fontSize: "35px",
                marginBottom: "10px"
              }}
            >
              📭
            </div>

            <strong
              style={{
                color: "#334155"
              }}
            >
              No recent activity
            </strong>

            <p
              style={{
                margin:
                  "5px 0 0",
                fontSize: "13px"
              }}
            >
              Analyze a call to see activity here.
            </p>

          </div>

        ) : (

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >

            {recentHistory.map(
              (
                item,
                index
              ) => {

                const prediction =
                  String(
                    item.prediction ||
                    ""
                  )
                    .trim()
                    .toLowerCase();

                const isScam =
                  prediction ===
                  "scam";

                const risk =
                  item.risk_level ||
                  "Low";

                const riskBackground =
                  isScam
                    ? "#fef2f2"
                    : "#f0fdf4";

                const riskColor =
                  isScam
                    ? "#dc2626"
                    : "#16a34a";

                return (

                  <div
                    key={
                      item.id ??
                      index
                    }
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap:
                        "15px",
                      flexWrap:
                        "wrap",
                      padding:
                        "17px 20px",
                      borderRadius:
                        "16px",
                      background:
                        "#ffffff",
                      border:
                        "1px solid #e2e8f0",
                      boxShadow:
                        "0 5px 18px rgba(15,23,42,.04)"
                    }}
                  >

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap:
                          "13px"
                      }}
                    >

                      <div
                        style={{
                          width:
                            "42px",
                          height:
                            "42px",
                          borderRadius:
                            "12px",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          background:
                            riskBackground,
                          fontSize:
                            "20px"
                        }}
                      >
                        {isScam
                          ? "🚨"
                          : "🛡️"}
                      </div>

                      <div>

                        <strong
                          style={{
                            display:
                              "block",
                            color:
                              "#0f172a",
                            fontSize:
                              "14px"
                          }}
                        >
                          {isScam
                            ? "Potential Scam Call"
                            : "Genuine Call"}
                        </strong>

                        <span
                          style={{
                            color:
                              "#64748b",
                            fontSize:
                              "12px"
                          }}
                        >
                          {item.date ||
                            "Recently analyzed"}
                        </span>

                      </div>

                    </div>


                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap:
                          "10px"
                      }}
                    >

                      <span
                        style={{
                          padding:
                            "7px 12px",
                          borderRadius:
                            "999px",
                          background:
                            riskBackground,
                          color:
                            riskColor,
                          fontSize:
                            "12px",
                          fontWeight:
                            "800"
                        }}
                      >
                        {risk} Risk
                      </span>


                      <span
                        style={{
                          fontSize:
                            "13px",
                          fontWeight:
                            "800",
                          color:
                            "#334155"
                        }}
                      >
                        {item.confidence}%
                      </span>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* ======================================================
          FOOTER SECURITY STATUS
      ====================================================== */}

      <section
        style={{
          marginTop: "35px",
          padding: "18px 22px",
          borderRadius: "16px",
          background: "#f8fafc",
          border:
            "1px solid #e2e8f0",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap"
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >

          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background:
                "#22c55e"
            }}
          />

          <span
            style={{
              fontSize: "13px",
              color: "#475569",
              fontWeight: "600"
            }}
          >
            VoiceGuard AI protection is active
          </span>

        </div>

        <span
          style={{
            fontSize: "12px",
            color: "#94a3b8"
          }}
        >
          AI-powered voice analysis
        </span>

      </section>


      {/* ======================================================
          SCAM / GENUINE POPUP
      ====================================================== */}

      <ScamAlert
        show={
          showAlert
        }
        result={
          result
        }
        onClose={
          closeAlert
        }
      />


      {/* ======================================================
          ALERT SOUND
      ====================================================== */}

      <AlertSound
        play={
          showAlert &&
          result &&
          String(
            result.prediction
          )
            .trim()
            .toLowerCase() ===
            "scam"
        }
      />


      {/* ======================================================
          VOICE WARNING
      ====================================================== */}

      <VoiceWarning
        play={
          showAlert &&
          result &&
          String(
            result.prediction
          )
            .trim()
            .toLowerCase() ===
            "scam"
        }
        result={
          result
        }
      />


      {/* ======================================================
          DESKTOP NOTIFICATION
      ====================================================== */}

      <DesktopNotification
        show={
          showAlert
        }
        result={
          result
        }
      />

    </div>

  );

}

export default Dashboard;