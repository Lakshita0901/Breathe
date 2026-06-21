# Contributing to Breathe

Thank you for choosing to contribute to Breathe! This document outlines the development workflow, setup procedures, and coding guidelines to maintain the quality and security of the application.

---

## 🛠️ Development Setup

Breathe is built using **React**, **TypeScript**, and **Vite**.

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### Setup Steps
1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd breathe
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy the `.env.example` template to create your own local configuration file:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and configure your Google Gemini API key:
     ```env
     VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
     ```

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:5173` to view the application.

---

## 🧪 Running Tests

We use **Vitest** for unit and integration testing. Any contribution must maintain 100% passing tests and high code coverage metrics.

### Run Tests in Watch Mode
```bash
npm run test
```

### Run Tests Once
```bash
npx vitest run
```

### Check Test Coverage
```bash
npm run test -- --coverage
```
Our baseline coverage expectation is **>85%** across Statements, Branches, Functions, and Lines.

### Production Build Validation
Always run the production build script before submitting code to ensure TypeScript compiles correctly and Vite can generate the production bundle:
```bash
npm run build
```

---

## 📂 Project Structure

```
breathe/
├── src/
│   ├── __tests__/      # Unit and integration test suites (*.test.ts, *.test.tsx)
│   ├── components/     # React presentation and logic components
│   │   ├── ChatBot.tsx         # Multilingual Gemini coaching interface
│   │   ├── Dashboard.tsx       # Core footprint metrics dashboard
│   │   ├── WhatIfSimulator.tsx # Interactive lifestyle impact simulator
│   │   ├── Quiz.tsx            # Multi-step survey module
│   │   └── ShareCard.tsx       # Click-to-copy LinkedIn sharing card
│   ├── contexts/       # React Context providers (e.g., LanguageContext.tsx)
│   ├── data/           # Statically configured country data and equivalents (countries.ts)
│   ├── utils/          # Pure helper and calculation functions
│   │   ├── calculator.ts       # Carbon logic & emotional equivalents calculation
│   │   ├── security.ts         # Input sanitization and API validation
│   │   └── history.ts          # Local storage results serialization
│   ├── translations.ts # Static translation tables for 12 languages
│   ├── App.tsx         # Main entry point & screen state transition coordinator
│   └── main.tsx        # React DOM render coordinator
├── public/             # Static public assets
├── index.html          # HTML entry point template
├── vite.config.ts      # Vite build bundler configuration
└── tsconfig.json       # TypeScript compiler settings
```

---

## 💻 Coding Standards

### 1. TypeScript & Type Safety
- **Strict Typing:** Avoid `any` types. Provide interfaces/types for all functions and component properties.
- **Component Props:** All components must declare their properties using interfaces prefixed by `Props` or descriptive naming (e.g. `interface Props { ... }`).
- **Readonly Data:** Static datasets like translations and country models should be typed securely to avoid unintended run-time mutation.

### 2. React Components & Hooks
- Use functional components and modern React hooks (`useState`, `useEffect`, `useRef`).
- Keep component files cohesive and modular. Avoid nesting separate helper components inside parent component renders.
- Clean up resources (e.g., event listeners, timeouts, intervals) in effect cleanup return functions.

### 3. Styling Guidelines
- Standard styles are compiled via **Tailwind CSS**.
- Design visual patterns must be responsive (supporting both desktop and mobile viewports) and leverage semantic components for structural layouts.
- Always use standard theme-based color scales rather than hardcoded pixel/hex values where possible.

### 4. Security Practices
- **Sanitisation:** All text fields accepting user input must run through the sanitization logic (`sanitizeInput`) before use.
- **API Secret Keys:** Never hardcode secret keys or API keys. Always use Vite's `import.meta.env.VITE_...` variables.
