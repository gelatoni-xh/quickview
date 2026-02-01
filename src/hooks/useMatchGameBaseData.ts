import { useCallback, useEffect, useState } from 'react'
import { apiGet } from '../utils/api'
import type { BaseResponse } from '../types/rbac'

export interface MatchGameBaseDataDTO {
    seasons: string[]
    myPlayerNames: string[]
    opponentPlayerNames: string[]
    myUserNames: string[]
}

export function useMatchGameBaseData() {
    const [data, setData] = useState<MatchGameBaseDataDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const result = await apiGet<BaseResponse<MatchGameBaseDataDTO>>('/api/match-game/base-data')
            if (!result.success) {
                setError(result.message || '获取比赛基础数据失败')
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

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refresh: fetchData }
}
