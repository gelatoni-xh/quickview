import { useState, useEffect } from 'react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: number;
  changelog?: string;
}

/**
 * 版本变更点弹窗组件
 * 
 * 显示指定版本的changelog，支持Markdown格式渲染
 */
export default function ChangelogModal({ isOpen, onClose, version, changelog }: ChangelogModalProps) {
  const [renderedContent, setRenderedContent] = useState<string>('');

  useEffect(() => {
    if (changelog) {
      let content = changelog
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
        .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
        .replace(/\n/g, '<br/>');
      
      setRenderedContent(content);
    } else {
      setRenderedContent('');
    }
  }, [changelog]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            版本 v{version} 变更点
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="关闭"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {changelog ? (
            <div 
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>此版本暂无变更记录</p>
            </div>
          )}
        </div>

        {/* 弹窗底部 */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}