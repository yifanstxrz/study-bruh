// DOM elements
const timerContainer = document.querySelector(".timer-container");
const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("statusDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const normalModeBtn = document.getElementById("normalMode");
const pomodoroModeBtn = document.getElementById("pomodoroMode");
const normalSettings = document.getElementById("normalSettings");
const pomodoroSettings = document.getElementById("pomodoroSettings");
const phaseIndicator = document.getElementById("phaseIndicator");

// Normal mode inputs
const hoursInput = document.getElementById("hours");
const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");

// Pomodoro mode inputs
const studyMinutesInput = document.getElementById("studyMinutes");
const studySecondsInput = document.getElementById("studySeconds");
const breakMinutesInput = document.getElementById("breakMinutes");
const breakSecondsInput = document.getElementById("breakSeconds");
const cyclesInput = document.getElementById("cycles");
const longBreakMinutesInput = document.getElementById("longBreakMinutes");
const longBreakSecondsInput = document.getElementById("longBreakSeconds");

// Timer variables
let timer;
let isRunning = false;
let isPaused = false;
let totalSeconds = 0;
let isPomodoroMode = false;
let pomodoroPhase = "study"; // 'study', 'break', 'longBreak'
let currentCycle = 1;
let totalCycles = 4;

// Function to save study session to localStorage
function saveStudySession(duration) {
  // Get existing sessions or initialize empty array
  const existingSessions = localStorage.getItem('studySessions');
  const sessions = existingSessions ? JSON.parse(existingSessions) : [];
  
  // Create new session object
  const newSession = {
    date: new Date().toISOString(),
    duration: duration // Duration in minutes
  };
  
  // Add to sessions array
  sessions.push(newSession);
  
  // Save back to localStorage
  localStorage.setItem('studySessions', JSON.stringify(sessions));
  
  console.log('Study session saved:', newSession);
}

// Function to save normal mode sessions
function saveNormalModeSession() {
  if (!isPomodoroMode) {
    // Get the original input values to determine how long the session was
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    
    // Convert total time to minutes (round up for seconds)
    const durationMinutes = hours * 60 + minutes + (seconds > 0 ? 1 : 0);
    
    // Only save sessions that were more than 0 minutes
    if (durationMinutes > 0) {
      saveStudySession(durationMinutes);
    }
  }
}

// Function to save pomodoro study sessions
function savePomodoroSession() {
  if (isPomodoroMode && pomodoroPhase === "study") {
    // Get study duration from inputs
    const studyMinutes = parseInt(studyMinutesInput.value) || 0;
    const studySeconds = parseInt(studySecondsInput.value) || 0;
    
    // Convert to minutes (round up for seconds)
    const durationMinutes = studyMinutes + (studySeconds > 0 ? 1 : 0);
    
    // Only save sessions that were more than 0 minutes
    if (durationMinutes > 0) {
      saveStudySession(durationMinutes);
    }
  }
}

// Initialize timer display
function initTimer() {
  if (isPomodoroMode) {
    updatePhaseIndicator();

    if (pomodoroPhase === "study") {
      totalSeconds =
        parseInt(studyMinutesInput.value) * 60 +
        parseInt(studySecondsInput.value || 0);
      statusDisplay.textContent = `Study Session - Cycle ${currentCycle} of ${totalCycles}`;
    } else if (pomodoroPhase === "break") {
      totalSeconds =
        parseInt(breakMinutesInput.value) * 60 +
        parseInt(breakSecondsInput.value || 0);
      statusDisplay.textContent = `Short Break - Next Cycle: ${
        currentCycle + 1
      } of ${totalCycles}`;
    } else if (pomodoroPhase === "longBreak") {
      totalSeconds =
        parseInt(longBreakMinutesInput.value) * 60 +
        parseInt(longBreakSecondsInput.value || 0);
      statusDisplay.textContent = `Long Break - All cycles complete!`;
    }
  } else {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
    statusDisplay.textContent = "Ready to start";
  }
  updateDisplay();
}

// Update timer display with proper formatting
function updateDisplay() {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    timerDisplay.textContent = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
}

// Create phase indicator dots for Pomodoro mode
function updatePhaseIndicator() {
  if (!isPomodoroMode) {
    phaseIndicator.innerHTML = "";
    return;
  }

  phaseIndicator.innerHTML = "";

  // Create dots for study sessions and breaks
  for (let i = 1; i <= totalCycles; i++) {
    // Study session dot
    const studyDot = document.createElement("div");
    studyDot.classList.add("phase-dot");

    if (i === currentCycle && pomodoroPhase === "study") {
      studyDot.classList.add("active");
    } else if (i < currentCycle) {
      studyDot.classList.add("completed");
    }

    phaseIndicator.appendChild(studyDot);

    // Break dot (except after the last study session)
    if (i < totalCycles) {
      const breakDot = document.createElement("div");
      breakDot.classList.add("phase-dot", "break");

      if (i === currentCycle && pomodoroPhase === "break") {
        breakDot.classList.add("active");
      } else if (i < currentCycle) {
        breakDot.classList.add("completed");
      }

      phaseIndicator.appendChild(breakDot);
    }
  }

  // Long break dot
  const longBreakDot = document.createElement("div");
  longBreakDot.classList.add("phase-dot", "long-break");

  if (pomodoroPhase === "longBreak") {
    longBreakDot.classList.add("active");
  }

  phaseIndicator.appendChild(longBreakDot);
}

// Switch between normal and pomodoro modes with smooth transitions
function switchMode(mode) {
  // Reset timer if it's running
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    startBtn.textContent = "Start";
    pauseBtn.disabled = true;
    timerContainer.classList.remove("timer-running", "timer-paused");
  }

  if (mode === "normal") {
    // Smooth transition
    normalModeBtn.classList.add("active");
    pomodoroModeBtn.classList.remove("active");

    // First hide pomodoro settings
    pomodoroSettings.classList.add("hidden");

    // After a short delay, show normal settings
    setTimeout(() => {
      normalSettings.classList.remove("hidden");
    }, 300);

    // Update variables
    isPomodoroMode = false;
    pomodoroPhase = "study";
    currentCycle = 1;

    // Clear phase indicators
    phaseIndicator.innerHTML = "";
  } else {
    // Smooth transition
    normalModeBtn.classList.remove("active");
    pomodoroModeBtn.classList.add("active");

    // First hide normal settings
    normalSettings.classList.add("hidden");

    // After a short delay, show pomodoro settings
    setTimeout(() => {
      pomodoroSettings.classList.remove("hidden");
    }, 300);

    // Update variables
    isPomodoroMode = true;
    pomodoroPhase = "study";
    currentCycle = 1;
    totalCycles = parseInt(cyclesInput.value) || 4;

    // Create phase indicators
    updatePhaseIndicator();
  }

  // Enable all input fields
  enableInputs();

  // Initialize the timer
  initTimer();
}

