import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ViolationChart({ data }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="name"
            tick={{
              fontSize: 12,
            }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tick={{
              fontSize: 12,
            }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip cursor={{ fill: "rgba(15, 23, 42, 0.04)" }} />

          <Bar
            dataKey="value"
            fill="#0f172a"
            radius={[5, 5, 0, 0]}
            barSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ViolationChart;
