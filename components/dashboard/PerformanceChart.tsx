"use client"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

const data = [
  { name: 'Mon', revenue: 120000, orders: 14 },
  { name: 'Tue', revenue: 98000, orders: 10 },
  { name: 'Wed', revenue: 145000, orders: 18 },
  { name: 'Thu', revenue: 110000, orders: 12 },
  { name: 'Fri', revenue: 175000, orders: 22 },
  { name: 'Sat', revenue: 210000, orders: 28 },
  { name: 'Sun', revenue: 185000, orders: 24 },
]

export function PerformanceChart() {
  return (
    <div className="h-[300px] dark:bg-gray-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [
              value, 
              value.toString().includes('revenue') ? 'Revenue' : 'Orders'
            ]}
            labelFormatter={(label) => `Day: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="orders" 
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