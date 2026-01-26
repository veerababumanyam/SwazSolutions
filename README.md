<div align="center">

<img src="./public/assets/images/content/swaz-logo-800.png" alt="Swaz Solutions Logo" width="200"/>

# Swaz Solutions

**Digital Identity • Music & Creativity • AI-Powered Innovation**

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/veerababumanyam/SwazSolutions)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 📇 VCard & Digital Identity
Create professional digital profiles with QR codes, vCard export, and seamless sharing.

- **Public Profiles** — Unique shareable URLs (`/u/username`)
- **QR Code Generation** — Scannable codes for instant sharing
- **vCard Export** — iOS/Android compatible contact cards
- **Social Integration** — 50+ platforms supported
- **Privacy Controls** — Granular visibility settings
- **Analytics** — Track profile views and engagement

### 📧 Digital Invitations
Professional event invitations with multi-language, AI text generation, and guest management.

- **Multi-Language Support** — 12 Indian languages with native script support
- **Multi-Event Itineraries** — Create wedding journeys (Sangeet, Mehendi, Haldi, Wedding, Reception, Baraat)
- **AI Text Generation** — Gemini-powered invitation text in multiple tones (Formal, Casual, Poetic, Witty, etc.)
- **Template System** — 8 marketplace templates + custom designer tools
- **Guest Management** — CRUD, categorization, status tracking, CSV import/export, bulk operations
- **Social Sharing** — WhatsApp, Email, Instagram Story generators
- **RSVP System** — Public RSVP forms with validation and tracking
- **QR Check-In** — Scanner-based and manual guest check-in at events
- **Analytics Dashboard** — Views, engagement, acceptance rates, geographic distribution
- **Bilingual Support** — Side-by-side, stacked, or tabbed language layouts

### 🎵 Music Player
Professional-grade streaming with advanced audio controls.

- **Audio Enhancement** — 3-band EQ with presets
- **Visual Experience** — Real-time frequency visualizer
- **Smart Features** — Shuffle, queue, playlists, history
- **Multi-Device** — Remote control via Socket.io
- **Library Management** — Auto-discovery with metadata extraction
- **Keyboard Shortcuts** — Full keyboard control support

### 🎙️ Lyric Studio
AI-powered songwriting with 13 specialized agents.

- **Multi-Agent AI** — Orchestrated workflow for professional lyrics
- **23 Languages** — All Indian languages with native scripts
- **Cultural Engine** — Region-specific metaphors and idioms
- **Magic Rhymes** — Auto-fix and optimize rhyme schemes
- **Album Art** — AI-generated covers with Imagen 4.0
- **Suno.com Ready** — Export-formatted lyrics with style tags

### 📰 News Hub
Real-time technology updates for photographers and creators.

- **Multi-Brand** — Canon, Nikon, Sony coverage
- **Daily Updates** — Automated firmware & product scanning
- **Smart Filtering** — By brand, type, and priority
- **Direct Links** — Official manufacturer sources

### 🤖 Agentic AI Development
Enterprise autonomous systems that think, decide, and act.

- **Multi-Agent Orchestration** — Collaborative AI coordination
- **LLM Support** — OpenAI, Claude, Gemini, Llama
- **Tool Integration** — Secure API interactions
- **Enterprise Ready** — SOC 2 compliant with monitoring

### 💾 Data Recovery Services
Enterprise-grade recovery with ISO-certified facilities.

- **Full Coverage** — HDD, SSD, RAID, NVMe
- **24/7 Emergency** — Critical data rapid turnaround
- **ISO Cleanroom** — Class 100 certified environment
- **Compliance** — SOC 2, ISO 27001, HIPAA, GDPR

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/app/apikey) (for Lyric Studio)

### Installation

```bash
# Clone repository
git clone https://github.com/veerababumanyam/SwazSolutions.git
cd SwazSolutions

# Install dependencies
npm install
cd backend && npm install && cd ..

# Start development server
npm run dev
```

### Access Points
| Service | URL |
|---------|-----|
| Home | http://localhost:3000 |
| Digital Invitations | http://localhost:3000/#/invites |
| Lyric Studio | http://localhost:3000/#/studio |
| Music Player | http://localhost:3000/#/music |
| News Hub | http://localhost:3000/#/news |
| Public Invite | http://localhost:3000/#/invite/:slug |

### Production Build

```bash
npm run build
npm start
```

---

## 🔐 Authentication

| Method | Description |
|--------|-------------|
| **Google OAuth** | Sign in with Google account |
| **Local Auth** | Username/password with JWT |

### Test Accounts
```bash
# Seed test users
node backend/scripts/seed-test-users.js
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@swaz.com | Admin123! |
| Pro | pro@swaz.com | ProUser123! |
| User | user@swaz.com | TestUser123! |

---

## 🏗️ Architecture

```
swaz-solutions/
├── src/
│   ├── agents/          # 13 AI agents for Lyric Studio
│   ├── components/      # React components
│   │   ├── invites/     # Digital invitation components
│   │   └── ...
│   ├── pages/           # Application pages
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services (inviteApi, etc.)
│   └── utils/           # Utilities
├── backend/
│   ├── routes/          # API endpoints (invites, invite-guests, etc.)
│   ├── middleware/      # Auth & validation
│   ├── services/        # Business logic
│   ├── migrations/      # Database schemas
│   └── config/          # Database config
├── public/              # Static assets
└── docs/                # Documentation
```

### Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js, Express, SQLite |
| **AI** | Google Gemini (Flash/Pro), Imagen 4.0 |
| **Auth** | JWT, Google OAuth |

---

## 🔒 Security

- **Authentication** — JWT tokens, Google OAuth, rate limiting
- **Data Protection** — AES-256 encryption, TLS 1.3
- **Privacy** — No tracking, local storage, data portability
- **Headers** — Helmet.js, CSP, CORS, HSTS

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Digital Invitations](./docs/DIGITAL-INVITE-FINAL-SUMMARY.md) | Complete digital invitation system guide |
| [Agentic AI Guide](./docs/AGENTIC_AI_QUICK_START.md) | AI solutions overview |
| [Google OAuth Setup](./docs/GOOGLE_OAUTH_SETUP.md) | OAuth configuration |
| [vCard PRD](./docs/vCardPRD.md) | Digital identity specs |
| [SEO Guide](./docs/SEO_IMPLEMENTATION_LOG.md) | SEO implementation |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**[Website](https://swaz.solutions)** • **[Issues](https://github.com/veerababumanyam/SwazSolutions/issues)** • **[Discussions](https://github.com/veerababumanyam/SwazSolutions/discussions)**

Made with ❤️ by [Swaz Solutions](https://github.com/veerababumanyam)

</div>
