import { apiPost } from '../utils/api'
import type { ApiPostBody } from '../utils/api'
import type { BaseResponse } from '../types/rbac'

export async function sendChat(message: string, sessionUuid: string) {
    return apiPost<BaseResponse<{ answer: string }>>('/api/chat', { message, sessionUuid } as unknown as ApiPostBody)
}
