/**
 * 简历区块组件
 * 
 * 通用的简历区块容器，包含标题和内容区域
 */

interface ResumeSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function ResumeSection({ title, children }: ResumeSectionProps) {
  return (
    <section className="mb-6">
      {/* 区块标题 */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      
      {/* 区块内容 */}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}
