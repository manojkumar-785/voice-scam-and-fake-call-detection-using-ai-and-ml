import { useEffect, useState } from "react";

function Reports() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem("callHistory") || "[]"
    );

    setHistory(savedHistory);
  }, []);

  const totalCalls = history.length;

  const scamCalls = history.filter(
    (item) =>
      item.prediction
        ?.toLowerCase()
        .includes("scam")
  ).length;

  const genuineCalls =
    totalCalls - scamCalls;

  const scamPercentage =
    totalCalls > 0
      ? (
          (scamCalls / totalCalls) *
          100
        ).toFixed(1)
      : 0;

  const allKeywords = history.flatMap(
    (item) => item.keywords || []
  );

  const keywordCount: any = {};

  allKeywords.forEach((keyword) => {
    keywordCount[keyword] =
      (keywordCount[keyword] || 0) + 1;
  });

  const topKeywords = Object.entries(
    keywordCount
  )
    .sort(
      (a: any, b: any) =>
        b[1] - a[1]
    )
    .slice(0, 5);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Reports Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div className="stats-card">
          <h3>Total Calls</h3>
          <h1>{totalCalls}</h1>
        </div>

        <div className="stats-card">
          <h3>Scam Calls</h3>
          <h1>{scamCalls}</h1>
        </div>

        <div className="stats-card">
          <h3>Genuine Calls</h3>
          <h1>{genuineCalls}</h1>
        </div>

        <div className="stats-card">
          <h3>Scam %</h3>
          <h1>{scamPercentage}%</h1>
        </div>
      </div>

      <div
        className="result-card"
        style={{ marginTop: "30px" }}
      >
        <h2>
          🚨 Top Scam Keywords
        </h2>

        {topKeywords.length === 0 ? (
          <p>
            No keywords detected yet.
          </p>
        ) : (
          <ul>
            {topKeywords.map(
              ([keyword, count]: any) => (
                <li key={keyword}>
                  {keyword} ({count})
                </li>
              )
            )}
          </ul>
        )}
      </div>

      <div
        className="result-card"
        style={{ marginTop: "30px" }}
      >
        <h2>
          📜 Recent Activity
        </h2>

        {history.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <table
            border={1}
            cellPadding={10}
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Date</th>
                <th>Prediction</th>
                <th>Confidence</th>
              </tr>
            </thead>

            <tbody>
              {history
                .slice(0, 5)
                .map(
                  (
                    item,
                    index
                  ) => (
                    <tr
                      key={index}
                    >
                      <td>
                        {item.date}
                      </td>
                      <td>
                        {
                          item.prediction
                        }
                      </td>
                      <td>
                        {
                          item.confidence
                        }
                        %
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reports;