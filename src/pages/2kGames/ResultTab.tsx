import type { ReactNode } from 'react'
import type { MatchGameDTO } from '../../types/matchGame'
import { calcWinnerText, ensureNumber, formatDatetime } from '../../utils/matchGameFormat'

export default function ResultTab(props: {
    season: string
    pageSize: number
    pageNum: number
    canNextPage: boolean
    loading: boolean
    error: string | null
    data: MatchGameDTO[]
    hasLogin: boolean
    onSeasonChange: (v: string) => void
    onPageSizeChange: (v: number) => void
    onSearch: () => void
    onRefresh: () => void
    onCreate: () => void
    onPrevPage: () => void
    onNextPage: () => void
    onViewDetail: (gameId: number) => void
    onEdit: (game: MatchGameDTO) => void
    onDelete: (game: MatchGameDTO) => void
    extraActions?: ReactNode
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
                                value={props.season}
                                onChange={(e) => props.onSeasonChange(e.target.value)}
                                placeholder="例如 S1 / 2026Q1"
                                disabled={props.loading}
                            />
                        </div>

                        <div>
                            <div className="text-sm text-gray-600 mb-1">每页数量</div>
                            <select
                                className="border rounded px-3 py-2 text-sm"
                                value={String(props.pageSize)}
                                onChange={(e) => props.onPageSizeChange(ensureNumber(e.target.value, 10))}
                                disabled={props.loading}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>

                        <button
                            onClick={props.onSearch}
                            className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                            disabled={props.loading}
                        >
                            查询
                        </button>

                        <button
                            onClick={props.onRefresh}
                            className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                            disabled={props.loading}
                        >
                            刷新
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={props.onCreate}
                            className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            disabled={props.loading || !props.hasLogin}
                            title={!props.hasLogin ? '请先登录' : ''}
                        >
                            新增比赛
                        </button>
                        {props.extraActions}
                    </div>
                </div>
            </div>

            {props.loading && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="text-sm text-gray-500">加载中...</div>
                </div>
            )}

            {!props.loading && props.error && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="text-sm text-red-500">{props.error}</div>
                </div>
            )}

            {!props.loading && !props.error && (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">比赛列表</h2>
                            <div className="text-xs text-gray-500 mt-1">当前页：{props.pageNum}</div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={props.onPrevPage}
                                className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                                disabled={props.loading || props.pageNum <= 1}
                            >
                                上一页
                            </button>
                            <button
                                onClick={props.onNextPage}
                                className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                                disabled={props.loading || !props.canNextPage}
                                title={!props.canNextPage ? '已到最后一页（按当前返回条数判断）' : ''}
                            >
                                下一页
                            </button>
                        </div>
                    </div>

                    <div className="overflow-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left px-4 py-2 font-medium">ID</th>
                                    <th className="text-left px-4 py-2 font-medium">赛季</th>
                                    <th className="text-left px-4 py-2 font-medium">场次</th>
                                    <th className="text-left px-4 py-2 font-medium">时间</th>
                                    <th className="text-left px-4 py-2 font-medium">比分</th>
                                    <th className="text-left px-4 py-2 font-medium">结果</th>
                                    <th className="text-left px-4 py-2 font-medium">对局</th>
                                    <th className="text-left px-4 py-2 font-medium">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.data.map((g) => (
                                    <tr key={g.id} className="border-t hover:bg-blue-50">
                                        <td className="px-4 py-2">{g.id}</td>
                                        <td className="px-4 py-2">{g.season}</td>
                                        <td className="px-4 py-2">{g.seasonMatchNo}</td>
                                        <td className="px-4 py-2">{formatDatetime(g.matchTime)}</td>
                                        <td className="px-4 py-2">{g.myScore} - {g.oppScore}</td>
                                        <td className="px-4 py-2">
                                            <span className={g.result ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                {calcWinnerText(g)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{g.isRobot ? '机器人' : '真人'}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => props.onViewDetail(g.id)}
                                                    className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                                                >
                                                    查看
                                                </button>
                                                <button
                                                    onClick={() => props.onEdit(g)}
                                                    className="px-2 py-1 text-xs rounded border hover:bg-gray-50 disabled:opacity-50"
                                                    disabled={!props.hasLogin}
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={() => props.onDelete(g)}
                                                    className="px-2 py-1 text-xs rounded border text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    disabled={!props.hasLogin}
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {props.data.length === 0 && (
                                    <tr className="border-t">
                                        <td className="px-4 py-8 text-center text-gray-400" colSpan={8}>
                                            暂无比赛数据
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    )
}
