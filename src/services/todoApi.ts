import { apiDelete, apiGet, apiPost } from '../utils/api'
import type { ApiPostBody } from '../utils/api'
import type { TodoItemListResponse, TodoTagListResponse } from '../types/todo'

export interface CreateTodoItemRequest {
    content: string
    tagId?: number | null
}

export interface UpdateTodoItemRequest {
    id: number
    content?: string
    completed?: boolean
    tagId?: number | null
}

export interface CreateTodoTagRequest {
    name: string
}

export async function getTodoItems(tagId: number | null) {
    const url = tagId !== null
        ? `/api/todo/item/listByTag?tagId=${tagId}`
        : '/api/todo/item/list'
    return apiGet<TodoItemListResponse>(url)
}

export async function getTodoTags() {
    return apiGet<TodoTagListResponse>('/api/todo/tag/list')
}

export async function createTodoItem(req: CreateTodoItemRequest) {
    return apiPost<any>('/api/todo/item/create', req as unknown as ApiPostBody)
}

export async function updateTodoItem(req: UpdateTodoItemRequest) {
    return apiPost<any>('/api/todo/item/update', req as unknown as ApiPostBody)
}

export async function deleteTodoItem(id: number) {
    return apiDelete<any>(`/api/todo/item/${id}`)
}

export async function createTodoTag(req: CreateTodoTagRequest) {
    return apiPost<any>('/api/todo/tag/create', req as unknown as ApiPostBody)
}

export async function deleteTodoTag(id: number) {
    return apiDelete<any>(`/api/todo/tag/${id}`)
}
