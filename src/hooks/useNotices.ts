/**
 * 公告数据获取 Hook
 *
 * 封装公告列表的分页查询逻辑，提供：
 * - data: 公告列表数据
 * - loading: 加载状态
 * - error: 错误信息
 * - refresh: 手动刷新方法
 *
 * @param pageNum - 页码，从 1 开始
 * @param pageSize - 每页大小
 * @returns Hook 返回值对象
 *
 * @example
 * ```tsx
 * const { data, loading, error, refresh } = useNotices(1, 10)
 * ```
 */
import { useCallback, useEffect, useState } from 'react'
import type { Notice, NoticePageResponse } from '../types/notices.ts'

export function useNotices(pageNum: number, pageSize: number) {
    // 公告列表数据
    const [data, setData] = useState<Notice[]>([])
    // 加载状态
    const [loading, setLoading] = useState(true)
    // 错误信息
    const [error, setError] = useState<string | null>(null)

    /**
     * 获取公告数据
     * 使用 useCallback 缓存，避免不必要的重复请求
     */
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

            // 安全处理：确保 data.list 存在且为数组
            setData(Array.isArray(result.data?.list) ? result.data.list : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }, [pageNum, pageSize])

    // 组件挂载时及分页参数变化时自动获取数据
    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        /** 公告列表数据 */
        data,
        /** 是否正在加载 */
        loading,
        /** 错误信息，无错误时为 null */
        error,
        /** 手动刷新数据 */
        refresh: fetchData,
    }
}
