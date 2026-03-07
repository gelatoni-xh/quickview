import { apiPost, apiGet } from '../utils/api'
import type { ApiPostBody } from '../utils/api'
import type { BaseResponse } from '../types/rbac'

export async function sendChat(message: string, sessionUuid: string) {
    return apiPost<BaseResponse<{ answer: string }>>('/api/chat', { message, sessionUuid } as unknown as ApiPostBody)
}

export async function getSessions(pageNo: number = 1, pageSize: number = 10) {
    return apiGet<BaseResponse<{
        records: Array<{ sessionUuid: string; title: string; createTime: string }>
        total: number
        current: number
        size: number
    }>>(`/api/chat/sessions?pageNo=${pageNo}&pageSize=${pageSize}`)
}

export async function getMessages(sessionId: string) {
    return apiGet<BaseResponse<Array<{ message: string; answer: string; createTime: string }>>>(`/api/chat/messages?sessionId=${sessionId}`)
}
