import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getArticles } from '../services/blogApi';
import type { BlogArticle } from '../services/blogApi';

export default function Blog() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setSelectedCategory(res.data[0]);
          }
        } else {
          setError(res.message || '加载分类失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getArticles(selectedCategory);
        if (res.success && res.data) {
          setArticles(res.data);
        } else {
          setError(res.message || '加载文章失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory]);

  return (
    <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">博客</h1>
        <p className="text-sm text-gray-500 mt-1">知识库文章列表</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold">分类</h2>
            </div>
            <div className="p-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
              {categories.length === 0 && !loading && (
                <div className="px-3 py-2 text-sm text-gray-400">暂无分类</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold">{selectedCategory || '文章列表'}</h2>
            </div>

            {loading && (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="p-6 text-sm text-red-500">{error}</div>
            )}

            {!loading && !error && (
              <div className="divide-y">
                {articles.map((article) => (
                  <button
                    key={`${article.category}-${article.title}`}
                    onClick={() => navigate(`/blog/${article.category}/${article.title}`)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{article.title}</div>
                  </button>
                ))}
                {articles.length === 0 && (
                  <div className="p-6 text-sm text-gray-400">该分类下暂无文章</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
