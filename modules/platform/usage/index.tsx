'use client';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const Usage = () => {
  // bar chart with 2 y-axis, x axis for time , y axis for (cost,count)
  const data: any[] = [...new Array(24)].map((_, i) => ({
    // month name + day
    month: new Date(2021, 0, i + 1).toLocaleDateString('en', {
      month: 'short',
      day: 'numeric'
    }),
    cost: Math.round(Math.random() * 100),
    count: Math.round(Math.random() * 100)
  }));

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active: boolean;
    payload: any[];
    label: string;
  }) => {
    const row = payload?.[0]?.payload;
    if (active && row) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="font-semibold text-gray-800">{label}</p>
          <ul>
            {/* cost & count*/}
            <li className="flex justify-between items-center gap-2">
              <p className="text-gray-800">Cost</p>
              <p className="text-gray-800">${row.cost}</p>
            </li>
            <li className="flex justify-between items-center gap-2">
              <p className="text-gray-800">Count</p>
              <p className="text-gray-800">{row.count}</p>
            </li>
          </ul>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="flex flex-col w-full">
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Usage</h1>
      <div className="mt-4 w-1/2 h-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar
              dataKey={'cost'}
              fill="#61AE6D"
              // rounded corners
              radius={[8, 8, 0, 0]}
            />
            <XAxis dataKey="month" />
            <YAxis dataKey={'cost'} tickFormatter={(value) => `$${value}`} />
            <Tooltip
              cursor={{
                opacity: 0.1,
                fill: 'white'
              }}
              content={<CustomTooltip active={true} payload={[]} label={''} />}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid #e5e7eb',
                color: '#374151'
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Usage;
