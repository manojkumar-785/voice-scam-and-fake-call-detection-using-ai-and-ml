import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444"];

function ChartsSection() {

  const [history, setHistory] = useState<any[]>([]);

  const [stats, setStats] = useState({

    total_calls: 0,

    scam_calls: 0,

    genuine_calls: 0,

    high_risk: 0,

    medium_risk: 0,

    low_risk: 0

  });

  useEffect(() => {

    loadCharts();

  }, []);

  const loadCharts = async () => {

    try {

      const historyResponse =
        await fetch(
          "http://127.0.0.1:5000/history"
        );

      const historyData =
        await historyResponse.json();

      historyData.forEach((item:any)=>{

        item.keywords =
          item.keywords
          ? item.keywords.split(",")
          : [];

      });

      setHistory(historyData);

      const statsResponse =
        await fetch(
          "http://127.0.0.1:5000/stats"
        );

      const statsData =
        await statsResponse.json();

      setStats(statsData);

    }

    catch(error){

      console.error(error);

    }

  };

  /* --------------------------
      Pie Chart
  -------------------------- */

  const pieData=[

    {

      name:"Genuine",

      value:stats.genuine_calls

    },

    {

      name:"Scam",

      value:stats.scam_calls

    }

  ];

  /* --------------------------
      Weekly Trend
  -------------------------- */

  const dailyMap:any={};

  history.forEach((item)=>{

    const day=item.date.split(" ")[0];

    dailyMap[day]=
      (dailyMap[day]||0)+1;

  });

  const trendData=
    Object.keys(dailyMap).map(

      (day)=>({

        day,

        calls:dailyMap[day]

      })

    );

  /* --------------------------
      Keyword Chart
  -------------------------- */

  const keywordMap:any={};

  history.forEach((item)=>{

    item.keywords.forEach(

      (keyword:string)=>{

        keywordMap[keyword]=

        (keywordMap[keyword]||0)+1;

      }

    );

  });

  const keywordData=

    Object.keys(keywordMap)

    .map((key)=>({

      keyword:key,

      count:keywordMap[key]

    }))

    .sort(

      (a,b)=>

      b.count-a.count

    )

    .slice(0,5);

  /* --------------------------
      Risk Chart
  -------------------------- */

  const riskData=[

    {

      risk:"High",

      value:stats.high_risk

    },

    {

      risk:"Medium",

      value:stats.medium_risk

    },

    {

      risk:"Low",

      value:stats.low_risk

    }

  ];

  return(

    <div className="charts-grid">

      {/* Pie */}

      <div className="chart-card">

        <h3>

          Scam vs Genuine Calls

        </h3>

        <ResponsiveContainer
          width="100%"
          height={260}
        >

          <PieChart>

            <Pie

              data={pieData}

              dataKey="value"

              outerRadius={90}

              label

            >

              {

                pieData.map(

                  (_,index)=>(

                    <Cell

                      key={index}

                      fill={

                        COLORS[index]

                      }

                    />

                  )

                )

              }

            </Pie>

            <Tooltip/>

          </PieChart>

        </ResponsiveContainer>

      </div>

      {/* Trend */}

      <div className="chart-card">

        <h3>

          Detection Trend

        </h3>

        <ResponsiveContainer
          width="100%"
          height={260}
        >

          <LineChart
            data={trendData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="day"
            />

            <YAxis/>

            <Tooltip/>

            <Line

              type="monotone"

              dataKey="calls"

              stroke="#2563eb"

              strokeWidth={4}

            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* Risk */}

      <div className="chart-card">

        <h3>

          Risk Distribution

        </h3>

        <ResponsiveContainer
          width="100%"
          height={260}
        >

          <BarChart
            data={riskData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="risk"
            />

            <YAxis/>

            <Tooltip/>

            <Bar

              dataKey="value"

              fill="#ef4444"

            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* Keywords */}

      <div className="chart-card">

        <h3>

          Top Scam Keywords

        </h3>

        <ResponsiveContainer
          width="100%"
          height={260}
        >

          <BarChart
            data={keywordData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="keyword"
            />

            <YAxis/>

            <Tooltip/>

            <Bar

              dataKey="count"

              fill="#2563eb"

            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}

export default ChartsSection;