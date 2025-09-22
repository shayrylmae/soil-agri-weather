import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

interface SoilData {
  moisture: number;
  fertility: number;
  ph: number;
  temperature: number;
  temperatureUnit: 'C' | 'F';
}

interface EnvironmentData {
  humidity: number;
  sunlightIntensity: number;
}

interface SensorData {
  soil: SoilData;
  environment: EnvironmentData;
}

interface Message {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  sensorData: SensorData;
  conversationHistory?: Message[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, sensorData, conversationHistory = [] }: ChatRequest = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Load system instructions from file
    const instructionFilePath = path.join(process.cwd(), 'system_instruction.md');
    const systemInstructions = fs.readFileSync(instructionFilePath, 'utf-8');

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = `\n## Previous Conversation\n`;
      conversationHistory.slice(-6).forEach((msg, index) => { // Include last 6 messages for context
        conversationContext += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
      });
    }

    // Create the full prompt with current sensor data and conversation context
    const prompt = `${systemInstructions}

## Current Sensor Data

### Soil Conditions
- **Soil Moisture**: ${sensorData.soil.moisture}%
- **Fertility (Electrical Conductivity)**: ${sensorData.soil.fertility} µS/cm
- **pH Level**: ${sensorData.soil.ph}
- **Soil Temperature**: ${sensorData.soil.temperature}°${sensorData.soil.temperatureUnit}

### Environmental Conditions
- **Air Humidity**: ${sensorData.environment.humidity}%
- **Sunlight Intensity**: ${sensorData.environment.sunlightIntensity} lux
${conversationContext}
## Current User Message
${message}

## Instructions
Please analyze the current sensor data and provide a comprehensive response. If this is a follow-up to a previous conversation, maintain context and continuity. For example, if you previously asked about providing a detailed analysis and the user responds with "yes" or "okay", provide that detailed analysis based on the previous context. Be conversational and remember what was discussed before.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);

    // Check if it's a service overload error
    if (error instanceof Error && error.message.includes('overloaded')) {
      return NextResponse.json(
        { error: 'AI service is currently overloaded. Please try again in a few moments.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}