const content = document.getElementById("content");
const stats = document.getElementById("stats");

// ---------- THEME ----------
const themeToggle = document.getElementById("themeToggle");
const headerButtons = document.querySelectorAll('header .actions button');

function updateThemeFromStorage() {
  const isDark = localStorage.getItem("theme") === "dark";
  if (isDark) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}

function updateThemeButton() {
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️ Day" : "🌙 Night";
  themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  themeToggle.title = isDark ? "Switch to day mode" : "Switch to night mode";
}

updateThemeFromStorage();
updateThemeButton();

// add consistent classes to header buttons
headerButtons.forEach((btn) => {
  btn.classList.add('btn');
  if (btn.id === 'exportBtn') btn.classList.add('primary');
  else btn.classList.add('ghost');
});

themeToggle.addEventListener('click', () => {
  const isDarkNow = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDarkNow ? "dark" : "light");
  updateThemeButton();
});

// ---------- RENDER ----------
const phaseSelect = document.getElementById('phaseSelect');

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

if (typeof roadmap === 'undefined' || !Array.isArray(roadmap) || roadmap.length === 0) {
  console.error('Roadmap not loaded or empty:', roadmap);
  content.innerHTML = `<div class="card error">Roadmap not found. Ensure <code>data.js</code> is included and loading correctly (check console/network).</div>`;
} else {
  try {
    roadmap.forEach((phase, pIdx) => {
  const phaseBlock = document.createElement('section');
  phaseBlock.className = 'phase-block';
  phaseBlock.id = `phase-${pIdx}`;

  const phaseHeader = document.createElement('div');
  phaseHeader.className = 'phase-header';

  const titleRow = document.createElement('div');
  titleRow.className = 'phase-title-row';
  titleRow.innerHTML = `
    <div style="display:flex;gap:0.6rem;align-items:center">
      <button class="phase-toggle" aria-expanded="true" aria-controls="phase-days-${pIdx}">
        <span class="chev" aria-hidden="true">▾</span>
        <strong>${phase.phase}</strong>
      </button>
    </div>
    <div class="phase-controls">
      <label class="sr-only" for="weekSelect-${pIdx}">Week</label>
      <select id="weekSelect-${pIdx}" class="week-select" aria-label="${phase.phase} week select">
        <option value="all">All weeks</option>
      </select>
    </div>
  `;
  phaseHeader.appendChild(titleRow);

  const progressWrap = document.createElement('div');
  progressWrap.className = 'progress-bar';
  progressWrap.innerHTML = `<div class="progress-fill" id="progress-${pIdx}"></div>`;
  phaseHeader.appendChild(progressWrap);

  phaseBlock.appendChild(phaseHeader);

  const daysContainer = document.createElement('div');
  daysContainer.className = 'phase-days';
  daysContainer.id = `phase-days-${pIdx}`;

  const weeks = chunk(phase.days, 7);

  weeks.forEach((weekDays, wIdx) => {
    const weekWrap = document.createElement('div');
    weekWrap.className = 'week-wrap';
    weekWrap.dataset.week = String(wIdx + 1);

    weekDays.forEach((day, dIdx) => {
      const dayIndex = wIdx * 7 + dIdx;
      const doneKey = `done-${pIdx}-${dayIndex}`;
      const noteKey = `note-${pIdx}-${dayIndex}`;

      const isDone = localStorage.getItem(doneKey) === 'true';
      const note = localStorage.getItem(noteKey) || '';

      const dayCard = document.createElement('div');
      dayCard.className = 'day-card';
      dayCard.dataset.week = String(wIdx + 1);

      dayCard.innerHTML = `
        <div class="day-header">
          <label>
            <input type="checkbox" ${isDone ? 'checked' : ''} />
            <strong>${day.day} — ${day.title}</strong>
          </label>
        </div>

        <ul class="resources">
          ${
            day.resources?.length
              ? day.resources
                  .map(
                    r =>
                      `<li><a href="${r[1]}" target="_blank" rel="noopener noreferrer">
                         <svg class="link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                           <path d="M10.59 13.41a1 1 0 0 0 1.41 0L16 9.41V12a1 1 0 1 0 2 0V7a1 1 0 0 0-1-1h-5a1 1 0 1 0 0 2h2.59l-4 4a1 1 0 0 0 0 1.41z" />
                         </svg>
                         <span>${r[0]}</span>
                        </a></li>`
                  )
                  .join('')
              : "<li class='muted'>Refresher / build day</li>"
          }
        </ul>

        <textarea placeholder="Remarks, insights, mistakes...">${note}</textarea>
      `;

      const checkbox = dayCard.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => {
        localStorage.setItem(doneKey, checkbox.checked);
        updateProgress();
      });

      const textarea = dayCard.querySelector('textarea');
      textarea.addEventListener('input', () => {
        localStorage.setItem(noteKey, textarea.value);
      });

      weekWrap.appendChild(dayCard);
    });

    daysContainer.appendChild(weekWrap);
  });

  phaseBlock.appendChild(daysContainer);
  content.appendChild(phaseBlock);

  // populate week select
  const weekSelect = document.getElementById(`weekSelect-${pIdx}`);
  weeks.forEach((_, i) => {
    const opt = document.createElement('option');
    opt.value = String(i + 1);
    opt.textContent = `Week ${i + 1}`;
    weekSelect.appendChild(opt);
  });

  weekSelect.addEventListener('change', () => {
    const val = weekSelect.value;
    daysContainer.querySelectorAll('.week-wrap').forEach(w => {
      w.style.display = val === 'all' || w.dataset.week === val ? '' : 'none';
    });
  });

  const toggleBtn = phaseHeader.querySelector('.phase-toggle');
  const chev = toggleBtn.querySelector('.chev');
  toggleBtn.addEventListener('click', () => {
    const collapsed = daysContainer.classList.toggle('hidden');
    toggleBtn.setAttribute('aria-expanded', !collapsed);
    chev.classList.toggle('collapsed', collapsed);
  });

  const opt = document.createElement('option');
  opt.value = String(pIdx);
  opt.textContent = phase.phase;
  phaseSelect.appendChild(opt);
});
  } catch (err) {
    console.error('Error rendering roadmap', err);
    content.innerHTML = `<div class="card error">Error rendering roadmap. Check console for details.</div>`;
  }
}

