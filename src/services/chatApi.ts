import { apiPost } from '../utils/api'
import type { ApiPostBody } from '../utils/api'
import type { BaseResponse } from '../types/rbac'

export async function sendChat(message: string) {
    return apiPost<BaseResponse<{ answer: string }>>('/api/chat', { message } as unknown as ApiPostBody)
}
