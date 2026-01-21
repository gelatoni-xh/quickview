import { useEffect, useState } from 'react'
import type { Notice, NoticePageResponse } from '../types/notices.ts'

export function useNotices(pageNum: number, pageSize: number) {
    const [data, setData] = useState<Notice[]>([])   // 必须是数组
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        const fetchData = async () => {
            try {
                // 只有在组件未被卸载时才更新loading和error状态
                if (!cancelled) {
                    setLoading(true)
                    setError(null)
                }

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

                if (cancelled) return

                // ⭐ 关键点：只取 list
                setData(Array.isArray(result.data?.list) ? result.data.list : [])
            } catch (err) {
                if (cancelled) return
                setError(err instanceof Error ? err.message : String(err))
            } finally {
                // 在 finally 中不再使用 return，而是检查 cancelled 状态
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            cancelled = true
        }
    }, [pageNum, pageSize])

    return { data, loading, error }
}
