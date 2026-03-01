import type { ResumeDTO } from '../types/resume';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 简历API服务
 */
export class ResumeApiService {
  
  /**
   * 获取简历列表
   * 按版本号倒序排列
   */
  static async getResumeList(): Promise<ResumeDTO[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data || [];
      } else {
        throw new Error(result.message || '获取简历列表失败');
      }
    } catch (error) {
      console.error('获取简历列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取最新版本的简历数据
   */
  static async getLatestResume(): Promise<ResumeDTO | null> {
    const resumeList = await this.getResumeList();
    return resumeList.length > 0 ? resumeList[0] : null;
  }
}