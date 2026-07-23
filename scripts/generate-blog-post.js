const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('환경변수 GEMINI_API_KEY가 설정되지 않았습니다.');
      return;
    }

    // 1단계: 최신 데이터 확인
    const infoFilePath = path.join(__dirname, '../public/data/city-info.json');
    if (!fs.existsSync(infoFilePath)) {
      console.error('city-info.json 파일이 존재하지 않습니다.');
      return;
    }

    const infoDataContent = fs.readFileSync(infoFilePath, 'utf-8');
    const infoList = JSON.parse(infoDataContent);
    if (!Array.isArray(infoList) || infoList.length === 0) {
      console.error('공공데이터 목록이 비어 있습니다.');
      return;
    }

    // 배열의 마지막 항목(가장 최근 데이터)
    const latestItem = infoList[infoList.length - 1];
    const latestName = latestItem.name || latestItem.serviceNm || '';

    if (!latestName) {
      console.error('최신 데이터에 이름(name) 정보가 없습니다.');
      return;
    }

    // 기존 posts 폴더의 마크다운 파일들과 비교
    const postsDir = path.join(__dirname, '../src/content/posts');
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
      for (const file of files) {
        const fileContent = fs.readFileSync(path.join(postsDir, file), 'utf-8');
        // 파일 본문이나 제목 등에 이미 같은 서비스명이 적혀 있는지 비교
        if (fileContent.includes(latestName)) {
          console.log('이미 작성된 글입니다');
          return;
        }
      }
    } else {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    // 2단계: Gemini AI로 블로그 글 생성
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`;
    const today = new Date().toISOString().split('T')[0];

    const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보:
${JSON.stringify(latestItem, null, 2)}

## 아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:

---
title: (친근하고 흥미로운 제목)
date: ${today}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API 호출 실패: ${response.status} ${response.statusText}\n${errText}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 마크다운 블록이 감싸져 있는 경우 처리
    text = text.replace(/^```markdown\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```$/i, '').trim();

    // FILENAME 정보 추출
    const filenameMatch = text.match(/FILENAME:\s*([^\n\r]+)/i);
    if (!filenameMatch) {
      throw new Error("파일명(FILENAME)을 Gemini 응답에서 찾을 수 없습니다.");
    }

    let filename = filenameMatch[1].trim();
    if (!filename.endsWith('.md')) {
      filename += '.md';
    }

    // 본문에서 FILENAME 라인 제거
    let fileContent = text.replace(/FILENAME:\s*[^\n\r]+/i, '').trim();

    // 3단계: 파일 저장
    const newPostPath = path.join(postsDir, filename);
    fs.writeFileSync(newPostPath, fileContent, 'utf-8');

    console.log('생성 완료');

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

run();
