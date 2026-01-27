import { useMemo, useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { useRoles } from '../hooks/useRoles'
import { usePermissions } from '../hooks/usePermissions'
import { useAssignUserRoles } from '../hooks/useAssignUserRoles'
import { useAssignRolePermissions } from '../hooks/useAssignRolePermissions'
import { useRoleCodesByUser } from '../hooks/useRoleCodesByUser'
import { usePermissionCodesByRole } from '../hooks/usePermissionCodesByRole'
import type { RoleDTO, UserDTO, PermissionDTO } from '../types/rbac'
import RoleEditorModal from '../components/widgets/rbac/RoleEditorModal'
import PermissionEditorModal from '../components/widgets/rbac/PermissionEditorModal'

type TabKey = 'user' | 'role' | 'permission'

export default function UserPermissionMgmt() {
    const [tab, setTab] = useState<TabKey>('user')

    const { data: users, loading: usersLoading, error: usersError, refresh: refreshUsers } = useUsers()
    const { data: roles, loading: rolesLoading, error: rolesError, refresh: refreshRoles } = useRoles()
    const { data: permissions, loading: permissionsLoading, error: permissionsError, refresh: refreshPermissions } = usePermissions()

    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null)
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])

    const [selectedRole, setSelectedRole] = useState<RoleDTO | null>(null)
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])

    const [selectedPermission, setSelectedPermission] = useState<PermissionDTO | null>(null)

    const [roleEditorOpen, setRoleEditorOpen] = useState(false)
    const [permissionEditorOpen, setPermissionEditorOpen] = useState(false)

    const { data: userRoleCodes, refresh: refreshUserRoleCodes } = useRoleCodesByUser(selectedUser?.id || null)
    const { data: rolePermissionCodes, refresh: refreshRolePermissionCodes } = usePermissionCodesByRole(selectedRole?.id || null)

    const { assignRoles, loading: assignUserRolesLoading, error: assignUserRolesError } = useAssignUserRoles()
    const { assignPermissions, loading: assignRolePermissionsLoading, error: assignRolePermissionsError } = useAssignRolePermissions()

    const loading = usersLoading || rolesLoading || permissionsLoading
    const error = usersError || rolesError || permissionsError

    const tabs = useMemo(() => {
        return [
            { key: 'user' as const, label: '用户管理' },
            { key: 'role' as const, label: '角色管理' },
            { key: 'permission' as const, label: '权限管理' },
        ]
    }, [])

    const toggleRoleId = (roleId: number) => {
        setSelectedRoleIds((prev) => {
            if (prev.includes(roleId)) {
                return prev.filter((id) => id !== roleId)
            }
            return [...prev, roleId]
        })
    }

    const togglePermissionId = (permissionId: number) => {
        setSelectedPermissionIds((prev) => {
            if (prev.includes(permissionId)) {
                return prev.filter((id) => id !== permissionId)
            }
            return [...prev, permissionId]
        })
    }

    const handleAssignUserRoles = async () => {
        if (!selectedUser) {
            alert('请先选择用户')
            return
        }

        if (selectedRoleIds.length === 0) {
            alert('请至少选择一个角色')
            return
        }

        const ok = await assignRoles({ userId: selectedUser.id, roleIds: selectedRoleIds })
        if (ok) {
            alert('分配成功（覆盖式）')
            refreshUsers()
            refreshUserRoleCodes()
        }
    }

    const handleAssignRolePermissions = async () => {
        if (!selectedRole) {
            alert('请先选择角色')
            return
        }

        if (selectedPermissionIds.length === 0) {
            alert('请至少选择一个权限')
            return
        }

        const ok = await assignPermissions({ roleId: selectedRole.id, permissionIds: selectedPermissionIds })
        if (ok) {
            alert('分配成功（覆盖式）')
            refreshRoles()
            refreshRolePermissionCodes()
        }
    }

    const renderUserTab = () => {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">用户列表</h2>
                            <div className="text-xs text-gray-500 mt-1">点击一行选中用户 {selectedUser && `(当前角色: ${userRoleCodes.join(', ')})`}</div>
                        </div>
                        <button
                            onClick={refreshUsers}
                            className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"
                            disabled={loading}
                        >
                            刷新
                        </button>
                    </div>

                    <div className="max-h-[520px] overflow-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left px-4 py-2 font-medium">ID</th>
                                    <th className="text-left px-4 py-2 font-medium">用户名</th>
                                    <th className="text-left px-4 py-2 font-medium">昵称</th>
                                    <th className="text-left px-4 py-2 font-medium">状态</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr
                                        key={u.id}
                                        className={
                                            'border-t hover:bg-blue-50 cursor-pointer ' +
                                            (selectedUser?.id === u.id ? 'bg-blue-50' : '')
                                        }
                                        onClick={() => {
                                            setSelectedUser(u)
                                            setSelectedRoleIds([])
                                        }}
                                    >
                                        <td className="px-4 py-2">{u.id}</td>
                                        <td className="px-4 py-2">{u.username}</td>
                                        <td className="px-4 py-2">{u.nickname}</td>
                                        <td className="px-4 py-2">{u.status === 1 ? '启用' : '禁用'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && !usersLoading && (
                            <div className="p-6 text-sm text-gray-400">暂无用户数据</div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b">
                        <h2 className="font-semibold">给用户分配角色</h2>
                        <div className="text-xs text-gray-500 mt-1">
                            当前为覆盖式分配：提交会覆盖该用户原有角色。
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="text-sm">
                            <span className="text-gray-600">当前用户：</span>
                            <span className="font-medium">
                                {selectedUser ? `${selectedUser.nickname || selectedUser.username} (#${selectedUser.id})` : '未选择'}
                            </span>
                        </div>

                        <div className="max-h-[360px] overflow-auto border rounded p-3">
                            {roles.map((r) => (
                                <label key={r.id} className="flex items-center gap-2 py-1 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedRoleIds.includes(r.id) || userRoleCodes.includes(r.roleCode)}
                                        onChange={() => toggleRoleId(r.id)}
                                        disabled={!selectedUser || assignUserRolesLoading}
                                    />
                                    <span className="font-medium">{r.roleName}</span>
                                    <span className="text-xs text-gray-500">({r.roleCode})</span>
                                    {userRoleCodes.includes(r.roleCode) && (
                                        <span className="text-xs text-green-600">(当前)</span>
                                    )}
                                </label>
                            ))}
                            {roles.length === 0 && !rolesLoading && (
                                <div className="text-sm text-gray-400">暂无角色数据</div>
                            )}
                        </div>

                        {assignUserRolesError && (
                            <div className="text-sm text-red-500">{assignUserRolesError}</div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={handleAssignUserRoles}
                                disabled={!selectedUser || assignUserRolesLoading}
                                className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                            >
                                {assignUserRolesLoading ? '提交中...' : '提交分配'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderRoleTab = () => {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">角色列表</h2>
                            <div className="text-xs text-gray-500 mt-1">点击一行选中角色 {selectedRole && `(当前权限: ${rolePermissionCodes.join(', ')})`}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setSelectedRole(null)
                                    setRoleEditorOpen(true)
                                }}
                                className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                新增
                            </button>
                            <button
                                onClick={refreshRoles}
                                className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"
                                disabled={loading}
                            >
                                刷新
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[520px] overflow-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left px-4 py-2 font-medium">ID</th>
                                    <th className="text-left px-4 py-2 font-medium">编码</th>
                                    <th className="text-left px-4 py-2 font-medium">名称</th>
                                    <th className="text-left px-4 py-2 font-medium">状态</th>
                                    <th className="text-left px-4 py-2 font-medium">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((r) => (
                                    <tr
                                        key={r.id}
                                        className={
                                            'border-t hover:bg-blue-50 cursor-pointer ' +
                                            (selectedRole?.id === r.id ? 'bg-blue-50' : '')
                                        }
                                        onClick={() => {
                                            setSelectedRole(r)
                                            setSelectedPermissionIds([])
                                        }}
                                    >
                                        <td className="px-4 py-2">{r.id}</td>
                                        <td className="px-4 py-2">{r.roleCode}</td>
                                        <td className="px-4 py-2">{r.roleName}</td>
                                        <td className="px-4 py-2">{r.status === 1 ? '启用' : '禁用'}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedRole(r)
                                                    setRoleEditorOpen(true)
                                                }}
                                                className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                                            >
                                                编辑
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {roles.length === 0 && !rolesLoading && (
                            <div className="p-6 text-sm text-gray-400">暂无角色数据</div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b">
                        <h2 className="font-semibold">给角色分配权限</h2>
                        <div className="text-xs text-gray-500 mt-1">
                            当前为覆盖式分配：提交会覆盖该角色原有权限。
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="text-sm">
                            <span className="text-gray-600">当前角色：</span>
                            <span className="font-medium">
                                {selectedRole ? `${selectedRole.roleName} (#${selectedRole.id})` : '未选择'}
                            </span>
                        </div>

                        <div className="max-h-[360px] overflow-auto border rounded p-3">
                            {permissions.map((p) => (
                                <label key={p.id} className="flex items-center gap-2 py-1 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissionIds.includes(p.id) || rolePermissionCodes.includes(p.permissionCode)}
                                        onChange={() => togglePermissionId(p.id)}
                                        disabled={!selectedRole || assignRolePermissionsLoading}
                                    />
                                    <span className="font-medium">{p.permissionName}</span>
                                    <span className="text-xs text-gray-500">({p.permissionCode})</span>
                                    {rolePermissionCodes.includes(p.permissionCode) && (
                                        <span className="text-xs text-green-600">(当前)</span>
                                    )}
                                </label>
                            ))}
                            {permissions.length === 0 && !permissionsLoading && (
                                <div className="text-sm text-gray-400">暂无权限数据</div>
                            )}
                        </div>

                        {assignRolePermissionsError && (
                            <div className="text-sm text-red-500">{assignRolePermissionsError}</div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={handleAssignRolePermissions}
                                disabled={!selectedRole || assignRolePermissionsLoading}
                                className="px-3 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                            >
                                {assignRolePermissionsLoading ? '提交中...' : '提交分配'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderPermissionTab = () => {
        return (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold">权限列表</h2>
                        <div className="text-xs text-gray-500 mt-1">可新增/编辑权限</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setSelectedPermission(null)
                                setPermissionEditorOpen(true)
                            }}
                            className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                            新增
                        </button>
                        <button
                            onClick={refreshPermissions}
                            className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"
                            disabled={loading}
                        >
                            刷新
                        </button>
                    </div>
                </div>

                <div className="max-h-[560px] overflow-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="text-left px-4 py-2 font-medium">ID</th>
                                <th className="text-left px-4 py-2 font-medium">编码</th>
                                <th className="text-left px-4 py-2 font-medium">名称</th>
                                <th className="text-left px-4 py-2 font-medium">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((p) => (
                                <tr key={p.id} className="border-t hover:bg-blue-50">
                                    <td className="px-4 py-2">{p.id}</td>
                                    <td className="px-4 py-2">{p.permissionCode}</td>
                                    <td className="px-4 py-2">{p.permissionName}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => {
                                                setSelectedPermission(p)
                                                setPermissionEditorOpen(true)
                                            }}
                                            className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                                        >
                                            编辑
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {permissions.length === 0 && !permissionsLoading && (
                        <div className="p-6 text-sm text-gray-400">暂无权限数据</div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">用户/角色/权限管理</h1>
                <p className="text-sm text-gray-500 mt-1">用户管理、角色管理、权限管理（覆盖式分配）</p>
            </div>

            <div className="bg-white rounded-xl border shadow-sm mb-6">
                <div className="flex items-center gap-2 p-2">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={
                                'px-4 py-2 text-sm rounded-lg transition-colors ' +
                                (tab === t.key
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100')
                            }
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="text-sm text-gray-500">加载中...</div>
                </div>
            )}

            {!loading && error && (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <div className="text-sm text-red-500">{error}</div>
                </div>
            )}

            {!loading && !error && (
                <>
                    {tab === 'user' && renderUserTab()}
                    {tab === 'role' && renderRoleTab()}
                    {tab === 'permission' && renderPermissionTab()}
                </>
            )}

            {roleEditorOpen && (
                <RoleEditorModal
                    role={selectedRole}
                    onClose={() => setRoleEditorOpen(false)}
                    onSuccess={() => {
                        setRoleEditorOpen(false)
                        refreshRoles()
                    }}
                />
            )}

            {permissionEditorOpen && (
                <PermissionEditorModal
                    permission={selectedPermission}
                    onClose={() => setPermissionEditorOpen(false)}
                    onSuccess={() => {
                        setPermissionEditorOpen(false)
                        refreshPermissions()
                    }}
                />
            )}
        </main>
    )
}
