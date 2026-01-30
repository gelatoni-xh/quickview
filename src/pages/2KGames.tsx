import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiDelete, apiGet, apiPost, apiPut } from '../utils/api'
import { users, players } from '../data/players'

interface BaseResponse<T> {
    success: boolean
    data: T
    message?: string
    traceId?: string
}

interface MatchGameDTO {
    id: number
    season: string
    seasonMatchNo: number
    matchTime: string
    isRobot: boolean
    myScore: number
    oppScore: number
    result: boolean
    remark?: string
    createTime?: string
}

interface MatchTeamStatsDTO {
    id?: number
    matchId?: number
    teamType: number
    score?: number
    fgAttempt?: number
    fgMade?: number
    threeAttempt?: number
    threeMade?: number
    assist?: number
    rebound?: number
    offRebound?: number
    defRebound?: number
    steal?: number
    block?: number
    dunk?: number
    paintScore?: number
    secondChanceScore?: number
    turnoverToScore?: number
    maxLead?: number
    createTime?: string
}

interface MatchPlayerStatsDTO {
    id?: number
    matchId?: number
    teamType: number
    userName?: string
    playerName?: string
    rating?: number
    isMvp?: boolean
    isSvp?: boolean
    score?: number
    assist?: number
    rebound?: number
    steal?: number
    block?: number
    turnover?: number
    dunk?: number
    fgAttempt?: number
    fgMade?: number
    threeAttempt?: number
    threeMade?: number
    midCount?: number
    maxScoringRun?: number
    createTime?: string
}

interface MatchGameDetailDTO {
    matchGame: MatchGameDTO
    myTeamStats: MatchTeamStatsDTO[]
    opponentTeamStats: MatchTeamStatsDTO[]
    myPlayerStats: MatchPlayerStatsDTO[]
    opponentPlayerStats: MatchPlayerStatsDTO[]
}

type MatchGameStatsDimension = 'PLAYER' | 'USER'

type MatchGameStatsMetric =
    | 'APPEARANCES'
    | 'SCORE'
    | 'REBOUND'
    | 'ASSIST'
    | 'STEAL'
    | 'BLOCK'
    | 'FG_ATTEMPT'
    | 'FG_MADE'
    | 'FG_PCT'
    | 'THREE_ATTEMPT'
    | 'THREE_MADE'
    | 'THREE_PCT'
    | 'MVP'
    | 'SVP'
    | 'TURNOVER'

interface MatchGameStatsRankItem {
    name: string
    value?: number
    made?: number
    attempt?: number
    rate?: number
}

interface MatchGameStatsLeaderboard {
    metric: MatchGameStatsMetric
    items: MatchGameStatsRankItem[]
}

interface MatchGameStatsDTO {
    season?: string
    dimension: MatchGameStatsDimension
    leaderboards: MatchGameStatsLeaderboard[]
}

type TabKey = 'result' | 'stats'

type GameEditorMode = 'create' | 'edit'

type EditorTabKey = 'base' | 'team' | 'player'

type GameEditorValue = {
    season: string
    seasonMatchNo: number
    matchTime: string
    isRobot: boolean
    myScore: number
    oppScore: number
    result: boolean
    remark: string
}

function toInputDatetimeLocalValue(value: string): string {
    if (!value) return ''

    if (value.includes('T') && value.length >= 16) {
        return value.slice(0, 16)
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return ''
    }

    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDatetime(value: string): string {
    if (!value) return '-'

    try {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
            return value
        }
        return date.toLocaleString()
    } catch {
        return value
    }
}

function calcWinnerText(game: MatchGameDTO): string {
    return game.result ? '胜' : '负'
}

function ensureNumber(v: string, fallback: number): number {
    const n = Number(v)
    if (Number.isNaN(n)) return fallback
    return n
}

function normalizeLocalDateTime(value: string): string {
    if (!value) return value
    if (value.length === 16) {
        return value + ':00'
    }
    return value
}

function formatPct01(rate?: number): string {
    const v = typeof rate === 'number' && !Number.isNaN(rate) ? rate : 0
    return (v * 100).toFixed(1) + '%'
}

