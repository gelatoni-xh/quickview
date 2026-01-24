/**
 * TODO 相关类型定义
 *
 * 与后端 TodoItemDTO 和 TodoTagDTO 对应的前端类型。
 */

/** TODO 标签类型 */
export interface TodoTag {
    /** 标签唯一标识 */
    id: number
    /** 标签名称 */
    name: string
    /** 创建时间，ISO 8601 格式字符串 */
    createTime: string
}

/** TODO 项类型 */
export interface TodoItem {
    /** TODO 项唯一标识 */
    id: number
    /** TODO 内容 */
    content: string
    /** 是否已完成 */
    completed: boolean
    /** 关联的标签 ID，可为 null */
    tagId: number | null
    /** 关联的标签名称 */
    tagName: string | null
    /** 创建时间 */
    createTime: string
    /** 最后修改时间 */
    modifiedTime: string
}

/** 标签列表响应类型 */
export interface TodoTagListResponse {
    success: boolean
    data: TodoTag[]
    message?: string
    traceId?: string
}

/** TODO 项列表响应类型 */
export interface TodoItemListResponse {
    success: boolean
    data: TodoItem[]
    message?: string
    traceId?: string
}

/** 通用操作响应类型 */
export interface TodoOperationResponse {
    success: boolean
    statusCode: string
    data: number
    message: string
    traceId: string
}
