import { useCallback, useEffect, useState } from 'react'
import type { Notice, NoticePageResponse } from '../types/notices.ts'

export function useNotices(pageNum: number, pageSize: number) {
    const [data, setData] = useState<Notice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch('/api/notice/page', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pageNum,
                    pageSize,
                }),
            })

            const result: NoticePageResponse = await res.json()

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