function metricLabel(metric: MatchGameStatsMetric): string {
    switch (metric) {
        case 'APPEARANCES':
            return '上场次数榜'
        case 'SCORE':
            return '得分榜'
        case 'REBOUND':
            return '篮板榜'
        case 'ASSIST':
            return '助攻榜'
        case 'STEAL':
            return '抢断榜'
        case 'BLOCK':
            return '盖帽榜'
        case 'FG_ATTEMPT':
            return '投篮出手次数榜'
        case 'FG_MADE':
            return '投篮命中数榜'
        case 'FG_PCT':
            return '投篮命中率榜'
        case 'THREE_ATTEMPT':
            return '三分出手次数榜'
        case 'THREE_MADE':
            return '三分命中数榜'
        case 'THREE_PCT':
            return '三分命中率榜'
        case 'MVP':
            return 'MVP榜'
        case 'SVP':
            return 'SVP榜'
        case 'TURNOVER':
            return '失误榜'
        default:
            return metric
    }
}

function GameEditorModal(props: {
    mode: GameEditorMode
    game?: MatchGameDTO | null
    onClose: () => void
    onSuccess: () => void
}) {
    const { userInfo } = useAuth()

    const [tab, setTab] = useState<EditorTabKey>('base')

    const [season, setSeason] = useState('')
    const [seasonMatchNo, setSeasonMatchNo] = useState<number>(1)
    const [matchTime, setMatchTime] = useState('')
    const [isRobot, setIsRobot] = useState<boolean>(false)
    const [myScore, setMyScore] = useState<number>(0)
    const [oppScore, setOppScore] = useState<number>(0)
    const [result, setResult] = useState<boolean>(true)
    const [remark, setRemark] = useState('')

    const [teamStatsList, setTeamStatsList] = useState<MatchTeamStatsDTO[]>([])
    const [playerStatsList, setPlayerStatsList] = useState<MatchPlayerStatsDTO[]>([])

    const [detailLoading, setDetailLoading] = useState(false)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isEdit = props.mode === 'edit'

    useEffect(() => {
        setTab('base')
        if (props.game) {
            setSeason(props.game.season || '')
            setSeasonMatchNo(props.game.seasonMatchNo || 1)
            setMatchTime(toInputDatetimeLocalValue(props.game.matchTime))
            setIsRobot(!!props.game.isRobot)
            setMyScore(props.game.myScore || 0)
            setOppScore(props.game.oppScore || 0)
            setResult(!!props.game.result)
            setRemark(props.game.remark || '')

            if (props.mode === 'edit') {
                setTeamStatsList([])
                setPlayerStatsList([])
            }
        } else {
            setSeason('')
            setSeasonMatchNo(1)
            setMatchTime('')
            setIsRobot(false)
            setMyScore(0)
            setOppScore(0)
            setResult(true)
            setRemark('')

            setTeamStatsList([])
            setPlayerStatsList([])
        }
    }, [props.game, props.mode])

    useEffect(() => {
        const fetchEditDetail = async () => {
            if (props.mode !== 'edit' || !props.game?.id) return

            try {
                setDetailLoading(true)
                setError(null)

                const res = await apiGet<BaseResponse<MatchGameDetailDTO>>(`/api/match-game/detail/${props.game.id}`)
                if (!res.success) {
                    setError(res.message || '获取比赛详情失败（用于编辑）')
                    return
                }

                const detail = res.data
                if (!detail) return

                // 基础信息以 detail 为准，避免列表字段缺失
                if (detail.matchGame) {
                    setSeason(detail.matchGame.season || '')
                    setSeasonMatchNo(detail.matchGame.seasonMatchNo || 1)
                    setMatchTime(toInputDatetimeLocalValue(detail.matchGame.matchTime))
                    setIsRobot(!!detail.matchGame.isRobot)
                    setMyScore(detail.matchGame.myScore || 0)
                    setOppScore(detail.matchGame.oppScore || 0)
                    setResult(!!detail.matchGame.result)
                    setRemark(detail.matchGame.remark || '')
                }

                const mergedTeamStats: MatchTeamStatsDTO[] = [
                    ...(Array.isArray(detail.myTeamStats) ? detail.myTeamStats : []),
                    ...(Array.isArray(detail.opponentTeamStats) ? detail.opponentTeamStats : []),
                ]
                setTeamStatsList(mergedTeamStats)

                const mergedPlayerStats: MatchPlayerStatsDTO[] = [
                    ...(Array.isArray(detail.myPlayerStats) ? detail.myPlayerStats : []),
                    ...(Array.isArray(detail.opponentPlayerStats) ? detail.opponentPlayerStats : []),
                ]
                setPlayerStatsList(mergedPlayerStats)
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err))
            } finally {
                setDetailLoading(false)
            }
        }

        fetchEditDetail()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.mode, props.game?.id])

    const userId = userInfo?.user?.id

    const buildValue = (): GameEditorValue | null => {
        if (!season.trim()) {
            alert('赛季不能为空')
            return null
        }
        if (!matchTime) {
            alert('比赛时间不能为空')
            return null
        }
        if (!userId) {
            alert('请先登录')
            return null
        }

        return {
            season: season.trim(),
            seasonMatchNo,
            matchTime: normalizeLocalDateTime(matchTime),
            isRobot,
            myScore,
            oppScore,
            result,
            remark,
        }
    }

    const handleSubmit = async () => {
        const value = buildValue()
        if (!value || !userId) return

        try {
            setLoading(true)
            setError(null)

            if (!isEdit) {
                const res = await apiPost<BaseResponse<number>>('/api/match-game/create', {
                    ...value,
                    creator: userId,
                    teamStatsList: teamStatsList.length > 0 ? teamStatsList : null,
                    playerStatsList: playerStatsList.length > 0 ? playerStatsList : null,
                })

                if (!res.success) {
                    setError(res.message || '创建比赛失败')
                    return
                }

                props.onSuccess()
                return
            }

            if (!props.game) {
                setError('编辑模式缺少比赛数据')
                return
            }

            const res = await apiPut<BaseResponse<boolean>>('/api/match-game/update', {
                id: props.game.id,
                ...value,
                modifier: userId,
                teamStatsList: teamStatsList.length > 0 ? teamStatsList : null,
                playerStatsList: playerStatsList.length > 0 ? playerStatsList : null,
            })

            if (!res.success) {
                setError(res.message || '更新比赛失败')
                return
            }

            if (!res.data) {
                setError('更新失败')
                return
            }

            props.onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl bg-white rounded shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{isEdit ? '编辑比赛' : '新增比赛'}</h3>
                    <button onClick={props.onClose} aria-label="关闭">×</button>
                </div>

                <div className="bg-white rounded-xl border shadow-sm mb-4">
                    <div className="flex items-center gap-2 p-2">
                        <button
                            onClick={() => setTab('base')}
                            className={
                                'px-4 py-2 text-sm rounded-lg transition-colors ' +
                                (tab === 'base' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100')
                            }
                            disabled={loading}
                        >
                            基础信息
                        </button>
                        <button
                            onClick={() => setTab('team')}
                            className={
                                'px-4 py-2 text-sm rounded-lg transition-colors ' +
                                (tab === 'team' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100')
                            }
                            disabled={loading}
                        >
                            队伍统计
                        </button>
                        <button
                            onClick={() => setTab('player')}
                            className={
                                'px-4 py-2 text-sm rounded-lg transition-colors ' +
                                (tab === 'player' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100')
                            }
                            disabled={loading}
                        >
                            球员统计
                        </button>
                    </div>
                </div>

                {detailLoading && (
                    <div className="text-sm text-gray-500 mb-3">加载编辑数据中...</div>
                )}

                {tab === 'base' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">赛季</label>
                            <input
                                className="w-full border rounded px-3 py-2 text-sm"
                                value={season}
                                onChange={(e) => setSeason(e.target.value)}
                                disabled={loading}
                                placeholder="例如 S1 / 2026Q1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">赛季第几场</label>
                            <input
                                className="w-full border rounded px-3 py-2 text-sm"
                                type="number"
                                value={seasonMatchNo}
                                onChange={(e) => setSeasonMatchNo(ensureNumber(e.target.value, 1))}
                                disabled={loading}
                                min={1}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">比赛时间</label>
                            <input
                                className="w-full border rounded px-3 py-2 text-sm"
                                type="datetime-local"
                                value={matchTime}
                                onChange={(e) => setMatchTime(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">对局类型</label>
                            <select
                                className="w-full border rounded px-3 py-2 text-sm"
                                value={String(isRobot)}
                                onChange={(e) => setIsRobot(e.target.value === 'true')}
                                disabled={loading}
                            >
                                <option value="false">真人</option>
                                <option value="true">机器人</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">我方得分</label>
                            <input
                                className="w-full border rounded px-3 py-2 text-sm"
                                type="number"
                                value={myScore}
                                onChange={(e) => setMyScore(ensureNumber(e.target.value, 0))}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">对方得分</label>
                            <input
                                className="w-full border rounded px-3 py-2 text-sm"
                                type="number"
                                value={oppScore}
                                onChange={(e) => setOppScore(ensureNumber(e.target.value, 0))}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">比赛结果</label>
                            <select
                                className="w-full border rounded px-3 py-2 text-sm"
                                value={String(result)}
                                onChange={(e) => setResult(e.target.value === 'true')}
                                disabled={loading}
                            >
                                <option value="true">胜</option>
                                <option value="false">负</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-600 mb-1">备注</label>
                            <textarea
                                className="w-full border rounded px-3 py-2 text-sm"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                disabled={loading}
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {tab === 'team' && (
                    <div className="space-y-3">
                        <div className="text-xs text-gray-500">
                            队伍统计为可选项；只要填写，会整体保存（创建/更新）。
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setTeamStatsList((prev) => [
                                        ...prev,
                                        {
                                            teamType: 1,
                                            score: 0,
                                            fgAttempt: 0,
                                            fgMade: 0,
                                            threeAttempt: 0,
                                            threeMade: 0,
                                            assist: 0,
                                            rebound: 0,
                                            offRebound: 0,
                                            defRebound: 0,
                                            steal: 0,
                                            block: 0,
                                            dunk: 0,
                                            paintScore: 0,
                                            secondChanceScore: 0,
                                            turnoverToScore: 0,
                                            maxLead: 0,
                                        },
                                    ])
                                }}
                                className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                                disabled={loading}
                            >
                                新增一行
                            </button>
                        </div>

                        <div className="overflow-auto border rounded">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="text-left px-3 py-2 font-medium">队伍</th>
                                        <th className="text-left px-3 py-2 font-medium">得分</th>
                                        <th className="text-left px-3 py-2 font-medium">投篮(中/投)</th>
                                        <th className="text-left px-3 py-2 font-medium">三分(中/投)</th>
                                        <th className="text-left px-3 py-2 font-medium">助攻</th>
                                        <th className="text-left px-3 py-2 font-medium">篮板(总)</th>
                                        <th className="text-left px-3 py-2 font-medium">篮板(进/防)</th>
                                        <th className="text-left px-3 py-2 font-medium">抢断</th>
                                        <th className="text-left px-3 py-2 font-medium">盖帽</th>
                                        <th className="text-left px-3 py-2 font-medium">灌篮</th>
                                        <th className="text-left px-3 py-2 font-medium">内线得分</th>
                                        <th className="text-left px-3 py-2 font-medium">二次得分</th>
                                        <th className="text-left px-3 py-2 font-medium">失误得分</th>
                                        <th className="text-left px-3 py-2 font-medium">最大领先</th>
                                        <th className="text-left px-3 py-2 font-medium">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamStatsList.map((row, idx) => (
                                        <tr key={row.id || idx} className="border-t">
                                            <td className="px-3 py-2">
                                                <select
                                                    className="border rounded px-2 py-1 text-sm"
                                                    value={String(row.teamType)}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 1)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, teamType: v } : r))
                                                    }}
                                                    disabled={loading}
                                                >
                                                    <option value="1">我方</option>
                                                    <option value="2">对方</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.score ?? 0}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 0)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, score: v } : r))
                                                    }}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        className="border rounded px-2 py-1 w-16"
                                                        type="number"
                                                        value={row.fgMade ?? 0}
                                                        onChange={(e) => {
                                                            const v = ensureNumber(e.target.value, 0)
                                                            setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, fgMade: v } : r))
                                                        }}
                                                        disabled={loading}
                                                    />
                                                    <span className="text-gray-400">/</span>
                                                    <input
                                                        className="border rounded px-2 py-1 w-16"
                                                        type="number"
                                                        value={row.fgAttempt ?? 0}
                                                        onChange={(e) => {
                                                            const v = ensureNumber(e.target.value, 0)
                                                            setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, fgAttempt: v } : r))
                                                        }}
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        className="border rounded px-2 py-1 w-16"
                                                        type="number"
                                                        value={row.threeMade ?? 0}
                                                        onChange={(e) => {
                                                            const v = ensureNumber(e.target.value, 0)
                                                            setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, threeMade: v } : r))
                                                        }}
                                                        disabled={loading}
                                                    />
                                                    <span className="text-gray-400">/</span>
                                                    <input
                                                        className="border rounded px-2 py-1 w-16"
                                                        type="number"
                                                        value={row.threeAttempt ?? 0}
                                                        onChange={(e) => {
                                                            const v = ensureNumber(e.target.value, 0)
                                                            setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, threeAttempt: v } : r))
                                                        }}
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.assist ?? 0}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 0)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, assist: v } : r))
                                                    }}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.rebound ?? 0}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 0)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, rebound: v } : r))
                                                    }}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        className="border rounded px-2 py-1 w-16"
                                                        type="number"
                                                        value={row.offRebound ?? 0}
                                                        onChange={(e) => {
                                                            const v = ensureNumber(e.target.value, 0)
                                                            setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, offRebound: v } : r))
                                                        }}
                                                        disabled={loading}
                                                    />
                                                    <span className="text-gray-400">/</span>
                                                    <input
                                                        className="border rounded px-2 py-1 w-16"
                                                        type="number"
                                                        value={row.defRebound ?? 0}
                                                        onChange={(e) => {
                                                            const v = ensureNumber(e.target.value, 0)
                                                            setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, defRebound: v } : r))
                                                        }}
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.steal ?? 0}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 0)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, steal: v } : r))
                                                    }}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.block ?? 0}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 0)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, block: v } : r))
                                                    }}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.dunk ?? 0}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 0)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, dunk: v } : r))
                                                    }}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-24"
                                                    type="number"
                                                    value={row.paintScore ?? 0}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 0)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, paintScore: v } : r))
                                                    }}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-24"
                                                    type="number"
                                                    value={row.secondChanceScore ?? 0}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 0)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, secondChanceScore: v } : r))
                                                    }}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-24"
                                                    type="number"
                                                    value={row.turnoverToScore ?? 0}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 0)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, turnoverToScore: v } : r))
                                                    }}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-24"
                                                    type="number"
                                                    value={row.maxLead ?? 0}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 0)
                                                        setTeamStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, maxLead: v } : r))
                                                    }}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    onClick={() => setTeamStatsList((prev) => prev.filter((_, i) => i !== idx))}
                                                    className="px-2 py-1 text-xs rounded border text-red-600 hover:bg-red-50"
                                                    disabled={loading}
                                                >
                                                    删除
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {teamStatsList.length === 0 && (
                                        <tr className="border-t">
                                            <td className="px-3 py-6 text-center text-gray-400" colSpan={14}>暂无队伍统计</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'player' && (
                    <div className="space-y-3">
                        <div className="text-xs text-gray-500">
                            球员统计为可选项；如果填写，请确保包含该比赛的全部球员数据（后端约束）。
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setPlayerStatsList((prev) => [
                                        ...prev,
                                        {
                                            teamType: 1,
                                            userName: '',
                                            playerName: '',
                                            rating: 0.0,
                                            isMvp: false,
                                            isSvp: false,
                                            score: 0,
                                            assist: 0,
                                            rebound: 0,
                                            steal: 0,
                                            block: 0,
                                            turnover: 0,
                                            dunk: 0,
                                            fgAttempt: 0,
                                            fgMade: 0,
                                            threeAttempt: 0,
                                            threeMade: 0,
                                            midCount: 0,
                                            maxScoringRun: 0,
                                        },
                                    ])
                                }}
                                className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                                disabled={loading}
                            >
                                新增一行
                            </button>
                        </div>

                        <div className="overflow-auto border rounded">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="text-left px-3 py-2 font-medium">队伍</th>
                                        <th className="text-left px-3 py-2 font-medium">用户</th>
                                        <th className="text-left px-3 py-2 font-medium">球员</th>
                                        <th className="text-left px-3 py-2 font-medium">得分</th>
                                        <th className="text-left px-3 py-2 font-medium">助攻</th>
                                        <th className="text-left px-3 py-2 font-medium">篮板</th>
                                        <th className="text-left px-3 py-2 font-medium">抢断</th>
                                        <th className="text-left px-3 py-2 font-medium">盖帽</th>
                                        <th className="text-left px-3 py-2 font-medium">失误</th>
                                        <th className="text-left px-3 py-2 font-medium">灌篮</th>
                                        <th className="text-left px-3 py-2 font-medium">中投</th>
                                        <th className="text-left px-3 py-2 font-medium">投篮(中/投)</th>
                                        <th className="text-left px-3 py-2 font-medium">三分(中/投)</th>
                                        <th className="text-left px-3 py-2 font-medium">评价</th>
                                        <th className="text-left px-3 py-2 font-medium">MVP/SVP</th>
                                        <th className="text-left px-3 py-2 font-medium">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {playerStatsList.map((row, idx) => (
                                        <tr key={row.id || idx} className="border-t">
                                            <td className="px-3 py-2">
                                                <select
                                                    className="border rounded px-2 py-1 text-sm"
                                                    value={String(row.teamType)}
                                                    onChange={(e) => {
                                                        const v = ensureNumber(e.target.value, 1)
                                                        setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, teamType: v } : r))
                                                    }}
                                                    disabled={loading}
                                                >
                                                    <option value="1">我方</option>
                                                    <option value="2">对方</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex gap-1">
                                                    <select
                                                        className="border rounded px-2 py-1 text-sm w-28"
                                                        value={row.userName ?? ''}
                                                        onChange={(e) => {
                                                            const selectedUser = users.find(u => u.username === e.target.value);
                                                            setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { 
                                                                ...r, 
                                                                userName: e.target.value,
                                                                playerName: selectedUser ? selectedUser.name : r.playerName
                                                            } : r))
                                                        }}
                                                        disabled={loading}
                                                    >
                                                        <option value="">选择用户</option>
                                                        {users.map(user => (
                                                            <option key={user.id} value={user.username}>
                                                                {user.username}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        className="border rounded px-2 py-1 text-sm w-28"
                                                        value={row.userName ?? ''}
                                                        onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, userName: e.target.value } : r))}
                                                        placeholder="或手动输入"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex gap-1">
                                                    <select
                                                        className="border rounded px-2 py-1 text-sm w-32"
                                                        value={row.playerName ?? ''}
                                                        onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, playerName: e.target.value } : r))}
                                                        disabled={loading}
                                                    >
                                                        <option value="">选择球员</option>
                                                        {players.map(player => (
                                                            <option key={player.id} value={player.name}>
                                                                {player.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        className="border rounded px-2 py-1 text-sm w-32"
                                                        value={row.playerName ?? ''}
                                                        onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, playerName: e.target.value } : r))}
                                                        placeholder="或手动输入"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.score ?? 0}
                                                    onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, score: ensureNumber(e.target.value, 0) } : r))}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.assist ?? 0}
                                                    onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, assist: ensureNumber(e.target.value, 0) } : r))}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.rebound ?? 0}
                                                    onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, rebound: ensureNumber(e.target.value, 0) } : r))}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.steal ?? 0}
                                                    onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, steal: ensureNumber(e.target.value, 0) } : r))}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.block ?? 0}
                                                    onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, block: ensureNumber(e.target.value, 0) } : r))}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.turnover ?? 0}
                                                    onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, turnover: ensureNumber(e.target.value, 0) } : r))}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.dunk ?? 0}
                                                    onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, dunk: ensureNumber(e.target.value, 0) } : r))}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.midCount ?? 0}
                                                    onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, midCount: ensureNumber(e.target.value, 0) } : r))}
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        className="border rounded px-2 py-1 w-16"
                                                        type="number"
                                                        value={row.fgMade ?? 0}
                                                        onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, fgMade: ensureNumber(e.target.value, 0) } : r))}
                                                        disabled={loading}
                                                    />
                                                    <span className="text-gray-400">/</span>
                                                    <input
                                                        className="border rounded px-2 py-1 w-16"
                                                        type="number"
                                                        value={row.fgAttempt ?? 0}
                                                        onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, fgAttempt: ensureNumber(e.target.value, 0) } : r))}
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        className="border rounded px-2 py-1 w-16"
                                                        type="number"
                                                        value={row.threeMade ?? 0}
                                                        onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, threeMade: ensureNumber(e.target.value, 0) } : r))}
                                                        disabled={loading}
                                                    />
                                                    <span className="text-gray-400">/</span>
                                                    <input
                                                        className="border rounded px-2 py-1 w-16"
                                                        type="number"
                                                        value={row.threeAttempt ?? 0}
                                                        onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, threeAttempt: ensureNumber(e.target.value, 0) } : r))}
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    className="border rounded px-2 py-1 w-20"
                                                    type="number"
                                                    value={row.rating ?? 0}
                                                    onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, rating: parseFloat(e.target.value) || 0 } : r))}
                                                    step="0.1"
                                                    disabled={loading}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="inline-flex items-center gap-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!row.isMvp}
                                                            onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, isMvp: e.target.checked } : r))}
                                                            disabled={loading}
                                                        />
                                                        <span className="text-xs">MVP</span>
                                                    </label>
                                                    <label className="inline-flex items-center gap-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!row.isSvp}
                                                            onChange={(e) => setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? { ...r, isSvp: e.target.checked } : r))}
                                                            disabled={loading}
                                                        />
                                                        <span className="text-xs">SVP</span>
                                                    </label>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    onClick={() => setPlayerStatsList((prev) => prev.filter((_, i) => i !== idx))}
                                                    className="px-2 py-1 text-xs rounded border text-red-600 hover:bg-red-50"
                                                    disabled={loading}
                                                >
                                                    删除
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {playerStatsList.length === 0 && (
                                        <tr className="border-t">
                                            <td className="px-3 py-6 text-center text-gray-400" colSpan={14}>暂无球员统计</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {error && <div className="text-sm text-red-500 mt-3">{error}</div>}

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={props.onClose}
                        className="px-3 py-1.5 text-sm rounded border"
                        disabled={loading}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function GameDetailModal(props: {
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
                const res = await apiGet<BaseResponse<MatchGameDetailDTO>>(`/api/match-game/detail/${props.gameId}`)
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

            const res = await apiPost<BaseResponse<MatchGameDTO[]>>('/api/match-game/page', {
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

            const res = await apiDelete<BaseResponse<boolean>>(`/api/match-game/delete/${game.id}`)
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

            const res = await apiPost<BaseResponse<MatchGameStatsDTO>>('/api/match-game/stats', {
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

    const renderResultTab = () => {
        return (
            <>
                <div className="bg-white rounded-xl border shadow-sm mb-4">
                    <div className="p-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-col md:flex-row gap-3 md:items-end">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">赛季筛选</div>
                                <input
                                    className="border rounded px-3 py-2 text-sm w-60"
                                    value={season}
                                    onChange={(e) => setSeason(e.target.value)}
                                    placeholder="例如 S1 / 2026Q1"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <div className="text-sm text-gray-600 mb-1">每页数量</div>
                                <select
                                    className="border rounded px-3 py-2 text-sm"
                                    value={String(pageSize)}
                                    onChange={(e) => setPageSize(ensureNumber(e.target.value, 10))}
                                    disabled={loading}
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>

                            <button
                                onClick={handleSearch}
                                className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                                disabled={loading}
                            >
                                查询
                            </button>

                            <button
                                onClick={() => fetchPage(pageNum)}
                                className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                                disabled={loading}
                            >
                                刷新
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCreate}
                                className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                disabled={loading || !userInfo?.user}
                                title={!userInfo?.user ? '请先登录' : ''}
                            >
                                新增比赛
                            </button>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <div className="text-sm text-gray-500">加载中...</div>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <div className="text-sm text-red-500">{error}</div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">比赛列表</h2>
                                <div className="text-xs text-gray-500 mt-1">当前页：{pageNum}</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchPage(Math.max(1, pageNum - 1))}
                                    className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                                    disabled={loading || pageNum <= 1}
                                >
                                    上一页
                                </button>
                                <button
                                    onClick={() => fetchPage(pageNum + 1)}
                                    className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                                    disabled={loading || !canNextPage}
                                    title={!canNextPage ? '已到最后一页（按当前返回条数判断）' : ''}
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
                                    {data.map((g) => (
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
                                                        onClick={() => setDetailGameId(g.id)}
                                                        className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                                                    >
                                                        查看
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(g)}
                                                        className="px-2 py-1 text-xs rounded border hover:bg-gray-50 disabled:opacity-50"
                                                        disabled={!userInfo?.user}
                                                    >
                                                        编辑
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(g)}
                                                        className="px-2 py-1 text-xs rounded border text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                        disabled={!userInfo?.user}
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {data.length === 0 && (
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

    const renderStatsTab = () => {
        return (
            <>
                <div className="bg-white rounded-xl border shadow-sm mb-4">
                    <div className="p-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-col md:flex-row gap-3 md:items-end">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">赛季筛选</div>
                                <input
                                    className="border rounded px-3 py-2 text-sm w-60"
                                    value={statsSeason}
                                    onChange={(e) => setStatsSeason(e.target.value)}
                                    placeholder="例如 S1 / 2026Q1；留空=全赛季"
                                    disabled={statsLoading}
                                />
                            </div>

                            <div>
                                <div className="text-sm text-gray-600 mb-1">统计维度</div>
                                <select
                                    className="border rounded px-3 py-2 text-sm"
                                    value={statsDimension}
                                    onChange={(e) => setStatsDimension(e.target.value as MatchGameStatsDimension)}
                                    disabled={statsLoading}
                                >
                                    <option value="PLAYER">球员维度</option>
                                    <option value="USER">用户维度</option>
                                </select>
                            </div>

                            <button
                                onClick={fetchStats}
                                className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                                disabled={statsLoading}
                            >
                                生成统计
                            </button>

                            <button
                                onClick={() => {
                                    setStatsSeason('')
                                    setStatsDimension('PLAYER')
                                    setStatsData(null)
                                    setStatsError(null)
                                }}
                                className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                                disabled={statsLoading}
                            >
                                重置
                            </button>
                        </div>

                        <div className="text-xs text-gray-500">
                            仅统计我方数据（team_type=我方）
                        </div>
                    </div>
                </div>

                {statsLoading && (
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <div className="text-sm text-gray-500">加载中...</div>
                    </div>
                )}

                {!statsLoading && statsError && (
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <div className="text-sm text-red-500">{statsError}</div>
                    </div>
                )}

                {!statsLoading && !statsError && !statsData && (
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <div className="text-sm text-gray-500">请先点击“生成统计”</div>
                    </div>
                )}

                {!statsLoading && !statsError && statsData && (
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
                )}
            </>
        )
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

            {tab === 'result' && renderResultTab()}
            {tab === 'stats' && renderStatsTab()}

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
