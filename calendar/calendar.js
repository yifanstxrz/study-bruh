// Global variables
let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("calendarEvents")) || [];

// DOM elements
const currentDateElement = document.getElementById("current-date");
const monthName = document.getElementById("month-name");
const dayName = document.getElementById("day-name");
const calendarDays = document.getElementById("calendar-days");
const timeSlots = document.getElementById("time-slots");
const monthView = document.getElementById("month-view");
const dailyView = document.getElementById("daily-view");
const eventModal = document.getElementById("event-modal");
const eventForm = document.getElementById("event-form");
const eventTitle = document.getElementById("event-title");
const eventDate = document.getElementById("event-date");
const eventStartTime = document.getElementById("event-start-time");
const eventEndTime = document.getElementById("event-end-time");
const eventCategory = document.getElementById("event-category");
const eventDescription = document.getElementById("event-description");
const eventId = document.getElementById("event-id");
const deleteEventBtn = document.getElementById("delete-event");
const modalTitle = document.getElementById("modal-title");

// Button event listeners
document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

document.getElementById("prev-day").addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() - 1);
  renderDailyView();
});

document.getElementById("next-day").addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() + 1);
  renderDailyView();
});

document.getElementById("today-btn").addEventListener("click", () => {
  currentDate = new Date();
  if (monthView.style.display !== "none") {
    renderCalendar();
  } else {
    renderDailyView();
  }
});

document.getElementById("month-view-btn").addEventListener("click", () => {
  dailyView.style.display = "none";
  monthView.style.display = "block";
  renderCalendar();
});

document.getElementById("day-view-btn").addEventListener("click", () => {
  monthView.style.display = "none";
  dailyView.style.display = "flex";
  renderDailyView();
});

document.getElementById("add-event-btn").addEventListener("click", () => {
  openEventModal();
});

document.getElementById("close-modal").addEventListener("click", () => {
  eventModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === eventModal) {
    eventModal.style.display = "none";
  }
});

deleteEventBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete this event?")) {
    const id = eventId.value;
    events = events.filter((event) => event.id !== id);
    localStorage.setItem("calendarEvents", JSON.stringify(events));
    eventModal.style.display = "none";

    if (monthView.style.display !== "none") {
      renderCalendar();
    } else {
      renderDailyView();
    }
  }
});

eventForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = eventId.value || Date.now().toString();
  const newEvent = {
    id: id,
    title: eventTitle.value,
    date: eventDate.value,
    startTime: eventStartTime.value,
    endTime: eventEndTime.value,
    category: eventCategory.value,
    description: eventDescription.value,
  };

  // Validate time range
  const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
  const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);

  if (endDateTime <= startDateTime) {
    alert("End time must be after start time");
    return;
  }

  if (eventId.value) {
    // Update existing event
    events = events.map((event) => (event.id === id ? newEvent : event));
  } else {
    // Add new event
    events.push(newEvent);
  }

  localStorage.setItem("calendarEvents", JSON.stringify(events));
  eventModal.style.display = "none";

  if (monthView.style.display !== "none") {
    renderCalendar();
  } else {
    renderDailyView();
  }
});

// Helper Functions
function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function formatISODate(date) {
  return date.toISOString().split("T")[0];
}

function getMonthName(date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function getDayName(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getEventsForDate(date) {
  const dateString = formatISODate(date);
  return events.filter((event) => event.date === dateString);
}

function openEventModal(event = null) {
  if (event) {
    modalTitle.textContent = "Edit Event";
    eventId.value = event.id;
    eventTitle.value = event.title;
    eventDate.value = event.date;
    eventStartTime.value = event.startTime;
    eventEndTime.value = event.endTime;
    eventCategory.value = event.category || "other";
    eventDescription.value = event.description;
    deleteEventBtn.style.display = "block";
  } else {
    modalTitle.textContent = "Add Event";
    eventForm.reset();
    eventId.value = "";
    eventDate.value = formatISODate(currentDate);
    eventStartTime.value = "09:00";
    eventEndTime.value = "10:00";
    eventCategory.value = "other";
    deleteEventBtn.style.display = "none";
  }

  eventModal.style.display = "flex";
}

// Render Functions
function renderCalendar() {
  const today = new Date();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Update header date
  currentDateElement.textContent = formatDate(currentDate);
  monthName.textContent = getMonthName(currentDate);

  // Clear previous calendar days
  calendarDays.innerHTML = "";

  // Calculate days from previous month to display
  const firstDayOfWeek = firstDay.getDay();
  const prevMonthDays = firstDayOfWeek;

  // Calculate days from next month to display
  const totalDaysToShow = 42; // 6 rows of 7 days
  const nextMonthDays = totalDaysToShow - (prevMonthDays + lastDay.getDate());

  // Add days from previous month
  const prevMonthLastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ).getDate();
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      day
    );
    const dayEvents = getEventsForDate(date);

    const dayElement = createDayElement(day, "other-month", date, dayEvents);
    calendarDays.appendChild(dayElement);
  }

  // Add days from current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dayEvents = getEventsForDate(date);

    let className = "";
    if (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    ) {
      className = "current-day";
    }

    const dayElement = createDayElement(day, className, date, dayEvents);
    calendarDays.appendChild(dayElement);
  }

  // Add days from next month
  for (let day = 1; day <= nextMonthDays; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      day
    );
    const dayEvents = getEventsForDate(date);

    const dayElement = createDayElement(day, "other-month", date, dayEvents);
    calendarDays.appendChild(dayElement);
  }
}

