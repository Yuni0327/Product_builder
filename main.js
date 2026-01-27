
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
                    display: inline-block;
                }
                .ball {
                    position: relative;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background-color: #f8f9fa;
                    border: 1px solid #dee2e6;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #212529;
                    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
                    transform-origin: center;
                    animation:
                        pop-in 650ms var(--delay) cubic-bezier(0.16, 1, 0.3, 1) both,
                        wobble 900ms calc(var(--delay) + 120ms) ease-in-out both;
                }

                .ball::after {
                    content: '';
                    position: absolute;
                    inset: -6px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255, 200, 0, 0.35), transparent 70%);
                    opacity: 0;
                    animation: glow 700ms calc(var(--delay) + 120ms) ease-out both;
                    pointer-events: none;
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
            </style>
            <div class="ball">${number}</div>
        `;
    }
}

customElements.define('lotto-ball', LottoBall);

document.getElementById('generate-btn').addEventListener('click', () => {
    const lottoNumbersContainer = document.getElementById('lotto-numbers-container');
    lottoNumbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    
    Array.from(numbers).sort((a, b) => a - b).forEach((number, index) => {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        lottoBall.style.setProperty('--delay', `${index * 120}ms`);
        lottoNumbersContainer.appendChild(lottoBall);
    });
});