// Start or restart timer with enhanced animations
function startTimer() {
  if (isRunning || startBtn.textContent === "Restart") {
    // If already running or restart was clicked, reset everything
    clearInterval(timer);
    isRunning = false;
    isPaused = false;

    // Update UI state
    timerContainer.classList.remove("timer-running", "timer-paused");

    // Enable input fields when timer is reset
    enableInputs();

    // Reset button states with animation
    startBtn.textContent = "Start";
    pauseBtn.disabled = true;
    pauseBtn.textContent = "Pause";

    if (isPomodoroMode) {
      pomodoroPhase = "study";
      currentCycle = 1;
      totalCycles = parseInt(cyclesInput.value) || 4;
      updatePhaseIndicator();
    }

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

    // Add class for running state
    timerContainer.classList.add("timer-running");
    timerContainer.classList.remove("timer-paused");

    // Disable input fields while timer is running
    disableInputs();

    timer = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
        updateDisplay();
      } else {
        if (isPomodoroMode) {
          handlePomodoroPhaseCompletion();
        } else {
          clearInterval(timer);
          isRunning = false;
          startBtn.textContent = "Start";
          pauseBtn.disabled = true;
          pauseBtn.textContent = "Pause";

          // Remove running state
          timerContainer.classList.remove("timer-running", "timer-paused");

          // Enable input fields when timer completes
          enableInputs();

          statusDisplay.textContent = "Time's up!";

          // Alert when timer completes
          playSound();
          
          // Save study session to dashboard
          saveNormalModeSession();

          // Use notification API if available
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("Study Timer", {
              body: "Time's up! Study session complete.",
              icon: "/favicon.ico",
            });
          } else {
            setTimeout(() => {
              alert("Time's up! Study session complete.");
            }, 100);
          }
        }
      }
    }, 1000);
  }
}

