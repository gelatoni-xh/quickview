import { apiDelete, apiPost } from '../utils/api'
import type { ApiPostBody } from '../utils/api'
import type { NoticePageResponse } from '../types/notices'

export interface NoticePageRequest {
    pageNum: number
    pageSize: number
}

export interface CreateNoticeRequest {
    title: string
    content: string
}

export async function getNoticePage(req: NoticePageRequest) {
    return apiPost<NoticePageResponse>('/api/notice/page', req as unknown as ApiPostBody)
}

export async function createNotice(req: CreateNoticeRequest) {
    return apiPost<any>('/api/notice/create', req as unknown as ApiPostBody)
}

export async function deleteNotice(id: number) {
    return apiDelete<any>(`/api/notice/${id}`)
}
