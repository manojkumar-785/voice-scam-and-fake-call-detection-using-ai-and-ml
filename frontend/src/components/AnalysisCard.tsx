type Props = {
  currentStep: number;
};

function AnalysisCard({ currentStep }: Props) {
  const steps = [
    {
      icon: "🎤",
      title: "Speech To Text Conversion",
    },
    {
      icon: "🔍",
      title: "Scam Keyword Detection",
    },
    {
      icon: "🤖",
      title: "Scam Classification",
    },
    {
      icon: "🧠",
      title: "AI Risk Evaluation",
    },
    {
      icon: "📊",
      title: "Confidence Score Generation",
    },
    {
      icon: "📄",
      title: "Report Generation",
    },
  ];

  return (
    <div className="analysis-card">
      <h2>🤖 AI Analysis Pipeline</h2>

      {steps.map((step, index) => {
        let status = "Waiting";
        let color = "#e5e7eb";
        let icon = "⚪";

        if (index < currentStep) {
          status = "Completed";
          color = "#22c55e";
          icon = "✅";
        } else if (index === currentStep) {
          status = "Processing...";
          color = "#f59e0b";
          icon = "🟡";
        }

        return (
          <div
            key={index}
            className="analysis-item"
            style={{
              borderLeft: `6px solid ${color}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {step.icon} {step.title}
            </span>

            <span
              style={{
                color: color,
                fontWeight: "bold",
              }}
            >
              {icon} {status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default AnalysisCard;