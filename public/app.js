// ─── State ────────────────────────────────────────────────────────────────────
let debounceTimer = null;
let lastResult    = null;
let isVisible     = false;

// ─── Elements ─────────────────────────────────────────────────────────────────
const passwordInput   = document.getElementById("password-input");
const toggleBtn       = document.getElementById("toggle-visibility");
const scoreBar        = document.getElementById("score-bar");
const scoreValue      = document.getElementById("score-value");
const strengthLabel   = document.getElementById("strength-label");
const crackTimeEl     = document.getElementById("crack-time");
const attackTypeEl    = document.getElementById("attack-type");
const entropyEl       = document.getElementById("entropy-value");
const poolEl          = document.getElementById("pool-value");
const lengthEl        = document.getElementById("length-value");
const patternsList    = document.getElementById("patterns-list");
const emptyState      = document.getElementById("empty-state");
const resultsPanel    = document.getElementById("results-panel");
const suggestionBox   = document.getElementById("suggestion-box");
const suggestionText  = document.getElementById("suggestion-text");
const copyBtn         = document.getElementById("copy-suggestion");
const charDisplay     = document.getElementById("char-display");

// ─── Toggle visibility ────────────────────────────────────────────────────────
toggleBtn.addEventListener("click", () => {
  isVisible = !isVisible;
  passwordInput.type = isVisible ? "text" : "password";
  toggleBtn.innerHTML = isVisible
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
});

// ─── Live character display ───────────────────────────────────────────────────
function updateCharDisplay(password) {
  charDisplay.innerHTML = "";
  if (!password) return;

  password.split("").forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.className = "char";

    if (/[A-Z]/.test(ch))      span.dataset.type = "upper";
    else if (/[a-z]/.test(ch)) span.dataset.type = "lower";
    else if (/[0-9]/.test(ch)) span.dataset.type = "digit";
    else                        span.dataset.type = "symbol";

    span.style.animationDelay = `${i * 20}ms`;
    charDisplay.appendChild(span);
  });
}

// ─── Input handler ────────────────────────────────────────────────────────────
passwordInput.addEventListener("input", () => {
  const val = passwordInput.value;
  updateCharDisplay(val);

  clearTimeout(debounceTimer);

  if (!val) {
    showEmpty();
    return;
  }

  debounceTimer = setTimeout(() => fetchAnalysis(val), 300);
});

// ─── API call ─────────────────────────────────────────────────────────────────
async function fetchAnalysis(password) {
  try {
    const res  = await fetch("/api/analyze", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ password }),
    });
    const data = await res.json();
    lastResult = data;
    renderResults(data);
  } catch (err) {
    console.error("Analysis failed:", err);
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────
function showEmpty() {
  emptyState.style.display   = "flex";
  resultsPanel.style.display = "none";
}

function renderResults(data) {
  if (data.empty) { showEmpty(); return; }

  emptyState.style.display   = "none";
  resultsPanel.style.display = "block";

  // Score bar
  scoreBar.style.width    = `${data.score}%`;
  scoreBar.dataset.color  = data.strength.color;
  scoreValue.textContent  = data.score;
  strengthLabel.textContent = data.strength.label;
  strengthLabel.dataset.color = data.strength.color;

  // Stats
  crackTimeEl.textContent = data.crackTime.label;
  crackTimeEl.dataset.color = data.crackTime.severity;
  attackTypeEl.textContent = data.likelyAttack;
  entropyEl.textContent   = `${data.entropy} bits`;
  poolEl.textContent      = `${data.charsetPool} chars`;
  lengthEl.textContent    = `${data.length} chars`;

  // Patterns
  patternsList.innerHTML = "";
  if (data.patterns.length === 0) {
    const li = document.createElement("li");
    li.className = "pattern-item safe";
    li.innerHTML = `
      <div class="pattern-header">
        <span class="pattern-icon">✓</span>
        <span class="pattern-label">No obvious vulnerabilities detected</span>
      </div>`;
    patternsList.appendChild(li);
  } else {
    data.patterns.forEach(p => {
      const li = document.createElement("li");
      li.className = `pattern-item ${p.severity}`;
      li.innerHTML = `
        <div class="pattern-header">
          <span class="pattern-icon">${severityIcon(p.severity)}</span>
          <span class="pattern-label">${p.label}</span>
          <span class="pattern-badge ${p.severity}">${p.severity}</span>
        </div>
        <p class="pattern-detail">${p.detail}</p>`;
      patternsList.appendChild(li);
    });
  }

  // Suggestion
  if (data.suggestion) {
    suggestionBox.style.display = "block";
    suggestionText.textContent  = data.suggestion;
  } else {
    suggestionBox.style.display = "none";
  }
}

function severityIcon(s) {
  return { critical: "⚠", high: "↯", medium: "◈", low: "○", safe: "✓" }[s] || "•";
}

// ─── Copy suggestion ──────────────────────────────────────────────────────────
copyBtn.addEventListener("click", () => {
  const text = suggestionText.textContent;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = "copied!";
    setTimeout(() => (copyBtn.textContent = "copy"), 2000);
  });
});

// ─── Init ─────────────────────────────────────────────────────────────────────
showEmpty();
passwordInput.focus();