export interface Notice {
    content: string
    createTime: string
}

export interface NoticePageResponse {
    success: boolean
    data: {
        list: Notice[]
        total: number
        pageNo: number
        pageSize: number
    }
    message?: string
    traceId?: string
}
