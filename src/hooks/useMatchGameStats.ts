import { useCallback, useState } from 'react'
import { getMatchGameStats } from '../services/matchGameApi'
import type { MatchGameStatsDTO, MatchGameStatsDimension } from '../types/matchGame'

export interface UseMatchGameStatsParams {
    season: string | null
    matchDate: string | null
    excludeRobot: boolean
    dimension: MatchGameStatsDimension
}

export function useMatchGameStats() {
    const [data, setData] = useState<MatchGameStatsDTO | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async (params: UseMatchGameStatsParams) => {
        try {
            setLoading(true)
            setError(null)

            const result = await getMatchGameStats(params)
            if (!result.success) {
                setError(result.message || '获取统计数据失败')
                setData(null)
                return
            }

            setData(result.data || null)
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
            setData(null)
        } finally {
            setLoading(false)
        }
    }, [])

    return { data, loading, error, fetchStats }
}
