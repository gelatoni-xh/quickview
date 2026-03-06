/**
 * 权限编码常量
 *
 * 定义系统中所有权限编码的常量，用于权限检查。
 */
export const PERMISSIONS = {
    /** Dashboard 权限 */
    DASHBOARD: 'PERM_DASHBOARD',
    /** 查看公告权限 */
    NOTICE_VIEW: 'PERM_NOTICE_VIEW',
    /** 创建公告权限 */
    NOTICE_CREATE: 'PERM_NOTICE_CREATE',
    /** TODO 权限（用于所有 TODO 相关的操作） */
    TODO: 'PERM_TODO',
    /** 活动记录权限（用于所有活动记录相关的操作） */
    ACTIVITY: 'PERM_ACTIVITY',
    /** 比赛权限（用于比赛相关的操作） */
    MATCH: 'PERM_MATCH',
    /** 简历权限（用于简历相关的操作） */
    RESUME: 'PERM_RESUME',
    /** 博客查看权限 */
    BLOG_VIEW: 'PERM_BLOG_VIEW',
    USER_PERMISSION_MGMT: 'PERM_USER_PERMISSION_MGMT',
    AI_CHAT: 'PERM_AI_CHAT',
} as const
