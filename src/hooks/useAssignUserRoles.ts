import { useState } from 'react'
import { apiPost } from '../utils/api'
import type { BaseResponse } from '../types/rbac'

export function useAssignUserRoles() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const assignRoles = async (params: { userId: number; roleIds: number[] }): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await apiPost<BaseResponse<number>>('/api/user/assign-role', {
                userId: params.userId,
                roleIds: params.roleIds,
            })

            if (!result.success) {
                setError(result.message || '分配角色失败')
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

    return { assignRoles, loading, error }
}
