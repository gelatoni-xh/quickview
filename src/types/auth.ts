/**
 * 认证相关类型定义
 */

/**
 * 用户信息
 */
export interface User {
    /** 用户ID */
    id: number
    /** 用户名 */
    username: string
    /** 用户昵称 */
    nickname: string
    /** 状态：1-启用 0-禁用 */
    status: number
    /** 创建时间 */
    createTime: string
    /** 最后修改时间 */
    modifiedTime: string
}

/**
 * 用户信息响应（包含角色和权限）
 */
export interface UserInfo {
    /** 用户基本信息，匿名用户时为 null */
    user: User | null
    /** 角色编码列表 */
    roleCodes: string[]
    /** 权限编码列表 */
    permissionCodes: string[]
    /** JWT Token（登录后返回） */
    token?: string
}

/**
 * 用户信息 API 响应
 */
export interface UserInfoResponse {
    /** 请求是否成功 */
    success: boolean
    /** 用户信息数据 */
    data: UserInfo
    /** 错误信息（请求失败时返回） */
    message?: string
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
    /** 用户名 */
    username: string
    /** 密码 */
    password: string
}

/**
 * 认证状态
 */
export interface AuthState {
    /** 用户信息 */
    userInfo: UserInfo | null
    /** 是否已登录 */
    isAuthenticated: boolean
    /** 是否正在加载 */
    loading: boolean
    /** 错误信息 */
    error: string | null
}
