/**
 * 简历头部组件
 *
 * 展示个人基本信息：姓名、联系方式、求职意向、照片
 */

import type { PersonalInfo } from '../../types/resume';

interface ResumeHeaderProps {
  data: PersonalInfo;
}

export default function ResumeHeader({ data }: ResumeHeaderProps) {
  return (
    <header className="mb-4 pb-3">
      <div className="flex justify-between items-start gap-6">
        {/* 左侧：个人信息 */}
        <div className="flex-1">
          {/* 姓名 */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.name}</h1>
          
          {/* 联系信息 - 每项一行 */}
          <div className="flex flex-col gap-0.5 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span>📱</span>
              <span>{data.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✉️</span>
              <span>{data.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{data.location}</span>
            </div>
          </div>
        </div>

        {/* 右侧：照片 */}
        <div className="flex-shrink-0">
          <img
            src="/images/photo-placeholder.jpg"
            alt="个人照片"
            className="w-[118px] h-[165px] object-cover border-2 border-gray-300"
          />
        </div>
      </div>
    </header>
  );
}
