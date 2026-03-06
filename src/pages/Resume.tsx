/**
 * 简历页面组件
 *
 * 完整的简历展示页面，包含所有简历区块
 * 支持打印导出为 PDF
 * 支持多版本简历管理，从后端API获取数据
 */

import { useState } from 'react';
import { useResumeData } from '../hooks/useResumeData';
import ResumeHeader from '../components/resume/ResumeHeader';
import EducationSection from '../components/resume/EducationSection';
import WorkSection from '../components/resume/WorkSection';
import SkillsSection from '../components/resume/SkillsSection';
import ChangelogModal from '../components/resume/ChangelogModal';

export default function Resume() {
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  
  // 从后端获取简历数据
  const {
    currentResume,
    currentResumeDTO,
    loading,
    error,
    getCurrentVersion,
    getAvailableVersions,
    switchToVersion,
    fetchResumeList
  } = useResumeData();

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载简历数据...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchResumeList}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 无数据状态
  if (!currentResume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">暂无简历数据</h2>
          <p className="text-gray-600 mb-4">请联系管理员添加简历数据</p>
          <button
            onClick={fetchResumeList}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            刷新
          </button>
        </div>
      </div>
    );
  }

  const currentVersion = getCurrentVersion();
  const availableVersions = getAvailableVersions();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 py-8 print:bg-white print:py-0">
      {/* 简历容器 - A4 纸张尺寸 */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none p-12 print:p-8 w-full">
        {/* 控制面板 - 仅在屏幕显示 */}
        <div className="mb-6 print:hidden flex justify-between items-center gap-4 p-4 bg-gray-100 rounded">
          <div className="flex items-center gap-4">
            {/* 版本信息和切换 */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>当前版本:</span>
              <select
                value={currentVersion || ''}
                onChange={(e) => {
                  const version = parseInt(e.target.value);
                  if (!isNaN(version)) {
                    switchToVersion(version);
                  }
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {availableVersions.map(version => (
                  <option key={version} value={version}>
                    v{version}
                  </option>
                ))}
              </select>
              {availableVersions.length > 1 && (
                <span className="text-xs text-gray-500">
                  (共 {availableVersions.length} 个版本)
                </span>
              )}
              
              {/* 变更点按钮 */}
              {currentResumeDTO?.changelog && (
                <button
                  onClick={() => setShowChangelogModal(true)}
                  className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title="查看版本变更点"
                >
                  📝 变更点
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchResumeList}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="刷新数据"
            >
              🔄
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              📄 打印/导出 PDF
            </button>
          </div>
        </div>

        {/* 简历头部 */}
        <ResumeHeader data={currentResume.personal} />

        {/* 教育经历 */}
        <EducationSection data={currentResume.education} />

        {/* 工作经历 */}
        <WorkSection data={currentResume.work} />

        {/* 专业技能 */}
        <SkillsSection data={currentResume.skills} />
      </div>

      {/* 打印样式 */}
      <style>{`
        @media print {
          @page {
            margin: 0.8cm 1cm;
            size: A4;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>

      {/* 变更点弹窗 */}
      <ChangelogModal
        isOpen={showChangelogModal}
        onClose={() => setShowChangelogModal(false)}
        version={currentVersion || 0}
        changelog={currentResumeDTO?.changelog}
      />
    </div>
  );
}
