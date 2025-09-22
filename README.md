# Soil Health AI

An interactive soil monitoring dashboard with AI-powered analysis. Features interactive dial controls for real-time sensor data adjustment and intelligent recommendations powered by Google's Gemini AI to optimize plant growth conditions.

## Features

- 🎛️ **Interactive Dial Controls** - Touch/mouse-friendly dials for precise sensor data adjustment
- 📊 **Comprehensive Monitoring** - Track soil moisture, fertility (EC), pH, temperature, humidity, and sunlight
- 🌡️ **Dual Temperature Display** - Shows both Celsius and Fahrenheit readings
- 🤖 **AI-Powered Analysis** - Get expert soil recommendations using Google Gemini AI
- 💬 **Conversational Interface** - Chat with AI for follow-up questions and detailed guidance
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Built with Next.js 15** - Modern React framework with TypeScript support
- 🚀 **Vercel Deployment Ready** - Easy cloud deployment

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

2. Get your Gemini API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key
   - Copy the generated API key

3. Update `.env.local` with your API key:
```bash
# .env.local
GEMINI_API_KEY=your_actual_api_key_here
```

**Note**: The app uses Gemini 1.5 Flash model which requires a valid API key. Make sure your API key has appropriate quotas enabled.

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

### 3. Interactive Conversation
- Continue the conversation with follow-up questions
- Ask for clarification on any recommendations
- Request seasonal adjustments or long-term monitoring strategies

## Deployment on Vercel

### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your `GEMINI_API_KEY` in Vercel's environment variables
4. Deploy!

### Option 2: Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
```

Make sure to add your `GEMINI_API_KEY` as an environment variable in your Vercel dashboard.

## Technology Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI Integration**: Google Gemini 1.5 Flash API
- **UI Components**: Custom interactive dial controls with SVG
- **Markdown Rendering**: react-markdown with custom styling
- **Deployment**: Vercel-optimized

## Project Structure

```
soil-data-monitor/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # Gemini API integration
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main dashboard with dial controls
│   │   └── globals.css          # Global styles
├── .env.example                 # Environment template
├── .env.local                   # Your API keys (gitignored)
├── package.json                 # Dependencies and scripts
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
├── system_instruction.ts        # AI system instructions
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