function createDayElement(day, className, date, dayEvents) {
  const dayElement = document.createElement("div");
  dayElement.className = "day " + className;
  dayElement.setAttribute(
    "data-day",
    date.toLocaleDateString("en-US", { weekday: "short" })
  );

  const dayNumber = document.createElement("div");
  dayNumber.className = "day-number";
  dayNumber.textContent = day;
  dayElement.appendChild(dayNumber);

  // Handle day click
  dayElement.addEventListener("click", () => {
    currentDate = new Date(date);
    if (dayEvents.length > 0) {
      // If there are events, switch to daily view
      monthView.style.display = "none";
      dailyView.style.display = "flex";
      renderDailyView();
    } else {
      // Otherwise open modal to add event
      openEventModal();
    }
  });

  // Add events for this day
  if (dayEvents.length > 0) {
    const eventsContainer = document.createElement("div");
    eventsContainer.className = "events";

    dayEvents.forEach((event) => {
      const eventElement = document.createElement("div");
      eventElement.className = `event ${event.category || "other"}`;
      eventElement.textContent = `${event.startTime} ${event.title}`;

      eventElement.addEventListener("click", (e) => {
        e.stopPropagation();
        openEventModal(event);
      });

      eventsContainer.appendChild(eventElement);
    });

    dayElement.appendChild(eventsContainer);
  }

  return dayElement;
}

function renderDailyView() {
  // Update headers
  currentDateElement.textContent = formatDate(currentDate);
  dayName.textContent = getDayName(currentDate);

  // Clear previous time slots
  timeSlots.innerHTML = "";

  // Create time slots for the day (24-hour format)
  for (let hour = 0; hour < 24; hour++) {
    const timeSlot = document.createElement("div");
    timeSlot.className = "time-slot";

    const timeLabel = document.createElement("div");
    timeLabel.className = "time-label";
    timeLabel.textContent = `${hour.toString().padStart(2, "0")}:00`;

    const slotContent = document.createElement("div");
    slotContent.className = "slot-content";

    timeSlot.appendChild(timeLabel);
    timeSlot.appendChild(slotContent);
    timeSlots.appendChild(timeSlot);
  }

  // Get events for the day
  const dayEvents = getEventsForDate(currentDate);

  // Add events to time slots
  dayEvents.forEach((event) => {
    if (!event.startTime) return;

    const startHour = parseInt(event.startTime.split(":")[0]);
    const startMinute = parseInt(event.startTime.split(":")[1]);
    const endHour = parseInt(event.endTime.split(":")[0]);
    const endMinute = parseInt(event.endTime.split(":")[1]);

    // Calculate position and height
    const startPosition = startHour * 60 + startMinute;
    const endPosition = endHour * 60 + endMinute;
    const duration = endPosition - startPosition;

    const eventElement = document.createElement("div");
    eventElement.className = `daily-event ${event.category || "other"}`;
    eventElement.textContent = event.title;

    // Position calculation
    const topPosition = (startPosition / 60) * 60;
    const heightValue = (duration / 60) * 60;

    // Set position and height
    eventElement.style.top = `${topPosition}px`;
    eventElement.style.height = `${heightValue}px`;

    eventElement.addEventListener("click", () => {
      openEventModal(event);
    });

    // Find the correct time slot to append the event
    const slotContent =
      timeSlots.children[startHour].querySelector(".slot-content");
    slotContent.appendChild(eventElement);
  });

  // Add click listener to time slots for adding new events
  timeSlots.querySelectorAll(".slot-content").forEach((slot, index) => {
    slot.addEventListener("click", (e) => {
      if (e.target === slot) {
        const newEvent = {
          date: formatISODate(currentDate),
          startTime: `${index.toString().padStart(2, "0")}:00`,
          endTime: `${(index + 1).toString().padStart(2, "0")}:00`,
        };
        openEventModal(newEvent);
      }
    });
  });
}

// Fix for existing events without category
events = events.map((event) => {
  if (!event.category) {
    event.category = "other";
  }
  return event;
});

// Initialize the calendar
function initCalendar() {
  renderCalendar();
}

// Initialize the calendar on load
window.onload = function () {
  initCalendar();
};
