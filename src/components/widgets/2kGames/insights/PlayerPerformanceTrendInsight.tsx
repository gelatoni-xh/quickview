import { useMemo, useEffect, useState } from 'react'
import { getMatchGameTrend } from '../../../../services/matchGameApi'
import { Chart as ChartJS, CategoryScale, LinearScale, BarController, BarElement, LineController, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarController, BarElement, LineController, LineElement, Title, Tooltip, Legend, Filler)

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

    const playerChartData = useMemo(() => {
        if (!trendData?.playerMetrics || !trendData?.dates) return null
        
        const datasets = playerNames.map((playerName, idx) => ({
            label: playerName,
            data: trendData.playerMetrics[playerName][selectedMetric] || [],
            backgroundColor: COLORS[idx % COLORS.length],
            borderColor: COLORS[idx % COLORS.length],
            borderWidth: 1,
            borderRadius: 4,
        }))

        return {
            labels: trendData.dates.map((date: string) => date.split('-')[2]),
            datasets
        }
    }, [trendData, selectedMetric, playerNames])

    const winRateChartData = useMemo(() => {
        if (!trendData?.winRate || !trendData?.dates) return null
        
        return {
            labels: trendData.dates.map((date: string) => date.split('-')[2]),
            datasets: [{
                label: '胜率',
                data: trendData.winRate.map((rate: number) => (rate * 100).toFixed(1)),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            }]
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

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                borderColor: '#ddd',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 } }
            }
        }
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

            {/* 指标选择按钮 */}
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

                {/* 球员数据柱状图 */}
                {playerChartData && (
                    <div className="h-80">
                        <Bar data={playerChartData} options={chartOptions} />
                    </div>
                )}
            </div>

            {/* 胜率趋势折线图 */}
            <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-4">胜率趋势</h4>
                {winRateChartData && (
                    <div className="h-80">
                        <Line data={winRateChartData} options={chartOptions} />
                    </div>
                )}
            </div>
        </div>
    )
}
