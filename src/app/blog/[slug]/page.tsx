import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  
  if (!post) {
    return {
      title: "포스트를 찾을 수 없습니다",
    };
  }

  return {
    title: `${post.title} | 성남시 생활 정보 블로그`,
    description: post.summary,
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const lastUpdated = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col justify-between">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center sm:text-left">
          <Link
            href="/blog/"
            className="inline-flex items-center text-xs font-semibold text-amber-100 hover:text-white mb-3 gap-1 transition-colors"
          >
            ← 블로그 목록으로 돌아가기
          </Link>
          <div className="mt-1 flex justify-center sm:justify-start items-center gap-2">
            <span className="bg-amber-100/20 text-amber-100 border border-amber-300/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-amber-100/90 font-medium">
              📅 {post.date}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 drop-shadow-sm leading-tight">
            {post.title}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex-grow w-full">
        <article className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sm:p-10 space-y-8">
          
          {/* Post Summary Alert */}
          {post.summary && (
            <div className="bg-amber-50/50 border-l-4 border-amber-500 p-4 rounded-r-xl">
              <p className="text-sm text-stone-700 leading-relaxed italic">
                {post.summary}
              </p>
            </div>
          )}

          {/* Markdown Content */}
          <div className="prose prose-stone max-w-none prose-headings:font-bold prose-a:text-amber-600 hover:prose-a:text-amber-700 prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="pt-6 border-t border-stone-100">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-stone-50 text-stone-600 text-xs font-medium px-3 py-1 rounded-lg border border-stone-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/blog/"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm text-center"
            >
              블로그 목록 보기
            </Link>
            <Link
              href="/"
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-6 py-3 rounded-xl transition-all text-center"
            >
              실시간 소식 홈으로
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 text-stone-500 py-8 text-xs sm:text-sm">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-stone-700">우리 동네 생활 정보 서비스</p>
            <p className="mt-1">
              데이터 출처: 공공데이터포털 (<a href="https://www.data.go.kr" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-700">data.go.kr</a>)
            </p>
          </div>
          <div>
            <p>마지막 업데이트: {lastUpdated}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
