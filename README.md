


# Breathe

**Every breath you take tells a story.**

Breathe is an AI-powered carbon footprint awareness platform designed to help users understand, track, and reduce their environmental impact through personalized insights, real-world comparisons, and actionable recommendations.

Built for **Prompt Wars Virtual Challenge #3**.

---

## Live Demo

[Add deployed Vercel link here]

---

## Problem Statement

Most carbon footprint calculators provide users with numbers but fail to explain what those numbers actually mean in everyday life.

Breathe transforms carbon emission data into relatable comparisons, personalized recommendations, and interactive simulations that help users understand the impact of their daily choices and encourages sustainable behavior through awareness rather than statistics alone.

---

## Features

* Carbon footprint calculation
* Real-world carbon impact comparisons
* Country-wise footprint analysis
* Category-wise emission breakdown
* AI-powered sustainability recommendations
* Interactive "What If" simulator
* Monthly footprint tracking
* Personalized chatbot assistance
* User-friendly and responsive interface
* Support for 6 countries
* Available in 12 languages

---

## Supported Countries

* India
* United States
* Germany
* Brazil
* Kenya
* Nigeria

---

## Supported Languages

* English
* Hindi
* Marathi
* Bengali
* Tamil
* Telugu
* German
* Portuguese
* Swahili
* Yoruba
* Hausa
* French

---

## Why Breathe?

Most carbon calculators stop at displaying a number.

Breathe focuses on awareness by converting emissions into meaningful real-world context.

Examples include:

* A Delhi → Mumbai flight compared to months of household electricity usage
* Household energy translated into everyday activities
* Shopping emissions translated into manufacturing impact
* Personalized sustainability recommendations based on lifestyle patterns

The objective is to make carbon awareness understandable, relatable, and actionable.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### AI & Development Tools

* Gemini API
* Gemini 3.5 Flash
* Claude Opus
* Bolt
* Antigravity

---

## AI Usage

Generative AI was used throughout the development process for:

* UI scaffolding and rapid prototyping
* Component generation
* Code assistance and debugging
* Feature iteration
* Localization support
* Prompt-driven development
* Personalized sustainability insights

AI accelerated implementation, while the overall product vision, awareness-focused experience, sustainability messaging, feature design, and carbon contextualization strategy were manually designed and refined.

---

## Human Design vs AI Contribution

### AI Assisted

* UI scaffolding
* Component generation
* Code assistance
* Debugging support
* Localization support
* AI-powered sustainability insights

### Human Designed

* Product vision
* User journey and information architecture
* Carbon awareness strategy
* Real-world impact comparisons
* Feature selection and prioritization
* Sustainability messaging
* Country comparison framework

A key objective was transforming carbon data into relatable everyday experiences rather than presenting raw numbers.

---

## Prompt Engineering Process

The project evolved through multiple prompt iterations.

### Prompt 1

Create a carbon footprint calculator that estimates monthly emissions based on transportation, food, energy usage, and shopping habits.

**Outcome:** Basic carbon calculation system.

### Prompt 2

Transform the calculator into a carbon footprint awareness platform that explains emissions through relatable real-world comparisons and actionable recommendations.

**Outcome:** Added contextual comparisons and awareness-focused experience.

### Prompt 3

Create a multilingual sustainability platform with country-based comparisons, AI-generated recommendations, and an interactive What If simulator.

**Outcome:** Expanded platform capabilities and user engagement.

### Prompt 4

Generate conversational sustainability insights that explain a user's footprint, identify major emission sources, and recommend practical lifestyle changes.

**Outcome:** AI-powered chatbot guidance and personalized recommendations.

---

## Architecture

```text
User
 │
 ▼
React + TypeScript Frontend
 │
 ▼
Carbon Footprint Calculation Engine
 │
 ├── Country & Language Layer
 │
 ├── Impact Comparison Engine
 │
 └── What-If Simulation Engine
         │
         ▼
      Gemini API
         │
         ▼
 AI Recommendations & Chatbot
         │
         ▼
 Personalized Awareness Dashboard
```

---

## Testing

The application was tested across multiple user flows, including:

* Carbon footprint calculation
* Country-wise footprint comparisons
* AI-powered recommendation generation
* Chatbot interactions
* Multilingual content rendering
* Responsive layouts across devices
* Input validation scenarios

Special attention was given to handling unusually high or low consumption values to ensure stable output generation.

---

## Performance & Efficiency

To maintain a smooth user experience:

* React components were structured to minimize unnecessary re-renders
* API calls are triggered only when required
* Frontend assets are optimized using Vite
* Lightweight UI components were preferred for faster loading times
* Responsive layouts were implemented for desktop and mobile users

---

## Accessibility & Inclusivity

Breathe was designed to be accessible to a diverse audience.

* Support for 12 languages
* Support for users across 6 countries
* Mobile-first responsive design
* Clear information hierarchy
* Readable content and intuitive navigation
* Sustainability concepts explained using relatable examples

The goal is to make carbon awareness understandable and actionable for users from different backgrounds.

---

## Environment Variables

Create a `.env` file in the project root.

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

The repository does not contain any private API keys.

---

## Local Setup

```bash
git clone <repository-url>

cd breathe

npm install

npm run dev
```

---

## Production Build

```bash
npm run build
```

---

## Prompt Wars Submission

Challenge: Prompt Wars Virtual Challenge #3

Theme: Carbon Footprint Awareness Platform

Submission Includes:

* Source Code Repository
* Deployed Web Application
* Prompt Engineering Documentation
* AI Tool Usage Documentation
* LinkedIn Project Write-Up

---

## Future Enhancements

* Community sustainability challenges
* Team and organization leaderboards
* Carbon reduction streaks
* Regional sustainability benchmarks
* Advanced AI coaching
* Additional countries and languages

---

## Author

Lakshita Banothe

Built as part of Prompt Wars Virtual Challenge #3.
