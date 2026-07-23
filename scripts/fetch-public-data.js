const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!PUBLIC_DATA_API_KEY || !GEMINI_API_KEY) {
      console.error('환경변수 PUBLIC_DATA_API_KEY 또는 GEMINI_API_KEY가 설정되지 않았습니다.');
      return;
    }

    // 1단계: 공공데이터포털 API에서 데이터 가져오기
    const url = `https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON&serviceKey=${encodeURIComponent(PUBLIC_DATA_API_KEY)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Infuser ${PUBLIC_DATA_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`공공데이터 API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const resJson = await response.json();
    const dataList = resJson.data || [];

    if (dataList.length === 0) {
      console.log('가져온 공공데이터가 없습니다.');
      return;
    }

    // 필터링 규칙 적용
    const filterByKeyword = (list, keyword) => {
      return list.filter(item => {
        const name = item['서비스명'] || item.serviceNm || '';
        const summary = item['서비스목적요약'] || item.servicePurpSmmr || '';
        const target = item['지원대상'] || item.supportTarget || '';
        const org = item['소관기관명'] || item.jurisOrgNm || '';
        
        return [name, summary, target, org].some(val => val && val.toString().includes(keyword));
      });
    };

    let filtered = filterByKeyword(dataList, '성남');
    if (filtered.length === 0) {
      filtered = filterByKeyword(dataList, '경기');
    }
    if (filtered.length === 0) {
      filtered = dataList;
    }

    // 2단계: 기존 데이터와 비교
    const filePath = path.join(__dirname, '../public/data/city-info.json');
    let existingList = [];
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        existingList = JSON.parse(fileContent);
        if (!Array.isArray(existingList)) {
          existingList = [];
        }
      }
    } catch (e) {
      existingList = [];
    }

    const existingNames = new Set(existingList.map(item => item.name));
    
    // 신규 항목 필터링
    const newItems = filtered.filter(item => {
      const name = item['서비스명'] || item.serviceNm || '';
      return name && !existingNames.has(name);
    });

    if (newItems.length === 0) {
      console.log('새로운 데이터가 없습니다.');
      return;
    }

    // 새 항목 1개 선정
    const targetItem = newItems[0];

    // 3단계: Gemini AI로 새 항목 가공
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const today = new Date().toISOString().split('T')[0];
    const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜 (${today}), endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터:
${JSON.stringify(targetItem, null, 2)}`;

    const geminiResponse = await fetch(geminiUrl, {
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

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API 호출 실패: ${geminiResponse.status} ${geminiResponse.statusText}`);
    }

    const geminiResJson = await geminiResponse.json();
    let text = geminiResJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // 마크다운 코드 블록 제거 및 JSON 파싱
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedItem;
    try {
      parsedItem = JSON.parse(text);
    } catch (e) {
      throw new Error(`Gemini 응답 JSON 파싱 실패: ${e.message}\n응답 텍스트: ${text}`);
    }

    // ID 부여 (기존 최댓값 + 1)
    const nextId = Math.max(...existingList.map(item => Number(item.id) || 0), 0) + 1;
    parsedItem.id = nextId;

    // 4단계: 기존 데이터에 추가
    existingList.push(parsedItem);

    // 디렉토리가 없을 수도 있으니 생성
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(existingList, null, 2), 'utf-8');
    console.log(`성공적으로 데이터를 추가했습니다: ${parsedItem.name}`);

  } catch (error) {
    console.error('오류 발생:', error.message);
    // 에러 발생 시 기존 파일을 유지하므로 추가 작업 없음
  }
}

run();
