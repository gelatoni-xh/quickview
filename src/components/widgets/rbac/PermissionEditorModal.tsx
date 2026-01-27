import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { PermissionDTO } from '../../../types/rbac'
import { useCreateOrUpdatePermission } from '../../../hooks/useCreateOrUpdatePermission'

interface Props {
    permission?: PermissionDTO | null
    onClose: () => void
    onSuccess?: () => void
}

export default function PermissionEditorModal({ permission, onClose, onSuccess }: Props) {
    const [permissionCode, setPermissionCode] = useState('')
    const [permissionName, setPermissionName] = useState('')

    const { create, update, loading, error } = useCreateOrUpdatePermission()

    const isEdit = !!permission

    useEffect(() => {
        if (permission) {
            setPermissionCode(permission.permissionCode)
            setPermissionName(permission.permissionName)
        } else {
            setPermissionCode('')
            setPermissionName('')
        }
    }, [permission])

    const handleSubmit = async () => {
        if (!permissionCode.trim() || !permissionName.trim()) {
            alert('权限编码和权限名称不能为空')
            return
        }

        const ok = isEdit && permission
            ? await update({ id: permission.id, permissionCode, permissionName })
            : await create({ permissionCode, permissionName })

        if (ok) {
            onSuccess?.()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg bg-white rounded shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{isEdit ? '编辑权限' : '新增权限'}</h3>
                    <button onClick={onClose} aria-label="关闭">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">权限编码</label>
                        <input
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={permissionCode}
                            onChange={(e) => setPermissionCode(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">权限名称</label>
                        <input
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={permissionName}
                            onChange={(e) => setPermissionName(e.target.value)}
                            disabled={loading}
                        />
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
