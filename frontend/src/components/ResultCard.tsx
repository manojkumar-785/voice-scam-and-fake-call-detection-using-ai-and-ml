function ResultCard({ result }: any) {
  const downloadReport = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/download-report",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate report");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "AI_Voice_Scam_Report.pdf";

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);

    alert("Unable to download report.");
  }
};

  if (!result) {

    return (

      <div className="result-card">

        <h2>🛡 AI Detection Result</h2>

        <div className="result-content">

          <div
            className="result-icon"
            style={{
              fontSize: "90px",
              marginBottom: "20px"
            }}
          >
            🤖
          </div>

          <h2
            style={{
              color: "#2563eb"
            }}
          >
            No Analysis Yet
          </h2>

          <p
            style={{
              marginTop: "15px",
              fontSize: "18px"
            }}
          >
            Upload or record an audio file to start
            AI voice scam detection.
          </p>

        </div>

      </div>

    );

  }

  const confidence =
    Number(result.confidence);

  const isScam =
    result.prediction.toLowerCase() ===
    "scam";

  const risk =
    result.risk_level || "Low";

  const reasons =
    result.reasons || [];

  const recommendations =
    result.recommendations || [];

  const keywords =
    result.keywords || [];

  let riskColor = "#22c55e";

  if (risk === "High") {

    riskColor = "#ef4444";

  }

  else if (risk === "Medium") {

    riskColor = "#f59e0b";

  }

  const downloadPDF = async () => {

    try {

      const response =
        await fetch(

          "http://127.0.0.1:5000/download-report",

          {

            method:"POST",

            headers:{

              "Content-Type":"application/json"

            },

            body:JSON.stringify(result)

          }

        );

      if(!response.ok){

        alert(
          "Unable to generate report."
        );

        return;

      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href=url;

      link.download=
      "AI_Voice_Scam_Report.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    }

    catch(error){

      console.error(error);

      alert(
        "Download failed."
      );

    }

  };

  return (

    <div className="result-card">

      <h2>

        🛡 AI Detection Result

      </h2>

      <div className="result-content">

        <div
    style={{
        background: isScam
            ? "linear-gradient(135deg,#ef4444,#dc2626)"
            : "linear-gradient(135deg,#22c55e,#16a34a)",
        borderRadius: "25px",
        padding: "35px",
        color: "white",
        marginBottom: "30px",
        boxShadow: "0 15px 35px rgba(0,0,0,.15)"
    }}
>

    <div
        style={{
            fontSize: "70px",
            textAlign: "center"
        }}
    >
        {isScam ? "🚨" : "🛡️"}
    </div>

    <h1
        style={{
            textAlign: "center",
            marginTop: "15px"
        }}
    >
        {isScam
            ? "SCAM CALL DETECTED"
            : "GENUINE CALL"}
    </h1>

    <h2
        style={{
            textAlign: "center",
            marginTop: "10px"
        }}
    >
        Confidence

        {" "}

        {confidence}%
    </h2>

    <div
        style={{
            width: "100%",
            height: "15px",
            background: "rgba(255,255,255,.35)",
            borderRadius: "20px",
            overflow: "hidden",
            marginTop: "20px"
        }}
    >

        <div
            style={{
                width: `${confidence}%`,
                height: "100%",
                background: "#ffffff",
                transition: "1s"
            }}
        />

    </div>

</div>
<div
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
        gap: "15px",
        marginBottom: "30px"
    }}
>

    <div className="status-card">
        <h4>🏦 Scam Type</h4>
        <p>{result.scam_type}</p>
    </div>
    <hr />

<h3
    style={{
        marginTop: "25px",
        marginBottom: "25px"
    }}
>
    📊 AI Fraud Risk Meter
</h3>

<div
    style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "35px"
    }}
>

    <div
        style={{
            width: "230px",
            height: "230px"
        }}
    >
<h3>📊 AI Fraud Risk Meter</h3>

<div
    style={{
        width: "100%",
        height: "22px",
        background: "#e5e7eb",
        borderRadius: "20px",
        overflow: "hidden",
        marginTop: "20px",
        marginBottom: "15px"
    }}
>
    <div
        style={{
            width: `${result.fraud_score || 0}%`,
            height: "100%",
            background:
                (result.fraud_score || 0) >= 80
                    ? "#ef4444"
                    : (result.fraud_score || 0) >= 50
                    ? "#f59e0b"
                    : "#22c55e",
            transition: "width 1s ease"
        }}
    />
</div>

<h2
    style={{
        textAlign: "center",
        color:
            (result.fraud_score || 0) >= 80
                ? "#ef4444"
                : (result.fraud_score || 0) >= 50
                ? "#f59e0b"
                : "#22c55e"
    }}
>
    {result.fraud_score || 0}% Fraud Risk
</h2>

    </div>

</div>

