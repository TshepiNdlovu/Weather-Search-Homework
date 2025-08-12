const API_KEY = "b2a5adcct04b33178913oc335f405433";

function formatDateFromTimestamp(unixSeconds) {
  const date = new Date(unixSeconds * 1000);
  let minutes = date.getMinutes();
  let hours = date.getHours();
  if (minutes < 10) minutes = `0${minutes}`;
  if (hours < 10) hours = `0${hours}`;
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = days[date.getDay()];
  return `${day} ${hours}:${minutes}`;
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function setHTML(selector, html) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = html;
}

function showLoadingState() {
  setText("#current-city", "Loading...");
  setText("#current-temp", "—");
  setText("#current-description", "");
  setText("#current-humidity", "—");
  setText("#current-wind", "—");
  setHTML("#current-icon", "");
  setText("#current-date", "");
}

function renderWeather(data) {
  if (!data) return;
  const city = data.city || "—";
  const temp = (data.temperature && data.temperature.current) ?? "—";
  const description = (data.condition && data.condition.description) || "";
  const humidity = (data.temperature && data.temperature.humidity) ?? "—";
  const windSpeed = (data.wind && data.wind.speed) ?? "—";
  const iconUrl = (data.condition && data.condition.icon_url) || null;
  const timeUnix = data.time ?? null;

  setText("#current-city", city);
  setText("#current-temp", Number.isFinite(temp) ? Math.round(temp) : temp);
  setText("#current-description", description);
  setText("#current-humidity", `${humidity}%`);
  setText("#current-wind", `${windSpeed} km/h`);
  setText("#current-date", timeUnix ? formatDateFromTimestamp(timeUnix) : "");
  setHTML(
    "#current-icon",
    iconUrl ? `<img src="${iconUrl}" alt="${description}" />` : ""
  );
}

function handleApiError(err) {
  console.error("Weather API error:", err);
  alert(
    "Sorry — could not find that city or there was an API error. Try another city."
  );
}

async function fetchCityWeather(city) {
  if (!city) return;
  const url = `https://api.shecodes.io/weather/v1/current?query=${encodeURIComponent(
    city
  )}&key=${API_KEY}&units=metric`;

  showLoadingState();

  if (typeof axios === "undefined") {
    console.error(
      "Axios is not loaded. Make sure you included the CDN <script> in index.html."
    );
    alert("Internal error: network library missing. Please check console.");
    return;
  }

  try {
    const response = await axios.get(url);
    if (!response || !response.data)
      throw new Error("No data returned from API");
    renderWeather(response.data);
  } catch (err) {
    handleApiError(err);
  }
}

function handleSearchSubmit(event) {
  event.preventDefault();
  const input = document.querySelector("#search-input");
  const city = input ? input.value.trim() : "";
  if (!city) return;
  fetchCityWeather(city);
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#search-form");
  if (form) form.addEventListener("submit", handleSearchSubmit);
  fetchCityWeather("Paris");
});
