import { useCallback, useState } from 'react'
import { getOpponentStats } from '../services/matchGameApi'
import type { OpponentStatsDTO } from '../types/matchGame'

export function useOpponentStats() {
    const [data, setData] = useState<OpponentStatsDTO | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async (season?: string | null, minGames?: number) => {
        try {
            setLoading(true)
            setError(null)
            const res = await getOpponentStats(season, minGames)
            setData(res.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : '获取对手统计失败')
        } finally {
            setLoading(false)
        }
    }, [])

    return { data, loading, error, fetchStats }
}
