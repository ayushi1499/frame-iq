# Frame IQ

A mobile-first multimodal AI productivity tool that combines face recognition, AI-powered face analysis, and intelligent text summarization in one sleek application.

## Features

### Face Recognition
- Register faces using photo upload or live camera capture
- Identify faces using Gemini AI-powered visual comparison
- Displays all registered faces ranked by match confidence with photos
- Best match highlighted with visual badge

### Face Analysis
- Detects age, gender, emotion, and ethnicity from uploaded or captured photos
- Powered by Google Gemini AI with multimodal image processing
- Returns confidence scores for each detected attribute
- Generates 3 personalized fun facts in an expandable section

### Text Summarization
- Condenses long text into clear summaries using Gemini AI
- Customizable summary styles: concise, detailed, or bullet points
- Adjustable output length
- Summary history saved for future reference

### User Experience
- Mobile-first dark mode design with bottom tab navigation
- Live camera capture with front-facing selfie mode
- Smooth animations powered by Framer Motion
- 2-step onboarding with hero video background
- Interactive 5-step guided tour
- Social media sharing (Twitter, Facebook, WhatsApp, LinkedIn)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| UI | shadcn/ui, Radix UI, Tailwind CSS |
| Animations | Framer Motion |
| Routing | Wouter |
| State | TanStack React Query v5 |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| AI | Google Gemini 2.5 Flash (via Replit AI Integrations) |
| Image Processing | Sharp |

## Demo

https://github.com/user-attachments/assets/demo-video

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session secret key |
| `AI_INTEGRATIONS_GEMINI_BASE_URL` | Gemini API base URL (auto-configured on Replit) |
| `AI_INTEGRATIONS_GEMINI_API_KEY` | Gemini API key (auto-configured on Replit) |

### Running the App

```bash
npm install
npm run dev
```

The app starts on port 5000 with both the Express API server and Vite dev server.

### Building for Production

```bash
npm run build
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Dashboard statistics |
| `/api/faces` | GET | List all registered faces |
| `/api/summaries` | GET | Summary history |
| `/api/register-face` | POST | Register a new face (multipart) |
| `/api/recognize-face` | POST | Recognize a face against all entries (multipart) |
| `/api/analyze-face` | POST | AI-powered face analysis (multipart) |
| `/api/summarize` | POST | Summarize text (JSON) |

## Project Structure

```
client/src/          Frontend React application
  ├── pages/         Page components (home, recognition, analysis, summarize)
  ├── components/    Reusable UI components
  ├── hooks/         Custom React hooks
  └── lib/           Utilities and query client

server/              Backend Express application
  ├── routes.ts      API route handlers
  ├── storage.ts     Database storage layer
  └── replit_integrations/  Gemini AI client

shared/              Shared between frontend and backend
  ├── schema.ts      Drizzle ORM database schema
  └── routes.ts      Zod validation schemas

face_dataset/        Stored face images and vector data
```

## How Face Recognition Works

1. **Registration** — Photo is resized to 400x400 color JPEG (for display) and 100x100 grayscale (for matching). Both are saved alongside metadata in PostgreSQL.

2. **Recognition** — Query photo and all registered face photos are sent to Gemini AI, which compares facial features (face shape, eye spacing, nose, jawline) and returns similarity scores. All matches are displayed ranked from best to worst.

## License

MIT
