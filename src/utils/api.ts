/**
 * API 请求工具函数
 *
 * 提供统一的 API 请求方法，自动处理：
 * - Token 认证
 * - 错误处理
 * - 响应解析
 */

/**
 * 获取认证 Token
 */
function getToken(): string | null {
    return localStorage.getItem('token')
}

/**
 * 创建带认证的请求头
 */
function createHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...customHeaders,
    }

    const token = getToken()
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    return headers
}

/**
 * 执行 API 请求
 *
 * @param url - 请求 URL
 * @param options - Fetch 选项
 * @returns Promise<Response>
 */
export async function apiRequest(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const headers = createHeaders(options.headers as Record<string, string> | undefined)

    return fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers || {}),
        },
    })
}

/**
 * GET 请求
 */
export async function apiGet<T = unknown>(url: string): Promise<T> {
    const res = await apiRequest(url, { method: 'GET' })
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
    }
    return res.json()
}

/**
 * POST 请求的数据类型
 */
export type ApiPostBodyValue =
    | string
    | number
    | boolean
    | null
    | Date
    | ApiPostBodyObject
    | ApiPostBodyValue[]

export interface ApiPostBodyObject {
    [key: string]: ApiPostBodyValue;
}

export type ApiPostBody = ApiPostBodyObject | ApiPostBodyValue[] | null

/**
 * POST 请求
 */
export async function apiPost<T = unknown>(url: string, body?: ApiPostBody): Promise<T> {
    const res = await apiRequest(url, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
    }
    return res.json()
}

/**
 * PUT 请求
 */
export async function apiPut<T = unknown>(url: string, body?: ApiPostBody): Promise<T> {
    const res = await apiRequest(url, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
    }
    return res.json()
}

/**
 * DELETE 请求
 */
export async function apiDelete<T = unknown>(url: string): Promise<T> {
    const res = await apiRequest(url, { method: 'DELETE' })
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
    }
    return res.json()
}
