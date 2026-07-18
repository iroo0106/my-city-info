import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "동네 소식 블로그 | 성남시 생활 정보",
  description: "우리 동네의 실시간 축제, 행사 및 생활 밀착형 혜택 정보 블로그 소식을 만나보세요.",
};

export default async function BlogListPage() {
  const posts = await getAllPosts();

  const lastUpdated = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col justify-between">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-xs font-semibold text-amber-100 hover:text-white mb-2 gap-1 transition-colors"
            >
              ← 홈으로 돌아가기
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
              동네 소식 블로그
            </h1>
            <p className="mt-2 text-amber-50/90 text-sm sm:text-base max-w-xl">
              성남시의 최신 행사, 유익한 혜택 및 유용한 생활 정보를 깊이 있게 소개합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors border border-white/20 text-sm"
            >
              실시간 소식 보기
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12 flex-grow w-full">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-100 shadow-sm">
            <span className="text-4xl">✍️</span>
            <h3 className="mt-4 text-lg font-bold text-stone-900">등록된 포스트가 없습니다</h3>
            <p className="mt-2 text-sm text-stone-500">곧 유익한 생활 소식을 들고 찾아오겠습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-2xl shadow-sm border border-stone-100 hover:shadow-md hover:border-amber-200 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Category & Date */}
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <time className="text-xs text-stone-400 font-medium">
                      📅 {post.date}
                    </time>
                  </div>
                  
                  {/* Title */}
                  <Link href={`/blog/${post.slug}/`} className="block">
                    <h2 className="text-xl font-bold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Summary */}
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                {/* Footer and Tags */}
                <div className="px-6 pb-6 pt-4 border-t border-stone-50 flex flex-col gap-3">
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-stone-50 text-stone-500 text-[10px] font-medium px-2 py-0.5 rounded border border-stone-100"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/blog/${post.slug}/`}
                    className="text-amber-600 hover:text-amber-700 text-xs font-bold inline-flex items-center gap-1 mt-1 transition-colors"
                  >
                    더 읽어보기 →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 text-stone-500 py-8 text-xs sm:text-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-stone-700">우리 동네 생활 정보 서비스</p>
            <p className="mt-1">
              데이터 출처: 공공데이터포털 (<a href="https://www.data.go.kr" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-700">data.go.kr</a>)
            </p>
          </div>
          <div>
            <p>마지막 업데이트: {lastUpdated}</p>
            <p className="mt-1 text-[10px] text-stone-400">© 2026 My City Info. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
