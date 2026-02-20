# Frame IQ

## Overview

Frame IQ is a mobile-first, full-stack TypeScript application designed as a multimodal AI productivity tool. It integrates three core AI-powered features:

1. **Face Recognition**: Register and identify faces using images or live camera input. Uses Gemini AI for visual face comparison, returning all registered faces ranked by match confidence with photos.
2. **Face Analysis**: Utilizes Google Gemini AI for multimodal image analysis to detect facial attributes such as age, gender, emotion, and ethnicity. Generates personalized "Fun Facts" in an expandable section.
3. **Text Summarization**: Leverages Gemini AI to condense lengthy texts into summaries, offering customizable styles (concise, detailed, bullet points) and length options.

The app delivers a native mobile app feel with bottom tab navigation, dark mode UI, and smooth Framer Motion animations. It includes a 2-step onboarding experience and an interactive guided tour. localStorage keys: `frameiq_onboarding_completed` (welcome page), `frameiq_tour_completed` (tour).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript, bundled by Vite.
- **Routing**: Wouter with 4 routes: `/`, `/recognition`, `/analysis`, `/summarize`
- **State Management**: TanStack React Query v5 for server state management.
- **UI Components**: shadcn/ui with Radix UI primitives (new-york style).
- **Styling**: Tailwind CSS with fixed dark mode theme. Fonts: Outfit (headings) + Plus Jakarta Sans (body).
- **Animations**: Framer Motion for page transitions, onboarding, and UI interactions.
- **Custom Components**: `BottomNav` (mobile nav), `ImageUploader` (file/camera input), `OnboardingTour` (guided tour).
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`
- **Design**: Mobile-first, max-width `md` (28rem), fixed dark mode, bottom tab navigation.

### Backend Architecture

- **Framework**: Express.js with TypeScript, run via `tsx`.
- **Entry Point**: `server/index.ts` handles server setup and route registration.
- **API**: RESTful endpoints in `server/routes.ts`. Zod schemas in `shared/routes.ts` enforce contracts.
- **Image Processing**: Sharp for resizing. Registration saves 400x400 color JPEG (display) + 100x100 grayscale pixel array JSON.
- **Face Recognition**: Uses Gemini AI multimodal comparison — sends query face + all registered face images to Gemini, which scores facial similarity.
- **AI Integration**: Replit AI Integrations for Gemini (`gemini-2.5-flash`) via `server/replit_integrations/image/client.ts`.
- **Dev/Prod**: Vite dev middleware in development, static files from `dist/public` in production.

### Data Storage

- **Database**: PostgreSQL via Drizzle ORM.
- **Schema**: `users`, `face_data`, `summary_history` tables.
- **Face Files**: Display images (400x400 JPEG) and vector JSONs saved to `face_dataset/`.
- **Migrations**: `drizzle-kit push` (schema push approach).

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Dashboard statistics |
| `/api/faces` | GET | All registered faces |
| `/api/summaries` | GET | Summary history |
| `/api/register-face` | POST | Register face (multipart: name + image) |
| `/api/recognize-face` | POST | AI-powered face recognition (multipart: image) |
| `/api/analyze-face` | POST | AI face analysis (multipart: image) |
| `/api/summarize` | POST | Text summarization (JSON: text, style, max_length) |

## External Dependencies

### APIs and Services

- **Google Gemini (via Replit AI Integrations)**: `gemini-2.5-flash` model for face analysis, face recognition comparison, and text summarization. Auto-configured, no API key management needed.

### Key NPM Packages

- `express`, `drizzle-orm`, `drizzle-kit`, `sharp`, `multer`, `@google/genai`
- `@tanstack/react-query`, `framer-motion`, `wouter`, `zod`
- `shadcn/ui`, `Radix UI`, `tailwindcss`, `lucide-react`, `react-icons`

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (auto-configured)
- `SESSION_SECRET`: Session secret key
- `AI_INTEGRATIONS_GEMINI_BASE_URL`, `AI_INTEGRATIONS_GEMINI_API_KEY`: Auto-configured by Replit AI integrations
