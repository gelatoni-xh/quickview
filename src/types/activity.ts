/**
 * 活动记录相关类型定义
 */

/** 活动标签 */
export interface ActivityTag {
    /** 标签唯一标识 */
    id: number
    /** 标签名称 */
    name: string
    /** 标签颜色（#RRGGBB） */
    color: string
}

/** 活动记录条目 */
export interface ActivityBlock {
    /** 记录唯一标识 */
    id: number
    /** 开始时间（HH:mm 或 HH:mm:ss） */
    startTime: string
    /** 结束时间（HH:mm 或 HH:mm:ss） */
    endTime: string
    /** 标签信息 */
    tag: ActivityTag
    /** 详细描述 */
    detail?: string | null
}

/** 列表响应类型 */
export interface ActivityListResponse<T> {
    success: boolean
    data: T
    message?: string
    traceId?: string
}

/** 操作响应类型 */
export interface ActivityOperationResponse {
    success: boolean
    statusCode: string
    data: number
    message: string
    traceId: string
}
