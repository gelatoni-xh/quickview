/**
 * 简历版本管理
 * 
 * 自动检测并加载最新版本的简历数据
 * 约定：resumeData2.ts > resumeData3.ts > resumeData4.ts ...
 * 数字越大，版本越新
 */

import type { ResumeData } from '../types/resume';

// 动态导入所有简历数据文件
const resumeModules = import.meta.glob('./resumeData*.ts', { eager: true });

interface ResumeModule {
  resumeData: ResumeData;
}

/**
 * 获取所有可用的简历版本
 */
export function getAvailableVersions(): number[] {
  const versions: number[] = [];
  
  Object.keys(resumeModules).forEach(path => {
    // 匹配 resumeData2.ts, resumeData3.ts 等
    const match = path.match(/resumeData(\d+)\.ts$/);
    if (match) {
      versions.push(parseInt(match[1]));
    }
  });
  
  // 按版本号降序排序（最新的在前）
  return versions.sort((a, b) => b - a);
}

/**
 * 获取指定版本的简历数据
 */
export function getResumeDataByVersion(version: number): ResumeData | null {
  const modulePath = `./resumeData${version}.ts`;
  const module = resumeModules[modulePath] as ResumeModule | undefined;
  
  return module?.resumeData || null;
}

/**
 * 获取最新版本的简历数据
 */
export function getLatestResumeData(): ResumeData {
  const versions = getAvailableVersions();
  
  // 如果有版本号文件，返回最新的
  if (versions.length > 0) {
    const latestVersion = versions[0];
    const data = getResumeDataByVersion(latestVersion);
    if (data) {
      return data;
    }
  }
  
  // 否则返回默认的 resumeData.ts
  const defaultModule = resumeModules['./resumeData.ts'] as ResumeModule;
  return defaultModule.resumeData;
}

/**
 * 获取当前使用的版本号
 */
export function getCurrentVersion(): number | 'default' {
  const versions = getAvailableVersions();
  return versions.length > 0 ? versions[0] : 'default';
}
