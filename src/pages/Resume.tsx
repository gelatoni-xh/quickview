/**
 * 简历页面组件
 *
 * 完整的简历展示页面，包含所有简历区块
 * 支持打印导出为 PDF，可选单页或多页模式
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
  const [singlePage, setSinglePage] = useState(false);
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
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
      {/* 简历容器 - A4 纸张尺寸 */}
      <div className={`max-w-4xl mx-auto bg-white shadow-lg print:shadow-none p-12 print:p-8 ${singlePage ? 'print:text-xs print:p-6' : ''}`}>
        {/* 控制面板 - 仅在屏幕显示 */}
        <div className="mb-6 print:hidden flex justify-between items-center gap-4 p-4 bg-gray-100 rounded">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={singlePage}
                onChange={(e) => setSinglePage(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">单页模式（压缩内容到一页）</span>
            </label>
            
            {/* 版本信息和切换 */}
            <div className="flex items-center gap-2 text-sm text-gray-600 ml-4">
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
          /* 移除浏览器默认的页眉页脚 */
          @page {
            margin: 0.8cm 1cm;
            size: A4;
          }
          
          /* 隐藏浏览器打印时的页眉页脚 */
          body {
            margin: 0;
            padding: 0;
          }
          
          /* 单页模式：激进压缩所有内容到一页 */
          ${singlePage ? `
            /* 整体容器 - 正文基础字体 */
            .max-w-4xl {
              font-size: 0.65rem !important;
              line-height: 1.3 !important;
              padding: 0.5cm !important;
            }
            
            /* 标题字体层级 - 确保上级大于下级 */
            .max-w-4xl h1 {
              font-size: 1.25rem !important;
              line-height: 1.2 !important;
              margin-bottom: 0.3rem !important;
            }
            
            .max-w-4xl h2 {
              font-size: 1.1rem !important;
              line-height: 1.2 !important;
              margin-bottom: 0.25rem !important;
              margin-top: 0.4rem !important;
            }
            
            .max-w-4xl h3 {
              font-size: 0.9rem !important;
              line-height: 1.2 !important;
              margin-bottom: 0.2rem !important;
              margin-top: 0.3rem !important;
            }
            
            .max-w-4xl h4 {
              font-size: 0.8rem !important;
              line-height: 1.2 !important;
              margin-bottom: 0.15rem !important;
              margin-top: 0.25rem !important;
            }
            
            .max-w-4xl h5 {
              font-size: 0.75rem !important;
              line-height: 1.2 !important;
              margin-bottom: 0.1rem !important;
              margin-top: 0.2rem !important;
            }
            
            /* 段落和列表 */
            .max-w-4xl p {
              margin-bottom: 0.15rem !important;
              line-height: 1.3 !important;
            }
            
            .max-w-4xl ul, .max-w-4xl ol {
              margin-bottom: 0.2rem !important;
              padding-left: 1rem !important;
            }
            
            .max-w-4xl li {
              margin-bottom: 0.1rem !important;
              line-height: 1.3 !important;
            }
            
            /* 区块间距 */
            .max-w-4xl > div {
              margin-bottom: 0.4rem !important;
            }
            
            /* 照片区域 */
            .max-w-4xl img {
              width: 80px !important;
              height: 112px !important;
            }
            
            /* 表格和其他元素 */
            .max-w-4xl table {
              font-size: inherit !important;
            }
            
            .max-w-4xl .text-xs {
              font-size: 0.6rem !important;
            }
            
            .max-w-4xl .text-sm {
              font-size: 0.65rem !important;
            }
            
            /* 强制单页 - 防止分页 */
            .max-w-4xl * {
              page-break-inside: avoid !important;
            }
            
            .max-w-4xl {
              page-break-inside: avoid !important;
              height: auto !important;
              max-height: none !important;
            }
          ` : ''}
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
