/**
 * 删除活动记录 Hook
 */
import { useState } from 'react'
import type { ActivityOperationResponse } from '../types/activity'

interface DeleteParams {
    id: number
}

export function useDeleteActivityBlock() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const removeBlock = async (params: DeleteParams) => {
        try {
            setLoading(true)
            setError(null)

            const token = localStorage.getItem('token')
            if (!token) {
                setError('未登录，请先登录')
                return false
            }

            const res = await fetch('/api/activity/block/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(params),
            })

            if (res.status === 401) {
                setError('没有权限，请先登录')
                return false
            }

            const result: ActivityOperationResponse = await res.json()
            if (!res.ok || !result.success) {
                setError(result.message || '删除活动记录失败')
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

    return { removeBlock, loading, error }
}
