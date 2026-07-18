import fs from "fs/promises";
import path from "path";
import Link from "next/link";

interface CityInfoItem {
  id: string;
  name: string;
  category: "행사" | "혜택";
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  link: string;
}

async function getCityInfo(): Promise<CityInfoItem[]> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "city-info.json");
    const jsonData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Failed to read city-info.json:", error);
    return [];
  }
}

export default async function Home() {
  const data = await getCityInfo();
  const events = data.filter((item) => item.category === "행사");
  const benefits = data.filter((item) => item.category === "혜택");

  // Format current local date for the footer
  const lastUpdated = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col justify-between">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="bg-amber-100/20 text-amber-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              우리 동네 실시간 소식
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 drop-shadow-sm">
              성남시 생활 정보
            </h1>
            <p className="mt-2 text-amber-50/90 text-sm sm:text-base max-w-xl">
              행사/축제 정보와 나에게 딱 맞는 혜택/지원금을 한눈에 확인하고 혜택을 놓치지 마세요!
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/blog/"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors border border-white/20 text-sm"
            >
              블로그 소식 보기
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Events/Festivals Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
              <span className="text-2xl">🎉</span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                이번 달 행사 / 축제
              </h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {events.length}건
              </span>
            </div>

            <div className="space-y-4">
              {events.map((item) => (
                <Link
                  key={item.id}
                  href="/blog"
                  className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 hover:shadow-md hover:border-amber-200 transition-all flex flex-col justify-between block group cursor-pointer"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2 py-0.5 rounded">
                        행사
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        📍 {item.location}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm text-stone-600 line-clamp-3">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-stone-500">
                    <div>
                      <span className="font-semibold text-stone-700">일정: </span>
                      {item.startDate} ~ {item.endDate}
                    </div>
                    <div>
                      <span className="font-semibold text-stone-700">대상: </span>
                      {item.target}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Subsidies/Benefits Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-emerald-200 pb-3">
              <span className="text-2xl">💰</span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                지원금 / 혜택 정보
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {benefits.length}건
              </span>
            </div>

            <div className="space-y-4">
              {benefits.map((item) => (
                <Link
                  key={item.id}
                  href="/blog"
                  className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between block group cursor-pointer"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2 py-0.5 rounded">
                        혜택
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        📍 {item.location}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm text-stone-600 line-clamp-3">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-stone-500">
                    <div>
                      <span className="font-semibold text-stone-700">기한: </span>
                      {item.startDate} ~ {item.endDate}
                    </div>
                    <div>
                      <span className="font-semibold text-stone-700">대상: </span>
                      {item.target}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
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
