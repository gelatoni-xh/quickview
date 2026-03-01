import { apiGet } from '../utils/api';
import type { ResumeDTO } from '../types/resume';

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
      const result = await apiGet<{success: boolean, data: ResumeDTO[], message?: string}>('/api/resume/list');
      
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