import { apiPost, apiGet } from '../utils/api'
import type { ApiPostBody } from '../utils/api'
import type { BaseResponse } from '../types/rbac'

export async function sendChat(message: string, sessionUuid: string) {
    return apiPost<BaseResponse<{ answer: string }>>('/api/chat', { message, sessionUuid } as unknown as ApiPostBody)
}

export async function getSessions(pageNo: number = 1, pageSize: number = 10) {
    return apiGet<BaseResponse<{
        list: Array<{ sessionUuid: string; title: string; createTime: string }>
        total: number
        pageNo: number
        pageSize: number
    }>>(`/api/chat/sessions?pageNo=${pageNo}&pageSize=${pageSize}`)
}

export async function getMessages(sessionUuid: string) {
    return apiGet<BaseResponse<Array<{ message: string; answer: string; createTime: string }>>>(`/api/chat/messages?sessionUuid=${sessionUuid}`)
}
