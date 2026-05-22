// ─── Common passwords list (top 200 most used) ───────────────────────────────
const COMMON_PASSWORDS = new Set([
  "password","123456","password123","12345678","qwerty","abc123","monkey",
  "1234567","letmein","trustno1","dragon","baseball","iloveyou","master",
  "sunshine","ashley","bailey","passw0rd","shadow","123123","654321","superman",
  "qazwsx","michael","football","password1","princess","charlie","donald",
  "password2","qwerty123","hello","freedom","whatever","qazwsxedc","pass",
  "admin","login","welcome","654321","mustang","access","shadow","master",
  "696969","123456789","superman","batman","samsung","987654321","111111",
  "000000","121212","1111111","abc123456","password01","hunter","1234567890",
  "starwars","12345","1234","123","test","user","pass123","admin123","root",
  "toor","alpine","raspberry","changeme","default","guest","secret","test123",
  "qwerty1","qwerty12","q1w2e3r4","1q2w3e4r","zxcvbnm","asdfghjkl","nicole",
  "jessica","purple","cheese","aaaaa","monkey123","dragon123","iloveyou1",
  "myspace1","monkey1","computer","george","sparky","correct","horse","battery",
  "staple","love","hello123","flower","robert","summer","ferrari","ranger",
  "shadow1","master1","blink182","matrix","qwert","asdfgh","zxcvbn","123321",
  "666666","777777","88888888","147258369","987654","q1w2e3","baseball1","soccer",
  "hockey","killer","maggie","skinny","bigcock","mike","guitar","tucker",
  "1234abc","1234qwer","thomas","ranger","phoenix","secret123","magic","winter",
]);

// ─── Keyboard walk patterns ───────────────────────────────────────────────────
const KEYBOARD_WALKS = [
  "qwerty","qwertyu","qwertyui","qwertyuio","qwertyuiop",
  "asdf","asdfg","asdfgh","asdfghj","asdfghjk","asdfghjkl",
  "zxcv","zxcvb","zxcvbn","zxcvbnm",
  "qaz","wsx","edc","rfv","tgb","yhn","ujm",
  "1qaz","2wsx","3edc","4rfv","5tgb","6yhn","7ujm","8ik,","9ol.",
  "qazwsx","qazwsxedc",
  "1q2w3e","1q2w3e4r","1q2w3e4r5t",
  "zaq1","xsw2","cde3",
];

// ─── Leet speak map ──────────────────────────────────────────────────────────
const LEET_MAP = { "@": "a", "4": "a", "3": "e", "1": "i", "!": "i",
                   "0": "o", "5": "s", "$": "s", "7": "t", "+": "t" };

// ─── Entropy calculation ──────────────────────────────────────────────────────
function calculateEntropy(password) {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;
  const entropy = pool > 0 ? password.length * Math.log2(pool) : 0;
  return { bits: Math.round(entropy * 10) / 10, pool };
}

// ─── Crack time estimation ────────────────────────────────────────────────────
// Based on 10 billion guesses/sec (modern GPU brute force)
function estimateCrackTime(entropyBits) {
  const guessesPerSec = 1e10;
  const combinations = Math.pow(2, entropyBits);
  const seconds = combinations / guessesPerSec / 2; // average case
  return formatSeconds(seconds);
}

function formatSeconds(s) {
  if (s < 0.001) return { label: "instantly", severity: "critical" };
  if (s < 1)     return { label: `${Math.round(s * 1000)}ms`, severity: "critical" };
  if (s < 60)    return { label: `${Math.round(s)} seconds`, severity: "critical" };
  if (s < 3600)  return { label: `${Math.round(s / 60)} minutes`, severity: "high" };
  if (s < 86400) return { label: `${Math.round(s / 3600)} hours`, severity: "high" };
  if (s < 2592000) return { label: `${Math.round(s / 86400)} days`, severity: "medium" };
  if (s < 31536000) return { label: `${Math.round(s / 2592000)} months`, severity: "medium" };
  if (s < 3.15e9)   return { label: `${Math.round(s / 31536000)} years`, severity: "low" };
  if (s < 3.15e12)  return { label: `${Math.round(s / 3.15e9)}k years`, severity: "safe" };
  if (s < 3.15e15)  return { label: `${Math.round(s / 3.15e12)}M years`, severity: "safe" };
  return { label: "centuries", severity: "safe" };
}

