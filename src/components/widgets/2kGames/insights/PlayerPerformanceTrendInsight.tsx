import { useMemo, useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { getMatchGameTrend } from '../../../../services/matchGameApi'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

const drawLabels = (chart: any) => {
    const ctx = chart.ctx
    const datasets = chart.data.datasets
    const xScale = chart.scales.x
    const yScale = chart.scales.y

    datasets.forEach((dataset: any, datasetIndex: number) => {
        dataset.data.forEach((value: number, index: number) => {
            if (value === null || value === undefined) return
            const x = xScale.getPixelForValue(index)
            const y = yScale.getPixelForValue(value)
            
            ctx.fillStyle = '#000'
            ctx.font = '11px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.fillText(value.toFixed(3) + '%', x, y - 8)
        })
    })
}

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

    if (loading) {
        return <div className="p-4 text-center text-gray-500">加载中...</div>
    }

    const getMetricLabel = (metric: string) => {
        const labels: { [key: string]: string } = {
            rating: '评价',
            score: '得分',
            assist: '助攻',
            rebound: '篮板',
            steal: '抢断',
            block: '盖帽'
        }
        return labels[metric] || metric
    }

    const winRateValues = trendData?.winRate?.map((rate: number) => parseFloat((rate * 100).toFixed(3))) || []
    const minWinRate = Math.min(...winRateValues)
    const maxWinRate = Math.max(...winRateValues)
    const yMin = Math.max(0, minWinRate - 10)
    const yMax = Math.min(100, maxWinRate + 10)

    return (
        <div className="space-y-6 w-full min-w-0">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">球员表现趋势</h3>
                <p className="text-sm text-gray-600">按日期展示各球员的数据变化，胜率为球队整体表现</p>
            </div>

            {/* 胜率趋势 */}
            <div className="bg-white rounded-lg border p-4 w-full min-w-0">
                <h4 className="font-semibold text-gray-900 mb-4">胜率趋势</h4>
                <div className="w-full min-w-0" style={{ height: 'clamp(250px, 40vw, 320px)' }}>
                    <Line
                        key={`chart-2-${resizeKey}`}
                        data={{
                            labels: trendData?.dates || [],
                            datasets: [{
                                label: '胜率',
                                data: winRateValues,
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
                                legend: { position: 'bottom' },
                                tooltip: {
                                    callbacks: {
                                        label: (context: any) => context.parsed.y.toFixed(3) + '%'
                                    }
                                }
                            },
                            scales: {
                                y: { beginAtZero: false, min: yMin, max: yMax }
                            }
                        }}
                        plugins={[{
                            id: 'drawLabels',
                            afterDatasetsDraw: drawLabels
                        }]}
                    />
                </div>
            </div>

            {/* 指标选择按钮 */}
            <div className="bg-white rounded-lg border p-4 w-full min-w-0">
                <div className="mb-4 flex gap-2 flex-wrap">
                    {['rating', 'score', 'assist', 'rebound', 'steal', 'block'].map(metric => (
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
                            labels: trendData?.dates || [],
                            datasets: playerNames.map((playerName, playerIdx) => ({
                                label: playerName,
                                data: trendData?.playerMetrics[playerName][selectedMetric]?.map((v: number) => parseFloat(v.toFixed(1))) || [],
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
        </div>
    )
}
