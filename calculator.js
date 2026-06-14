const calculatorTranslations = {
    ru: {
        basicMode: "БАЗОВЫЙ",
        scientificMode: "НАУЧНЫЙ",
        about: "Обо мне",
        games: "Наши игры",
        functions: "Полезные функции"
    },
    en: {
        basicMode: "BASIC",
        scientificMode: "SCIENTIFIC",
        about: "About me",
        games: "Our games",
        functions: "Useful functions"
    },
    de: {
        basicMode: "BASIC",
        scientificMode: "WISSENSCHAFTLICH",
        about: "Über mich",
        games: "Unsere Spiele",
        functions: "Nützliche Funktionen"
    }
};

let currentLang = localStorage.getItem('calculator_language') || 'ru';

function t(key) {
    return calculatorTranslations[currentLang]?.[key] || calculatorTranslations.ru[key];
}

function updateCalculatorUILanguage() {
    const elements = ['basicMode', 'scientificMode'];
    elements.forEach(key => {
        const el = document.querySelector(`[data-key="${key}"]`);
        if (el) el.textContent = t(key);
    });
    
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
        const flags = { ru: '🌐 RU', en: '🌐 EN', de: '🌐 DE' };
        langBtn.innerHTML = flags[currentLang];
    }
    
    document.querySelectorAll('.nav-links a').forEach((link, idx) => {
        const keys = ['about', 'games', 'functions'];
        if (idx < keys.length) link.textContent = t(keys[idx]);
    });
}

const display = document.getElementById('display');
const history = document.getElementById('history');
const basicButtons = document.getElementById('basic-buttons');
const scientificButtons = document.getElementById('scientific-buttons');
const basicModeBtn = document.getElementById('basic-mode');
const scientificModeBtn = document.getElementById('scientific-mode');

let currentInput = '0';
let previousInput = '';
let operation = null;
let waitingForNewInput = false;
let memory = 0;
let isRadians = false;
let lastResult = null;

function formatNumber(num) {
    if (num === 'Error') return 'Error';
    let n = parseFloat(num);
    if (isNaN(n)) return '0';
    if (Math.abs(n) > 1e12 || (Math.abs(n) < 1e-12 && n !== 0)) {
        return n.toExponential(10);
    }
    let formatted = n.toString();
    if (formatted.length > 15) {
        formatted = n.toPrecision(12);
    }
    return formatted.replace(/\.?0+$/, '');
}

basicModeBtn.addEventListener('click', () => {
    basicButtons.style.display = 'grid';
    scientificButtons.style.display = 'none';
    basicModeBtn.classList.add('active-mode');
    scientificModeBtn.classList.remove('active-mode');
});

scientificModeBtn.addEventListener('click', () => {
    basicButtons.style.display = 'grid';
    scientificButtons.style.display = 'grid';
    basicModeBtn.classList.remove('active-mode');
    scientificModeBtn.classList.add('active-mode');
});

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const number = button.dataset.number;
        
        display.classList.remove('input-active');
        void display.offsetWidth;
        display.classList.add('input-active');
        
        if (number !== undefined) {
            inputNumber(number);
        } else if (action) {
            handleAction(action);
        }
        
        updateDisplay();
    });
});

function inputNumber(num) {
    if (waitingForNewInput) {
        currentInput = num;
        waitingForNewInput = false;
    } else {
        currentInput = currentInput === '0' ? num : currentInput + num;
    }
}

