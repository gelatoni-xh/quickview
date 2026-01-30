import type { MatchGameStatsDTO, MatchGameStatsDimension } from '../../types/matchGame'
import { formatPct01, metricLabel } from '../../utils/matchGameFormat'

export default function StatsTab(props: {
    statsSeason: string
    statsDimension: MatchGameStatsDimension
    statsLoading: boolean
    statsError: string | null
    statsData: MatchGameStatsDTO | null
    onStatsSeasonChange: (v: string) => void
    onStatsDimensionChange: (v: MatchGameStatsDimension) => void
    onFetchStats: () => void
    onReset: () => void
}) {
    return (
        <>
            <div className="bg-white rounded-xl border shadow-sm mb-4">
                <div className="p-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col md:flex-row gap-3 md:items-end">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">赛季筛选</div>
                            <input
                                className="border rounded px-3 py-2 text-sm w-60"
                                value={props.statsSeason}
                                onChange={(e) => props.onStatsSeasonChange(e.target.value)}
                                placeholder="例如 S1 / 2026Q1；留空=全赛季"
                                disabled={props.statsLoading}
                            />
                        </div>

                        <div>
                            <div className="text-sm text-gray-600 mb-1">统计维度</div>
                            <select
                                className="border rounded px-3 py-2 text-sm"
                                value={props.statsDimension}
                                onChange={(e) => props.onStatsDimensionChange(e.target.value as MatchGameStatsDimension)}
                                disabled={props.statsLoading}
                            >
                                <option value="PLAYER">球员维度</option>
                                <option value="USER">用户维度</option>
                            </select>
                        </div>

                        <button
                            onClick={props.onFetchStats}
                            className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                            disabled={props.statsLoading}
                        >
                            生成统计
                        </button>

                        <button
                            onClick={props.onReset}
                            className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                            disabled={props.statsLoading}
                        >
                            重置
                        </button>
                    </div>

                    <div className="text-xs text-gray-500">
                        仅统计我方数据（team_type=我方）
                    </div>
                </div>
            </div>

            {props.statsLoading && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="text-sm text-gray-500">加载中...</div>
                </div>
            )}

            {!props.statsLoading && props.statsError && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="text-sm text-red-500">{props.statsError}</div>
                </div>
            )}

            {!props.statsLoading && !props.statsError && !props.statsData && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="text-sm text-gray-500">请先点击“生成统计”</div>
                </div>
            )}

            {!props.statsLoading && !props.statsError && props.statsData && (
                (() => {
                    const statsData = props.statsData

                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                            {(Array.isArray(statsData.leaderboards) ? statsData.leaderboards : []).map((lb) => {
                        const isPct = lb.metric === 'FG_PCT' || lb.metric === 'THREE_PCT'

                        return (
                            <div key={lb.metric} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{metricLabel(lb.metric)}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            维度：{statsData.dimension === 'PLAYER' ? '球员' : '用户'}
                                            {statsData.season ? ` · 赛季：${statsData.season}` : ' · 全赛季'}
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="text-left px-4 py-2 font-medium">排名</th>
                                                <th className="text-left px-4 py-2 font-medium">名称</th>
                                                {isPct ? (
                                                    <>
                                                        <th className="text-right px-4 py-2 font-medium">命中/出手</th>
                                                        <th className="text-right px-4 py-2 font-medium">命中率</th>
                                                    </>
                                                ) : (
                                                    <th className="text-right px-4 py-2 font-medium">数值</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(Array.isArray(lb.items) ? lb.items : []).slice(0, 50).map((it, idx) => (
                                                <tr key={`${lb.metric}-${it.name}-${idx}`} className="border-t hover:bg-blue-50">
                                                    <td className="px-4 py-2">{idx + 1}</td>
                                                    <td className="px-4 py-2">{it.name}</td>
                                                    {isPct ? (
                                                        <>
                                                            <td className="px-4 py-2 text-right">
                                                                {(it.made ?? 0)} / {(it.attempt ?? 0)}
                                                            </td>
                                                            <td className="px-4 py-2 text-right">{formatPct01(it.rate)}</td>
                                                        </>
                                                    ) : (
                                                        <td className="px-4 py-2 text-right">{it.value ?? 0}</td>
                                                    )}
                                                </tr>
                                            ))}

                                            {(!lb.items || lb.items.length === 0) && (
                                                <tr className="border-t">
                                                    <td
                                                        className="px-4 py-8 text-center text-gray-400"
                                                        colSpan={isPct ? 4 : 3}
                                                    >
                                                        暂无数据
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                            })}
                        </div>
                    )
                })()
            )}
        </>
    )
}
