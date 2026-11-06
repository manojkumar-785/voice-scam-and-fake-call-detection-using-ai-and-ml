import { useEffect, useState } from "react";

function AIInsights() {
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_calls: 0,
    scam_calls: 0,
    genuine_calls: 0,
    high_risk: 0,
    medium_risk: 0,
    low_risk: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // History
      const historyResponse = await fetch(
        "http://127.0.0.1:5000/history"
      );

      const historyData = await historyResponse.json();

      historyData.forEach((item: any) => {
        item.keywords = item.keywords
          ? item.keywords.split(",")
          : [];
      });

      setHistory(historyData);

      // Stats
      const statsResponse = await fetch(
        "http://127.0.0.1:5000/stats"
      );

      const statsData = await statsResponse.json();

      setStats(statsData);

    } catch (error) {
      console.error(error);
    }
  };

  /* --------------------------
     Top Keyword
  -------------------------- */

  const keywordMap: any = {};

  history.forEach((item) => {
    item.keywords.forEach((keyword: string) => {
      keywordMap[keyword] =
        (keywordMap[keyword] || 0) + 1;
    });
  });

  const topKeyword =
    Object.keys(keywordMap).length > 0
      ? Object.keys(keywordMap).reduce((a, b) =>
          keywordMap[a] > keywordMap[b] ? a : b
        )
      : "None";

  /* --------------------------
     Risk
  -------------------------- */

  let mostRisk = "Low";

  if (
    stats.high_risk >= stats.medium_risk &&
    stats.high_risk >= stats.low_risk
  ) {
    mostRisk = "High";
  } else if (
    stats.medium_risk >= stats.low_risk
  ) {
    mostRisk = "Medium";
  }

  /* --------------------------
     Scam Percentage
  -------------------------- */

  const scamPercentage =
    stats.total_calls > 0
      ? (
          (stats.scam_calls /
            stats.total_calls) *
          100
        ).toFixed(1)
      : "0";

  /* --------------------------
     Recommendation
  -------------------------- */

  let recommendation =
    "Continue monitoring suspicious calls.";

  if (mostRisk === "High") {
    recommendation =
      "Never share OTP, bank PIN, passwords or personal information over phone calls.";
  }

  else if (mostRisk === "Medium") {
    recommendation =
      "Verify unknown callers before taking any action.";
  }

  return (
    <div className="chart-card">

      <h2
        style={{
          marginBottom: "25px",
          color: "#2563eb",
        }}
      >
        🤖 AI Insights
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
        }}
      >
        <div className="stats-card">
          <div className="card-icon">
            🔥
          </div>

          <div className="card-body">
            <h3>Top Scam Keyword</h3>

            <h1
              style={{
                fontSize: "26px",
              }}
            >
              {topKeyword}
            </h1>
          </div>

          <div className="card-wave"></div>
        </div>

        <div className="stats-card">
          <div className="card-icon">
            🚨
          </div>

          <div className="card-body">
            <h3>Most Common Risk</h3>

            <h1
              style={{
                fontSize: "26px",
              }}
            >
              {mostRisk}
            </h1>
          </div>

          <div className="card-wave"></div>
        </div>

        <div className="stats-card">
          <div className="card-icon">
            📞
          </div>

          <div className="card-body">
            <h3>Total Calls</h3>

            <h1>
              {stats.total_calls}
            </h1>
          </div>

          <div className="card-wave"></div>
        </div>

        <div className="stats-card">
          <div className="card-icon">
            🛡
          </div>

          <div className="card-body">
            <h3>Scam Percentage</h3>

            <h1>
              {scamPercentage}%
            </h1>
          </div>

          <div className="card-wave"></div>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "25px",
          borderRadius: "18px",
          background:
            "linear-gradient(135deg,#2563eb,#06b6d4)",
          color: "white",
        }}
      >
        <h3
          style={{
            marginBottom: "12px",
          }}
        >
          💡 AI Recommendation
        </h3>

        <p
          style={{
            lineHeight: "1.8",
            fontSize: "16px",
          }}
        >
          {recommendation}
        </p>
      </div>
    </div>
  );
}

export default AIInsights;