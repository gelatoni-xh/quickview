import { useMemo } from 'react'
import type { MatchGameBaseDataDTO } from '../../../../types/matchGame'

interface PlayerPerformanceTrendInsightProps {
    baseData: MatchGameBaseDataDTO | null
}

export default function PlayerPerformanceTrendInsight({ baseData }: PlayerPerformanceTrendInsightProps) {
    const mockData = useMemo(() => {
        return [
            { date: '2026-02-10', score: 28, assists: 5, rebounds: 8, efficiency: 52 },
            { date: '2026-02-11', score: 32, assists: 7, rebounds: 6, efficiency: 58 },
            { date: '2026-02-12', score: 24, assists: 4, rebounds: 10, efficiency: 45 },
            { date: '2026-02-13', score: 35, assists: 8, rebounds: 7, efficiency: 65 },
            { date: '2026-02-14', score: 29, assists: 6, rebounds: 9, efficiency: 54 },
            { date: '2026-02-15', score: 31, assists: 7, rebounds: 8, efficiency: 60 },
        ]
    }, [])

    const stats = useMemo(() => {
        const scores = mockData.map(d => d.score)
        const efficiencies = mockData.map(d => d.efficiency)
        return {
            avgScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
            maxScore: Math.max(...scores),
            minScore: Math.min(...scores),
            avgEfficiency: (efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length).toFixed(1),
            trend: scores[scores.length - 1] > scores[0] ? '上升' : '下降',
        }
    }, [])

    const getScoreColor = (score: number) => {
        if (score >= 32) return 'bg-green-100 text-green-700'
        if (score >= 28) return 'bg-blue-100 text-blue-700'
        return 'bg-orange-100 text-orange-700'
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">球员表现浮动</h3>
                <p className="text-sm text-gray-600">近期每场比赛的得分、助攻、篮板等数据变化趋势</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="text-xs text-gray-600 mb-1">平均得分</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.avgScore}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">最高得分</div>
                    <div className="text-2xl font-bold text-green-600">{stats.maxScore}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="text-xs text-gray-600 mb-1">平均效率</div>
                    <div className="text-2xl font-bold text-purple-600">{stats.avgEfficiency}%</div>
                </div>
                <div className={`bg-gradient-to-br ${stats.trend === '上升' ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'} rounded-lg p-4 border ${stats.trend === '上升' ? 'border-green-200' : 'border-red-200'}`}>
                    <div className="text-xs text-gray-600 mb-1">近期趋势</div>
                    <div className={`text-2xl font-bold ${stats.trend === '上升' ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.trend === '上升' ? '📈' : '📉'} {stats.trend}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-4">近6场比赛数据</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">日期</th>
                                <th className="px-4 py-2 text-center font-semibold text-gray-700">得分</th>
                                <th className="px-4 py-2 text-center font-semibold text-gray-700">助攻</th>
                                <th className="px-4 py-2 text-center font-semibold text-gray-700">篮板</th>
                                <th className="px-4 py-2 text-center font-semibold text-gray-700">效率</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockData.map((row, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 text-gray-900">{row.date}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-1 rounded font-semibold ${getScoreColor(row.score)}`}>
                                            {row.score}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center text-gray-700">{row.assists}</td>
                                    <td className="px-4 py-2 text-center text-gray-700">{row.rebounds}</td>
                                    <td className="px-4 py-2 text-center text-gray-700">{row.efficiency}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-gray-900 mb-2">📊 简易折线图</h4>
                <div className="space-y-2">
                    <div className="flex items-end gap-1 h-24">
                        {mockData.map((row, idx) => (
                            <div
                                key={idx}
                                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t hover:opacity-80 transition-opacity"
                                style={{ height: `${(row.score / 35) * 100}%` }}
                                title={`${row.date}: ${row.score}分`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                        {mockData.map((row, idx) => (
                            <span key={idx}>{row.date.split('-')[2]}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
