class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        this.shadowRoot.innerHTML = `
            <style>
                .ball {
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
    
    Array.from(numbers).sort((a, b) => a - b).forEach(number => {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        lottoNumbersContainer.appendChild(lottoBall);
    });
});
