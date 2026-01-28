
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
