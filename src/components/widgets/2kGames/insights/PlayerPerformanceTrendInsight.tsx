import { useMemo, useEffect, useState } from 'react'
import { getMatchGameTrend } from '../../../../services/matchGameApi'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function PlayerPerformanceTrendInsight() {
    const [trendData, setTrendData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedMetric, setSelectedMetric] = useState('score')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getMatchGameTrend({
                    season: null,
                    excludeRobot: true,
                    dimension: 'PLAYER'
                })
                if (response) {
                    setTrendData(response)
                }
            } catch (error) {
                console.error('Failed to fetch trend data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const playerNames = useMemo(() => {
        if (!trendData?.playerMetrics) return []
        return Object.keys(trendData.playerMetrics).sort()
    }, [trendData])

    const winRateStats = useMemo(() => {
        if (!trendData?.winRate) return { avg: '0', max: 0, min: 0 }
        const rates = trendData.winRate
        return {
            avg: (rates.reduce((a: number, b: number) => a + b, 0) / rates.length * 100).toFixed(1),
            max: Math.max(...rates) * 100,
            min: Math.min(...rates) * 100,
        }
    }, [trendData])

    if (loading) {
        return <div className="p-4 text-center text-gray-500">加载中...</div>
    }

    const getMetricLabel = (metric: string) => {
        const labels: { [key: string]: string } = {
            score: '得分',
            assist: '助攻',
            rebound: '篮板',
            rating: '效率',
            steal: '抢断',
            block: '盖帽'
        }
        return labels[metric] || metric
    }

    const renderLineChart = () => {
        if (!trendData?.dates || playerNames.length === 0) return null

        const maxValue = Math.max(
            ...playerNames.flatMap(p => trendData.playerMetrics[p][selectedMetric] || [])
        ) || 1

        return (
            <div className="bg-white rounded-lg border p-4">
                <div className="mb-4 flex gap-2 flex-wrap">
                    {['score', 'assist', 'rebound', 'rating', 'steal', 'block'].map(metric => (
                        <button
                            key={metric}
                            onClick={() => setSelectedMetric(metric)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                selectedMetric === metric
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {getMetricLabel(metric)}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <svg width="100%" height="300" viewBox={`0 0 ${trendData.dates.length * 60 + 60} 300`} className="min-w-full">
                        {/* Y轴 */}
                        <line x1="40" y1="20" x2="40" y2="260" stroke="#ccc" strokeWidth="1" />
                        {/* X轴 */}
                        <line x1="40" y1="260" x2={trendData.dates.length * 60 + 40} y2="260" stroke="#ccc" strokeWidth="1" />

                        {/* 网格线和Y轴标签 */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                            const y = 260 - ratio * 240
                            const value = Math.round(maxValue * ratio * 10) / 10
                            return (
                                <g key={i}>
                                    <line x1="35" y1={y} x2={trendData.dates.length * 60 + 40} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                                    <text x="5" y={y + 4} fontSize="12" fill="#999" textAnchor="end">{value}</text>
                                </g>
                            )
                        })}

                        {/* 绘制每个球员的折线 */}
                        {playerNames.map((playerName, playerIdx) => {
                            const values = trendData.playerMetrics[playerName][selectedMetric] || []
                            const points = values.map((v: number, idx: number) => {
                                const x = 40 + idx * 60 + 30
                                const y = 260 - (v / maxValue) * 240
                                return `${x},${y}`
                            }).join(' ')

                            return (
                                <g key={playerName}>
                                    <polyline points={points} fill="none" stroke={COLORS[playerIdx % COLORS.length]} strokeWidth="2" />
                                    {values.map((v: number, idx: number) => (
                                        <circle
                                            key={`${playerName}-${idx}`}
                                            cx={40 + idx * 60 + 30}
                                            cy={260 - (v / maxValue) * 240}
                                            r="3"
                                            fill={COLORS[playerIdx % COLORS.length]}
                                        />
                                    ))}
                                </g>
                            )
                        })}

                        {/* X轴标签 */}
                        {trendData.dates.map((date: string, idx: number) => (
                            <text key={idx} x={40 + idx * 60 + 30} y="280" fontSize="12" fill="#666" textAnchor="middle">
                                {date.split('-')[2]}
                            </text>
                        ))}
                    </svg>
                </div>

                {/* 图例 */}
                <div className="mt-4 flex flex-wrap gap-4">
                    {playerNames.map((playerName, idx) => (
                        <div key={playerName} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-sm text-gray-700">{playerName}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">球员表现趋势</h3>
                <p className="text-sm text-gray-600">按日期展示各球员的数据变化，胜率为球队整体表现</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="text-xs text-gray-600 mb-1">平均胜率</div>
                    <div className="text-2xl font-bold text-blue-600">{winRateStats.avg}%</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">最高胜率</div>
                    <div className="text-2xl font-bold text-green-600">{winRateStats.max.toFixed(0)}%</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="text-xs text-gray-600 mb-1">最低胜率</div>
                    <div className="text-2xl font-bold text-purple-600">{winRateStats.min.toFixed(0)}%</div>
                </div>
            </div>

            {renderLineChart()}

            <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-4">胜率趋势</h4>
                <div className="flex items-end gap-1 h-24">
                    {trendData?.winRate?.map((rate: number, idx: number) => (
                        <div
                            key={idx}
                            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t hover:opacity-80 transition-opacity"
                            style={{ height: `${rate * 100}%` }}
                            title={`${trendData.dates[idx]}: ${(rate * 100).toFixed(0)}%`}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                    {trendData?.dates?.map((date: string, idx: number) => (
                        <span key={idx}>{date.split('-')[2]}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}
