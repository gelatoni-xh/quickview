import { useEffect, useState } from 'react'
import type { OpponentRecord } from '../../../../types/matchGame'
import { useOpponentStats } from '../../../../hooks/useOpponentStats'

interface UnbeatenOpponentsInsightProps {
    season?: string | null
}

export default function UnbeatenOpponentsInsight({ season }: UnbeatenOpponentsInsightProps) {
    const { data: opponentStats, loading, fetchStats } = useOpponentStats()
    const [minGames, setMinGames] = useState(3)
    const [filteredData, setFilteredData] = useState<OpponentRecord[]>([])

    useEffect(() => {
        fetchStats(season, minGames)
    }, [season, minGames, fetchStats])

    useEffect(() => {
        if (opponentStats?.opponents) {
            setFilteredData(opponentStats.opponents)
        }
    }, [opponentStats])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">最无法碰到的对手</h3>
                    <p className="text-sm text-gray-600">统计你对阵各个对手的胜率和净胜分</p>
                </div>
                <div className="text-center py-8 text-gray-500">加载中...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">最无法碰到的对手</h3>
                <p className="text-sm text-gray-600">统计你对阵各个对手的胜率和净胜分</p>
            </div>

            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">最小对阵次数：</label>
                <select
                    value={minGames}
                    onChange={(e) => setMinGames(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={1}>≥ 1 场</option>
                    <option value={3}>≥ 3 场</option>
                    <option value={5}>≥ 5 场</option>
                    <option value={10}>≥ 10 场</option>
                </select>
            </div>

            {filteredData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无对手数据</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">对手</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">总场次</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">胜场</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">负场</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">胜率</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">净胜分</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((row, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-900">{row.playerName}</td>
                                        <td className="px-4 py-3 text-center text-gray-700 font-semibold">{row.totalGames}</td>
                                        <td className="px-4 py-3 text-center text-green-600 font-semibold">{row.wins}</td>
                                        <td className="px-4 py-3 text-center text-red-600 font-semibold">{row.losses}</td>
                                        <td className="px-4 py-3 text-center text-gray-700">{(row.winRate * 100).toFixed(0)}%</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-semibold ${row.pointDifferential > 0 ? 'text-green-600' : row.pointDifferential < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                                {row.pointDifferential > 0 ? '+' : ''}{row.pointDifferential}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">{opponentStats?.summary.maxLosses || 0}</div>
                            <div className="text-sm text-gray-600 mt-1">最难对手的负场数</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="text-2xl font-bold text-green-600">{opponentStats?.summary.totalOpponents || 0}</div>
                            <div className="text-sm text-gray-600 mt-1">统计对手数</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <div className="text-2xl font-bold text-purple-600">{((opponentStats?.summary.avgWinRate || 0) * 100).toFixed(0)}%</div>
                            <div className="text-sm text-gray-600 mt-1">平均胜率</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
