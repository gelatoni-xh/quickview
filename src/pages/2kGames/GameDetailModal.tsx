import { useEffect, useState } from 'react'
import { getMatchGameDetail } from '../../services/matchGameApi'
import type { MatchGameDetailDTO } from '../../types/matchGame'
import { formatDatetime } from '../../utils/matchGameFormat'

export default function GameDetailModal(props: {
    gameId: number
    onClose: () => void
}) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<MatchGameDetailDTO | null>(null)

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await getMatchGameDetail(props.gameId)
                if (!res.success) {
                    setError(res.message || '获取比赛详情失败')
                    setData(null)
                    return
                }
                setData(res.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err))
            } finally {
                setLoading(false)
            }
        }

        fetchDetail()
    }, [props.gameId])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-5xl bg-white rounded shadow-lg p-4 max-h-[85vh] overflow-auto">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">比赛详情</h3>
                    <button onClick={props.onClose} aria-label="关闭">×</button>
                </div>

                {loading && <div className="text-sm text-gray-500">加载中...</div>}
                {!loading && error && <div className="text-sm text-red-500">{error}</div>}

                {!loading && !error && data && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded border p-3">
                            <div className="text-sm font-medium">基础信息</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mt-2">
                                <div>赛季：{data.matchGame.season}</div>
                                <div>赛季场次：{data.matchGame.seasonMatchNo}</div>
                                <div>时间：{formatDatetime(data.matchGame.matchTime)}</div>
                                <div>结果：{data.matchGame.result ? '胜' : '负'}</div>
                                <div>比分：{data.matchGame.myScore} - {data.matchGame.oppScore}</div>
                                <div>对局：{data.matchGame.isRobot ? '机器人' : '真人'}</div>
                            </div>
                            {data.matchGame.remark && (
                                <div className="text-sm text-gray-600 mt-2">备注：{data.matchGame.remark}</div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-white rounded border p-3">
                                <div className="text-sm font-medium mb-2">我方球员</div>
                                <div className="overflow-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="text-left px-3 py-2 font-medium">球员</th>
                                                <th className="text-left px-3 py-2 font-medium">得分</th>
                                                <th className="text-left px-3 py-2 font-medium">助攻</th>
                                                <th className="text-left px-3 py-2 font-medium">篮板</th>
                                                <th className="text-left px-3 py-2 font-medium">评价</th>
                                                <th className="text-left px-3 py-2 font-medium">MVP/SVP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.myPlayerStats.map((p, idx) => (
                                                <tr key={p.id || idx} className="border-t">
                                                    <td className="px-3 py-2">{p.playerName || '-'}</td>
                                                    <td className="px-3 py-2">{p.score ?? '-'}</td>
                                                    <td className="px-3 py-2">{p.assist ?? '-'}</td>
                                                    <td className="px-3 py-2">{p.rebound ?? '-'}</td>
                                                    <td className="px-3 py-2">{typeof p.rating === 'number' ? p.rating.toFixed(1) : p.rating ?? '-'}</td>
                                                    <td className="px-3 py-2">
                                                        {p.isMvp ? 'MVP' : p.isSvp ? 'SVP' : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {data.myPlayerStats.length === 0 && (
                                                <tr className="border-t">
                                                    <td className="px-3 py-2 text-gray-400" colSpan={6}>暂无球员数据</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white rounded border p-3">
                                <div className="text-sm font-medium mb-2">对方球员</div>
                                <div className="overflow-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="text-left px-3 py-2 font-medium">球员</th>
                                                <th className="text-left px-3 py-2 font-medium">得分</th>
                                                <th className="text-left px-3 py-2 font-medium">助攻</th>
                                                <th className="text-left px-3 py-2 font-medium">篮板</th>
                                                <th className="text-left px-3 py-2 font-medium">评价</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.opponentPlayerStats.map((p, idx) => (
                                                <tr key={p.id || idx} className="border-t">
                                                    <td className="px-3 py-2">{p.playerName || '-'}</td>
                                                    <td className="px-3 py-2">{p.score ?? '-'}</td>
                                                    <td className="px-3 py-2">-</td>
                                                    <td className="px-3 py-2">-</td>
                                                    <td className="px-3 py-2">{typeof p.rating === 'number' ? p.rating.toFixed(1) : p.rating ?? '-'}</td>
                                                    <td className="px-3 py-2">
                                                        {p.isMvp ? 'MVP' : p.isSvp ? 'SVP' : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {data.opponentPlayerStats.length === 0 && (
                                                <tr className="border-t">
                                                    <td className="px-3 py-2 text-gray-400" colSpan={6}>暂无球员数据</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
