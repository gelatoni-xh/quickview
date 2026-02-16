import { apiGet, apiPost } from '../utils/api'
import type { ApiPostBody } from '../utils/api'
import type { ActivityListResponse, ActivityTag } from '../types/activity'

export interface CreateActivityTagRequest {
    name: string
    color: string
}

export interface UpdateActivityTagRequest {
    id: number
    name?: string
    color?: string
}

export interface CreateOrUpdateActivityBlockRequest {
    tagId: number
    activityDate: string
    startTime: string
    endTime: string
    detail?: string | null
}

export interface DeleteActivityBlockRequest {
    id: number
}

export interface DeleteActivityTagRequest {
    id: number
}

export async function getActivityTags() {
    return apiGet<ActivityListResponse<ActivityTag[]>>('/api/activity/tag/list')
}

export async function getActivityBlocksByDate(date: string) {
    return apiGet<ActivityListResponse<any>>(`/api/activity/block/listByDate?date=${date}`)
}

export async function createActivityTag(req: CreateActivityTagRequest) {
    return apiPost<any>('/api/activity/tag/create', req as unknown as ApiPostBody)
}

export async function updateActivityTag(req: UpdateActivityTagRequest) {
    return apiPost<any>('/api/activity/tag/update', req as unknown as ApiPostBody)
}

export async function deleteActivityTag(req: DeleteActivityTagRequest) {
    return apiPost<any>('/api/activity/tag/delete', req as unknown as ApiPostBody)
}

export async function createOrUpdateActivityBlock(req: CreateOrUpdateActivityBlockRequest) {
    return apiPost<any>('/api/activity/block/createOrUpdate', req as unknown as ApiPostBody)
}

export async function deleteActivityBlock(req: DeleteActivityBlockRequest) {
    return apiPost<any>('/api/activity/block/delete', req as unknown as ApiPostBody)
}
