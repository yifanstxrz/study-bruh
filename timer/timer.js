// DOM elements
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');

// Timer variables
let timer;
let isRunning = false;
let isPaused = false;
let totalSeconds = 0;

// Initialize timer display
function initTimer() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
    updateDisplay();
}

// Update timer display
function updateDisplay() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // If hours are 0, hide them for a cleaner display
    if (hours === 0) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Start or restart timer
function startTimer() {
    if (isRunning || startBtn.textContent === "Restart") {
        // If already running or restart was clicked, reset everything
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        
        // Enable input fields when timer is reset
        hoursInput.disabled = false;
        minutesInput.disabled = false;
        secondsInput.disabled = false;
        
        // Reset button states
        startBtn.textContent = "Start";
        pauseBtn.disabled = true;
        pauseBtn.textContent = "Pause";
        
        // Reset the timer display to the input values
        initTimer();
        return;
    }
    
    // Set up new timer
    initTimer();
    
    if (totalSeconds > 0) {
        isRunning = true;
        startBtn.textContent = "Restart";
        pauseBtn.disabled = false;
        
        // Disable input fields while timer is running
        hoursInput.disabled = true;
        minutesInput.disabled = true;
        secondsInput.disabled = true;
        
        timer = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                updateDisplay();
            } else {
                clearInterval(timer);
                isRunning = false;
                startBtn.textContent = "Start";
                pauseBtn.disabled = true;
                pauseBtn.textContent = "Pause";
                
                // Enable input fields when timer completes
                hoursInput.disabled = false;
                minutesInput.disabled = false;
                secondsInput.disabled = false;
                
                // Alert when timer completes
                setTimeout(() => {
                    alert("Time's up! Study session complete.");
                }, 100);
            }
        }, 1000);
    }
}

// Pause or unpause timer
function togglePause() {
    if (isRunning) {
        if (isPaused) {
            // Unpause timer
            isPaused = false;
            pauseBtn.textContent = "Pause";
            
            timer = setInterval(() => {
                if (totalSeconds > 0) {
                    totalSeconds--;
                    updateDisplay();
                } else {
                    clearInterval(timer);
                    isRunning = false;
                    startBtn.textContent = "Start";
                    pauseBtn.disabled = true;
                    pauseBtn.textContent = "Pause";
                    
                    // Enable input fields when timer completes
                    hoursInput.disabled = false;
                    minutesInput.disabled = false;
                    secondsInput.disabled = false;
                    
                    // Alert when timer completes
                    setTimeout(() => {
                        alert("Time's up! Study session complete.");
                    }, 100);
                }
            }, 1000);
        } else {
            // Pause timer
            isPaused = true;
            pauseBtn.textContent = "Resume";
            clearInterval(timer);
        }
    }
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', togglePause);

// Input validation and formatting
[hoursInput, minutesInput, secondsInput].forEach(input => {
    input.addEventListener('input', function() {
        // Ensure value is numeric and within range
        let value = parseInt(this.value) || 0;
        const max = parseInt(this.max);
        
        if (value > max) {
            value = max;
        } else if (value < 0) {
            value = 0;
        }
        
        this.value = value;
        
        // Update timer display when inputs change
        if (!isRunning) {
            initTimer();
        }
    });
});

// Initialize timer on page load
initTimer();
