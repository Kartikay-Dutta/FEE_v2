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

// --- Dark mode toggle (kept as original UI behaviour) ---
const darkModeToggle = document.getElementById('darkModeToggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('wn_theme') || 'dark'; // keep dark by default to match look

function applyTheme(theme) {
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    darkModeToggle.checked = true;
  } else {
    root.removeAttribute('data-theme');
    darkModeToggle.checked = false;
  }
  localStorage.setItem('wn_theme', theme);
}
applyTheme(savedTheme);

darkModeToggle.addEventListener('change', () => {
  const next = darkModeToggle.checked ? 'dark' : 'light';
  applyTheme(next);
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

