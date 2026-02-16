import { useCallback, useEffect, useState } from 'react'
import { getMatchGamePage } from '../services/matchGameApi'
import type { MatchGameDTO } from '../types/matchGame'

export interface UseMatchGamePageParams {
    pageNum: number
    pageSize: number
    season: string | null
}

export function useMatchGamePage(params: UseMatchGamePageParams) {
    const [data, setData] = useState<MatchGameDTO[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const result = await getMatchGamePage(params)
            if (!result.success) {
                setError(result.message || '获取比赛列表失败')
                setData([])
                return
            }

            setData(Array.isArray(result.data) ? result.data : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
            setData([])
        } finally {
            setLoading(false)
        }
    }, [params.pageNum, params.pageSize, params.season])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refresh: fetchData }
}
