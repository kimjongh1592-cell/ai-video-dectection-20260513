// --- 1. 전역 변수 세팅 ---
let testStartTime; 
let currentVideoIndex = 0; 
let testSet = []; 

// --- 2. 영상 데이터베이스 (총 30개: 진짜 15개, 가짜 15개 고정) ---
const database = [
    { id: 'v1_R', type: 'real' }, { id: 'v2_R', type: 'real' }, { id: 'v3_R', type: 'real' },
    { id: 'v4_R', type: 'real' }, { id: 'v5_R', type: 'real' }, { id: 'v6_R', type: 'real' },
    { id: 'v7_R', type: 'real' }, { id: 'v8_R', type: 'real' }, { id: 'v9_R', type: 'real' },
    { id: 'v10_R', type: 'real' }, { id: 'v11_R', type: 'real' }, { id: 'v12_R', type: 'real' },
    { id: 'v13_R', type: 'real' }, { id: 'v14_R', type: 'real' }, { id: 'v15_R', type: 'real' },

    { id: 'v1_F', type: 'fake' }, { id: 'v2_F', type: 'fake' }, { id: 'v3_F', type: 'fake' },
    { id: 'v4_F', type: 'fake' }, { id: 'v5_F', type: 'fake' }, { id: 'v6_F', type: 'fake' },
    { id: 'v7_F', type: 'fake' }, { id: 'v8_F', type: 'fake' }, { id: 'v9_F', type: 'fake' },
    { id: 'v10_F', type: 'fake' }, { id: 'v11_F', type: 'fake' }, { id: 'v12_F', type: 'fake' },
    { id: 'v13_F', type: 'fake' }, { id: 'v14_F', type: 'fake' }, { id: 'v15_F', type: 'fake' }
];

function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- 3. 실험 시작: 그룹 A/B 분기 ---
function startExperiment() {
    const name = document.getElementById('userName').value;
    const age = document.getElementById('userAge').value;
    const group = document.getElementById('userGroup').value;

    if (!name || !age) return alert("정보를 모두 입력해주세요.");
    if (!document.getElementById('privacyConsent').checked) return alert("개인정보 수집에 동의해주셔야 실험에 참여할 수 있습니다.");

    localStorage.removeItem('testResults');
    localStorage.removeItem('surveyAnswer'); 
    localStorage.setItem('userName', name);
    localStorage.setItem('userAge', age);
    localStorage.setItem('userGroup', group);

    testSet = shuffleArray(database);

    if (group === 'A') {
        showPage('pageGuideline');
    } else {
        startReadyCountdown();
    }
}

