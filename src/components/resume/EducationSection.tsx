/**
 * 教育经历组件
 * 
 * 展示教育背景信息
 */

import type { Education } from '../../types/resume';
import ResumeSection from './ResumeSection';

interface EducationSectionProps {
  data: Education[];
}

export default function EducationSection({ data }: EducationSectionProps) {
  return (
    <ResumeSection title="教育经历">
      {data.map((edu, index) => (
        <div key={index} className="mb-4">
          {/* 学校和时间 */}
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{edu.school}</h3>
              <p className="text-sm font-semibold text-gray-600">
                {edu.degree} {edu.college} {edu.major}
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>{edu.startDate} - {edu.endDate}</p>
              <p>{edu.location}</p>
            </div>
          </div>
          
          {/* 亮点 */}
          {edu.highlights.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {edu.highlights.map((highlight, idx) => (
                <li key={idx}>{highlight}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </ResumeSection>
  );
}