function handleAction(action) {
    switch (action) {
        case 'clear':
            currentInput = '0';
            previousInput = '';
            operation = null;
            waitingForNewInput = false;
            lastResult = null;
            break;
        case 'clear-entry':
            currentInput = '0';
            break;
        case 'backspace':
            if (currentInput.length > 1 && currentInput !== 'Error') {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            break;
        case 'decimal':
            if (!currentInput.includes('.') && currentInput !== 'Error') {
                currentInput += '.';
            }
            break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
            handleOperation(action);
            break;
        case 'equals':
            if (operation && previousInput !== '' && currentInput !== 'Error') {
                calculate();
            }
            break;
        case 'square':
            performUnaryOperation(x => x * x);
            break;
        case 'sqrt':
            performUnaryOperation(x => x >= 0 ? Math.sqrt(x) : NaN, 'sqrt');
            break;
        case 'power':
            previousInput = currentInput;
            operation = 'power';
            waitingForNewInput = true;
            break;
        case 'pi':
            currentInput = formatNumber(Math.PI);
            waitingForNewInput = true;
            break;
        case 'sin':
            performUnaryOperation(x => isRadians ? Math.sin(x) : Math.sin(x * Math.PI / 180));
            break;
        case 'cos':
            performUnaryOperation(x => isRadians ? Math.cos(x) : Math.cos(x * Math.PI / 180));
            break;
        case 'tan':
            performUnaryOperation(x => isRadians ? Math.tan(x) : Math.tan(x * Math.PI / 180));
            break;
        case 'asin':
            performUnaryOperation(x => x >= -1 && x <= 1 ? (isRadians ? Math.asin(x) : Math.asin(x) * 180 / Math.PI) : NaN, 'asin');
            break;
        case 'acos':
            performUnaryOperation(x => x >= -1 && x <= 1 ? (isRadians ? Math.acos(x) : Math.acos(x) * 180 / Math.PI) : NaN, 'acos');
            break;
        case 'atan':
            performUnaryOperation(x => isRadians ? Math.atan(x) : Math.atan(x) * 180 / Math.PI);
            break;
        case 'log':
            performUnaryOperation(x => x > 0 ? Math.log10(x) : NaN, 'log');
            break;
        case 'ln':
            performUnaryOperation(x => x > 0 ? Math.log(x) : NaN, 'ln');
            break;
        case 'factorial':
            performFactorial();
            break;
        case 'reciprocal':
            performUnaryOperation(x => x !== 0 ? 1 / x : NaN, 'reciprocal');
            break;
        case 'exp':
            performUnaryOperation(x => Math.exp(x));
            break;
        case 'ten-power':
            performUnaryOperation(x => Math.pow(10, x));
            break;
        case 'abs':
            performUnaryOperation(x => Math.abs(x));
            break;
        case 'mod':
            previousInput = currentInput;
            operation = 'mod';
            waitingForNewInput = true;
            break;
        case 'rand':
            currentInput = formatNumber(Math.random());
            waitingForNewInput = true;
            break;
        case 'deg-rad':
            isRadians = !isRadians;
            document.getElementById('degRadBtn').textContent = isRadians ? 'RAD' : 'DEG';
            break;
        case 'memory-clear':
            memory = 0;
            break;
        case 'memory-recall':
            currentInput = formatNumber(memory);
            waitingForNewInput = true;
            break;
        case 'memory-add':
            memory += parseFloat(currentInput) || 0;
            break;
        case 'memory-subtract':
            memory -= parseFloat(currentInput) || 0;
            break;
    }
}

function performUnaryOperation(func, errorMsg = null) {
    const val = parseFloat(currentInput);
    if (isNaN(val)) {
        currentInput = 'Error';
    } else {
        const result = func(val);
        if (isNaN(result) || !isFinite(result)) {
            currentInput = 'Error';
        } else {
            currentInput = formatNumber(result);
        }
    }
    waitingForNewInput = true;
}

function performFactorial() {
    const n = parseInt(currentInput);
    if (isNaN(n) || n < 0 || n > 170) {
        currentInput = 'Error';
    } else {
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
            if (result > 1e308) {
                currentInput = 'Error';
                return;
            }
        }
        currentInput = formatNumber(result);
    }
    waitingForNewInput = true;
}

function handleOperation(nextOperation) {
    const inputValue = parseFloat(currentInput);
    
    if (previousInput === '') {
        previousInput = currentInput;
    } else if (operation) {
        calculate();
        previousInput = currentInput;
    }
    
    waitingForNewInput = true;
    operation = nextOperation;
}

function calculate() {
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result = 0;
    
    if (isNaN(prev) || isNaN(current)) {
        currentInput = 'Error';
        operation = null;
        previousInput = '';
        waitingForNewInput = true;
        return;
    }
    
    switch (operation) {
        case 'add':
            result = prev + current;
            break;
        case 'subtract':
            result = prev - current;
            break;
        case 'multiply':
            result = prev * current;
            break;
        case 'divide':
            if (current === 0) {
                currentInput = 'Error';
                operation = null;
                previousInput = '';
                waitingForNewInput = true;
                return;
            }
            result = prev / current;
            break;
        case 'power':
            result = Math.pow(prev, current);
            if (!isFinite(result)) {
                currentInput = 'Error';
                operation = null;
                previousInput = '';
                waitingForNewInput = true;
                return;
            }
            break;
        case 'mod':
            if (current === 0) {
                currentInput = 'Error';
                operation = null;
                previousInput = '';
                waitingForNewInput = true;
                return;
            }
            result = prev % current;
            break;
        default:
            return;
    }
    
    currentInput = formatNumber(result);
    operation = null;
    previousInput = '';
    waitingForNewInput = true;
}

function updateDisplay() {
    if (currentInput === 'Error') {
        display.textContent = 'ERROR';
    } else {
        display.textContent = currentInput;
    }
    
    if (operation) {
        const operatorSymbols = {
            'add': '+',
            'subtract': '-',
            'multiply': '×',
            'divide': '÷',
            'power': '^',
            'mod': 'mod'
        };
        history.textContent = `${previousInput} ${operatorSymbols[operation]}`;
    } else {
        history.textContent = previousInput || '';
    }
}

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('calculator_language', lang);
    updateCalculatorUILanguage();
}

document.querySelectorAll('.lang-dropdown a').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = item.getAttribute('data-lang');
        if (lang) changeLanguage(lang);
    });
});

updateCalculatorUILanguage();