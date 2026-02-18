import { useMemo, useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { getMatchGameTrend } from '../../../../services/matchGameApi'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function PlayerPerformanceTrendInsight() {
    const [trendData, setTrendData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedMetric, setSelectedMetric] = useState('score')
    const [resizeKey, setResizeKey] = useState(0)

    useEffect(() => {
        const handleResize = () => setResizeKey(k => k + 1)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getMatchGameTrend({
                    season: null,
                    excludeRobot: true,
                    dimension: 'PLAYER'
                })
                console.log('Trend data response:', response)
                if (response?.data) {
                    setTrendData(response.data)
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

    const getMaxValue = () => {
        if (!trendData?.playerMetrics) return 1
        let max = 0
        Object.values(trendData.playerMetrics).forEach((player: any) => {
            const values = player[selectedMetric] || []
            const playerMax = Math.max(...values)
            if (playerMax > max) max = playerMax
        })
        return max || 1
    }

    const maxValue = getMaxValue()

    return (
        <div className="space-y-6 w-full min-w-0">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">球员表现趋势</h3>
                <p className="text-sm text-gray-600">按日期展示各球员的数据变化，胜率为球队整体表现</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
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

            {/* 指标选择按钮 */}
            <div className="bg-white rounded-lg border p-4 w-full min-w-0">
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

                {/* 折线图 */}
                <div className="w-full min-w-0" style={{ height: 'clamp(300px, 50vw, 400px)' }}>
                    <Line
                        key={`chart-1-${resizeKey}`}
                        data={{
                            labels: trendData?.dates?.map((date: string) => date.split('-')[2]) || [],
                            datasets: playerNames.map((playerName, playerIdx) => ({
                                label: playerName,
                                data: trendData?.playerMetrics[playerName][selectedMetric] || [],
                                borderColor: COLORS[playerIdx % COLORS.length],
                                backgroundColor: COLORS[playerIdx % COLORS.length] + '20',
                                tension: 0.4,
                                fill: false,
                                pointRadius: 4,
                                pointHoverRadius: 6
                            }))
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom' }
                            },
                            scales: {
                                y: { beginAtZero: true }
                            }
                        }}
                    />
                </div>
            </div>

            {/* 胜率趋势 */}
            <div className="bg-white rounded-lg border p-4 w-full min-w-0">
                <h4 className="font-semibold text-gray-900 mb-4">胜率趋势</h4>
                <div className="w-full min-w-0" style={{ height: 'clamp(250px, 40vw, 320px)' }}>
                    <Line
                        key={`chart-2-${resizeKey}`}
                        data={{
                            labels: trendData?.dates?.map((date: string) => date.split('-')[2]) || [],
                            datasets: [{
                                label: '胜率',
                                data: trendData?.winRate?.map((rate: number) => (rate * 100).toFixed(1)) || [],
                                borderColor: '#3b82f6',
                                backgroundColor: '#3b82f620',
                                tension: 0.4,
                                fill: true,
                                pointRadius: 4,
                                pointHoverRadius: 6
                            }]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom' }
                            },
                            scales: {
                                y: { beginAtZero: true, max: 100 }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
