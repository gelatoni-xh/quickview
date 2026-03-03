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

export const getCategories = () => apiGet<ApiResponse<string[]>>('/api/blog/categories');

export const getArticles = (category: string) =>
  apiGet<ApiResponse<BlogArticle[]>>(`/api/blog/articles?category=${encodeURIComponent(category)}`);

export const getContent = (category: string, title: string) =>
  apiGet<ApiResponse<BlogContent>>(`/api/blog/content?category=${encodeURIComponent(category)}&title=${encodeURIComponent(title)}`);
