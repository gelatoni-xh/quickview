import { useCallback, useEffect, useState } from 'react'
import { apiGet } from '../utils/api'
import type { BaseResponse, PermissionDTO } from '../types/rbac'

export function usePermissions() {
    const [data, setData] = useState<PermissionDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const result = await apiGet<BaseResponse<PermissionDTO[]>>('/api/permission/list')
            if (!result.success) {
                setError(result.message || '获取权限列表失败')
                setData([])
                return
            }

            setData(Array.isArray(result.data) ? result.data : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refresh: fetchData }
}
