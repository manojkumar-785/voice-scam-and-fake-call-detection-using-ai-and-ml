import { useEffect, useState } from "react";
import jsPDF from "jspdf";

function History() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [history, setHistory] =
    useState<any[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [predictionFilter, setPredictionFilter] =
    useState("All");

  const [riskFilter, setRiskFilter] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("Newest");

  const [loading, setLoading] =
    useState(true);

  // ==========================================================
  // BACKEND URL
  // ==========================================================

  const API_URL =
    "http://127.0.0.1:5000";

  // ==========================================================
  // LOAD HISTORY
  // ==========================================================

  useEffect(() => {

    loadHistory();

  }, []);

  const loadHistory = async () => {

    try {

      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/history`
        );

      if (!response.ok) {

        throw new Error(
          "Failed to load history"
        );

      }

      const data =
        await response.json();

      if (!Array.isArray(data)) {

        setHistory([]);

        return;

      }

      const formattedData =
        data.map(
          (item: any) => ({

            ...item,

            keywords:
              item.keywords
                ? String(item.keywords)
                    .split(",")
                    .map(
                      (keyword: string) =>
                        keyword.trim()
                    )
                    .filter(Boolean)
                : []

          })
        );

      setHistory(
        formattedData
      );

    }

    catch (error) {

      console.error(
        "History loading error:",
        error
      );

    }

    finally {

      setLoading(false);

    }

  };

  // ==========================================================
  // CLEAR HISTORY
  // ==========================================================

  const clearHistory = async () => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to clear the entire call history?"
      );

    if (!confirmDelete) {

      return;

    }

    try {

      const response =
        await fetch(
          `${API_URL}/history`,
          {
            method: "DELETE"
          }
        );

      if (!response.ok) {

        throw new Error(
          "Failed to clear history"
        );

      }

      await loadHistory();

    }

    catch (error) {

      console.error(
        "Clear history error:",
        error
      );

      alert(
        "Unable to clear history."
      );

    }

  };

  // ==========================================================
  // DELETE SINGLE RECORD
  // ==========================================================

  const deleteRecord = async (
    id: number
  ) => {

    const confirmDelete =
      window.confirm(
        "Delete this call record?"
      );

    if (!confirmDelete) {

      return;

    }

    try {

      const response =
        await fetch(
          `${API_URL}/history/${id}`,
          {
            method: "DELETE"
          }
        );

      if (!response.ok) {

        throw new Error(
          "Failed to delete record"
        );

      }

      await loadHistory();

    }

    catch (error) {

      console.error(
        "Delete record error:",
        error
      );

      alert(
        "Unable to delete this record."
      );

    }

  };

  // ==========================================================
  // DOWNLOAD PDF
  // ==========================================================

  const downloadPDF = (
    item: any
  ) => {

    const doc =
      new jsPDF();

    // Header

    doc.setFillColor(
      15,
      43,
      107
    );

    doc.rect(
      0,
      0,
      210,
      38,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFontSize(
      22
    );

    doc.text(
      "VoiceGuard AI",
      20,
      17
    );

    doc.setFontSize(
      11
    );

    doc.text(
      "Voice Scam Detection Report",
      20,
      28
    );

    // Body

    doc.setTextColor(
      15,
      23,
      42
    );

    doc.setFontSize(
      17
    );

    doc.text(
      "Call Analysis",
      20,
      55
    );

    doc.setFontSize(
      11
    );

    doc.text(
      `Date: ${item.date || "N/A"}`,
      20,
      70
    );

    doc.text(
      `Prediction: ${item.prediction || "N/A"}`,
      20,
      80
    );

    doc.text(
      `Confidence: ${item.confidence ?? "N/A"}%`,
      20,
      90
    );

    doc.text(
      `Risk Level: ${item.risk_level || "N/A"}`,
      20,
      100
    );

    if (item.caller_number) {

      doc.text(
        `Caller: ${item.caller_number}`,
        20,
        110
      );

    }

    // Transcript

    doc.setFontSize(
      16
    );

    doc.text(
      "Transcript",
      20,
      128
    );

    doc.setFontSize(
      10
    );

    const transcript =
      doc.splitTextToSize(
        item.transcript ||
          "No transcript available.",
        170
      );

    doc.text(
      transcript,
      20,
      138
    );

    // Keywords

    const keywordText =
      Array.isArray(item.keywords)
        ? item.keywords.join(", ")
        : String(
            item.keywords || ""
          );

    const transcriptHeight =
      Math.min(
        transcript.length * 5,
        80
      );

    doc.setFontSize(
      14
    );

    doc.text(
      "Keywords",
      20,
      145 + transcriptHeight
    );

    doc.setFontSize(
      10
    );

    doc.text(
      keywordText ||
        "No keywords detected.",
      20,
      154 + transcriptHeight,
      {
        maxWidth: 170
      }
    );

    doc.save(
      "VoiceGuard_Detection_Report.pdf"
    );

  };

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  const filteredHistory =
    history
      .filter(
        (item) => {

          const transcript =
            String(
              item.transcript || ""
            ).toLowerCase();

          const caller =
            String(
              item.caller_number || ""
            ).toLowerCase();

          const search =
            searchTerm
              .toLowerCase();

          return (
            transcript.includes(search) ||
            caller.includes(search)
          );

        }
      )
      .filter(
        (item) => {

          if (
            predictionFilter ===
            "All"
          ) {

            return true;

          }

          return (
            String(
              item.prediction || ""
            ).toLowerCase() ===
            predictionFilter.toLowerCase()
          );

        }
      )
      .filter(
        (item) => {

          if (
            riskFilter ===
            "All"
          ) {

            return true;

          }

          return (
            String(
              item.risk_level || ""
            ).toLowerCase() ===
            riskFilter.toLowerCase()
          );

        }
      );

  // ==========================================================
  // SORT
  // ==========================================================

  if (
    sortBy ===
    "Highest Confidence"
  ) {

    filteredHistory.sort(
      (a, b) =>
        Number(
          b.confidence || 0
        ) -
        Number(
          a.confidence || 0
        )
    );

  }

  else if (
    sortBy ===
    "Lowest Confidence"
  ) {

    filteredHistory.sort(
      (a, b) =>
        Number(
          a.confidence || 0
        ) -
        Number(
          b.confidence || 0
        )
    );

  }

  // ==========================================================
  // COUNTS
  // ==========================================================

  const scamCount =
    history.filter(
      (item) =>
        String(
          item.prediction || ""
        ).toLowerCase() ===
        "scam"
    ).length;

  const genuineCount =
    history.filter(
      (item) =>
        String(
          item.prediction || ""
        ).toLowerCase() ===
        "genuine"
    ).length;

  const recordingCount =
    history.filter(
      (item) =>
        Boolean(
          item.audio_filename
        )
    ).length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="dashboard-container"
      style={{
        paddingBottom: "50px"
      }}
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "28px"
        }}
      >

        <div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding:
                "7px 13px",
              borderRadius:
                "999px",
              background:
                "#eff6ff",
              color:
                "#2563eb",
              fontSize: "12px",
              fontWeight: "800",
              marginBottom: "10px"
            }}
          >
            📜 CALL RECORDS
          </div>

          <h1
            className="dashboard-title"
            style={{
              marginBottom: "5px"
            }}
          >
            Call History
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            Review analyzed calls,
            transcripts and saved recordings.
          </p>

        </div>


        <button
          className="analyze-btn"
          onClick={
            clearHistory
          }
          disabled={
            history.length === 0
          }
          style={{
            background:
              history.length === 0
                ? "#94a3b8"
                : "linear-gradient(135deg,#dc2626,#ef4444)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          🗑 Clear History
        </button>

      </div>


      {/* ====================================================
          SUMMARY CARDS
      ==================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: "15px",
          marginBottom: "28px"
        }}
      >

        {/* Total */}

        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "20px",
            boxShadow:
              "0 7px 25px rgba(15,23,42,.05)"
          }}
        >

          <div
            style={{
              fontSize: "25px",
              marginBottom: "9px"
            }}
          >
            📞
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "800",
              color: "#64748b",
              textTransform:
                "uppercase"
            }}
          >
            Total Records
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "28px",
              fontWeight: "800",
              color: "#0f172a"
            }}
          >
            {history.length}
          </div>

        </div>


        {/* Scam */}

        <div
          style={{
            background: "#fff7f7",
            border:
              "1px solid #fecaca",
            borderRadius: "18px",
            padding: "20px",
            boxShadow:
              "0 7px 25px rgba(239,68,68,.05)"
          }}
        >

          <div
            style={{
              fontSize: "25px",
              marginBottom: "9px"
            }}
          >
            🚨
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "800",
              color: "#991b1b",
              textTransform:
                "uppercase"
            }}
          >
            Scam Calls
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "28px",
              fontWeight: "800",
              color: "#dc2626"
            }}
          >
            {scamCount}
          </div>

        </div>


        {/* Genuine */}

        <div
          style={{
            background: "#f0fdf4",
            border:
              "1px solid #bbf7d0",
            borderRadius: "18px",
            padding: "20px",
            boxShadow:
              "0 7px 25px rgba(34,197,94,.05)"
          }}
        >

          <div
            style={{
              fontSize: "25px",
              marginBottom: "9px"
            }}
          >
            🛡️
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "800",
              color: "#166534",
              textTransform:
                "uppercase"
            }}
          >
            Genuine Calls
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "28px",
              fontWeight: "800",
              color: "#16a34a"
            }}
          >
            {genuineCount}
          </div>

        </div>


        {/* Recordings */}

        <div
          style={{
            background: "#eff6ff",
            border:
              "1px solid #bfdbfe",
            borderRadius: "18px",
            padding: "20px",
            boxShadow:
              "0 7px 25px rgba(37,99,235,.05)"
          }}
        >

          <div
            style={{
              fontSize: "25px",
              marginBottom: "9px"
            }}
          >
            🎧
          </div>

          <div
            style={{
              fontSize: "12px",
              fontWeight: "800",
              color: "#1e40af",
              textTransform:
                "uppercase"
            }}
          >
            Saved Recordings
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "28px",
              fontWeight: "800",
              color: "#2563eb"
            }}
          >
            {recordingCount}
          </div>

        </div>

      </div>


      {/* ====================================================
          SEARCH + FILTERS
      ==================================================== */}

      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "25px",
          boxShadow:
            "0 7px 25px rgba(15,23,42,.04)"
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "15px"
          }}
        >

          <span
            style={{
              fontSize: "20px"
            }}
          >
            🔍
          </span>

          <strong
            style={{
              color: "#0f172a",
              fontSize: "16px"
            }}
          >
            Find a Call
          </strong>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px,2fr) repeat(3,minmax(130px,1fr))",
            gap: "12px"
          }}
        >

          <input
            type="text"
            placeholder="Search transcript or caller..."
            value={
              searchTerm
            }
            onChange={
              (e) =>
                setSearchTerm(
                  e.target.value
                )
            }
            style={{
              width: "100%",
              boxSizing:
                "border-box",
              padding:
                "12px 14px",
              borderRadius:
                "11px",
              border:
                "1px solid #cbd5e1",
              outline: "none",
              fontSize: "14px"
            }}
          />


          <select
            value={
              predictionFilter
            }
            onChange={
              (e) =>
                setPredictionFilter(
                  e.target.value
                )
            }
            style={{
              padding:
                "12px",
              borderRadius:
                "11px",
              border:
                "1px solid #cbd5e1",
              background:
                "#ffffff",
              cursor: "pointer"
            }}
          >

            <option value="All">
              All Results
            </option>

            <option value="Scam">
              🚨 Scam
            </option>

            <option value="Genuine">
              🛡️ Genuine
            </option>

          </select>


          <select
            value={
              riskFilter
            }
            onChange={
              (e) =>
                setRiskFilter(
                  e.target.value
                )
            }
            style={{
              padding:
                "12px",
              borderRadius:
                "11px",
              border:
                "1px solid #cbd5e1",
              background:
                "#ffffff",
              cursor: "pointer"
            }}
          >

            <option value="All">
              All Risk
            </option>

            <option value="High">
              🔴 High
            </option>

            <option value="Medium">
              🟠 Medium
            </option>

            <option value="Low">
              🟢 Low
            </option>

          </select>


          <select
            value={
              sortBy
            }
            onChange={
              (e) =>
                setSortBy(
                  e.target.value
                )
            }
            style={{
              padding:
                "12px",
              borderRadius:
                "11px",
              border:
                "1px solid #cbd5e1",
              background:
                "#ffffff",
              cursor: "pointer"
            }}
          >

            <option value="Newest">
              Newest
            </option>

            <option value="Highest Confidence">
              Highest Confidence
            </option>

            <option value="Lowest Confidence">
              Lowest Confidence
            </option>

          </select>

        </div>

      </div>


      {/* ====================================================
          LOADING
      ==================================================== */}

      {loading && (

        <div
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e2e8f0",
            borderRadius:
              "20px",
            padding:
              "50px 20px",
            textAlign:
              "center"
          }}
        >

          <div
            style={{
              fontSize:
                "40px",
              marginBottom:
                "12px"
            }}
          >
            ⏳
          </div>

          <strong
            style={{
              color:
                "#334155"
            }}
          >
            Loading call history...
          </strong>

        </div>

      )}


      {/* ====================================================
          EMPTY RESULT
      ==================================================== */}

      {!loading &&
        filteredHistory.length === 0 && (

          <div
            style={{
              background:
                "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius:
                "20px",
              padding:
                "55px 20px",
              textAlign:
                "center",
              boxShadow:
                "0 7px 25px rgba(15,23,42,.04)"
            }}
          >

            <div
              style={{
                fontSize:
                  "50px",
                marginBottom:
                  "12px"
              }}
            >
              📭
            </div>

            <h2
              style={{
                margin:
                  "0 0 7px",
                color:
                  "#0f172a"
              }}
            >
              No Calls Found
            </h2>

            <p
              style={{
                margin: 0,
                color:
                  "#64748b",
                fontSize:
                  "14px"
              }}
            >
              Try changing your filters
              or analyze a new call.
            </p>

          </div>

        )}


      {/* ====================================================
          HISTORY CARDS
      ==================================================== */}

      {!loading &&
        filteredHistory.length > 0 && (

          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap: "18px"
            }}
          >

            {filteredHistory.map(
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

                const confidence =
                  Number(
                    item.confidence ||
                    0
                  );

                const risk =
                  String(
                    item.risk_level ||
                    (isScam
                      ? "High"
                      : "Low")
                  );

                let riskColor =
                  "#16a34a";

                let riskBackground =
                  "#f0fdf4";

                let borderColor =
                  "#bbf7d0";

                if (
                  risk.toLowerCase() ===
                  "high"
                ) {

                  riskColor =
                    "#dc2626";

                  riskBackground =
                    "#fef2f2";

                  borderColor =
                    "#fecaca";

                }

                else if (
                  risk.toLowerCase() ===
                  "medium"
                ) {

                  riskColor =
                    "#d97706";

                  riskBackground =
                    "#fffbeb";

                  borderColor =
                    "#fde68a";

                }

                return (

                  <div
                    key={
                      item.id ??
                      index
                    }
                    style={{
                      background:
                        "#ffffff",
                      border:
                        "1px solid #e2e8f0",
                      borderLeft:
                        `5px solid ${
                          isScam
                            ? "#ef4444"
                            : "#22c55e"
                        }`,
                      borderRadius:
                        "20px",
                      padding:
                        "22px",
                      boxShadow:
                        "0 8px 28px rgba(15,23,42,.05)"
                    }}
                  >

                    {/* ========================================
                        CARD HEADER
                    ======================================== */}

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap:
                          "15px",
                        flexWrap:
                          "wrap",
                        marginBottom:
                          "18px"
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
                              "50px",
                            height:
                              "50px",
                            borderRadius:
                              "15px",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            background:
                              isScam
                                ? "#fef2f2"
                                : "#f0fdf4",
                            fontSize:
                              "25px"
                          }}
                        >
                          {isScam
                            ? "🚨"
                            : "🛡️"}
                        </div>


                        <div>

                          <h2
                            style={{
                              margin:
                                "0 0 4px",
                              fontSize:
                                "18px",
                              color:
                                isScam
                                  ? "#991b1b"
                                  : "#166534"
                            }}
                          >
                            {isScam
                              ? "Potential Scam Call"
                              : "Genuine Call"}
                          </h2>

                          <p
                            style={{
                              margin: 0,
                              color:
                                "#64748b",
                              fontSize:
                                "12px"
                            }}
                          >
                            {item.date ||
                              "Date unavailable"}
                          </p>

                        </div>

                      </div>


                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "9px",
                          flexWrap:
                            "wrap"
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
                            border:
                              `1px solid ${borderColor}`,
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
                            padding:
                              "7px 12px",
                            borderRadius:
                              "999px",
                            background:
                              "#eff6ff",
                            color:
                              "#1d4ed8",
                            fontSize:
                              "12px",
                            fontWeight:
                              "800"
                          }}
                        >
                          {confidence}% Confidence
                        </span>

                      </div>

                    </div>


                    {/* ========================================
                        METRICS
                    ======================================== */}

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(160px,1fr))",
                        gap:
                          "10px",
                        marginBottom:
                          "18px"
                      }}
                    >

                      <div
                        style={{
                          padding:
                            "13px 15px",
                          background:
                            "#f8fafc",
                          borderRadius:
                            "12px"
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "11px",
                            fontWeight:
                              "800",
                            color:
                              "#64748b",
                            textTransform:
                              "uppercase"
                          }}
                        >
                          Prediction
                        </div>

                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontWeight:
                              "800",
                            color:
                              isScam
                                ? "#dc2626"
                                : "#16a34a"
                          }}
                        >
                          {isScam
                            ? "🚨 Scam"
                            : "🛡️ Genuine"}
                        </div>

                      </div>


                      <div
                        style={{
                          padding:
                            "13px 15px",
                          background:
                            "#f8fafc",
                          borderRadius:
                            "12px"
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "11px",
                            fontWeight:
                              "800",
                            color:
                              "#64748b",
                            textTransform:
                              "uppercase"
                          }}
                        >
                          Confidence
                        </div>

                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontWeight:
                              "800",
                            color:
                              "#0f172a"
                          }}
                        >
                          {confidence}%
                        </div>

                      </div>


                      <div
                        style={{
                          padding:
                            "13px 15px",
                          background:
                            "#f8fafc",
                          borderRadius:
                            "12px"
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "11px",
                            fontWeight:
                              "800",
                            color:
                              "#64748b",
                            textTransform:
                              "uppercase"
                          }}
                        >
                          Scam Type
                        </div>

                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontWeight:
                              "700",
                            color:
                              "#334155",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis"
                          }}
                        >
                          {item.scam_type ||
                            (isScam
                              ? "Suspicious Activity"
                              : "None detected")}
                        </div>

                      </div>

                    </div>


                    {/* ========================================
                        TRANSCRIPT
                    ======================================== */}

                    <div
                      style={{
                        padding:
                          "17px",
                        borderRadius:
                          "15px",
                        background:
                          "#f8fafc",
                        border:
                          "1px solid #e2e8f0",
                        marginBottom:
                          "16px"
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "8px",
                          marginBottom:
                            "9px"
                        }}
                      >

                        <span>
                          📝
                        </span>

                        <strong
                          style={{
                            color:
                              "#334155",
                            fontSize:
                              "14px"
                          }}
                        >
                          Transcript
                        </strong>

                      </div>

                      <p
                        style={{
                          margin: 0,
                          color:
                            "#475569",
                          fontSize:
                            "14px",
                          lineHeight:
                            1.65,
                          whiteSpace:
                            "pre-wrap"
                        }}
                      >
                        {item.transcript ||
                          "No transcript available."}
                      </p>

                    </div>


                    {/* ========================================
                        KEYWORDS
                    ======================================== */}

                    <div
                      style={{
                        marginBottom:
                          "18px"
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "8px",
                          marginBottom:
                            "9px"
                        }}
                      >

                        <span>
                          🔑
                        </span>

                        <strong
                          style={{
                            color:
                              "#334155",
                            fontSize:
                              "14px"
                          }}
                        >
                          Detected Keywords
                        </strong>

                      </div>


                      <div
                        style={{
                          display:
                            "flex",
                          flexWrap:
                            "wrap",
                          gap:
                            "7px"
                        }}
                      >

                        {item.keywords &&
                        item.keywords.length >
                          0

                          ?

                          item.keywords.map(
                            (
                              keyword: string,
                              keywordIndex: number
                            ) => (

                              <span
                                key={
                                  keywordIndex
                                }
                                style={{
                                  padding:
                                    "6px 10px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    "#eff6ff",
                                  color:
                                    "#1d4ed8",
                                  border:
                                    "1px solid #dbeafe",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    "700"
                                }}
                              >
                                {keyword}
                              </span>

                            )
                          )

                          :

                          <span
                            style={{
                              color:
                                "#94a3b8",
                              fontSize:
                                "13px"
                            }}
                          >
                            No keywords detected
                          </span>

                        }

                      </div>

                    </div>


                    {/* ========================================
                        AUDIO PLAYER
                    ======================================== */}

                    {item.audio_filename && (

                      <div
                        style={{
                          padding:
                            "17px",
                          borderRadius:
                            "15px",
                          background:
                            "linear-gradient(135deg,#eff6ff,#f8fafc)",
                          border:
                            "1px solid #bfdbfe",
                          marginBottom:
                            "18px"
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "10px",
                            marginBottom:
                              "11px"
                          }}
                        >

                          <div
                            style={{
                              width:
                                "38px",
                              height:
                                "38px",
                              borderRadius:
                                "11px",
                              background:
                                "#dbeafe",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              fontSize:
                                "19px"
                            }}
                          >
                            🎧
                          </div>

                          <div>

                            <strong
                              style={{
                                display:
                                  "block",
                                color:
                                  "#1e3a8a",
                                fontSize:
                                  "14px"
                              }}
                            >
                              Call Recording
                            </strong>

                            <span
                              style={{
                                color:
                                  "#64748b",
                                fontSize:
                                  "11px"
                              }}
                            >
                              Saved recording
                            </span>

                          </div>

                        </div>


                        <audio
                          controls
                          preload="none"
                          style={{
                            width:
                              "100%",
                            maxWidth:
                              "600px",
                            height:
                              "42px"
                          }}
                          src={
                            `${API_URL}/history/audio/${encodeURIComponent(
                              item.audio_filename
                            )}`
                          }
                        >

                          Your browser does not support
                          audio playback.

                        </audio>

                      </div>

                    )}


                    {/* ========================================
                        ACTIONS
                    ======================================== */}

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap:
                          "12px",
                        flexWrap:
                          "wrap"
                      }}
                    >

                      <div
                        style={{
                          color:
                            "#94a3b8",
                          fontSize:
                            "12px"
                        }}
                      >

                        Record ID: #
                        {item.id ??
                          "N/A"}

                      </div>


                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "9px",
                          flexWrap:
                            "wrap"
                        }}
                      >

                        <button
                          className="analyze-btn"
                          onClick={() =>
                            downloadPDF(
                              item
                            )
                          }
                          style={{
                            padding:
                              "9px 14px",
                            fontSize:
                              "12px"
                          }}
                        >
                          📄 Download Report
                        </button>


                        <button
                          className="analyze-btn"
                          onClick={() =>
                            deleteRecord(
                              item.id
                            )
                          }
                          style={{
                            padding:
                              "9px 14px",
                            fontSize:
                              "12px",
                            background:
                              "#ef4444"
                          }}
                        >
                          🗑 Delete
                        </button>

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

    </div>

  );

}

export default History;