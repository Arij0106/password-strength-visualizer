const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggleVisibility');
const generateBtn = document.getElementById('generatePassword');
const strengthIndicator = document.getElementById('strengthIndicator');
const strengthLabel = document.getElementById('strengthLabel');
const scoreElement = document.getElementById('score');
const hintText = document.getElementById('hintText');
const requirementsList = document.querySelectorAll('.requirement');
const lengthStat = document.getElementById('lengthStat');
const crackTime = document.getElementById('crackTime');
const combinations = document.getElementById('combinations');
const entropyElement = document.getElementById('entropy');
const upperCount = document.getElementById('upperCount');
const lowerCount = document.getElementById('lowerCount');
const numberCount = document.getElementById('numberCount');
const specialCount = document.getElementById('specialCount');

let charChart = null;

const commonPasswords = [
    'password', '123456', '12345678', '1234', 'qwerty', '12345',
    'dragon', 'football', 'baseball', 'letmein', 'monkey',
    'shadow', 'master', 'hello', 'password1', 'admin'
];

document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    passwordInput.focus();
    
    passwordInput.addEventListener('input', analyzePassword);
    toggleBtn.addEventListener('click', togglePasswordVisibility);
    generateBtn.addEventListener('click', generateStrongPassword);
    
    analyzePassword();
});

function initializeChart() {
    const ctx = document.getElementById('charChart').getContext('2d');
    charChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Uppercase', 'Lowercase', 'Numbers', 'Special'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#3498db', 
                    '#2ecc71', 
                    '#e74c3c', 
                    '#f39c12'  
                ],
                borderWidth: 0,
                hoverOffset: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    toggleBtn.innerHTML = type === 'password' ? 
        '<i class="fas fa-eye"></i>' : 
        '<i class="fas fa-eye-slash"></i>';
    toggleBtn.title = type === 'password' ? 'Show password' : 'Hide password';
}

function generateStrongPassword() {
    const length = 16;
    const charset = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
    
    let password = [
        getRandomChar(charset.upper),
        getRandomChar(charset.lower),
        getRandomChar(charset.numbers),
        getRandomChar(charset.special)
    ];
    
    const allChars = Object.values(charset).join('');
    for (let i = password.length; i < length; i++) {
        password.push(getRandomChar(allChars));
    }
    
    password = shuffleArray(password).join('');
    
    passwordInput.value = password;
    passwordInput.type = 'text';
    toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    toggleBtn.title = 'Hide password';
    
    analyzePassword();
    
    hintText.innerHTML = '<i class="fas fa-check-circle"></i> Strong password generated!';
    hintText.style.color = '#2ecc71';
}

