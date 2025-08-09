"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

type InputData = {
  day: string
  sales: number
  orders: number
}

type Props = {
  data: InputData[]
}

export function PerformanceChart({ data }: Props) {
  // ✅ Use sales directly
  const chartData = data.map(item => ({
    name: item.day,
    sales: item.sales,
    orders: item.orders
  }));

  return (
    <div className="h-[300px] dark:bg-gray-800 bg-white p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
          <YAxis tick={{ fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              borderColor: '#374151',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
            formatter={(value, name) => {
              console.log({value, name})
              return [
              name === 'sales' ? `₦${Number(value).toLocaleString()}` : value,
              name === 'Sales' ? 'Sales' : 'Orders'
            ]}}
            labelFormatter={(label) => `Day: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            name="Sales"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
