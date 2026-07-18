import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export async function generateStaticParams() {
  const data = await getCityInfo();
  return data.map((item) => ({
    id: item.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InfoDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getCityInfo();
  const item = data.find((d) => d.id === resolvedParams.id);

  if (!item) {
    notFound();
  }

  const isEvent = item.category === "행사";
  
  const lastUpdated = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col justify-between">
      {/* Header Banner */}
      <header className={`text-white shadow-md transition-all ${
        isEvent 
          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" 
          : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
      }`}>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center sm:text-left">
          <Link href="/" className="inline-flex items-center text-xs font-semibold text-white/80 hover:text-white mb-3 gap-1 transition-colors">
            ← 목록으로 돌아가기
          </Link>
          <div className="mt-1">
            <span className={`inline-block border text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isEvent 
                ? "bg-amber-100/20 text-amber-100 border-amber-300/30" 
                : "bg-emerald-100/20 text-emerald-100 border-emerald-300/30"
            }`}>
              {item.category}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 drop-shadow-sm">
            {item.name}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex-grow w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sm:p-8 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-stone-100 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-medium">📍 장소</span>
              <span className="text-stone-800 font-semibold">{item.location}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-stone-400 font-medium">📅 {isEvent ? "행사 기간" : "신청 기간"}</span>
              <span className="text-stone-800 font-semibold">{item.startDate} ~ {item.endDate}</span>
            </div>
            <div className="flex flex-col sm:col-span-2 gap-1 pt-2">
              <span className="text-stone-400 font-medium">👥 지원 대상</span>
              <span className="text-stone-800 font-semibold">{item.target}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-stone-900">상세 안내</h2>
            <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
              {item.summary}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row gap-3">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 text-center font-bold text-white px-6 py-3 rounded-xl transition-all shadow-sm ${
                isEvent 
                  ? "bg-amber-500 hover:bg-amber-600" 
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              자세히 보기 →
            </a>
            <Link
              href="/"
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-6 py-3 rounded-xl transition-all text-center"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
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
