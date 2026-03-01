/**
 * 简历数据类型定义
 */

export interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
  position: string;
}

export interface Education {
  school: string;
  degree: string;
  major: string;
  college: string;
  startDate: string;
  endDate: string;
  location: string;
  highlights: string[];
}

export interface WorkExperience {
  company: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  location: string;
  projects: WorkProject[];
}

export interface WorkProject {
  title: string;
  description: string[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface ResumeData {
  personal: PersonalInfo;
  education: Education[];
  work: WorkExperience[];
  skills: SkillCategory[];
}

export interface ResumeDTO {
  id: number;
  version: number;
  name: string;
  resumeData: string; // JSON字符串
  createTime: string;
  updateTime: string;
}
