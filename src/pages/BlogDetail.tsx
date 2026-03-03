import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getContent } from '../services/blogApi';
import type { BlogContent } from '../services/blogApi';

export default function BlogDetail() {
  const { category, title } = useParams<{ category: string; title: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<BlogContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category || !title) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getContent(category, title);
        if (res.success && res.data) {
          setContent(res.data);
        } else {
          setError(res.message || '加载失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [category, title]);

  if (loading) {
    return (
      <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50 via-white to-sky-50">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2 mt-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !content) {
    return (
      <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50 via-white to-sky-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="text-red-500 mb-4">{error || '文章不存在'}</div>
            <button
              onClick={() => navigate('/blog')}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              返回列表
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate('/blog')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← 返回列表
          </button>
        </div>
        
        <div className="bg-white rounded-xl border shadow-sm p-8">
          <div className="mb-6 pb-4 border-b">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
            <div className="text-sm text-gray-500">分类: {content.category}</div>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown>{content.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </main>
  );
}
