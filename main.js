
class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --delay: 0ms;
                    --size: 52px;
                    display: inline-block;
                }
                .ball {
                    position: relative;
                    width: var(--size);
                    height: var(--size);
                    border-radius: 50%;
                    background: var(--ball-grad, #f8f9fa);
                    border: 1px solid var(--ball-ring, rgba(0, 0, 0, 0.08));
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--ball-text, #212529);
                    box-shadow: var(--shadow, 0 12px 24px rgba(0, 0, 0, 0.16));
                    transform-origin: center;
                    animation:
                        pop-in 650ms var(--delay) cubic-bezier(0.16, 1, 0.3, 1) both,
                        wobble 900ms calc(var(--delay) + 120ms) ease-in-out both;
                }

                .ball::after {
                    content: '';
                    position: absolute;
                    inset: -8px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.55), transparent 70%);
                    opacity: 0;
                    animation: glow 700ms calc(var(--delay) + 120ms) ease-out both;
                    pointer-events: none;
                }

                .ball.nudge {
                    animation: tap 420ms ease-out;
                }

                @keyframes pop-in {
                    0% {
                        transform: translateY(-24px) scale(0.6) rotate(-12deg);
                        opacity: 0;
                    }
                    60% {
                        transform: translateY(6px) scale(1.08) rotate(3deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(0) scale(1) rotate(0);
                    }
                }

                @keyframes wobble {
                    0% { transform: translateY(0) scale(1) rotate(0); }
                    35% { transform: translateY(-4px) scale(1.02) rotate(6deg); }
                    70% { transform: translateY(2px) scale(0.98) rotate(-5deg); }
                    100% { transform: translateY(0) scale(1) rotate(0); }
                }

                @keyframes glow {
                    0% { opacity: 0; transform: scale(0.6); }
                    50% { opacity: 0.9; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.15); }
                }

                @keyframes tap {
                    0% { transform: scale(1); }
                    40% { transform: scale(1.08); }
                    100% { transform: scale(1); }
                }
            </style>
            <div class="ball">${number}</div>
        `;

        const ball = this.shadowRoot.querySelector('.ball');
        ball.addEventListener('pointerdown', () => {
            ball.classList.remove('nudge');
            void ball.offsetWidth;
            ball.classList.add('nudge');
        });
    }
}

customElements.define('lotto-ball', LottoBall);

const themeToggleBtn = document.getElementById('theme-toggle');
const setTheme = (theme) => {
    document.body.setAttribute('data-theme', theme);
    themeToggleBtn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
};

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
}

themeToggleBtn.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
});

const lottoNumbersContainer = document.getElementById('lotto-numbers-container');
const bonusContainer = document.getElementById('bonus-number-container');
const drawTime = document.getElementById('draw-time');
const card = document.querySelector('.card');

const palettes = [
    { min: 1, max: 10, grad: 'linear-gradient(135deg, #ffd166, #ff8f1f)', ring: 'rgba(255, 188, 102, 0.8)', text: '#1b140b' },
    { min: 11, max: 20, grad: 'linear-gradient(135deg, #7bdff2, #4c7bff)', ring: 'rgba(91, 142, 255, 0.7)', text: '#0b1c3b' },
    { min: 21, max: 30, grad: 'linear-gradient(135deg, #8bfba0, #38b000)', ring: 'rgba(68, 216, 132, 0.7)', text: '#0c2414' },
    { min: 31, max: 40, grad: 'linear-gradient(135deg, #ff9bd5, #ff4d6d)', ring: 'rgba(255, 146, 196, 0.7)', text: '#2c0916' },
    { min: 41, max: 45, grad: 'linear-gradient(135deg, #d7b5ff, #8a5cff)', ring: 'rgba(169, 124, 255, 0.7)', text: '#1d102e' }
];

const getPalette = (number, isBonus) => {
    const base = palettes.find((palette) => number >= palette.min && number <= palette.max) || palettes[0];
    if (!isBonus) {
        return base;
    }
    return {
        grad: 'linear-gradient(135deg, #ffe29f, #ffb347)',
        ring: 'rgba(255, 179, 71, 0.85)',
        text: '#3a2000'
    };
};

const createBall = (number, index, isBonus = false) => {
    const palette = getPalette(number, isBonus);
    const ball = document.createElement('lotto-ball');
    ball.setAttribute('number', number);
    ball.style.setProperty('--delay', `${index * 130}ms`);
    ball.style.setProperty('--ball-grad', palette.grad);
    ball.style.setProperty('--ball-ring', palette.ring);
    ball.style.setProperty('--ball-text', palette.text);
    ball.style.setProperty('--size', isBonus ? '62px' : '54px');
    return ball;
};

const generateNumbers = () => {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
};

const generateBonusNumber = (excludedNumbers) => {
    let bonus = Math.floor(Math.random() * 45) + 1;
    while (excludedNumbers.includes(bonus)) {
        bonus = Math.floor(Math.random() * 45) + 1;
    }
    return bonus;
};

const renderNumbers = () => {
    lottoNumbersContainer.innerHTML = '';
    bonusContainer.innerHTML = '';

    const numbers = generateNumbers();
    const bonus = generateBonusNumber(numbers);

    numbers.forEach((number, index) => {
        lottoNumbersContainer.appendChild(createBall(number, index));
    });

    bonusContainer.appendChild(createBall(bonus, numbers.length, true));
};

const playCelebration = () => {
    card.classList.remove('celebrate');
    void card.offsetWidth;
    card.classList.add('celebrate');
};

const updateDrawTime = () => {
    drawTime.textContent = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};

const generateTicket = () => {
    renderNumbers();
    updateDrawTime();
    playCelebration();
};

document.getElementById('generate-btn').addEventListener('click', generateTicket);
document.getElementById('shuffle-btn').addEventListener('click', () => {
    lottoNumbersContainer.querySelectorAll('lotto-ball').forEach((ball) => {
        ball.style.setProperty('--delay', `${Math.random() * 120}ms`);
    });
    bonusContainer.querySelectorAll('lotto-ball').forEach((ball) => {
        ball.style.setProperty('--delay', `${Math.random() * 120}ms`);
    });
    playCelebration();
});

generateTicket();

const TM_MODEL_BASE = 'https://teachablemachine.withgoogle.com/models/mrrlxN-j5/';
const MODEL_URL = `${TM_MODEL_BASE}model.json`;
const METADATA_URL = `${TM_MODEL_BASE}metadata.json`;

const webcamStartBtn = document.getElementById('webcam-start');
const webcamStopBtn = document.getElementById('webcam-stop');
const webcamContainer = document.getElementById('webcam-container');
const uploadInput = document.getElementById('image-upload');
const previewImage = document.getElementById('preview-image');
const resultBox = document.getElementById('animal-result');
const predictionList = document.getElementById('prediction-list');
const labelContainerEl = document.getElementById('label-container');
const modelStatus = document.getElementById('model-status');

let model = null;
let webcam = null;
let webcamFrame = null;
let labelContainer = null;
let maxPredictions = 0;

const emojiMap = {
    dog: '🐶',
    cat: '🐱',
    deer: '🦌',
    fox: '🦊',
    hamster: '🐹',
    rabbit: '🐰',
    bear: '🐻',
    강아지: '🐶',
    고양이: '🐱',
    사슴: '🦌',
    여우: '🦊',
    햄스터: '🐹',
    토끼: '🐰',
    곰: '🐻'
};

const labelMap = {
    dog: '강아지',
    cat: '고양이',
    fox: '여우',
    rabbit: '토끼',
    hamster: '햄스터',
    deer: '사슴',
    bear: '곰'
};

const classOrder = ['강아지', '고양이', '여우', '토끼', '햄스터', '사슴', '곰'];

const normalizeLabel = (label) => labelMap[label] || label;

const getEmoji = (label) => {
    if (emojiMap[label]) {
        return emojiMap[label];
    }
    const normalized = label.toLowerCase();
    return emojiMap[normalized] || '🐾';
};

const setStatus = (text) => {
    modelStatus.textContent = text;
};

const setResult = (label, score) => {
    const emoji = getEmoji(label);
    resultBox.innerHTML = `
        <span class="result-emoji">${emoji}</span>
        <div>
            <div class="result-label">${label}</div>
            <div class="result-score">${score}</div>
        </div>
    `;
};

const classOrder = ['강아지', '고양이', '여우', '토끼', '햄스터', '사슴', '곰'];

const sortPredictions = (predictions) => {
    const orderMap = new Map(classOrder.map((label, index) => [label, index]));
    return [...predictions].sort((a, b) => {
        const aLabel = normalizeLabel(a.className);
        const bLabel = normalizeLabel(b.className);
        const aIndex = orderMap.has(aLabel) ? orderMap.get(aLabel) : 999;
        const bIndex = orderMap.has(bLabel) ? orderMap.get(bLabel) : 999;
        return aIndex - bIndex;
    });
};

const renderPredictions = (predictions) => {
    const sorted = sortPredictions(predictions);
    const top = [...predictions].sort((a, b) => b.probability - a.probability)[0];
    const percent = Math.round(top.probability * 100);
    setResult(normalizeLabel(top.className), `${percent}% 확률`);

    predictionList.innerHTML = '';
    sorted.forEach((prediction) => {
        const row = document.createElement('div');
        row.className = 'prediction-item';
        const probabilityPercent = Math.round(prediction.probability * 100);
        const displayLabel = normalizeLabel(prediction.className);
        row.innerHTML = `
            <div class="prediction-header">
                <span>${displayLabel}</span>
                <span>${probabilityPercent}%</span>
            </div>
            <div class="prediction-bar"><span style="width:${probabilityPercent}%"></span></div>
        `;
        predictionList.appendChild(row);
    });
};

const updateLabelContainer = (predictions) => {
    if (!labelContainer) return;
    const ordered = sortPredictions(predictions);
    for (let i = 0; i < maxPredictions; i += 1) {
        const prediction = ordered[i];
        if (!prediction) continue;
        const displayLabel = normalizeLabel(prediction.className);
        labelContainer.childNodes[i].innerHTML = `${displayLabel}: ${prediction.probability.toFixed(2)}`;
    }
};

const loadModel = async () => {
    if (model) {
        return model;
    }
    setStatus('모델 불러오는 중...');
    try {
        model = await tmImage.load(MODEL_URL, METADATA_URL);
        maxPredictions = classOrder.length || model.getTotalClasses();
        labelContainer = labelContainerEl;
        labelContainer.innerHTML = '';
        for (let i = 0; i < maxPredictions; i += 1) {
            labelContainer.appendChild(document.createElement('div'));
        }
        setStatus('모델 준비 완료.');
        return model;
    } catch (error) {
        setStatus('모델 로딩에 실패했어요. 네트워크를 확인해주세요.');
        throw error;
    }
};

const stopWebcam = () => {
    if (webcamFrame) {
        cancelAnimationFrame(webcamFrame);
        webcamFrame = null;
    }
    if (webcam) {
        webcam.stop();
        webcam = null;
    }
    webcamContainer.innerHTML = '<span class="placeholder">카메라를 시작하면 여기에 표시됩니다.</span>';
};

const predictImage = async (imageElement) => {
    const activeModel = await loadModel();
    const predictions = await activeModel.predict(imageElement);
    updateLabelContainer(predictions);
    renderPredictions(predictions);
};

async function loop() {
    if (!webcam) return;
    webcam.update();
    await predict();
    webcamFrame = window.requestAnimationFrame(loop);
}

async function init() {
    stopWebcam();
    await loadModel();
    previewImage.classList.remove('is-visible');
    previewImage.removeAttribute('src');
    webcam = new tmImage.Webcam(280, 280, true);
    await webcam.setup();
    await webcam.play();
    webcamContainer.innerHTML = '';
    webcamContainer.appendChild(webcam.canvas);
    window.requestAnimationFrame(loop);
}

async function predict() {
    const predictions = await model.predict(webcam.canvas);
    updateLabelContainer(predictions);
    renderPredictions(predictions);
}

webcamStartBtn.addEventListener('click', async () => {
    try {
        await init();
    } catch (error) {
        setStatus('카메라 접근에 실패했어요. 권한을 확인해주세요.');
    }
});

webcamStopBtn.addEventListener('click', () => {
    stopWebcam();
    setStatus('웹캠이 중지되었습니다.');
});

uploadInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    stopWebcam();
    setStatus('이미지 분석 중...');
    const reader = new FileReader();
    reader.onload = async () => {
        previewImage.src = reader.result;
        previewImage.classList.add('is-visible');
        previewImage.onload = async () => {
            await predictImage(previewImage);
        };
    };
    reader.readAsDataURL(file);
});
