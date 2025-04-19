document.addEventListener("DOMContentLoaded", function () {
  // Display current date
  displayCurrentDate();

  // Load data and render dashboard
  loadDashboard();
});

function displayCurrentDate() {
  const dateElement = document.getElementById("currentDate");
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const today = new Date().toLocaleDateString("en-US", options);
  dateElement.textContent = today;
}

function loadDashboard() {
  // Get study sessions from localStorage
  const studySessions = getStudySessions();

  // Update dashboard components
  updateStatistics(studySessions);
  updateSessionsList(studySessions);
  renderWeeklyChart(studySessions);
}

function getStudySessions() {
  // Get data from localStorage or return empty array if none exists
  const sessions = localStorage.getItem("studySessions");
  return sessions ? JSON.parse(sessions) : [];
}

function updateStatistics(sessions) {
  if (sessions.length === 0) return;

  // Calculate total time studied in minutes
  const totalMinutes = sessions.reduce(
    (total, session) => total + session.duration,
    0
  );

  // Convert to hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // Calculate average session length
  const averageMinutes = Math.round(totalMinutes / sessions.length);

  // Count sessions in the past 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentSessions = sessions.filter(
    (session) => new Date(session.date) > oneWeekAgo
  );

  // Update DOM elements
  document.getElementById(
    "totalTimeStudied"
  ).textContent = `${hours}h ${minutes}m`;
  document.getElementById("sessionCount").textContent = recentSessions.length;
  document.getElementById("averageSession").textContent = `${averageMinutes}m`;
}

function updateSessionsList(sessions) {
  const sessionsListElement = document.getElementById("sessionsList");

  // Clear the current content
  sessionsListElement.innerHTML = "";

  if (sessions.length === 0) {
    sessionsListElement.innerHTML =
      '<div class="empty-state">No study sessions recorded yet</div>';
    return;
  }

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Take only the 10 most recent sessions
  const recentSessions = sortedSessions.slice(0, 10);

  // Create session items
  recentSessions.forEach((session) => {
    const sessionDate = new Date(session.date);
    const formattedDate = sessionDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const formattedTime = sessionDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Format duration in hours and minutes
    let durationText;
    if (session.duration < 60) {
      durationText = `${session.duration} minutes`;
    } else {
      const hours = Math.floor(session.duration / 60);
      const minutes = session.duration % 60;
      durationText = `${hours}h ${minutes}m`;
    }

    const sessionItem = document.createElement("div");
    sessionItem.className = "session-item";
    sessionItem.innerHTML = `
            <div class="session-date">${formattedDate} at ${formattedTime}</div>
            <div class="session-duration">${durationText}</div>
        `;

    sessionsListElement.appendChild(sessionItem);
  });
}

function renderWeeklyChart(sessions) {
  // Get dates for the past 7 days
  const last7Days = [];
  const dayLabels = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date);

    // Format as short day name (Mon, Tue, etc.)
    dayLabels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
  }

  // Calculate total duration for each day
  const dailyTotals = last7Days.map((day) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    // Filter sessions for this day and sum durations
    const dayTotal = sessions
      .filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      })
      .reduce((total, session) => total + session.duration, 0);

    return dayTotal;
  });

  // Get the chart canvas
  const ctx = document.getElementById("studyChart").getContext("2d");

  // Create the chart
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: dayLabels,
      datasets: [
        {
          label: "Minutes Studied",
          data: dailyTotals,
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Minutes",
          },
        },
        x: {
          title: {
            display: true,
            text: "Day",
          },
        },
      },
    },
  });
}

// DEMO DATA
function generateSampleData() {
  const studySessions = [];
  const now = new Date();

  // Generate sessions for the past 14 days
  for (let i = 0; i < 14; i++) {
    // Some days might have multiple sessions
    const sessionsPerDay = Math.floor(Math.random() * 3);

    for (let j = 0; j <= sessionsPerDay; j++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      date.setHours(
        Math.floor(Math.random() * 12) + 9, // Between 9 AM and 9 PM
        Math.floor(Math.random() * 60),
        0
      );

      studySessions.push({
        date: date.toISOString(),
        duration: Math.floor(Math.random() * 120) + 15, // 15 to 135 minutes
      });
    }
  }

  localStorage.setItem("studySessions", JSON.stringify(studySessions));
  console.log("Sample data generated:", studySessions.length, "sessions");
  return studySessions;
}

document.addEventListener("DOMContentLoaded", function () {
  // Get the current page filename
  const currentPage = window.location.pathname.split("/").pop();

  // Select all navigation links
  const navLinks = document.querySelectorAll(".nav-link");

  // Add active class to the current page link
  navLinks.forEach((link) => {
    const linkHref = link.getAttribute("href");
    if (linkHref === currentPage) {
      link.classList.add("active");
    }
  });
});

const sampleData = generateSampleData();
