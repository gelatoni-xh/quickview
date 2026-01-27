import {useEffect, useState} from 'react'
import { X } from 'lucide-react'
import type { RoleDTO } from '../../../types/rbac'
import { useCreateOrUpdateRole } from '../../../hooks/useCreateOrUpdateRole'

interface Props {
    role?: RoleDTO | null
    onClose: () => void
    onSuccess?: () => void
}

export default function RoleEditorModal({ role, onClose, onSuccess }: Props) {
    const [roleCode, setRoleCode] = useState('')
    const [roleName, setRoleName] = useState('')
    const [status, setStatus] = useState<number>(1)

    const { create, update, loading, error } = useCreateOrUpdateRole()

    const isEdit = !!role

    useEffect(() => {
        if (role) {
            setRoleCode(role.roleCode)
            setRoleName(role.roleName)
            setStatus(role.status)
        } else {
            setRoleCode('')
            setRoleName('')
            setStatus(1)
        }
    }, [role])

    const handleSubmit = async () => {
        if (!roleCode.trim() || !roleName.trim()) {
            alert('角色编码和角色名称不能为空')
            return
        }

        const ok = isEdit && role
            ? await update({ id: role.id, roleCode, roleName, status })
            : await create({ roleCode, roleName, status })

        if (ok) {
            onSuccess?.()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg bg-white rounded shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{isEdit ? '编辑角色' : '新增角色'}</h3>
                    <button onClick={onClose} aria-label="关闭">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">角色编码</label>
                        <input
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={roleCode}
                            onChange={(e) => setRoleCode(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">角色名称</label>
                        <input
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">状态</label>
                        <select
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => setStatus(Number(e.target.value))}
                            disabled={loading}
                        >
                            <option value={1}>启用</option>
                            <option value={0}>禁用</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="text-sm text-red-500 mt-2">{error}</div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-sm rounded border"
                        disabled={loading}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                    >
                        {loading ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    )
}
