import { useState } from 'react'
import { apiPost } from '../utils/api'
import type { BaseResponse } from '../types/rbac'

export function useCreateOrUpdateRole() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const create = async (params: { roleCode: string; roleName: string; status: number }): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await apiPost<BaseResponse<number>>('/api/role/create', {
                roleCode: params.roleCode,
                roleName: params.roleName,
                status: params.status,
            })

            if (!result.success) {
                setError(result.message || '创建角色失败')
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

    const update = async (params: { id: number; roleCode: string; roleName: string; status: number }): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await apiPost<BaseResponse<number>>('/api/role/update', {
                id: params.id,
                roleCode: params.roleCode,
                roleName: params.roleName,
                status: params.status,
            })

            if (!result.success) {
                setError(result.message || '更新角色失败')
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

    return { create, update, loading, error }
}