// Handle completion of a Pomodoro phase with animations
function handlePomodoroPhaseCompletion() {
  playSound();

  // If we're completing a study session, save it to the dashboard
  if (pomodoroPhase === "study") {
    savePomodoroSession();
  }

  // Add a flash animation to the timer
  timerDisplay.classList.add("phase-complete");
  setTimeout(() => {
    timerDisplay.classList.remove("phase-complete");
  }, 500);

  if (pomodoroPhase === "study") {
    if (currentCycle >= totalCycles) {
      // Move to long break after all cycles
      pomodoroPhase = "longBreak";
      statusDisplay.textContent = "Long Break - All cycles complete!";
      totalSeconds =
        parseInt(longBreakMinutesInput.value) * 60 +
        parseInt(longBreakSecondsInput.value || 0);

      // Update phase indicator
      updatePhaseIndicator();

      // Show notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pomodoro Timer", {
          body: "All study cycles complete! Time for a long break.",
          icon: "/favicon.ico",
        });
      } else {
        setTimeout(() => {
          alert("All study cycles complete! Time for a long break.");
        }, 100);
      }
    } else {
      // Move to short break
      pomodoroPhase = "break";
      statusDisplay.textContent = `Short Break - Next Cycle: ${
        currentCycle + 1
      } of ${totalCycles}`;
      totalSeconds =
        parseInt(breakMinutesInput.value) * 60 +
        parseInt(breakSecondsInput.value || 0);

      // Update phase indicator
      updatePhaseIndicator();

      // Show notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pomodoro Timer", {
          body: `Study session ${currentCycle} complete! Time for a short break.`,
          icon: "/favicon.ico",
        });
      } else {
        setTimeout(() => {
          alert(
            `Study session ${currentCycle} complete! Time for a short break.`
          );
        }, 100);
      }
    }
  } else if (pomodoroPhase === "break") {
    // Move to next study cycle
    currentCycle++;
    pomodoroPhase = "study";
    statusDisplay.textContent = `Study Session - Cycle ${currentCycle} of ${totalCycles}`;
    totalSeconds =
      parseInt(studyMinutesInput.value) * 60 +
      parseInt(studySecondsInput.value || 0);

    // Update phase indicator
    updatePhaseIndicator();

    // Show notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Pomodoro Timer", {
        body: `Break complete! Starting study cycle ${currentCycle} of ${totalCycles}.`,
        icon: "/favicon.ico",
      });
    } else {
      setTimeout(() => {
        alert(
          `Break complete! Starting study cycle ${currentCycle} of ${totalCycles}.`
        );
      }, 100);
    }
  } else if (pomodoroPhase === "longBreak") {
    // Reset pomodoro after long break
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    startBtn.textContent = "Start";
    pauseBtn.disabled = true;
    pauseBtn.textContent = "Pause";

    // Remove running state
    timerContainer.classList.remove("timer-running", "timer-paused");

    pomodoroPhase = "study";
    currentCycle = 1;

    // Enable input fields when timer completes
    enableInputs();

    statusDisplay.textContent = "Pomodoro complete!";

    // Update phase indicator
    updatePhaseIndicator();

    // Show notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Pomodoro Timer", {
        body: "Pomodoro technique complete! Great job!",
        icon: "/favicon.ico",
      });
    } else {
      setTimeout(() => {
        alert("Pomodoro technique complete! Great job!");
      }, 100);
    }

    // Show confetti animation for completing full pomodoro session
    showConfetti();

    totalCycles = parseInt(cyclesInput.value) || 4;
    initTimer();
    return;
  }

  updateDisplay();
}

function playSound() {
  try {
    // Attempt to play the user's audio file first
    const audio = new Audio("for_lovers.wav"); // Ensure file exists and is accessible
    audio.play().catch((e) => {
      console.log("Sound playback failed, switching to generated sound:", e);
      generateBellSound(); // If file fails, play generated bell sound
    });
  } catch (e) {
    console.log("Audio file playback failed, using fallback sound:", e);
    generateBellSound();
  }
}

// Function to generate a pleasant bell-like tone
function generateBellSound() {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 1.5
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.5);
  } catch (fallbackError) {
    console.log("All sound methods failed:", fallbackError);
  }
}

// Pause or unpause timer with visual feedback
function togglePause() {
  if (isRunning) {
    if (isPaused) {
      // Unpause timer
      isPaused = false;
      pauseBtn.textContent = "Pause";

      // Remove paused state, add running state
      timerContainer.classList.remove("timer-paused");
      timerContainer.classList.add("timer-running");

      timer = setInterval(() => {
        if (totalSeconds > 0) {
          totalSeconds--;
          updateDisplay();
        } else {
          if (isPomodoroMode) {
            handlePomodoroPhaseCompletion();
          } else {
            clearInterval(timer);
            isRunning = false;
            startBtn.textContent = "Start";
            pauseBtn.disabled = true;
            pauseBtn.textContent = "Pause";

            // Remove timer states
            timerContainer.classList.remove("timer-running", "timer-paused");

            // Enable input fields when timer completes
            enableInputs();

            statusDisplay.textContent = "Time's up!";

            // Alert when timer completes
            playSound();
            
            // Save study session to dashboard
            saveNormalModeSession();
            
            setTimeout(() => {
              alert("Time's up! Study session complete.");
            }, 100);
          }
        }
      }, 1000);
    } else {
      // Pause timer
      isPaused = true;
      pauseBtn.textContent = "Resume";
      clearInterval(timer);

      // Add paused state, remove running state
      timerContainer.classList.add("timer-paused");
      timerContainer.classList.remove("timer-running");
    }
  }
}

