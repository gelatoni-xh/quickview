import { apiGet } from '../utils/api';

export interface BlogArticle {
  title: string;
  category: string;
}

export interface BlogContent {
  title: string;
  category: string;
  content: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const KNOWLEDGE_BASE_PATH = '/knowledge_base';
const USE_DIRECT_ACCESS = true;

async function fetchDirectly<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, data: null as any, message: String(error) };
  }
}

export const getCategories = async (): Promise<ApiResponse<string[]>> => {
  if (USE_DIRECT_ACCESS) {
    return fetchDirectly<string[]>(`${KNOWLEDGE_BASE_PATH}/index.json`);
  }
  return apiGet<ApiResponse<string[]>>('/api/blog/categories');
};

export const getArticles = async (category: string): Promise<ApiResponse<BlogArticle[]>> => {
  if (USE_DIRECT_ACCESS) {
    return fetchDirectly<BlogArticle[]>(`${KNOWLEDGE_BASE_PATH}/${category}/index.json`);
  }
  return apiGet<ApiResponse<BlogArticle[]>>(`/api/blog/articles?category=${encodeURIComponent(category)}`);
};

export const getContent = async (category: string, title: string): Promise<ApiResponse<BlogContent>> => {
  if (USE_DIRECT_ACCESS) {
    try {
      const res = await fetch(`${KNOWLEDGE_BASE_PATH}/${category}/${title}.md`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const content = await res.text();
      return { success: true, data: { title, category, content } };
    } catch (error) {
      return { success: false, data: null as any, message: String(error) };
    }
  }
  return apiGet<ApiResponse<BlogContent>>(`/api/blog/content?category=${encodeURIComponent(category)}&title=${encodeURIComponent(title)}`);
};
