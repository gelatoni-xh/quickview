import { apiGet, apiPost } from '../utils/api'
import type { ApiPostBody } from '../utils/api'
import type { BaseResponse, PermissionDTO, RoleDTO, UserDTO } from '../types/rbac'

export interface CreateRoleRequest {
    roleCode: string
    roleName: string
    status: number
}

export interface UpdateRoleRequest {
    id: number
    roleCode: string
    roleName: string
    status: number
}

export interface CreatePermissionRequest {
    permissionCode: string
    permissionName: string
}

export interface UpdatePermissionRequest {
    id: number
    permissionCode: string
    permissionName: string
}

export interface AssignRolePermissionsRequest {
    roleId: number
    permissionIds: number[]
}

export interface AssignUserRolesRequest {
    userId: number
    roleIds: number[]
}

export async function getPermissions() {
    return apiGet<BaseResponse<PermissionDTO[]>>('/api/permission/list')
}

export async function getRoles() {
    return apiGet<BaseResponse<RoleDTO[]>>('/api/role/list')
}

export async function getUsers() {
    return apiGet<BaseResponse<UserDTO[]>>('/api/user/list')
}

export async function createRole(req: CreateRoleRequest) {
    return apiPost<BaseResponse<number>>('/api/role/create', req as unknown as ApiPostBody)
}

export async function updateRole(req: UpdateRoleRequest) {
    return apiPost<BaseResponse<number>>('/api/role/update', req as unknown as ApiPostBody)
}

export async function createPermission(req: CreatePermissionRequest) {
    return apiPost<BaseResponse<number>>('/api/permission/create', req as unknown as ApiPostBody)
}

export async function updatePermission(req: UpdatePermissionRequest) {
    return apiPost<BaseResponse<number>>('/api/permission/update', req as unknown as ApiPostBody)
}

export async function assignRolePermissions(req: AssignRolePermissionsRequest) {
    return apiPost<BaseResponse<number>>('/api/role/assign-permission', req as unknown as ApiPostBody)
}

export async function assignUserRoles(req: AssignUserRolesRequest) {
    return apiPost<BaseResponse<number>>('/api/user/assign-role', req as unknown as ApiPostBody)
}

export async function getPermissionCodesByRole(roleId: number) {
    return apiGet<BaseResponse<string[]>>(`/api/role/permissions-by-role/${roleId}`)
}

export async function getRoleCodesByUser(userId: number) {
    return apiGet<BaseResponse<string[]>>(`/api/user/roles-by-user/${userId}`)
}