<p
    style={{
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "20px",
        color:

            (result.fraud_score || 0) >= 80

                ? "#ef4444"

                : (result.fraud_score || 0) >= 50

                ? "#f59e0b"

                : "#22c55e"

    }}
>

    {(result.fraud_score || 0) >= 80

        ? "🚨 Critical Fraud Risk"

        : (result.fraud_score || 0) >= 50

        ? "⚠ Moderate Fraud Risk"

        : "🛡 Low Fraud Risk"}

</p>

<hr />

    <div className="status-card">
        <h4>🚨 Threat</h4>
        <p>{result.threat_level}</p>
    </div>

    <div className="status-card">
        <h4>💰 Fraud Score</h4>
        <p>{result.fraud_score}%</p>
    </div>

    <div className="status-card">
        <h4>💳 Financial Risk</h4>
        <p>{result.financial_risk}</p>
    </div>

</div>
        <br/>

        <h3>

          AI Risk Meter

        </h3>
        

        <div className="risk-bar">

          <div

            className="risk-fill"

            style={{

              width:`${confidence}%`,

              background:riskColor

            }}

          ></div>

        </div>

        <p

          style={{

            color:riskColor,

            fontWeight:"bold",

            marginTop:"10px"

          }}

        >

          {risk}
<hr />

<h3>🛡 AI Security Overview</h3>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "15px",
    marginTop: "20px",
    marginBottom: "20px"
  }}
>

  <div className="ai-info-card">
    <h4>🏦 Scam Type</h4>
    <p>{result.scam_type || "General"}</p>
  </div>

  <div className="ai-info-card">
    <h4>🚨 Threat Level</h4>
    <p>{result.threat_level || "Low"}</p>
  </div>

 <div className="ai-info-card">

    <h4>💰 AI Fraud Score</h4>

    <div
        style={{
            width: "100%",
            height: "12px",
            background: "#e5e7eb",
            borderRadius: "20px",
            overflow: "hidden",
            marginTop: "15px",
            marginBottom: "12px"
        }}
    >

        <div
            style={{
                width: `${result.fraud_score || 0}%`,
                height: "100%",
                background:
                    (result.fraud_score || 0) >= 80
                        ? "#dc2626"
                        : (result.fraud_score || 0) >= 50
                        ? "#f59e0b"
                        : "#22c55e",
                transition: "1s"
            }}
        />

    </div>

    <h2>

        {result.fraud_score || 0}%

    </h2>

</div>

  <div className="ai-info-card">
    <h4>💳 Financial Risk</h4>
  <span
    style={{
        background:
            result.financial_risk === "High"
                ? "#ef4444"
                : "#22c55e",
        color: "white",
        padding: "8px 18px",
        borderRadius: "30px",
        fontWeight: "bold"
    }}
>
    {result.financial_risk || "Low"}
</span>
  </div>

  <div className="ai-info-card">
    <h4>🔐 Sensitive Data Risk</h4>
    <p>{result.sensitive_data_risk || "Low"}</p>
  </div>

  <div className="ai-info-card">
    <h4>🧠 Social Engineering</h4>
    <p>
      {result.social_engineering ? "Detected" : "Not Detected"}
    </p>
  </div>

</div>
        </p>
<hr />

<h3>🕵 Scam Type</h3>

<p
  style={{
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2563eb"
  }}
>
  {result.scam_type || "General"}
</p>

<hr />

<h3>🚨 Threat Level</h3>

<p
  style={{
    fontSize: "18px",
    fontWeight: "bold",
    color:
      result.threat_level === "Extreme"
        ? "#dc2626"
        : result.threat_level === "High"
        ? "#ef4444"
        : result.threat_level === "Moderate"
        ? "#f59e0b"
        : "#22c55e"
  }}
>
  {result.threat_level || "Low"}
</p>

<hr />

<h3>⚡ Urgency Score</h3>

<div className="risk-bar">
  <div
    className="risk-fill"
    style={{
      width: `${result.urgency_score || 0}%`,
      background:
        (result.urgency_score || 0) >= 80
          ? "#dc2626"
          : (result.urgency_score || 0) >= 50
          ? "#f59e0b"
          : "#22c55e"
    }}
  ></div>
</div>

<p
  style={{
    marginTop: "10px",
    fontWeight: "bold"
  }}
>
  {result.urgency_score || 0}%