phaseSelect.addEventListener('change', () => {
  const val = phaseSelect.value;
  document.querySelectorAll('.phase-block').forEach(block => {
    block.style.display = val === 'all' || block.id === `phase-${val}` ? '' : 'none';
  });
});

updateProgress();

// ---------- PROGRESS ----------
function updateProgress() {
  if (typeof roadmap === 'undefined' || !Array.isArray(roadmap)) return;
  roadmap.forEach((phase, pIdx) => {
    const total = phase.days.length;
    let completed = 0;

    phase.days.forEach((_, dIdx) => {
      if (localStorage.getItem(`done-${pIdx}-${dIdx}`) === "true") {
        completed++;
      }
    });

    const percent = Math.round((completed / total) * 100);
    const bar = document.getElementById(`progress-${pIdx}`);
    if (bar) bar.style.width = `${percent}%`;
  });
}

// ---------- EXPORT ----------
document.getElementById("exportBtn").onclick = () => {
  let md = "# Study Notes\n\n";

  roadmap.forEach((phase, pIdx) => {
    md += `## ${phase.phase}\n\n`;
    phase.days.forEach((day, dIdx) => {
      const note = localStorage.getItem(`note-${pIdx}-${dIdx}`);
      const done = localStorage.getItem(`done-${pIdx}-${dIdx}`) === "true";
      if (note || done) {
        md += `### ${day.day}: ${day.title}\n`;
        md += done ? "- Status: Completed\n" : "- Status: In progress\n";
        if (note) md += `\n${note}\n`;
        md += "\n";
      }
    });
  });

  const blob = new Blob([md], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "study-notes.md";
  a.click();
};

// ---------- PORTFOLIO MODE ----------
document.getElementById("portfolioToggle").onclick = () => {
  document.body.classList.toggle("portfolio");
};
