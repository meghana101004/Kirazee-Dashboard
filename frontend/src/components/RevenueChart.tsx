import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Permission, DailyRevenue } from '../types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './RevenueChart.css'

interface RevenueChartProps {
  data: DailyRevenue[]
  timeRange: 'day' | 'week' | 'month' | 'year'
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, timeRange }) => {
  const { hasPermission } = useAuth()

  // Require CA_Finance or Super_Admin permission
  if (
    !hasPermission(Permission.VIEW_REVENUE) &&
    !hasPermission(Permission.MANAGE_USERS)
  ) {
    return null
  }

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Format date based on time range
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    
    switch (timeRange) {
      case 'day':
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      case 'week':
        return date.toLocaleDateString('en-US', { 
          weekday: 'short' 
        })
      case 'month':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      case 'year':
        return date.toLocaleDateString('en-US', { 
          month: 'short' 
        })
      default:
        return dateString
    }
  }

  // Format data for chart
  const chartData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date),
  }))

  return (
    <div className="revenue-chart-container">
      <h3 className="chart-title">Revenue Trends</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelStyle={{ color: '#333' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#28a745"
            strokeWidth={2}
            name="Revenue"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#007bff"
            strokeWidth={2}
            name="Orders"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
