// GitHub Repo Link
const githubUrl = "https://github.com/Kartikay-Dutta/FEE_v2";

// Video files for light/dark themes
const themeVideos = {
  light: "images/background_bg.mp4", // day
  dark: "images/dark_bg(2).mp4"      // night
};

// Elements
const video = document.getElementById("bg-video");
const videoSource = document.getElementById("bg-video-source");
const themeToggle = document.getElementById("theme-toggle");
const githubLink = document.getElementById("github-link");

// Set GitHub link
if (githubLink) githubLink.href = githubUrl;

// Theme switch function
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";

  const newSrc = themeVideos[theme];
  if (videoSource.src.includes(newSrc)) return;

  video.pause();
  videoSource.setAttribute("src", newSrc);
  video.load();
  video.play().catch(() => {});
  localStorage.setItem("theme", theme);
}

// Initialize theme
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// Toggle button
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
});

// Subscribe form
function handleSubscribe(e) {
  e.preventDefault();
  const emailInput = document.querySelector("#email");
  if (emailInput && emailInput.value.trim()) {
    alert("Thanks for subscribing! You'll get updates soon.");
    emailInput.value = "";
  }
}

// Accessibility fallback
video.addEventListener("error", () => {
  video.style.display = "none";
  document.getElementById("hero").style.background =
    "linear-gradient(180deg, rgba(20,30,48,1) 0%, rgba(48,57,82,1) 100%)";
});

// Handle Get Started button (redirect later)
const getStartedBtn = document.getElementById("get-started-btn");
if (getStartedBtn) {
  getStartedBtn.addEventListener("click", () => {
    // TODO: Replace with your sign-in / sign-up page URL
    window.location.href = "signin_page.html";
  });
}
