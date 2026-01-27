import { useState } from 'react'
import { apiPost } from '../utils/api'
import type { BaseResponse } from '../types/rbac'

export function useCreateOrUpdatePermission() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const create = async (params: { permissionCode: string; permissionName: string }): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await apiPost<BaseResponse<number>>('/api/permission/create', {
                permissionCode: params.permissionCode,
                permissionName: params.permissionName,
            })

            if (!result.success) {
                setError(result.message || '创建权限失败')
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

    const update = async (params: { id: number; permissionCode: string; permissionName: string }): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await apiPost<BaseResponse<number>>('/api/permission/update', {
                id: params.id,
                permissionCode: params.permissionCode,
                permissionName: params.permissionName,
            })

            if (!result.success) {
                setError(result.message || '更新权限失败')
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
