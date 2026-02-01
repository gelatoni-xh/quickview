import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createMatchGame, getMatchGameDetail, updateMatchGame } from '../../services/matchGameApi'
import type {
    MatchGameDTO,
    MatchPlayerStatsDTO,
    MatchTeamStatsDTO,
} from '../../types/matchGame'
import {
    ensureNumber,
    normalizeLocalDateTime,
    toInputDatetimeLocalValue,
} from '../../utils/matchGameFormat'
import { useMatchGameBaseData } from '../../hooks/useMatchGameBaseData'

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

export default function GameEditorModal(props: {
    mode: GameEditorMode
    game?: MatchGameDTO | null
    onClose: () => void
    onSuccess: () => void
}) {
    const { userInfo } = useAuth()

    const { data: baseData, loading: baseDataLoading } = useMatchGameBaseData()

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

                const res = await getMatchGameDetail(props.game.id)
                if (!res.success) {
                    setError(res.message || '获取比赛详情失败（用于编辑）')
                    return
                }

                const detail = res.data
                if (!detail) return

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
                const res = await createMatchGame({
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

            const res = await updateMatchGame({
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
                            <div className="flex gap-1">
                                <select
                                    className="w-full border rounded px-3 py-2 text-sm"
                                    value={season}
                                    onChange={(e) => setSeason(e.target.value)}
                                    disabled={loading || baseDataLoading}
                                >
                                    <option value="">选择赛季</option>
                                    {(baseData?.seasons || []).map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    className="w-full border rounded px-3 py-2 text-sm"
                                    value={season}
                                    onChange={(e) => setSeason(e.target.value)}
                                    disabled={loading}
                                    placeholder="或手动输入"
                                />
                            </div>
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
                                                            setPlayerStatsList((prev) => prev.map((r, i) => i === idx ? {
                                                                ...r,
                                                                userName: e.target.value,
                                                                playerName: r.playerName,
                                                            } : r))
                                                        }}
                                                        disabled={loading || baseDataLoading || row.teamType !== 1}
                                                    >
                                                        <option value="">选择用户</option>
                                                        {(baseData?.myUserNames || []).map((u) => (
                                                            <option key={u} value={u}>
                                                                {u}
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
                                                        disabled={loading || baseDataLoading}
                                                    >
                                                        <option value="">选择球员</option>
                                                        {(row.teamType === 2
                                                            ? (baseData?.opponentPlayerNames ?? [])
                                                            : (baseData?.myPlayerNames ?? [])
                                                        ).map((p) => (
                                                            <option key={p} value={p}>
                                                                {p}
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
