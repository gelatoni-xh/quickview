import { useState, useEffect } from 'react';
import { ResumeApiService } from '../services/resumeApi';
import type { ResumeDTO, ResumeData } from '../types/resume';

/**
 * 简历数据Hook
 */
export const useResumeData = () => {
  const [resumeList, setResumeList] = useState<ResumeDTO[]>([]);
  const [currentResume, setCurrentResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取简历列表
  const fetchResumeList = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await ResumeApiService.getResumeList();
      setResumeList(list);
      
      // 如果有简历数据，解析最新版本的简历
      if (list.length > 0) {
        const latestResume = list[0]; // 已按版本号倒序排列
        try {
          const resumeData = JSON.parse(latestResume.resumeData) as ResumeData;
          setCurrentResume(resumeData);
        } catch (parseError) {
          console.error('解析简历数据失败:', parseError);
          setError('简历数据格式错误');
        }
      } else {
        setCurrentResume(null);
      }
    } catch (err) {
      console.error('获取简历数据失败:', err);
      setError(err instanceof Error ? err.message : '获取简历数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换到指定版本的简历
  const switchToVersion = (version: number) => {
    const targetResume = resumeList.find(resume => resume.version === version);
    if (targetResume) {
      try {
        const resumeData = JSON.parse(targetResume.resumeData) as ResumeData;
        setCurrentResume(resumeData);
      } catch (parseError) {
        console.error('解析简历数据失败:', parseError);
        setError('简历数据格式错误');
      }
    }
  };

  // 获取当前版本号
  const getCurrentVersion = (): number | null => {
    if (!currentResume || resumeList.length === 0) return null;
    
    // 通过比较数据内容找到当前版本
    const currentResumeStr = JSON.stringify(currentResume);
    const matchedResume = resumeList.find(resume => resume.resumeData === currentResumeStr);
    return matchedResume?.version || null;
  };

  // 获取可用版本列表
  const getAvailableVersions = (): number[] => {
    return resumeList.map(resume => resume.version).sort((a, b) => b - a);
  };

  useEffect(() => {
    fetchResumeList();
  }, []);

  return {
    resumeList,
    currentResume,
    loading,
    error,
    fetchResumeList,
    switchToVersion,
    getCurrentVersion,
    getAvailableVersions,
  };
};