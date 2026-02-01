import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { deleteMatchGame, getMatchGamePage, getMatchGameStats } from '../services/matchGameApi'
import type { MatchGameDTO, MatchGameStatsDTO, MatchGameStatsDimension } from '../types/matchGame'
import { ensureNumber } from '../utils/matchGameFormat'
import GameDetailModal from '../components/widgets/2kGames/GameDetailModal.tsx'
import GameEditorModal from '../components/widgets/2kGames/GameEditorModal.tsx'
import ResultTab from '../components/widgets/2kGames/ResultTab.tsx'
import StatsTab from '../components/widgets/2kGames/StatsTab.tsx'

type TabKey = 'result' | 'stats'

type GameEditorMode = 'create' | 'edit'

export default function _2KGames() {
    const { userInfo } = useAuth()

    const [tab, setTab] = useState<TabKey>('result')

    const [season, setSeason] = useState('')
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<MatchGameDTO[]>([])

    const [editorOpen, setEditorOpen] = useState(false)
    const [editorMode, setEditorMode] = useState<GameEditorMode>('create')
    const [selectedGame, setSelectedGame] = useState<MatchGameDTO | null>(null)

    const [detailGameId, setDetailGameId] = useState<number | null>(null)

    const [statsSeason, setStatsSeason] = useState('')
    const [statsDimension, setStatsDimension] = useState<MatchGameStatsDimension>('PLAYER')
    const [statsLoading, setStatsLoading] = useState(false)
    const [statsError, setStatsError] = useState<string | null>(null)
    const [statsData, setStatsData] = useState<MatchGameStatsDTO | null>(null)

    const canNextPage = useMemo(() => data.length === pageSize, [data.length, pageSize])

    const tabs = useMemo(() => {
        return [
            { key: 'result' as const, label: '比赛结果' },
            { key: 'stats' as const, label: '数据统计' },
        ]
    }, [])

    const fetchPage = async (targetPageNum: number) => {
        try {
            setLoading(true)
            setError(null)

            const res = await getMatchGamePage({
                pageNum: targetPageNum,
                pageSize,
                season: season.trim() ? season.trim() : null,
            })

            if (!res.success) {
                setError(res.message || '获取比赛列表失败')
                setData([])
                return
            }

            setData(Array.isArray(res.data) ? res.data : [])
            setPageNum(targetPageNum)
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
            setData([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPage(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSearch = () => {
        fetchPage(1)
    }

    const handleCreate = () => {
        setEditorMode('create')
        setSelectedGame(null)
        setEditorOpen(true)
    }

    const handleEdit = (game: MatchGameDTO) => {
        setEditorMode('edit')
        setSelectedGame(game)
        setEditorOpen(true)
    }

    const handleDelete = async (game: MatchGameDTO) => {
        const ok = window.confirm(`确认删除比赛 #${game.id} 吗？删除后不可恢复。`)
        if (!ok) return

        try {
            setLoading(true)
            setError(null)

            const res = await deleteMatchGame(game.id)
            if (!res.success) {
                setError(res.message || '删除比赛失败')
                return
            }

            if (!res.data) {
                setError('删除失败')
                return
            }

            await fetchPage(pageNum)
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            setStatsLoading(true)
            setStatsError(null)

            const res = await getMatchGameStats({
                season: statsSeason.trim() ? statsSeason.trim() : null,
                dimension: statsDimension,
            })

            if (!res.success) {
                setStatsError(res.message || '获取统计数据失败')
                setStatsData(null)
                return
            }

            setStatsData(res.data || null)
        } catch (err) {
            setStatsError(err instanceof Error ? err.message : String(err))
            setStatsData(null)
        } finally {
            setStatsLoading(false)
        }
    }

    return (
        <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">2K Games</h1>
                <p className="text-sm text-gray-500 mt-1">比赛结果管理（分页查询 / 赛季筛选 / 详情 / 新增 / 编辑 / 删除）</p>
            </div>

            <div className="bg-white rounded-xl border shadow-sm mb-6">
                <div className="flex items-center gap-2 p-2">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={
                                'px-4 py-2 text-sm rounded-lg transition-colors ' +
                                (tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100')
                            }
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'result' && (
                <ResultTab
                    season={season}
                    pageSize={pageSize}
                    pageNum={pageNum}
                    canNextPage={canNextPage}
                    loading={loading}
                    error={error}
                    data={data}
                    hasLogin={!!userInfo?.user}
                    onSeasonChange={setSeason}
                    onPageSizeChange={(v) => setPageSize(ensureNumber(String(v), 10))}
                    onSearch={handleSearch}
                    onRefresh={() => fetchPage(pageNum)}
                    onCreate={handleCreate}
                    onPrevPage={() => fetchPage(Math.max(1, pageNum - 1))}
                    onNextPage={() => fetchPage(pageNum + 1)}
                    onViewDetail={(gameId) => setDetailGameId(gameId)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {tab === 'stats' && (
                <StatsTab
                    statsSeason={statsSeason}
                    statsDimension={statsDimension}
                    statsLoading={statsLoading}
                    statsError={statsError}
                    statsData={statsData}
                    onStatsSeasonChange={setStatsSeason}
                    onStatsDimensionChange={setStatsDimension}
                    onFetchStats={fetchStats}
                    onReset={() => {
                        setStatsSeason('')
                        setStatsDimension('PLAYER')
                        setStatsData(null)
                        setStatsError(null)
                    }}
                />
            )}

            {editorOpen && (
                <GameEditorModal
                    mode={editorMode}
                    game={selectedGame}
                    onClose={() => setEditorOpen(false)}
                    onSuccess={() => {
                        setEditorOpen(false)
                        fetchPage(pageNum)
                    }}
                />
            )}

            {detailGameId !== null && (
                <GameDetailModal
                    gameId={detailGameId}
                    onClose={() => setDetailGameId(null)}
                />
            )}
        </main>
    )
}
