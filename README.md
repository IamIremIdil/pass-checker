# pass-checker

[![Express Version](https://img.shields.io/npm/v/express.svg)](https://www.npmjs.com/package/express)
[![CORS Version](https://img.shields.io/npm/v/cors.svg)](https://www.npmjs.com/package/cors)

**See how your password would be cracked.**

A full-stack password security analyzer that goes beyond a strength meter - it tells you *which attack vector* would break your password, estimates crack time on modern GPU hardware, and explains every vulnerability in plain language.

![passchecker Screenshot](screenshot.png)

## Features

- **Entropy calculation** — measures true randomness based on character pool and length
- **Crack time estimate** — based on 10 billion guesses/sec (realistic GPU benchmark)
- **Attack vector detection** — identifies whether brute force, dictionary, rule-based, or pattern attack would succeed first
- **10 vulnerability checks**: dictionary match, keyboard walks, leet speak, sequential numbers, repetition, number padding, missing char types, and more
- **Live character breakdown** — color-coded display showing uppercase / lowercase / digits / symbols
- **Passphrase suggestions** — generates strong, memorable alternatives when your password is weak
- **Zero logging** — passwords are analyzed in memory and immediately discarded

## Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JS + HTML/CSS (no frameworks)
- **Analysis**: Custom entropy engine + pattern detection (no external APIs required)

## File structure:

```
passchecker/
├── server.js              Express server, one /api/analyze route
├── package.json
├── .gitignore
├── README.md              
├── src/
│   └── analyzer.js        all the brain: entropy, patterns, crack time
└── public/
    ├── index.html         full UI + CSS (dark terminal)
    └── app.js             frontend: debounced input, API calls, DOM updates
```

## Getting Started

```bash
git clone https://github.com/IamIremIdil/pass-checker
cd pass-checker
npm install
npm run dev     # development (nodemon)
# or
npm start       # production
```

Open [http://localhost:3000](http://localhost:3000)

## How the Analysis Works

### Entropy
```
entropy (bits) = length × log₂(character_pool_size)
```
Character pool: lowercase (26) + uppercase (26) + digits (10) + symbols (32)

### Crack Time
```
combinations = 2^entropy
crack_time   = combinations / (2 × guesses_per_second)
```
Assumes 10 billion guesses/sec (NVIDIA RTX 4090 class hardware, bcrypt excluded).

### Vulnerability Checks
| Check | Severity | What it detects |
|-------|----------|-----------------|
| Dictionary match | Critical | Appears in top-200 breach list |
| Keyboard walk | High | qwerty, asdf, zxcvb patterns |
| Leet speak | High | p@ssw0rd → password |
| Sequential numbers | High | 1234, 9876 |
| Character repetition | Medium | aaa, 111 |
| All lowercase | Medium | No uppercase |
| No symbols | Medium | Letters/numbers only |
| Short length | Critical/Medium | < 8 or < 12 chars |
| All numbers | Critical | PIN-style passwords |
| Number padding | Low | word + numbers at end |

## Security Note

This tool is for **educational purposes** - understanding why passwords fail is the first step to making better ones. Passwords typed here are never logged, stored, or transmitted beyond your local server.

---

Built by [@iro.codes](https://instagram.com/iro.codes) · [IamIremIdil](https://github.com/IamIremIdil)