function getRandomChar(charset) {
    return charset[Math.floor(Math.random() * charset.length)];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function analyzePassword() {
    const password = passwordInput.value;
    const analysis = analyzePasswordStrength(password);
    
    updateUI(analysis, password);
    updateChart(analysis.characterCounts);
}

function analyzePasswordStrength(password) {
    const analysis = {
        length: password.length,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        characterCounts: {
            upper: (password.match(/[A-Z]/g) || []).length,
            lower: (password.match(/[a-z]/g) || []).length,
            numbers: (password.match(/\d/g) || []).length,
            special: (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length
        },
        hasSequence: hasSequentialCharacters(password),
        isCommon: commonPasswords.includes(password.toLowerCase())
    };
    
    analysis.score = calculateScore(analysis);
    analysis.strength = getStrengthLevel(analysis.score);
    
    analysis.entropy = calculateEntropy(password);
    analysis.combinations = calculateCombinations(analysis);
    analysis.crackTime = estimateCrackTime(analysis);
    
    return analysis;
}

function calculateScore(analysis) {
    let score = 0;
    
    score += Math.min(analysis.length * 2, 30);
    
    if (analysis.hasUpper) score += 10;
    if (analysis.hasLower) score += 10;
    if (analysis.hasNumbers) score += 10;
    if (analysis.hasSpecial) score += 10;
    
    const charTypes = [analysis.hasUpper, analysis.hasLower, analysis.hasNumbers, analysis.hasSpecial];
    const typeCount = charTypes.filter(Boolean).length;
    if (typeCount >= 3) score += 10;
    
    if (analysis.hasSequence) score -= 15;
    if (analysis.isCommon) score -= 20;
    
    return Math.max(0, Math.min(100, score));
}

function getStrengthLevel(score) {
    if (score >= 90) return 'very-strong';
    if (score >= 75) return 'strong';
    if (score >= 50) return 'good';
    if (score >= 25) return 'fair';
    return 'weak';
}

function hasSequentialCharacters(password) {
    for (let i = 0; i < password.length - 2; i++) {
        const char1 = password.charCodeAt(i);
        const char2 = password.charCodeAt(i + 1);
        const char3 = password.charCodeAt(i + 2);
        
        if (char2 === char1 + 1 && char3 === char2 + 1) {
            return true;
        }
    }
    return false;
}

function calculateEntropy(password) {
    if (!password) return 0;
    
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/\d/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; 
    
    if (charsetSize === 0) return 0;
    
    return Math.round(password.length * Math.log2(charsetSize));
}

function calculateCombinations(analysis) {
    let charsetSize = 0;
    if (analysis.hasLower) charsetSize += 26;
    if (analysis.hasUpper) charsetSize += 26;
    if (analysis.hasNumbers) charsetSize += 10;
    if (analysis.hasSpecial) charsetSize += 32;
    
    if (charsetSize === 0 || analysis.length === 0) return 0;
    
    return Math.pow(charsetSize, analysis.length).toExponential(2);
}

function estimateCrackTime(analysis) {
    if (analysis.length === 0) return 'Instantly';
    
    const guessesPerSecond = 1e9;
    const totalCombinations = Math.pow(95, analysis.length); 
    const seconds = totalCombinations / guessesPerSecond;
    
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return `${Math.round(seconds / 3153600000)} centuries`;
}

function updateUI(analysis, password) {
    const width = analysis.score + '%';
    strengthIndicator.style.width = width;
    
    strengthLabel.textContent = formatStrengthLabel(analysis.strength);
    strengthLabel.className = analysis.strength;
    scoreElement.textContent = `Score: ${analysis.score}/100`;
    
    updateRequirements(analysis, password);
    
    updateStats(analysis);
    
    updateHintText(analysis, password);
    
    updateCharacterCounts(analysis.characterCounts);
}

function formatStrengthLabel(strength) {
    const labels = {
        'weak': 'Weak 🔴',
        'fair': 'Fair 🟠',
        'good': 'Good 🟡',
        'strong': 'Strong 🟢',
        'very-strong': 'Very Strong 💪'
    };
    return labels[strength] || 'Unknown';
}

function updateRequirements(analysis, password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: analysis.hasUpper,
        lowercase: analysis.hasLower,
        numbers: analysis.hasNumbers,
        special: analysis.hasSpecial,
        sequence: !analysis.hasSequence,
        common: !analysis.isCommon
    };
    
    requirementsList.forEach(req => {
        const rule = req.dataset.rule;
        const isValid = requirements[rule];
        
        req.classList.toggle('valid', isValid);
        
        const icon = req.querySelector('i');
        icon.className = isValid ? 'fas fa-check-circle' : 'fas fa-times-circle';
        
        const valueSpan = req.querySelector('.requirement-value');
        if (rule === 'length') {
            valueSpan.textContent = `${password.length}/8`;
        } else if (['uppercase', 'lowercase', 'numbers', 'special'].includes(rule)) {
            const count = analysis.characterCounts[rule] || 0;
            valueSpan.textContent = count;
        }
    });
}

function updateStats(analysis) {
    lengthStat.textContent = `${analysis.length} character${analysis.length !== 1 ? 's' : ''}`;
    crackTime.textContent = analysis.crackTime;
    combinations.textContent = analysis.combinations;
    entropyElement.textContent = `${analysis.entropy} bits`;
}

function updateHintText(analysis, password) {
    let hint = '';
    
    if (password.length === 0) {
        hint = 'Start typing to see strength analysis';
    } else if (analysis.isCommon) {
        hint = '⚠️ This is a commonly used password - try something more unique!';
    } else if (analysis.hasSequence) {
        hint = '⚠️ Avoid sequential characters (abc, 123)';
    } else if (analysis.length < 8) {
        hint = '📏 Make it longer! Aim for at least 8 characters';
    } else if (!analysis.hasUpper || !analysis.hasLower || !analysis.hasNumbers || !analysis.hasSpecial) {
        const missing = [];
        if (!analysis.hasUpper) missing.push('uppercase letters');
        if (!analysis.hasLower) missing.push('lowercase letters');
        if (!analysis.hasNumbers) missing.push('numbers');
        if (!analysis.hasSpecial) missing.push('special characters');
        hint = `✨ Add ${missing.join(', ')} to make it stronger`;
    } else if (analysis.score >= 90) {
        hint = '🎉 Excellent password! This is very secure!';
    } else if (analysis.score >= 75) {
        hint = '👍 Good password! Consider making it longer for extra security';
    } else {
        hint = '💡 Keep going! Try mixing different character types';
    }
    
    hintText.innerHTML = `<i class="fas fa-lightbulb"></i> ${hint}`;
}

function updateCharacterCounts(counts) {
    upperCount.textContent = counts.upper;
    lowerCount.textContent = counts.lower;
    numberCount.textContent = counts.numbers;
    specialCount.textContent = counts.special;
}

function updateChart(counts) {
    if (!charChart) return;
    
    const data = [
        counts.upper,
        counts.lower,
        counts.numbers,
        counts.special
    ];
    
    charChart.data.datasets[0].data = data;
    charChart.update();
    
    charChart.options.animation = {
        animateScale: true,
        animateRotate: true,
        duration: 800
    };
}
