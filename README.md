# Soil Health Monitoring AI Chatbot

A Next.js application that helps monitor soil health using AI-powered analysis. Users can input soil data (humidity, moisture, fertility) and chat with an AI assistant powered by Google's Gemini API for expert soil advice.

## Features

- 📊 Real-time soil data input (humidity, moisture, fertility)
- 🤖 AI-powered soil analysis using Google Gemini
- 💬 Conversational interface for follow-up questions
- 📱 Responsive design with Tailwind CSS
- ⚡ Built with Next.js 15 and TypeScript
- 🚀 Vercel deployment ready

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
   - Create a new API key
   - Copy the API key

3. Update `.env.local` with your API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Enter Soil Data**: Input your soil's humidity (%), moisture (%), and fertility level (1-10)
2. **Ask Questions**: Type questions about your soil health, plant recommendations, or growing advice
3. **Get AI Analysis**: Receive expert advice from the AI based on your soil conditions
4. **Continue Conversation**: Ask follow-up questions to get more specific guidance

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

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API
- **Deployment**: Vercel

## Project Structure

```
soil-data-monitor/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # Gemini API integration
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main application
├── .env.example                 # Environment template
├── .env.local                   # Your API keys (gitignored)
├── vercel.json                  # Vercel configuration
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
