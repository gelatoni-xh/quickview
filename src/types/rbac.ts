export interface BaseResponse<T> {
    success: boolean
    data: T
    message?: string
    traceId?: string
}

export interface UserDTO {
    id: number
    username: string
    nickname: string
    status: number
    createTime: string
    modifiedTime: string
}

export interface RoleDTO {
    id: number
    roleCode: string
    roleName: string
    status: number
    createTime: string
    modifiedTime: string
}

export interface PermissionDTO {
    id: number
    permissionCode: string
    permissionName: string
    createTime: string
    modifiedTime: string
}
