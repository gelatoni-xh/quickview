/**
 * 删除公告 Hook
 */
import { useState } from 'react'

interface DeleteNoticeResponse {
    success: boolean
    statusCode: string
    data: number
    message: string
    traceId: string
}

export function useDeleteNotice() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const deleteNotice = async (id: number) => {
        try {
            setLoading(true)
            setError(null)

            const token = localStorage.getItem('token')
            if (!token) {
                setError('未登录，请先登录')
                return false
            }

            const res = await fetch(`/api/notice/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.status === 401) {
                setError('没有权限，请先登录')
                return false
            }

            const result: DeleteNoticeResponse = await res.json()

            if (!res.ok || !result.success) {
                setError(result.message || '删除公告失败')
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

    return { deleteNotice, loading, error }
}
