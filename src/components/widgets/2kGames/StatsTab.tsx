import { useState, useEffect, useMemo } from 'react'
import type { MatchGameStatsDTO, MatchGameStatsDimension } from '../../../types/matchGame.ts'
import type { MatchGameBaseDataDTO } from '../../../hooks/useMatchGameBaseData'
import { formatPct01 } from '../../../utils/matchGameFormat.ts'
import MetricConfigModal from './MetricConfigModal.tsx'

export default function StatsTab(props: {
    baseData: MatchGameBaseDataDTO | null
    statsSeason: string
    statsMatchDate: string
    statsDimension: MatchGameStatsDimension
    statsLoading: boolean
    statsError: string | null
    statsData: MatchGameStatsDTO | null
    onStatsSeasonChange: (v: string) => void
    onStatsMatchDateChange: (v: string) => void
    onStatsDimensionChange: (v: MatchGameStatsDimension) => void
    onFetchStats: () => void
    onReset: () => void
    onClearCache: () => void
}) {
    const [configModalOpen, setConfigModalOpen] = useState(false)
    const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set())

    const defaultVisibleMetrics = useMemo(() => {
        if (!props.baseData?.metricConfigs) return new Set<string>()
        return new Set(
            props.baseData.metricConfigs
                .filter(c => props.statsDimension === 'PLAYER' ? c.defaultVisibleForPlayer : c.defaultVisibleForUser)
                .map(c => c.metric)
        )
    }, [props.baseData?.metricConfigs, props.statsDimension])

    useEffect(() => {
        setVisibleMetrics(defaultVisibleMetrics)
    }, [defaultVisibleMetrics])

    const availableDates = props.statsSeason && props.baseData?.matchDatesBySeason
        ? props.baseData.matchDatesBySeason[props.statsSeason] || []
        : []

    const filteredLeaderboards = useMemo(() => {
        if (!props.statsData?.leaderboards) return []
        return props.statsData.leaderboards.filter(lb => visibleMetrics.has(lb.metric))
    }, [props.statsData?.leaderboards, visibleMetrics])
    return (
        <>
            <div className="bg-white rounded-xl border shadow-sm mb-4">
                <div className="p-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col md:flex-row gap-3 md:items-end">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">赛季筛选</div>
                            <select
                                className="border rounded px-3 py-2 text-sm w-40"
                                value={props.statsSeason}
                                onChange={(e) => props.onStatsSeasonChange(e.target.value)}
                                disabled={props.statsLoading}
                            >
                                <option value="">全赛季</option>
                                {props.baseData?.seasons.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="text-sm text-gray-600 mb-1">日期筛选</div>
                            <select
                                className="border rounded px-3 py-2 text-sm w-40"
                                value={props.statsMatchDate}
                                onChange={(e) => props.onStatsMatchDateChange(e.target.value)}
                                disabled={props.statsLoading || !props.statsSeason}
                            >
                                <option value="">全部日期</option>
                                {availableDates.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
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
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setConfigModalOpen(true)}
                            className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                            disabled={props.statsLoading}
                        >
                            显示项
                        </button>
                        <button
                            onClick={props.onClearCache}
                            className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                            disabled={props.statsLoading}
                        >
                            清除缓存
                        </button>
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
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            {filteredLeaderboards.map((lb) => {
                        const isPct = lb.metric === 'FG_PCT' || lb.metric === 'THREE_PCT'
                        const isAvgPct = lb.metric === 'FG_PCT_AVG' || lb.metric === 'THREE_PCT_AVG'
                        const isAvg = lb.metric.endsWith('_AVG')

                        return (
                            <div key={lb.metric} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{lb.metricDesc}</div>
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
                                                ) : isAvgPct ? (
                                                    <>
                                                        <th className="text-right px-4 py-2 font-medium">场均命中/出手</th>
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
                                                    ) : isAvgPct ? (
                                                        <>
                                                            <td className="px-4 py-2 text-right">
                                                                {(it.made ?? 0).toFixed(1)} / {(it.attempt ?? 0).toFixed(1)}
                                                            </td>
                                                            <td className="px-4 py-2 text-right">{formatPct01(it.rate)}</td>
                                                        </>
                                                    ) : isAvg ? (
                                                        <td className="px-4 py-2 text-right">{(it.avg ?? 0).toFixed(1)}</td>
                                                    ) : (
                                                        <td className="px-4 py-2 text-right">{it.value ?? 0}</td>
                                                    )}
                                                </tr>
                                            ))}

                                            {(!lb.items || lb.items.length === 0) && (
                                                <tr className="border-t">
                                                    <td
                                                        className="px-4 py-8 text-center text-gray-400"
                                                        colSpan={isPct || isAvgPct ? 4 : 3}
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

            {configModalOpen && props.baseData?.metricConfigs && (
                <MetricConfigModal
                    dimension={props.statsDimension}
                    metricConfigs={props.baseData.metricConfigs}
                    visibleMetrics={visibleMetrics}
                    onClose={() => setConfigModalOpen(false)}
                    onSave={setVisibleMetrics}
                />
            )}
        </>
    )
}
