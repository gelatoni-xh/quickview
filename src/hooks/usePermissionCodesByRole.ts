import { useState, useEffect } from 'react';
import { apiGet } from '../utils/api';

interface PermissionCodesByRoleResponse {
    success: boolean;
    data: string[];
    message?: string;
    traceId?: string;
}

export function usePermissionCodesByRole(roleId: number | null) {
    const [data, setData] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPermissionCodes = async () => {
        if (roleId === null) {
            setData([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const result: PermissionCodesByRoleResponse = await apiGet(`/api/role/permissions-by-role/${roleId}`);
            
            if (!result.success) {
                setError(result.message || '获取角色权限失败');
                setData([]);
            } else {
                setData(result.data || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissionCodes();
    }, [roleId]);

    return { data, loading, error, refresh: fetchPermissionCodes };
}