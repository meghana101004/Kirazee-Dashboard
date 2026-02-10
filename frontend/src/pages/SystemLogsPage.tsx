import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Permission, SystemLogsResponse, SystemLog, APIAnalyticsResponse } from '../types'
import apiClient from '../utils/apiClient'
import './SystemLogsPage.css'

type LogLevel = 'info' | 'warning' | 'error' | 'all'

const SystemLogsPage: React.FC = () => {
  const { hasPermission } = useAuth()
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [analytics, setAnalytics] = useState<APIAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [logLevelFilter, setLogLevelFilter] = useState<LogLevel>('all')
  const [logLimit, setLogLimit] = useState<number>(100)

  // Check permissions
  const canViewLogs = hasPermission(Permission.VIEW_SYSTEM_LOGS) || hasPermission(Permission.MANAGE_USERS)
  const canViewAnalytics = hasPermission(Permission.VIEW_API_ANALYTICS) || hasPermission(Permission.MANAGE_USERS)

  useEffect(() => {
    if (canViewLogs || canViewAnalytics) {
      fetchData()
    }
  }, [logLevelFilter, logLimit, canViewLogs, canViewAnalytics])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const promises: Promise<any>[] = []

      if (canViewLogs) {
        const logParams: any = { limit: logLimit }
        if (logLevelFilter !== 'all') {
          logParams.level = logLevelFilter
        }
        promises.push(apiClient.get<SystemLogsResponse>('/system/logs', { params: logParams }))
      }

      if (canViewAnalytics) {
        promises.push(apiClient.get<APIAnalyticsResponse>('/system/api-analytics'))
      }

      const results = await Promise.all(promises)

      let resultIndex = 0
      if (canViewLogs) {
        setLogs(results[resultIndex].data.logs)
        resultIndex++
      }
      if (canViewAnalytics) {
        setAnalytics(results[resultIndex].data)
      }
    } catch (err: any) {
      console.error('Error fetching system data:', err)
      setError(err.response?.data?.error || 'Failed to load system data')
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getLogLevelClass = (level: string): string => {
    switch (level) {
      case 'info':
        return 'log-level-info'
      case 'warning':
        return 'log-level-warning'
      case 'error':
        return 'log-level-error'
      default:
        return ''
    }
  }

  if (!canViewLogs && !canViewAnalytics) {
    return (
      <div className="system-logs-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to view system logs and analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="system-logs-page">
      <div className="page-header">
        <h2>System Logs & Analytics</h2>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading system data...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button onClick={fetchData} className="btn-retry">
            Retry
          </button>
        </div>
      ) : (
        <>
          {canViewAnalytics && analytics && (
            <div className="analytics-section">
              <h3>API Analytics</h3>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <span className="analytics-label">Total Requests</span>
                  <span className="analytics-value">{analytics.total_requests.toLocaleString()}</span>
                </div>
                <div className="analytics-card">
                  <span className="analytics-label">Avg Response Time</span>
                  <span className="analytics-value">{analytics.average_response_time.toFixed(2)} ms</span>
                </div>
                <div className="analytics-card">
                  <span className="analytics-label">Error Rate</span>
                  <span className="analytics-value">{(analytics.error_rate * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="endpoint-stats">
                <h4>Requests by Endpoint</h4>
                <div className="endpoint-list">
                  {Object.entries(analytics.requests_by_endpoint)
                    .sort(([, a], [, b]) => b - a)
                    .map(([endpoint, count]) => (
                      <div key={endpoint} className="endpoint-item">
                        <span className="endpoint-name">{endpoint}</span>
                        <span className="endpoint-count">{count.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {canViewLogs && (
            <div className="logs-section">
              <div className="logs-header">
                <h3>System Logs</h3>
                <div className="logs-controls">
                  <div className="control-group">
                    <label htmlFor="log-level-filter">Level:</label>
                    <select
                      id="log-level-filter"
                      value={logLevelFilter}
                      onChange={(e) => setLogLevelFilter(e.target.value as LogLevel)}
                      className="log-level-select"
                    >
                      <option value="all">All</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label htmlFor="log-limit">Limit:</label>
                    <select
                      id="log-limit"
                      value={logLimit}
                      onChange={(e) => setLogLimit(Number(e.target.value))}
                      className="log-limit-select"
                    >
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="500">500</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="logs-container">
                {logs.length === 0 ? (
                  <div className="no-logs">
                    <p>No logs found</p>
                  </div>
                ) : (
                  <div className="logs-list">
                    {logs.map((log, index) => (
                      <div key={index} className={`log-entry ${getLogLevelClass(log.level)}`}>
                        <div className="log-header">
                          <span className={`log-level ${getLogLevelClass(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                          <span className="log-source">{log.source}</span>
                        </div>
                        <div className="log-message">{log.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SystemLogsPage
