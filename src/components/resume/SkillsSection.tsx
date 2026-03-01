/**
 * 专业技能组件
 * 
 * 展示技能分类和详情
 */

import type { SkillCategory } from '../../types/resume';
import ResumeSection from './ResumeSection';

interface SkillsSectionProps {
  data: SkillCategory[];
}

export default function SkillsSection({ data }: SkillsSectionProps) {
  return (
    <ResumeSection title="专业技能">
      <div className="space-y-2">
        {data.map((category, index) => (
          <div key={index} className="text-sm text-gray-700">
            {/* 技能分类和内容在同一行，分类加粗 */}
            <span className="font-semibold">● {category.category}:</span>
            {' '}
            <span>{category.skills.join(' ')}</span>
          </div>
        ))}
      </div>
    </ResumeSection>
  );
}
