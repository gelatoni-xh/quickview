import { useState } from 'react'

interface CreateNoticeParams {
    title: string
    content: string
}

interface CreateNoticeResponse {
    success: boolean
    statusCode: string
    data: number
    message: string
    traceId: string
}

export function useCreateNotice() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createNotice = async (params: CreateNoticeParams) => {
        try {
            setLoading(true)
            setError(null)

            const token = localStorage.getItem('token')

            const res = await fetch('/api/notice/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(params),
            })

            // ⭐ 核心：统一处理 401
            if (res.status === 401) {
                setError('没有权限，请先登录')
                return false
            }

            const result: CreateNoticeResponse = await res.json()

            if (!res.ok || !result.success) {
                setError(result.message || '创建公告失败')
                return false
            }

            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        createNotice,
        loading,
        error,
    }
}