</p>
        <hr/>
                <h3>

          Transcript

        </h3>

        <p

          style={{

            textAlign:"left",

            lineHeight:"1.8",

            marginTop:"15px"

          }}

        >

          {result.transcript}

        </p>

        <hr/>

        <h3>

          🔑 Detected Keywords

        </h3>

        {

          keywords.length > 0

          ?

          (

            <div

              style={{

                display:"flex",

                flexWrap:"wrap",

                gap:"10px",

                marginTop:"15px",

                marginBottom:"20px"

              }}

            >

              {

                keywords.map(

                  (

                    keyword:string,

                    index:number

                  )=>(

                    <span

                      key={index}

                      style={{

                        background:"#2563eb",

                        color:"white",

                        padding:"8px 14px",

                        borderRadius:"20px",

                        fontSize:"14px",

                        fontWeight:"600"

                      }}

                    >

                      {keyword}

                    </span>

                  )

                )

              }

            </div>

          )

          :

          (

            <p>

              No suspicious keywords detected.

            </p>

          )

        }

        <hr/>

        <h3>

          🧠 Why did AI predict this?

        </h3>

        {

          reasons.length > 0

          ?

          (

            <ul

              style={{

                textAlign:"left",

                lineHeight:"2",

                marginTop:"15px"

              }}

            >

              {

                reasons.map(

                  (

                    reason:string,

                    index:number

                  )=>(

                    <li

                      key={index}

                    >

                      {reason}

                    </li>

                  )

                )

              }

            </ul>

          )

          :

          (

            <p>

              No explanation available.

            </p>

          )

        }

        <hr/>
        <hr />

<h3>🧠 AI Executive Summary</h3>

<div
  style={{
    background: "#f8fafc",
    borderLeft: "6px solid #2563eb",
    padding: "22px",
    borderRadius: "12px",
    marginTop: "20px",
    marginBottom: "25px",
    textAlign: "left",
    lineHeight: "1.9",
    boxShadow: "0 6px 18px rgba(0,0,0,.08)"
  }}
>

  <p>

    <strong>Analysis:</strong>

    {" "}

    The uploaded conversation appears to be

    <strong>

      {" "}

      {result.scam_type || "General"}

    </strong>

    .

  </p>

  <br />

  <p>

    <strong>Threat Level:</strong>

    {" "}

    {result.threat_level || "Low"}

  </p>

  <br />

  <p>

    <strong>Fraud Score:</strong>

    {" "}

    {result.fraud_score || 0}%

  </p>

  <br />

  <p>

    <strong>Summary:</strong>

    {" "}

    {result.prediction === "Scam"

      ? "The AI model detected multiple indicators commonly associated with fraudulent voice calls. The conversation contains suspicious patterns and should be treated with caution."

      : "The AI model did not identify significant fraud indicators in the conversation. Continue exercising normal caution when sharing personal information."}

  </p>

</div>
                <h3>

          🤖 AI Recommendation

        </h3>

        {

          recommendations.length > 0

          ?

          (

           <div
    style={{
        marginTop: "20px"
    }}
>

{
    recommendations.map(
        (
            item: string,
            index: number
        ) => (

            <div
                key={index}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    background: "#f8fafc",
                    borderLeft: "5px solid #2563eb",
                    padding: "15px",
                    marginBottom: "12px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 10px rgba(0,0,0,.06)"
                }}
            >

                <span
                    style={{
                        fontSize: "24px"
                    }}
                >
                    ✅
                </span>

                <span>
                    {item}
                </span>

            </div>

        )
    )
}

</div>
            

          )

          :

          (

            <p>

              No recommendation available.

            </p>

          )

        }

        <hr/>

        <div

          style={{

            display:"grid",

            gridTemplateColumns:"repeat(3,1fr)",

            gap:"15px",

            marginTop:"20px",

            marginBottom:"25px"

          }}

        >

          <div

            style={{

              background:"#eff6ff",

              borderRadius:"15px",

              padding:"20px",

              textAlign:"center"

            }}

          >

            <h4>

              Prediction

            </h4>

            <h2>

              {

                result.prediction

              }

            </h2>

          </div>

          <div

            style={{

              background:"#fef3c7",

              borderRadius:"15px",

              padding:"20px",

              textAlign:"center"

            }}

          >

            <h4>

              Confidence

            </h4>

            <h2>

              {confidence}%

            </h2>

          </div>

          <div

            style={{

              background:"#fee2e2",

              borderRadius:"15px",

              padding:"20px",

              textAlign:"center"

            }}

          >

            <h4>

              Risk Level

            </h4>

            <h2>

              {risk}

            </h2>

          </div>

        </div>

        <div

          style={{

            display:"flex",

            justifyContent:"center",

            gap:"20px",

            flexWrap:"wrap"

          }}

        >

          <button
   onClick={downloadReport}
    style={{
        width: "100%",
        padding: "18px",
        border: "none",
        borderRadius: "15px",
        background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
        color: "white",
        fontSize: "18px",
        fontWeight: "bold",
        cursor: "pointer",
        marginTop: "30px",
        boxShadow: "0 10px 25px rgba(37,99,235,.35)",
        transition: "0.3s"
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow =
            "0 18px 35px rgba(37,99,235,.45)";
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow =
            "0 10px 25px rgba(37,99,235,.35)";
    }}
>
    📄 Download Professional AI Report
</button>

        </div>

        <br/>
              </div>

    </div>

  );

}

export default ResultCard;