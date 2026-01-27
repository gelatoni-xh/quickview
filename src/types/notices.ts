/**
 * 公告类型定义
 *
 * 与后端 NoticeDTO 对应的前端类型。
 */
export interface Notice {
    /** 公告 ID */
    id: number
    /** 公告标题 */
    title: string
    /** 公告内容，支持 Markdown 格式 */
    content: string
    /** 创建时间，ISO 8601 格式字符串 */
    createTime: string
}

/**
 * 公告分页查询响应类型
 *
 * 与后端 BaseResponse<PageData<NoticeDTO>> 对应的前端类型。
 */
export interface NoticePageResponse {
    /** 请求是否成功 */
    success: boolean
    /** 分页数据 */
    data: {
        /** 当前页的公告列表 */
        list: Notice[]
        /** 总记录数 */
        total: number
        /** 当前页码 */
        pageNo: number
        /** 每页大小 */
        pageSize: number
    }
    /** 错误信息（请求失败时返回） */
    message?: string
    /** 链路追踪 ID，用于排查问题 */
    traceId?: string
}
