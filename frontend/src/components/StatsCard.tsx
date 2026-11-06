import { useEffect, useState } from "react";

type Props = {
  title: string;
  value: string;
  icon: string;
};

function StatsCard({
  title,
  value,
  icon,
}: Props) {

  const [displayValue, setDisplayValue] =
    useState(0);

  useEffect(() => {

    const target = parseFloat(
      value.replace("%", "")
    );

    if (isNaN(target)) return;

    let current = 0;

    const increment =
      target / 40;

    const timer = setInterval(() => {

      current += increment;

      if (current >= target) {

        current = target;

        clearInterval(timer);

      }

      setDisplayValue(
        Number(current.toFixed(1))
      );

    }, 25);

    return () => clearInterval(timer);

  }, [value]);

  const isPercentage =
    value.includes("%");

  return (

    <div className="stats-card">

      <div className="stats-glow"></div>

      <div className="card-header">

        <div className="card-icon">

          {icon}

        </div>

        <div className="status-dot"></div>

      </div>

      <div className="card-body">

        <h3>

          {title}

        </h3>

        <h1>

          {

            isPercentage

              ? `${displayValue}%`

              : Math.round(displayValue)

          }

        </h1>

        <p className="card-subtitle">

          Live Statistics

        </p>

      </div>

      <div className="card-wave"></div>

    </div>

  );

}

export default StatsCard;