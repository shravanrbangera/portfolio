# 📚 Technical Documentation: Shravan R Bangera Digital Studio & Portfolio

---

## 1. 🌐 Project URLs & Repository

| Resource | Link / URL |
| :--- | :--- |
| **GitHub Repository** | [https://github.com/shravanrbangera/portfolio](https://github.com/shravanrbangera/portfolio) |
| **Local Development Server** | `http://localhost:3000` |
| **Vercel Production Deployment** | `https://portfolio-shravanrbangera.vercel.app` *(or custom domain)* |
| **Primary Branch** | `main` |

---

## 2. 🤖 AI Tools Used During Development

| AI Tool / Model | Role in Project Development |
| :--- | :--- |
| **Google Antigravity IDE (DeepMind Agentic Engine)** | End-to-end full-stack development, architectural scaffolding, Vanilla JS routing, SVG telemetry chart mathematics, and automated Git version control. |
| **Gemini Multimodal Vision Model** | Analyzed visual design references (Pistachio Bento layouts, 3D Sprout mascot, high-contrast typography) and translated them into modular CSS design tokens. |
| **DeepMind Code Synthesis** | Synthesized zero-dependency pure JavaScript components: SVG dynamic stroke calculus, history state management, physics lerp magnetic cursor, and modal systems. |
| **Generative Asset & Vector Synthesis** | Generated and optimized vector SVG diagrams, FoodIQ UI simulator mockups, and photographic placeholders. |

---

## 3. 🛠️ Complete Tech Stack

```
Frontend Architecture (Zero Framework Overhead)
├── Structure: Semantic HTML5 (ARIA a11y, OpenGraph tags, SVG vectors)
├── Styling: Vanilla CSS3 (Custom Design Tokens, Glassmorphism, 12-Col Bento Grid)
├── Logic: Pure ES6+ JavaScript (History API, DOMParser, SVG Stroke Calculus)
└── Fonts: Plus Jakarta Sans & Inter (Google Fonts with System Fallbacks)

Backend & Infrastructure
├── Local Server: Node.js (Built-in http, fs, path, url modules — 0 npm packages)
├── Version Control: Git & GitHub
└── Cloud Deployment: Vercel Serverless Edge (vercel.json clean URLs & cache rules)
```

### Detailed Breakdown:
1. **HTML5**: Multi-page semantic architecture with 8 dedicated digital rooms.
2. **Vanilla CSS3**:
   - Custom CSS variables (`--sage-primary: #6B8E4E`, `--bg-main: #F6F8F3`, `--text-dark: #172312`).
   - Bento Grid layout with `border-radius: 26px - 32px`.
   - Backdrop filter glassmorphism (`backdrop-filter: blur(20px)`).
   - Fluid typography and keyframe animations.
3. **Vanilla JavaScript (ES6+)**:
   - Client-side SPA navigation via HTML5 History API & `fetch()`.
   - Dynamic SVG `<circle>` and `<path>` recalculation math.
   - Magnetic cursor tracking with linear interpolation (lerp).
4. **Node.js**:
   - Static HTTP web server with URL path sanitization and directory traversal prevention.
5. **Vercel**:
   - Global CDN deployment with edge route rewrites.

---

## 4. 📁 Project Structure & File Index

```
d:/MCA/Projects/Portfolio/
├── index.html              # Room 1: Studio Hub & Hero Bento Grid
├── about.html              # Room 2: Narrative Manifesto & 4 Pillars
├── story.html              # Room 3: Formative Story & Photo Gallery
├── journey.html            # Room 4: Leadership Timeline & Growth Chart
├── work.html               # Room 5: Creative Direction & Campaigns
├── projects.html           # Room 6: Technical Projects & FoodIQ AI Scanner
├── achievements.html       # Room 7: Milestones & Competition Awards
├── certifications.html     # Room 8: Verified Credentials & Skills Matrix
├── contact.html            # Room 9: Contact Channel & Social Links
├── style.css               # Complete Bento Design System & Global Styles
├── script.js               # SPA Router, Chart Math, Cursor & Mascot Logic
├── server.js               # Zero-dependency Node.js HTTP Server
├── vercel.json             # Vercel Deployment & Route Configuration
├── .gitignore              # Git Ignore Rules
├── README.md               # GitHub Project Readme
├── PROJECT_REPORT.md       # Comprehensive Engineering & Design Report
├── DOCUMENTATION.md        # Technical Documentation (This File)
└── assets/                 # Images, SVGs, Mockups & Sprout IP Mascot
```

---

## 5. 💻 Core Code Architecture & Key Snippets

### 5.1 Design System Tokens & Bento Grid (`style.css`)
```css
:root {
  /* Pistachio / Sage Green & Editorial Cream Bento Tokens */
  --sage-deep: #172312;
  --sage-primary: #6B8E4E;
  --sage-vivid: #7BA35A;
  --sage-sprout: #8FC065;
  --sage-pale: #EAF2E3;
  --forest-dark: #1F2E19;
  --bg-main: #F6F8F3;
  --text-dark: #172312;
  --grad-moss-bento: linear-gradient(145deg, #8FA876 0%, #6C8B50 100%);
  --radius-lg: 26px;
  --radius-xl: 32px;
}

/* Bento Hero Grid */
.bento-hero-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
  margin-top: 32px;
}
.bento-card-green {
  background: var(--grad-moss-bento);
  color: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: 36px;
}
.bento-big-num {
  font-size: 3.5rem;
  font-weight: 800;
  opacity: 0.25;
}
```

---

### 5.2 Seamless SPA Page Router (`script.js`)
```javascript
// Intercepts internal links and swaps DOM without full-page reloads
function initSeamlessTransitions() {
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a[data-nav-link]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;

    e.preventDefault();
    const curtain = document.getElementById('pageTransitionCurtain');
    if (curtain) curtain.classList.add('active');

    const response = await fetch(href);
    const htmlText = await response.text();
    const newDoc = new DOMParser().parseFromString(htmlText, 'text/html');

    document.title = newDoc.title;
    document.getElementById('mainContent').innerHTML = newDoc.getElementById('mainContent').innerHTML;
    window.history.pushState({}, newDoc.title, href);

    if (curtain) curtain.classList.remove('active');
    initPageModules(); // Re-bind charts, modals & mascot
  });
}
```

---

### 5.3 Dynamic SVG Donut Chart Calculus (`script.js`)
```javascript
// Real-time recalculation of concentric SVG macro rings
const CIRCUMFERENCE = 2 * Math.PI * 40; // r = 40 => ~251.32

function updateDonutChart(proteinPct, carbsPct, fatsPct) {
  const proteinOffset = CIRCUMFERENCE * (1 - proteinPct / 100);
  const carbsOffset = CIRCUMFERENCE * (1 - carbsPct / 100);
  const fatsOffset = CIRCUMFERENCE * (1 - fatsPct / 100);

  document.getElementById('ringProtein').style.strokeDashoffset = proteinOffset;
  document.getElementById('ringCarbs').style.strokeDashoffset = carbsOffset;
  document.getElementById('ringFats').style.strokeDashoffset = fatsOffset;
}
```

---

### 5.4 Physics LERP Magnetic Cursor (`script.js`)
```javascript
// Smooth cursor ring animation using linear interpolation (lerp)
function renderCursorLoop() {
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  requestAnimationFrame(renderCursorLoop);
}
```

---

### 5.5 Static Node.js HTTP Server (`server.js`)
```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

const server = http.createServer((req, res) => {
  let pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (pathname === '/') pathname = '/index.html';

  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
```

---

### 5.6 Vercel Edge Routing Configuration (`vercel.json`)
```json
{
  "version": 2,
  "cleanUrls": true,
  "rewrites": [
    { "source": "/creative", "destination": "/work.html" },
    { "source": "/milestones", "destination": "/achievements.html" },
    { "source": "/credentials", "destination": "/certifications.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 6. 🚀 Quick Deployment & Run Guide

### Running Locally:
```bash
# Clone the repository
git clone https://github.com/shravanrbangera/portfolio.git

# Enter project directory
cd portfolio

# Run server
node server.js
```
Navigate to `http://localhost:3000`.

### Deploying to Vercel:
1. Open [https://vercel.com/new](https://vercel.com/new).
2. Import `shravanrbangera/portfolio`.
3. Click **Deploy**.

---

&copy; 2026 Shravan R Bangera. Built with craft, curiosity & code.
