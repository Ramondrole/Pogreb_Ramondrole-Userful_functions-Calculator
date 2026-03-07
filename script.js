        document.addEventListener('DOMContentLoaded', function() {
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
            
           
            basicModeBtn.addEventListener('click', function() {
                basicButtons.style.display = 'grid';
                scientificButtons.style.display = 'none';
                basicModeBtn.classList.add('active-mode');
                scientificModeBtn.classList.remove('active-mode');
            });
            
            scientificModeBtn.addEventListener('click', function() {
                basicButtons.style.display = 'grid';
                scientificButtons.style.display = 'grid';
                basicModeBtn.classList.remove('active-mode');
                scientificModeBtn.classList.add('active-mode');
            });
            
            
            document.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', function() {
                    const action = this.dataset.action;
                    const number = this.dataset.number;
                    
                    
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
                        break;
                    case 'clear-entry':
                        currentInput = '0';
                        break;
                    case 'backspace':
                        if (currentInput.length > 1) {
                            currentInput = currentInput.slice(0, -1);
                        } else {
                            currentInput = '0';
                        }
                        break;
                    case 'decimal':
                        if (!currentInput.includes('.')) {
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
                        if (operation && previousInput !== '') {
                            calculate();
                        }
                        break;
                    case 'square':
                        currentInput = String(Math.pow(parseFloat(currentInput), 2));
                        waitingForNewInput = true;
                        break;
                    case 'sqrt':
                        if (parseFloat(currentInput) >= 0) {
                            currentInput = String(Math.sqrt(parseFloat(currentInput)));
                        } else {
                            currentInput = 'Error';
                        }
                        waitingForNewInput = true;
                        break;
                    case 'power':
                        previousInput = currentInput;
                        operation = 'power';
                        waitingForNewInput = true;
                        break;
                    case 'pi':
                        currentInput = String(Math.PI);
                        break;
                    case 'sin':
                        currentInput = String(isRadians ? 
                            Math.sin(parseFloat(currentInput)) : 
                            Math.sin(parseFloat(currentInput) * Math.PI / 180));
                        waitingForNewInput = true;
                        break;
                    case 'cos':
                        currentInput = String(isRadians ? 
                            Math.cos(parseFloat(currentInput)) : 
                            Math.cos(parseFloat(currentInput) * Math.PI / 180));
                        waitingForNewInput = true;
                        break;
                    case 'tan':
                        currentInput = String(isRadians ? 
                            Math.tan(parseFloat(currentInput)) : 
                            Math.tan(parseFloat(currentInput) * Math.PI / 180));
                        waitingForNewInput = true;
                        break;
                    case 'asin':
                        let asinValue = parseFloat(currentInput);
                        if (asinValue >= -1 && asinValue <= 1) {
                            currentInput = String(isRadians ? 
                                Math.asin(asinValue) : 
                                Math.asin(asinValue) * 180 / Math.PI);
                        } else {
                            currentInput = 'Error';
                        }
                        waitingForNewInput = true;
                        break;
                    case 'acos':
                        let acosValue = parseFloat(currentInput);
                        if (acosValue >= -1 && acosValue <= 1) {
                            currentInput = String(isRadians ? 
                                Math.acos(acosValue) : 
                                Math.acos(acosValue) * 180 / Math.PI);
                        } else {
                            currentInput = 'Error';
                        }
                        waitingForNewInput = true;
                        break;
                    case 'atan':
                        currentInput = String(isRadians ? 
                            Math.atan(parseFloat(currentInput)) : 
                            Math.atan(parseFloat(currentInput)) * 180 / Math.PI);
                        waitingForNewInput = true;
                        break;
                    case 'log':
                        if (parseFloat(currentInput) > 0) {
                            currentInput = String(Math.log10(parseFloat(currentInput)));
                        } else {
                            currentInput = 'Error';
                        }
                        waitingForNewInput = true;
                        break;
                    case 'ln':
                        if (parseFloat(currentInput) > 0) {
                            currentInput = String(Math.log(parseFloat(currentInput)));
                        } else {
                            currentInput = 'Error';
                        }
                        waitingForNewInput = true;
                        break;
                    case 'factorial':
                        let n = parseInt(currentInput);
                        if (n >= 0 && n <= 170) {
                            let result = 1;
                            for (let i = 2; i <= n; i++) {
                                result *= i;
                            }
                            currentInput = String(result);
                        } else {
                            currentInput = 'Error';
                        }
                        waitingForNewInput = true;
                        break;
                    case 'reciprocal':
                        if (parseFloat(currentInput) !== 0) {
                            currentInput = String(1 / parseFloat(currentInput));
                        } else {
                            currentInput = 'Error';
                        }
                        waitingForNewInput = true;
                        break;
                    case 'exp':
                        currentInput = String(Math.exp(parseFloat(currentInput)));
                        waitingForNewInput = true;
                        break;
                    case 'ten-power':
                        currentInput = String(Math.pow(10, parseFloat(currentInput)));
                        waitingForNewInput = true;
                        break;
                    case 'abs':
                        currentInput = String(Math.abs(parseFloat(currentInput)));
                        waitingForNewInput = true;
                        break;
                    case 'mod':
                        previousInput = currentInput;
                        operation = 'mod';
                        waitingForNewInput = true;
                        break;
                    case 'rand':
                        currentInput = String(Math.random());
                        waitingForNewInput = true;
                        break;
                    case 'deg-rad':
                        isRadians = !isRadians;
                        document.querySelector('[data-action="deg-rad"]').textContent = 
                            isRadians ? 'RAD' : 'DEG';
                        break;
                    case 'memory-clear':
                        memory = 0;
                        break;
                    case 'memory-recall':
                        currentInput = String(memory);
                        break;
                    case 'memory-add':
                        memory += parseFloat(currentInput);
                        break;
                    case 'memory-subtract':
                        memory -= parseFloat(currentInput);
                        break;
                }
            }
            
            function handleOperation(nextOperation) {
                const inputValue = parseFloat(currentInput);
                
                if (previousInput === '') {
                    previousInput = currentInput;
                } else if (operation) {
                    calculate();
                }
                
                waitingForNewInput = true;
                operation = nextOperation;
            }
            
            function calculate() {
                const prev = parseFloat(previousInput);
                const current = parseFloat(currentInput);
                let result = 0;
                
                if (isNaN(prev) || isNaN(current)) return;
                
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
                        result = current !== 0 ? prev / current : 'Error';
                        break;
                    case 'power':
                        result = Math.pow(prev, current);
                        break;
                    case 'mod':
                        result = current !== 0 ? prev % current : 'Error';
                        break;
                }
                
                currentInput = String(result);
                operation = null;
                previousInput = '';
                waitingForNewInput = true;
            }
            
            function updateDisplay() {
                display.textContent = currentInput;
                
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
                    history.textContent = previousInput;
                }
            }
            
            
            updateDisplay();
        });