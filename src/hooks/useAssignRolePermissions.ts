import { useState } from 'react'
import { apiPost } from '../utils/api'
import type { BaseResponse } from '../types/rbac'

export function useAssignRolePermissions() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const assignPermissions = async (params: { roleId: number; permissionIds: number[] }): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const result = await apiPost<BaseResponse<number>>('/api/role/assign-permission', {
                roleId: params.roleId,
                permissionIds: params.permissionIds,
            })

            if (!result.success) {
                setError(result.message || '分配权限失败')
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

    return { assignPermissions, loading, error }
}