// --- 4. 카운트다운 ---
function startReadyCountdown() {
    const cdTitle = document.getElementById('countdownTitle');
    
    cdTitle.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; gap: 20px;">
            <div style="font-size: 1.1em; white-space: nowrap;">무작위로 섞인 30개의 영상이 제공됩니다.</div>
            <div style="color:#ff4d4d; font-size: 1.2em; font-weight: bold; white-space: nowrap;">각 영상에 대해 AI 영상 여부를 판별해주세요.</div>
            <div style="font-size: 1.1em; font-weight: bold; white-space: nowrap;">최대한 빠르게 수행하되, 정확하게 진행해주세요.</div>
        </div>
    `;

    showPage('pageCountdown');
    let count = 5; 
    document.getElementById('cdText').innerText = count;
    
    const timer = setInterval(() => {
        count--;
        if (count === 0) {
            clearInterval(timer);
            renderTest(); 
        } else {
            document.getElementById('cdText').innerText = count;
        }
    }, 1000);
}

// --- 5. 영상 테스트 렌더링 ---
function renderTest() {
    showPage('pageTest');
    const list = document.getElementById('testList');
    list.innerHTML = '';
    currentVideoIndex = 0;

    const questionText = "이 영상은 AI 영상인가요?";
    const btn1Text = "진짜 영상";
    const btn2Text = "모르겠다 / 판단 불가";
    const btn3Text = "AI 영상";

    testSet.forEach((v, index) => {
        const item = document.createElement('div');
        item.className = 'short-item';
        item.id = `video-item-${index}`;

        item.innerHTML = `
            <div style="width:100%; height:60%; pointer-events:none; margin-top:-50px;">
                <video width="100%" height="100%" autoplay loop muted playsinline style="object-fit: cover; border-radius: 10px;">
                    <source src="videos/${v.id}.mp4" type="video/mp4">
                </video>
            </div>
            <div class="container" style="margin-top:20px;">
                <p style="margin-top:0; margin-bottom:15px; font-weight:bold; color:#ff4d4d; font-size:18px;">${questionText}</p>
                <div class="rate-container" style="flex-direction: column; gap: 10px;">
                    <button class="rate-btn" onclick="submitScore(${index}, '${v.id}', '${v.type}', 1)">${btn1Text}</button>
                    <button class="rate-btn" onclick="submitScore(${index}, '${v.id}', '${v.type}', 2)" style="background:#555;">${btn2Text}</button>
                    <button class="rate-btn" onclick="submitScore(${index}, '${v.id}', '${v.type}', 3)">${btn3Text}</button>
                </div>
            </div>
        `;
        list.appendChild(item);
    });

    testStartTime = performance.now();
}

// --- 6. 점수 제출 및 페이지 전환 ---
function submitScore(index, videoId, actualType, userScore) {
    const occurrenceTime = ((performance.now() - testStartTime) / 1000).toFixed(2);
    const isActualFake = (actualType === 'fake');
    
    let guessedFake = (userScore === 3);
    let guessedReal = (userScore === 1);
    const isFalsePositive = (!isActualFake && guessedFake);

    const result = {
        order: index + 1,
        videoId: videoId,
        actualType: actualType,
        score: userScore, 
        timeSeconds: parseFloat(occurrenceTime), 
        guessedFake: guessedFake,
        guessedReal: guessedReal,
        isFP: isFalsePositive
    };

    const currentData = JSON.parse(localStorage.getItem('testResults') || '[]');
    currentData.push(result);
    localStorage.setItem('testResults', JSON.stringify(currentData));

    setTimeout(() => {
        if (currentVideoIndex < testSet.length - 1) {
            currentVideoIndex++;
            const nextVideoElement = document.getElementById(`video-item-${currentVideoIndex}`);
            if (nextVideoElement) {
                nextVideoElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            testStartTime = performance.now();
        } else {
            // A, B 그룹 모두 pageEnd(수고하셨습니다)로 이동
            showPage('pageEnd'); 
        }
    }, 200);
}

// --- 7. 영상 모두 종료 후 안내 페이지(pageEnd)에서 사후 설문으로 이동 ---
function proceedFromEnd() {
    showPage('pageSurvey'); 
}

// --- 8. 사후 설문(주관식) 제출 처리 ---
function submitSurvey() {
    let answer = document.getElementById('surveyTextarea').value.trim();

    if(answer === "") {
        alert("판별 시 주의 깊게 본 요소를 간단히 작성해주세요.");
        return;
    }

    // 엑셀(CSV) 파일 포맷이 깨지지 않도록 줄바꿈은 공백으로, 쉼표는 슬래시로 변환
    answer = answer.replace(/\n/g, " ").replace(/,/g, " / ");

    localStorage.setItem('surveyAnswer', answer);
    showScorecard();
}

// --- 9. 최종 결과 화면 (B그룹은 결과 숨김) ---
function showScorecard() {
    const group = localStorage.getItem('userGroup');
    const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    
    let correctCount = 0; 
    let falsePositiveCount = 0; 
    let totalRealVideos = 0;    

    testResults.forEach(res => {
        if(res.actualType === 'real') totalRealVideos++;
        if(res.isFP) falsePositiveCount++;
        
        let correct = (res.actualType === 'fake' && res.guessedFake) || (res.actualType === 'real' && res.guessedReal);
        if(correct) correctCount++;
    });

    const accuracy = Math.round((correctCount / 30) * 100);
    const fpRate = totalRealVideos > 0 ? Math.round((falsePositiveCount / totalRealVideos) * 100) : 0;

    let scoreHtml = '';

    if (group === 'A') {
        scoreHtml = `
            <p><strong>[A 실험군 (가이드라인 O)]</strong></p>
            <p>판별 일치율 (Accuracy): <span style="color:#4CAF50; font-size:18px; font-weight:bold;">${accuracy}%</span> (${correctCount}개 / 30개)</p>
            <p style="color:#ff4d4d; margin-top:15px;">멀쩡한 진짜 영상을 AI(가짜)로 오해한 횟수:</p>
            <p><b>${falsePositiveCount}번</b> 오해함 (총 ${totalRealVideos}개의 진짜 영상 중 / <span style="color:#ff4d4d;">${fpRate}%</span>)</p>
        `;
    } else {
        scoreHtml = `
            <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #4CAF50;">모든 평가가 완료되었습니다.</p>
            <p style="color:#ddd; font-size:15px; margin-top:15px; line-height: 1.6;">본 실험에 참여해주셔서 감사합니다.<br><br>아래 버튼을 눌러 결과 파일을 다운로드한 뒤 연구자에게 전송해주세요.</p>
        `;
    }

    document.getElementById('scoreResult').innerHTML = scoreHtml;
    showPage('pageResult');
}

// --- 10. 결과 엑셀(CSV) 다운로드 (사후 설문을 맨 밑 요약으로 이동) ---
function downloadCSV() {
    const name = localStorage.getItem('userName') || '익명';
    const age = localStorage.getItem('userAge') || '알수없음';
    const group = localStorage.getItem('userGroup') || '알수없음';
    const surveyAnswer = localStorage.getItem('surveyAnswer') || '응답없음'; 
    
    const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');

    let correctCount = 0; 
    let falsePositiveCount = 0; 
    let totalRealVideos = 0;
    
    let totalSpentTime = 0; 
    let maxTime = 0;            
    let maxTimeVideoId = '';    

    // 상단 데이터 헤더에서 사후설문응답 칸을 제거해서 깔끔하게 유지
    let csvContent = "이름,나이,실험그룹,영상순서,영상ID,실제데이터(Real/Fake),응답버튼(1진짜/2모름/3가짜),발생 시간(초),사용자판별해석,오탐(FalsePositive)여부\n";

    testResults.forEach((res) => {
        if(res.actualType === 'real') totalRealVideos++;
        if(res.isFP) falsePositiveCount++;
        
        totalSpentTime += res.timeSeconds; 
        if (res.timeSeconds > maxTime) {
            maxTime = res.timeSeconds;
            maxTimeVideoId = res.videoId;
        }

        let correct = (res.actualType === 'fake' && res.guessedFake) || (res.actualType === 'real' && res.guessedReal);
        if(correct) correctCount++;

        let userGuessed = "판단보류";
        if(res.score === 1) userGuessed = "진짜로 판별";
        if(res.score === 3) userGuessed = "AI로 판별";
        
        // 개별 행 데이터에서도 사후 설문을 뺌
        let row = [
            name,
            age,
            group,
            res.order,
            res.videoId,
            res.actualType,
            res.score,
            res.timeSeconds.toFixed(2),
            userGuessed,
            res.isFP ? "O" : "X"
        ];
        csvContent += row.join(",") + "\n";
    });

    const accuracy = Math.round((correctCount / 30) * 100);
    const fpRate = totalRealVideos > 0 ? Math.round((falsePositiveCount / totalRealVideos) * 100) : 0;

    // 요약 파트에 시간 정보와 사후 설문을 차례대로 배치
    csvContent += "\n=== [실험 결과 요약 (연구자 분석용)] ===\n";
    csvContent += `총 정답률 (Accuracy),${accuracy}%,(${correctCount} / 30)\n`;
    csvContent += `총 오탐률 (False Positive Rate),${fpRate}%,(${falsePositiveCount} / ${totalRealVideos})\n`;
    csvContent += `총 소요 시간 (Total Spent Time),${totalSpentTime.toFixed(2)}초\n`;
    csvContent += `가장 오래 걸린 시간 (Max Time),${maxTime.toFixed(2)}초,(해당 영상 ID: ${maxTimeVideoId})\n`;
    csvContent += `사후 설문 응답 (주관식),${surveyAnswer}\n`; // 여기에 한 번만 출력

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `HCI_최종결과_${group}그룹_${name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}