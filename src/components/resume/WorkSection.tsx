/**
 * 工作经历组件
 * 
 * 展示工作经验和项目详情
 */

import type { WorkExperience } from '../../types/resume';
import ResumeSection from './ResumeSection';

interface WorkSectionProps {
  data: WorkExperience[];
}

export default function WorkSection({ data }: WorkSectionProps) {
  return (
    <ResumeSection title="工作经历">
      {data.map((work, index) => (
        <div key={index} className="mb-6">
          {/* 公司和时间 */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{work.company}</h3>
              <p className="text-sm text-gray-600">
                {work.department} {work.position}
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>{work.startDate} - {work.endDate}</p>
              <p>{work.location}</p>
            </div>
          </div>
          
          {/* 项目列表 */}
          <div className="space-y-4">
            {work.projects.map((project, idx) => {
              // 判断是否为子标题（以空格开头）
              const isSubTitle = project.title.startsWith('  ');
              const displayTitle = project.title.trim();
              
              return (
                <div key={idx}>
                  {/* 项目标题 - 根据层级调整样式 */}
                  <h4 className={`font-semibold text-gray-900 mb-2 ${
                    isSubTitle
                      ? 'text-sm ml-4'
                      : 'text-base'
                  }`}>
                    ● {displayTitle}
                  </h4>
                  
                  {/* 项目描述 */}
                  {project.description.length > 0 && (
                    <ul className={`list-none space-y-1 ${isSubTitle ? 'ml-8' : 'ml-4'}`}>
                      {project.description.map((desc, descIdx) => (
                        <li key={descIdx} className="text-sm text-gray-700 leading-relaxed">
                          <span className="text-gray-400 mr-2">○</span>
                          {desc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </ResumeSection>
  );
}
