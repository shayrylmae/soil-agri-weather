# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Server
```bash
npm run dev          # Start development server with Turbopack
```

### Build and Production
```bash
npm run build        # Build for production with Turbopack
npm start           # Start production server
```

### Code Quality
```bash
npm run lint        # Run ESLint
```

### Testing
No test framework is currently configured in this project.

## Architecture Overview

This is a **Next.js 15 application** using the App Router pattern that creates an interactive soil monitoring dashboard with AI analysis.

### Core Application Structure

- **Frontend**: Single-page React application (`src/app/page.tsx`) with custom interactive dial controls for sensor data input
- **Backend**: Next.js API route (`src/app/api/chat/route.ts`) that integrates with Google Gemini AI
- **AI Integration**: Uses Google Gemini 1.5 Flash model with system instructions loaded from `system_instruction.md`

### Key Components

**Interactive Dial Component**: Custom SVG-based dial controls that handle both mouse and touch events for sensor data adjustment. Each dial manages specific ranges:
- Soil moisture (0-100%)
- Fertility/EC (0-3000 µS/cm)
- pH level (1-14)
- Temperature (-10-50°C with dual C/F display)
- Humidity (0-100%)
- Sunlight intensity (0-2000 lux)

**Chat Interface**: Real-time conversation with AI that maintains conversation history and provides contextual responses based on current sensor readings.

### Data Flow

1. User adjusts sensor readings via interactive dials
2. User submits questions through chat interface
3. Frontend sends sensor data + message + conversation history to `/api/chat`
4. Backend constructs prompt using system instructions + current sensor data + conversation context
5. Google Gemini AI generates agricultural advice
6. Response rendered as Markdown in chat interface

### Environment Configuration

Required environment variable in `.env.local`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Styling and UI

- **Tailwind CSS v4** for styling
- **Custom color scheme**: Teal/green gradient theme with glass-morphism effects
- **Responsive design**: Mobile-first approach with grid layouts that adapt to screen size
- **Typography**: Geist font family (sans and mono variants)

### AI System Instructions

The AI behavior is controlled by `system_instruction.md` which defines:
- Role as agricultural soil scientist
- Response structure for different question types
- Optimal sensor ranges for various plants
- Conversation flow and context handling