// Enable all input fields with animation
function enableInputs() {
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach((input, index) => {
    setTimeout(() => {
      input.disabled = false;
    }, index * 50); // Staggered enabling
  });

  // Mode buttons
  normalModeBtn.disabled = false;
  pomodoroModeBtn.disabled = false;
}

// Disable all input fields with animation
function disableInputs() {
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach((input, index) => {
    setTimeout(() => {
      input.disabled = true;
    }, index * 50); // Staggered disabling
  });

  // Mode buttons
  normalModeBtn.disabled = true;
  pomodoroModeBtn.disabled = true;
}

// Input validation and formatting for all number inputs
document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.addEventListener("input", function () {
    // Ensure value is numeric and within range
    let value = parseInt(this.value) || 0;
    const max = parseInt(this.max);
    const min = parseInt(this.min);

    if (value > max) {
      value = max;
    } else if (value < min) {
      value = min;
    }

    this.value = value;

    // Update timer display when inputs change
    if (!isRunning && !isPaused) {
      if (this.id === "cycles") {
        totalCycles = value;
        updatePhaseIndicator();
      }
      initTimer();
    }
  });

  // Add focus/blur effects for better UX
  input.addEventListener("focus", function () {
    this.parentElement.classList.add("focused");
  });

  input.addEventListener("blur", function () {
    this.parentElement.classList.remove("focused");
  });
});

// Request notification permission on page load
function requestNotificationPermission() {
  if (
    "Notification" in window &&
    Notification.permission !== "granted" &&
    Notification.permission !== "denied"
  ) {
    Notification.requestPermission();
  }
}

// Event listeners
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", togglePause);
normalModeBtn.addEventListener("click", () => switchMode("normal"));
pomodoroModeBtn.addEventListener("click", () => switchMode("pomodoro"));

// Add animations to buttons
const buttons = document.querySelectorAll(".timer-button, .mode-button");
buttons.forEach((button) => {
  button.addEventListener("mousedown", function () {
    this.style.transform = "scale(0.95)";
  });

  button.addEventListener("mouseup", function () {
    this.style.transform = "";
  });

  button.addEventListener("mouseleave", function () {
    this.style.transform = "";
  });
});

// Add confetti effect for completed pomodoro sessions
function showConfetti() {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.pointerEvents = "none";
  container.style.zIndex = "9999";
  document.body.appendChild(container);

  // Create confetti pieces
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "absolute";
    confetti.style.width = Math.random() * 10 + 5 + "px";
    confetti.style.height = Math.random() * 10 + 5 + "px";
    confetti.style.backgroundColor = [
      "#4CAF50",
      "#FF9800",
      "#2196F3",
      "#FFC107",
      "#9C27B0",
    ][Math.floor(Math.random() * 5)];
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.top = -20 + "px";
    confetti.style.opacity = Math.random() + 0.5;
    confetti.style.transformOrigin = "center";
    container.appendChild(confetti);

    // Animate falling
    const animationDuration = Math.random() * 3 + 2;
    confetti.animate(
      [
        { transform: "translateY(0) rotate(0deg)", opacity: 1 },
        {
          transform: `translateY(${window.innerHeight}px) rotate(${
            Math.random() * 360
          }deg)`,
          opacity: 0,
        },
      ],
      {
        duration: animationDuration * 1000,
        easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
        fill: "forwards",
      }
    );
  }

  // Remove container after animation
  setTimeout(() => {
    document.body.removeChild(container);
  }, 5000);
}

// Initialize timer on page load
document.addEventListener("DOMContentLoaded", function () {
  initTimer();
  requestNotificationPermission();

  // Easter egg: Double-click title to toggle dark mode
  const appTitle = document.querySelector(".app-title");
  appTitle.addEventListener("dblclick", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      document.body.style.background =
        "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";
      timerContainer.style.backgroundColor = "rgba(30, 30, 50, 0.95)";
      timerContainer.style.color = "#e2e8f0";
      document
        .querySelectorAll("h1, h3, .timer-display")
        .forEach((el) => (el.style.color = "#f0f4f8"));
    } else {
      document.body.style.background =
        "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)";
      timerContainer.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
      timerContainer.style.color = "";
      document
        .querySelectorAll("h1, h3, .timer-display")
        .forEach((el) => (el.style.color = ""));
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Get the current page filename
  const currentPage = window.location.pathname.split('/').pop();
  
  // Select all navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Add active class to the current page link
  navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === currentPage) {
          link.classList.add('active');
      }
  });
});
