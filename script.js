/* Theme initialization & toggle (follows system by default) */
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function setToggleUI(isDark) {
  if (!themeToggle) return;
  themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    setToggleUI(true);
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    setToggleUI(false);
  } else {
    // system/default: remove explicit override so CSS media query applies
    document.documentElement.removeAttribute('data-theme');
    setToggleUI(prefersDark.matches);
  }
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved);
  } else {
    applyTheme(null);
    // update UI when system preference changes, but only if user hasn't set an override
    prefersDark.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) setToggleUI(e.matches);
    });
  }

  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {
    const current = localStorage.getItem('theme');
    if (current === 'dark') {
      // switch to light
      localStorage.setItem('theme', 'light');
      applyTheme('light');
    } else if (current === 'light') {
      // revert to system/default
      localStorage.removeItem('theme');
      applyTheme(null);
    } else {
      // no override: set opposite of system
      const newTheme = prefersDark.matches ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    }
  });
}

/* Persisted checkbox state */
function initCheckboxes() {
  const checkboxes = document.querySelectorAll("input[type='checkbox']");

  checkboxes.forEach((checkbox, index) => {
    const saved = localStorage.getItem("cb-" + index);
    checkbox.checked = saved === "true";

    checkbox.addEventListener("change", () => {
      localStorage.setItem("cb-" + index, checkbox.checked);
    });
  });
}

/* Initialize on DOM ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { initTheme(); initCheckboxes(); });
} else {
  initTheme(); initCheckboxes();
}
