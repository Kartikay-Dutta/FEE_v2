// --- Config ---
const GITHUB_URL = "https://github.com/Kartikay-Dutta/FEE_v2";

// --- Menu dropdown ---
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');

function closeMenu() {
  menuDropdown.classList.remove('show');
  menuDropdown.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');
}
function openMenu() {
  menuDropdown.classList.add('show');
  menuDropdown.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true');
}

menuBtn.addEventListener('click', (e) => {
  const isOpen = menuDropdown.classList.contains('show');
  if (isOpen) closeMenu();
  else openMenu();
});

// close when clicking outside
document.addEventListener('click', (e) => {
  if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
    closeMenu();
  }
});

// --- Menu actions ---
document.getElementById('aboutUsLink').href = GITHUB_URL;

const favoritesBtn = document.getElementById('favoritesBtn');
const historyBtn = document.getElementById('historyBtn');
const changeUserBtn = document.getElementById('changeUserBtn');

const favoritesModal = document.getElementById('favoritesModal');
const favoritesListEl = document.getElementById('favoritesList');
const closeFavorites = document.getElementById('closeFavorites');

// open favorites modal (simple example - reads from localStorage)
favoritesBtn.addEventListener('click', () => {
  closeMenu();
  const data = JSON.parse(localStorage.getItem('wn_favorites') || '[]');
  if (!data.length) favoritesListEl.innerHTML = "<p style='color:#ddd;margin:6px 0;'>No favorites yet.</p>";
  else {
    favoritesListEl.innerHTML = '<ul style="padding-left:16px;margin:6px 0;">' +
      data.map(d => `<li style="padding:6px 0;">${d}</li>`).join('') +
      '</ul>';
  }
  favoritesModal.classList.add('show');
  favoritesModal.setAttribute('aria-hidden', 'false');
});

// history simple demo
historyBtn.addEventListener('click', () => {
  closeMenu();
  alert('History feature placeholder — implement with your API / local logs.');
});

// change user simple demo
changeUserBtn.addEventListener('click', () => {
  closeMenu();
  const newUser = prompt('Enter username to switch to:');
  if (newUser) alert('Switched to: ' + newUser + ' (demo only)');
});

// close favorites
closeFavorites.addEventListener('click', () => {
  favoritesModal.classList.remove('show');
  favoritesModal.setAttribute('aria-hidden', 'true');
});

// close modal on outside click
favoritesModal.addEventListener('click', (e) => {
  if (e.target === favoritesModal) {
    favoritesModal.classList.remove('show');
    favoritesModal.setAttribute('aria-hidden', 'true');
  }
});

// === Theme Toggle Functionality ===
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme if available
if (localStorage.getItem('theme') === 'light') {
  body.classList.add('light-mode');
  themeToggle.textContent = '🌙 Dark Mode';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');

  if (body.classList.contains('light-mode')) {
    themeToggle.textContent = '🌙 Dark Mode';
    localStorage.setItem('theme', 'light');
  } else {
    themeToggle.textContent = '☀️ Light Mode';
    localStorage.setItem('theme', 'dark');
  }
});

// --- Simple clock & date sample to look live (updates every second) ---
function updateClock() {
  const now = new Date();
  const hh = now.getHours().toString().padStart(2,'0');
  const mm = now.getMinutes().toString().padStart(2,'0');
  document.getElementById('clock').textContent = `${hh}:${mm}`;

  const options = { weekday: 'long', day: 'numeric', month: 'short' };
  document.getElementById('date').textContent = now.toLocaleDateString(undefined, options);
}
updateClock();
setInterval(updateClock, 1000);

// --- Accessibility: keyboard support for menu ---
menuBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const isOpen = menuDropdown.classList.contains('show');
    if (isOpen) closeMenu(); else openMenu();
  }
});
document.getElementById("mode-toggle").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

// API KEY
const apiKey = "2ba7dd79b4bde9f946abab213a551ac9";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=chandigarh";

async function checkWeather() {
  const reponse = await fetch(apiUrl + `&appid=${apiKey}`);
  var data = await response.json();
  console.log(data);
}