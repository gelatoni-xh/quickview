import { useCallback, useEffect, useState } from 'react'
import { getNoticePage } from '../services/noticeApi'
import type { Notice } from '../types/notices'

export function useNotices(pageNum: number, pageSize: number) {
    const [data, setData] = useState<Notice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const result = await getNoticePage({ pageNum, pageSize })
            setData(Array.isArray(result.data?.list) ? result.data.list : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }, [pageNum, pageSize])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
    }
}
