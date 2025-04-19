document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const themeToggle = document.getElementById("themeToggle");
  const locationInput = document.getElementById("locationInput");
  const addLocationBtn = document.getElementById("addLocationBtn");
  const locationsContainer = document.getElementById("locationsContainer");

  // State management
  let darkMode = false;
  let locations = [];
  let temperatureUnit = "celsius"; // Default to Celsius

  // Initialize from local storage
  initializeFromLocalStorage();

  // Event listeners
  themeToggle.addEventListener("click", toggleTheme);
  addLocationBtn.addEventListener("click", addLocation);
  locationInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addLocation();
  });

  // Functions
  function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle("dark-mode", darkMode);
    themeToggle.textContent = darkMode ? "☀️" : "🌙";
    localStorage.setItem("darkMode", darkMode);
  }

  function initializeFromLocalStorage() {
    // Load dark mode preference
    if (localStorage.getItem("darkMode") === "true") {
      darkMode = true;
      document.body.classList.add("dark-mode");
      themeToggle.textContent = "☀️";
    }

    // Load saved locations
    const savedLocations = localStorage.getItem("weatherLocations");
    if (savedLocations) {
      locations = JSON.parse(savedLocations);
      locations.forEach((location) => fetchWeatherData(location));
    } else {
      showNoLocationsMessage();
    }

    // Load temperature unit preference
    if (localStorage.getItem("temperatureUnit")) {
      temperatureUnit = localStorage.getItem("temperatureUnit");
    }
  }

  function showNoLocationsMessage() {
    if (locations.length === 0) {
      locationsContainer.innerHTML = `
                <div class="no-locations">
                    <p>No locations added yet. Search for a city above to get started!</p>
                </div>
            `;
    }
  }

  function addLocation() {
    const locationName = locationInput.value.trim();

    if (!locationName) {
      showInputError("Please enter a location");
      return;
    }

    // Check if location already exists
    if (locations.includes(locationName)) {
      showInputError("Location already added");
      return;
    }

    // Add to locations array
    locations.push(locationName);
    saveLocationsToLocalStorage();

    // Clear input and error
    locationInput.value = "";
    locationInput.classList.remove("error");

    // Fetch weather data
    fetchWeatherData(locationName);
  }

  function showInputError(message) {
    locationInput.placeholder = message;
    locationInput.classList.add("error");

    setTimeout(() => {
      locationInput.placeholder = "Enter city name, coordinates, or zip code";
      locationInput.classList.remove("error");
    }, 2000);
  }

  function saveLocationsToLocalStorage() {
    localStorage.setItem("weatherLocations", JSON.stringify(locations));
  }

  function removeLocation(locationName) {
    const index = locations.indexOf(locationName);
    if (index > -1) {
      locations.splice(index, 1);
      saveLocationsToLocalStorage();

      // Remove card with animation
      const card = document.getElementById(
        `card-${locationName.replace(/\s+/g, "-").toLowerCase()}`
      );
      if (card) {
        card.style.opacity = "0";
        card.style.transform = "scale(0.8)";
        setTimeout(() => {
          card.remove();
          if (locations.length === 0) {
            showNoLocationsMessage();
          }
        }, 300);
      }
    }
  }

  function refreshWeatherData(locationName) {
    const refreshBtn = document.querySelector(
      `#refresh-${locationName.replace(/\s+/g, "-").toLowerCase()}`
    );
    if (refreshBtn) {
      refreshBtn.classList.add("loading");
    }

    fetchWeatherData(locationName, true);
  }

  function toggleTemperatureUnit(locationName) {
    const locationId = locationName.replace(/\s+/g, "-").toLowerCase();
    const celsiusBtn = document.querySelector(`#celsius-${locationId}`);
    const fahrenheitBtn = document.querySelector(`#fahrenheit-${locationId}`);
    const tempElement = document.querySelector(`#temp-${locationId}`);

    if (celsiusBtn && fahrenheitBtn && tempElement) {
      const currentTemp = parseFloat(tempElement.dataset.celsius);

      if (celsiusBtn.classList.contains("active")) {
        // Switch to Fahrenheit
        celsiusBtn.classList.remove("active");
        fahrenheitBtn.classList.add("active");
        const fahrenheit = (currentTemp * 9) / 5 + 32;
        tempElement.textContent = `${fahrenheit.toFixed(1)}°F`;
        temperatureUnit = "fahrenheit";
      } else {
        // Switch to Celsius
        fahrenheitBtn.classList.remove("active");
        celsiusBtn.classList.add("active");
        tempElement.textContent = `${currentTemp.toFixed(1)}°C`;
        temperatureUnit = "celsius";
      }

      localStorage.setItem("temperatureUnit", temperatureUnit);
    }
  }

  async function fetchWeatherData(locationName, isRefresh = false) {
    // Clear no locations message if present
    if (document.querySelector(".no-locations")) {
      locationsContainer.innerHTML = "";
    }

    const locationId = locationName.replace(/\s+/g, "-").toLowerCase();

    // Create or find card
    let card = document.getElementById(`card-${locationId}`);

    if (!card) {
      // Create new card with loading state
      card = document.createElement("div");
      card.id = `card-${locationId}`;
      card.className = "location-card";
      card.style.animationDelay = `${locations.indexOf(locationName) * 0.2}s`;

      card.innerHTML = `
                <div class="loading">
                    <div class="loader"></div>
                </div>
            `;

      locationsContainer.appendChild(card);
    } else if (isRefresh) {
      // Just update the refresh button
      const refreshBtn = card.querySelector(".refresh-btn");
      if (refreshBtn) refreshBtn.classList.add("loading");
    }

    try {
      // First fetch geocoding data
      const geocodingResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          locationName
        )}&count=1`
      );
      const geocodingData = await geocodingResponse.json();

      if (!geocodingData.results || geocodingData.results.length === 0) {
        throw new Error("Location not found");
      }

      const location = geocodingData.results[0];
      const { latitude, longitude, name, timezone } = location;

      // Now fetch weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m&timezone=${timezone}`
      );
      const weatherData = await weatherResponse.json();

      if (!weatherData.current) {
        throw new Error("Weather data not available");
      }

      updateWeatherCard(card, locationName, weatherData, isRefresh);
    } catch (error) {
      console.error("Error fetching weather data:", error);

      card.innerHTML = `
                <div class="location-header">
                    <h3 class="location-name">${locationName}</h3>
                    <button class="remove-btn" onclick="removeLocation('${locationName}')">×</button>
                </div>
                <div class="error">
                    <p>Error: ${
                      error.message || "Could not fetch weather data"
                    }</p>
                    <button class="refresh-btn" id="refresh-${locationId}" onclick="refreshWeatherData('${locationName}')">↻</button>
                </div>
            `;
    }
  }

  function updateWeatherCard(card, locationName, weatherData, isRefresh) {
    const locationId = locationName.replace(/\s+/g, "-").toLowerCase();
    const current = weatherData.current;

    // Get weather condition icon
    const weatherIcon = getWeatherIcon(current.weather_code);
    const weatherDescription = getWeatherDescription(current.weather_code);

    // Format temperature based on user preference
    const tempC = current.temperature_2m;
    const tempF = (tempC * 9) / 5 + 32;
    const displayTemp =
      temperatureUnit === "celsius"
        ? `${tempC.toFixed(1)}°C`
        : `${tempF.toFixed(1)}°F`;

    // Update card content
    card.innerHTML = `
            <div class="location-header">
                <h3 class="location-name">${locationName}</h3>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button class="refresh-btn" id="refresh-${locationId}" onclick="refreshWeatherData('${locationName}')">↻</button>
                    <button class="remove-btn" onclick="removeLocation('${locationName}')">×</button>
                </div>
            </div>
            <div class="weather-info">
                <div>
                    <div class="temperature" id="temp-${locationId}" data-celsius="${tempC}">${displayTemp}</div>
                    <div class="temp-unit-toggle">
                        <button class="unit-btn ${
                          temperatureUnit === "celsius" ? "active" : ""
                        }" id="celsius-${locationId}" onclick="toggleTemperatureUnit('${locationName}')">°C</button>
                        <button class="unit-btn ${
                          temperatureUnit === "fahrenheit" ? "active" : ""
                        }" id="fahrenheit-${locationId}" onclick="toggleTemperatureUnit('${locationName}')">°F</button>
                    </div>
                </div>
                <div>
                    <div class="weather-condition">
                        <span class="weather-icon">${weatherIcon}</span>
                        <span>${weatherDescription}</span>
                    </div>
                </div>
            </div>
            <div class="details">
                <div>
                    <span>Feels like:</span>
                    <span>${
                      temperatureUnit === "celsius"
                        ? `${current.apparent_temperature.toFixed(1)}°C`
                        : `${(
                            (current.apparent_temperature * 9) / 5 +
                            32
                          ).toFixed(1)}°F`
                    }
                    </span>
                </div>
                <div>
                    <span>Humidity:</span>
                    <span>${current.relative_humidity_2m}%</span>
                </div>
                <div>
                    <span>Precipitation:</span>
                    <span>${current.precipitation} mm</span>
                </div>
                <div>
                    <span>Wind Speed:</span>
                    <span>${current.wind_speed_10m} km/h</span>
                </div>
                <div>
                    <span>Cloud Cover:</span>
                    <span>${current.cloud_cover}%</span>
                </div>
                <div>
                    <span>Last updated:</span>
                    <span>${new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        `;

    // Animation for refresh
    if (isRefresh) {
      card.style.animation = "none";
      card.offsetHeight; // Trigger reflow
      card.style.animation = "fadeIn 0.5s forwards";
    }
  }

  function getWeatherIcon(code) {
    // WMO Weather interpretation codes
    // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
    if (code === 0) return "☀️"; // Clear sky
    if (code === 1) return "🌤️"; // Mainly clear
    if (code === 2) return "⛅"; // Partly cloudy
    if (code === 3) return "☁️"; // Overcast
    if ([45, 48].includes(code)) return "🌫️"; // Fog
    if ([51, 53, 55].includes(code)) return "🌧️"; // Drizzle
    if ([56, 57].includes(code)) return "🌨️"; // Freezing Drizzle
    if ([61, 63, 65].includes(code)) return "🌧️"; // Rain
    if ([66, 67].includes(code)) return "🌨️"; // Freezing Rain
    if ([71, 73, 75].includes(code)) return "❄️"; // Snow fall
    if (code === 77) return "❄️"; // Snow grains
    if ([80, 81, 82].includes(code)) return "🌦️"; // Rain showers
    if ([85, 86].includes(code)) return "🌨️"; // Snow showers
    if ([95, 96, 99].includes(code)) return "⛈️"; // Thunderstorm
    return "🌡️"; // Default
  }

  function getWeatherDescription(code) {
    if (code === 0) return "Clear sky";
    if (code === 1) return "Mainly clear";
    if (code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55].includes(code)) return "Drizzle";
    if ([56, 57].includes(code)) return "Freezing Drizzle";
    if ([61, 63, 65].includes(code)) return "Rain";
    if ([66, 67].includes(code)) return "Freezing Rain";
    if ([71, 73, 75].includes(code)) return "Snow";
    if (code === 77) return "Snow grains";
    if ([80, 81, 82].includes(code)) return "Rain showers";
    if ([85, 86].includes(code)) return "Snow showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Unknown";
  }

  // Expose functions to global scope for onclick handlers
  window.removeLocation = removeLocation;
  window.refreshWeatherData = refreshWeatherData;
  window.toggleTemperatureUnit = toggleTemperatureUnit;
});
