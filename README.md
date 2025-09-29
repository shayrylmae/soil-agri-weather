# Soil Health AI

An intelligent agricultural monitoring dashboard combining real-time sensor data with AI-powered analysis and regional weather insights. Features interactive dial controls for sensor data adjustment and comprehensive agricultural guidance powered by Google's Gemini AI with RAG (Retrieval-Augmented Generation) for enhanced regional weather and farming recommendations.

## Features

- **Interactive Dial Controls** - Touch/mouse-friendly dials for precise sensor data adjustment
- **Comprehensive Monitoring** - Track soil moisture, fertility (EC), pH, temperature, humidity, and sunlight
- **Dual Temperature Display** - Shows both Celsius and Fahrenheit readings
- **AI-Powered Analysis** - Get expert soil recommendations using Google Gemini AI
- **RAG-Enhanced Insights** - Retrieval-Augmented Generation for regional weather and agricultural data
- **Regional Weather Integration** - Philippine weather forecasts and farming advisories from PAGASA
- **Conversational Interface** - Chat with AI for follow-up questions and detailed guidance
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Built with Next.js 15** - Modern React framework with TypeScript support
- **Vercel Deployment Ready** - Easy cloud deployment

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd soil-data-monitor
npm install
```

### 2. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. **Required: Get your Gemini API key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the generated API key

3. **Optional: Configure Vectorize.io for RAG (for enhanced weather data):**
   - Sign up at [Vectorize.io](https://vectorize.io)
   - Create an organization and pipeline
   - Get your access token, organization ID, and pipeline ID

4. Update `.env.local` with your configuration:
```bash
# Required - Gemini AI
GEMINI_API_KEY=your_actual_api_key_here

# Optional - Vectorize.io RAG (for enhanced weather data)
VECTORIZE_ACCESS_TOKEN=your_vectorize_token_here
VECTORIZE_ORG_ID=your_organization_id_here
VECTORIZE_PIPELINE_ID=your_pipeline_id_here

# Development mode (enables mock weather data for testing)
VECTORIZE_DEV_MODE=true

# Fallback mode (uses mock data when Vectorize is unavailable)
VECTORIZE_FALLBACK_ENABLED=true
```

**Notes**:
- The app uses Gemini 2.5 Flash model which requires a valid API key
- RAG integration is optional - the app works with just Gemini API
- When Vectorize.io is not configured, the app uses mock Philippine weather data for testing
- Mock data includes PAGASA weather forecasts and humidity data for Visayas region

### 3. Run Development Server

```bash
npm run dev
```

The app will start with Turbopack for faster development. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## How to Use

### 1. Adjust Sensor Readings
Use the interactive dial controls to input your current readings:
- **Soil Moisture**: 0-100% (drag the dial to adjust)
- **Fertility (EC)**: 0-3000 µS/cm (electrical conductivity measurement)
- **pH Level**: 1-14 pH (soil acidity/alkalinity)
- **Temperature**: -10 to 50°C (displays both °C and °F)
- **Humidity**: 0-100% (air humidity)
- **Sunlight**: 0-2000 lux (light intensity)

### 2. Get AI Analysis
- Type questions about your soil conditions in the chat interface
- Ask for plant recommendations based on your current readings
- Request specific growing advice or troubleshooting help
- Get explanations about optimal ranges for different plants
- Ask about regional weather conditions and farming forecasts

### 3. Enhanced Weather Insights (RAG-Powered)
- Request local weather forecasts and agricultural advisories
- Get humidity predictions for your region (Visayas, Luzon, Mindanao)
- Ask about typhoon and storm preparations for farming
- Receive farming recommendations based on seasonal weather patterns

### 4. Interactive Conversation
- Continue the conversation with follow-up questions
- Ask for clarification on any recommendations
- Request seasonal adjustments or long-term monitoring strategies
- Combine sensor data analysis with weather forecast insights

## Deployment on Vercel

### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's environment variables:
   - `GEMINI_API_KEY` (required)
   - `VECTORIZE_ACCESS_TOKEN` (optional, for RAG)
   - `VECTORIZE_ORG_ID` (optional, for RAG)
   - `VECTORIZE_PIPELINE_ID` (optional, for RAG)
   - `VECTORIZE_FALLBACK_ENABLED=true` (recommended for production)
4. Deploy!

### Option 2: Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
```

Make sure to add your required environment variables (`GEMINI_API_KEY`) and optional RAG variables in your Vercel dashboard.

## Technology Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI Integration**: Google Gemini 2.5 Flash API
- **RAG System**: Vectorize.io for document retrieval and knowledge enhancement
- **Data Sources**: PAGASA weather forecasts and agricultural advisories
- **UI Components**: Custom interactive dial controls with SVG
- **Markdown Rendering**: react-markdown with custom styling
- **Deployment**: Vercel-optimized

## RAG Architecture

The application implements Retrieval-Augmented Generation (RAG) to enhance AI responses with regional weather and agricultural data:

### Components
- **VectorizeService**: Handles document retrieval from Vectorize.io
- **Knowledge Base**: Philippine weather forecasts, humidity data, and farming advisories
- **Fallback System**: Mock PAGASA data when external services are unavailable
- **Context Integration**: Combines sensor data with retrieved weather information

### Data Sources
- PAGASA Weekend/Special Farm Weather Outlook
- Regional humidity forecasts (Visayas, Luzon, Mindanao)
- Agricultural implications and farming recommendations
- Typhoon and storm preparedness guidance

### Fallback Strategy
- **Development Mode**: Uses mock data for testing (`VECTORIZE_DEV_MODE=true`)
- **Production Fallback**: Graceful degradation when RAG service is unavailable
- **Network Resilience**: Retry logic with exponential backoff
- **Smart Routing**: Weather queries prioritize RAG data, sensor queries use base AI model

## Project Structure

```
soil-data-monitor/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # Gemini API + RAG integration
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main dashboard with dial controls
│   │   └── globals.css          # Global styles
│   └── lib/
│       └── vectorize.ts         # RAG service implementation
├── .env.example                 # Environment template
├── .env.local                   # Your API keys (gitignored)
├── package.json                 # Dependencies and scripts
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
├── system_instruction.md        # Current AI system instructions
├── CLAUDE.md                    # Claude Code development guidance
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own soil monitoring needs!