// ─── Pattern detection ────────────────────────────────────────────────────────
function detectPatterns(password) {
  const lower = password.toLowerCase();
  const findings = [];

  // 1. Common password check
  if (COMMON_PASSWORDS.has(lower)) {
    findings.push({
      type: "dictionary",
      severity: "critical",
      label: "Known dictionary word",
      detail: "This exact password appears in breach databases. It would be the first thing tried.",
    });
  }

  // 2. Keyboard walk
  const walkFound = KEYBOARD_WALKS.find(w => lower.includes(w));
  if (walkFound) {
    findings.push({
      type: "keyboard_walk",
      severity: "high",
      label: "Keyboard walk detected",
      detail: `Contains a keyboard pattern ("${walkFound}"). These are in every cracker's pattern list.`,
    });
  }

  // 3. Sequential numbers
  const seqMatch = lower.match(/(?:0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)+/);
  if (seqMatch) {
    findings.push({
      type: "sequential",
      severity: "high",
      label: "Sequential numbers",
      detail: `"${seqMatch[0]}" is a predictable sequence — one of the first patterns brute-forcers try.`,
    });
  }

  // 4. Repeated characters
  const repMatch = password.match(/(.)\1{2,}/);
  if (repMatch) {
    findings.push({
      type: "repetition",
      severity: "medium",
      label: "Repeated characters",
      detail: `"${repMatch[0]}" — character repetition massively reduces the effective search space.`,
    });
  }

  // 5. Leet speak detection
  const deleeted = password.toLowerCase().split("").map(c => LEET_MAP[c] || c).join("");
  if (deleeted !== lower && COMMON_PASSWORDS.has(deleeted)) {
    findings.push({
      type: "leet",
      severity: "high",
      label: "Leet speak substitution",
      detail: `Replacing ${Object.keys(LEET_MAP).join("")} with letters gives a common word. Crackers try this automatically.`,
    });
  }

  // 6. All lowercase
  if (password === lower && password.length > 0) {
    findings.push({
      type: "no_uppercase",
      severity: "medium",
      label: "No uppercase letters",
      detail: "Lowercase-only cuts your character pool from 62 to 26. Reduces entropy significantly.",
    });
  }

  // 7. No special characters
  if (!/[^a-zA-Z0-9]/.test(password)) {
    findings.push({
      type: "no_special",
      severity: "medium",
      label: "No special characters",
      detail: "Adding even one symbol (!@#$) expands your pool by 32 characters and multiplies crack time.",
    });
  }

  // 8. Short length
  if (password.length < 8) {
    findings.push({
      type: "too_short",
      severity: "critical",
      label: "Too short",
      detail: `${password.length} characters is trivially brute-forceable. Minimum 12 is the current recommendation.`,
    });
  } else if (password.length < 12) {
    findings.push({
      type: "short",
      severity: "medium",
      label: "Somewhat short",
      detail: `${password.length} characters is okay but 12+ is much safer. Every extra character multiplies combinations.`,
    });
  }

  // 9. All numbers
  if (/^\d+$/.test(password)) {
    findings.push({
      type: "all_numbers",
      severity: "critical",
      label: "Only numbers",
      detail: "Pure numeric passwords have a pool of 10. A 10-digit all-number password is weaker than a 6-char mixed one.",
    });
  }

  // 10. Starts/ends with number (common padding pattern)
  if (/^[a-zA-Z]+\d+$/.test(password) || /^\d+[a-zA-Z]+$/.test(password)) {
    findings.push({
      type: "number_padding",
      severity: "low",
      label: "Number padding",
      detail: "Appending numbers to a word (word123) is a known pattern. Crackers apply this as a rule.",
    });
  }

  return findings;
}

// ─── Strength score ───────────────────────────────────────────────────────────
function calculateScore(password, entropy, patterns) {
  let score = Math.min(entropy.bits, 80) / 80 * 100;

  // penalize for patterns
  for (const p of patterns) {
    if (p.severity === "critical") score -= 25;
    if (p.severity === "high") score -= 15;
    if (p.severity === "medium") score -= 8;
    if (p.severity === "low") score -= 3;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreLabel(score) {
  if (score < 20) return { label: "Critical", color: "critical" };
  if (score < 40) return { label: "Weak", color: "high" };
  if (score < 60) return { label: "Fair", color: "medium" };
  if (score < 80) return { label: "Strong", color: "low" };
  return { label: "Very Strong", color: "safe" };
}

// ─── Suggestion generator ─────────────────────────────────────────────────────
function generateSuggestion(password) {
  // Simple passphrase suggestion (3 random words + number + symbol)
  const words = ["cedar", "mirror", "falcon", "thunder", "lantern", "circuit",
                 "bridge", "marble", "forest", "signal", "amber", "crater"];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  const sym = ["!", "@", "#", "$", "&"][Math.floor(Math.random() * 5)];
  return `${pick(words)}-${pick(words)}-${pick(words)}${num}${sym}`;
}

// ─── Primary export ───────────────────────────────────────────────────────────
function analyze(password) {
  if (!password || password.length === 0) {
    return { empty: true };
  }

  const entropy     = calculateEntropy(password);
  const crackTime   = estimateCrackTime(entropy.bits);
  const patterns    = detectPatterns(password);
  const score       = calculateScore(password, entropy, patterns);
  const strength    = scoreLabel(score);
  const suggestion  = score < 60 ? generateSuggestion(password) : null;

  // Which attack would most likely succeed
  let likelyAttack = "Brute force";
  if (patterns.some(p => p.type === "dictionary")) likelyAttack = "Dictionary attack";
  else if (patterns.some(p => p.type === "leet"))   likelyAttack = "Rule-based dictionary attack";
  else if (patterns.some(p => p.type === "keyboard_walk")) likelyAttack = "Pattern/walk attack";
  else if (entropy.bits < 30) likelyAttack = "Brute force (trivial)";
  else if (entropy.bits < 50) likelyAttack = "Brute force (GPU-accelerated)";

  return {
    entropy: entropy.bits,
    charsetPool: entropy.pool,
    length: password.length,
    crackTime,
    patterns,
    score,
    strength,
    likelyAttack,
    suggestion,
  };
}

module.exports = { analyze };