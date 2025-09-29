import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { VectorizeService } from '@/lib/vectorize';

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
  // Default sensor data for error handling
  let sensorData: SensorData = {
    soil: { moisture: 0, fertility: 0, ph: 7, temperature: 20, temperatureUnit: 'C' },
    environment: { humidity: 50, sunlightIntensity: 1000 }
  };

  try {
    const { message, sensorData: requestSensorData, conversationHistory = [] }: ChatRequest = await request.json();
    sensorData = requestSensorData;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Load system instructions from file
    const instructionFilePath = path.join(process.cwd(), 'system_instruction.md');
    const systemInstructions = fs.readFileSync(instructionFilePath, 'utf-8');

    // Retrieve relevant documents from RAG system
    let ragContext = '';
    const vectorizeService = new VectorizeService();
    const documents = await vectorizeService.retrieveDocuments(message, 3);

    if (documents && documents.length > 0) {
      ragContext = `\n## Knowledge Base Information (PRIORITY DATA)\n\n`;
      ragContext += `**IMPORTANT**: The following information should be your PRIMARY source for regional, weather, and forecast-related questions:\n\n`;

      documents.forEach((doc, index) => {
        const content = doc.text || JSON.stringify(doc);
        ragContext += `### Knowledge Source ${index + 1}\n${content}\n\n`;
      });

      ragContext += `**END OF KNOWLEDGE BASE DATA** - Use this information to answer regional/weather questions.\n\n`;
    } else {
      // Check if this looks like a regional/weather query
      const isRegionalQuery = /\b(forecast|weather|region|visayas|luzon|mindanao|philippines|climate|rain|storm|typhoon|temperature|humidity|wind)\b/i.test(message);

      if (isRegionalQuery) {
        ragContext = `\n## Knowledge Base Status\n**IMPORTANT**: Knowledge base retrieval for regional weather information is currently unavailable. For specific regional forecasts and weather data, I recommend checking local meteorological services or weather agencies. I can still provide general agricultural guidance based on the current sensor readings.\n\n`;
      }
    }

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = `\n## Previous Conversation\n`;
      conversationHistory.slice(-6).forEach((msg) => { // Include last 6 messages for context
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
${ragContext}${conversationContext}
## Current User Message
${message}

## Instructions
Follow the system instructions above carefully. Key points:

1. **Knowledge Base Priority**: If Knowledge Base Information is provided above, use it as your primary source for regional, weather, and forecast-related questions.

2. **Context Awareness**: Check conversation history. If this is a follow-up question, respond directly without repeating previous information.

3. **Agricultural Focus**: Frame all weather and regional information in terms of farming implications (planting windows, irrigation needs, pest risks, etc.).

4. **Response Style**: Match response length to question complexity - brief for simple queries, detailed for complex topics.

5. **Sensor Integration**: Always consider current sensor data alongside any knowledge base information when providing recommendations.

Analyze the current sensor data and user message, incorporating any available knowledge base information to provide the most relevant agricultural guidance.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);

    // Enhanced error handling with meaningful fallback responses
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isNetworkError = errorMessage.includes('fetch failed') ||
                          errorMessage.includes('network') ||
                          errorMessage.includes('connection');
    const isServiceUnavailable = errorMessage.includes('503') ||
                                errorMessage.includes('Service Unavailable') ||
                                errorMessage.includes('overloaded');

    // Provide helpful fallback responses instead of generic errors
    let fallbackMessage = '';

    if (isServiceUnavailable) {
      fallbackMessage = `I'm currently experiencing some technical difficulties with my AI processing service. However, I can still provide some general guidance based on your sensor readings:

**Your Current Sensor Analysis:**
- **Soil Moisture**: ${sensorData.soil.moisture}% - ${sensorData.soil.moisture >= 40 ? 'Good hydration level' : 'Consider watering'}
- **Fertility (EC)**: ${sensorData.soil.fertility} µS/cm - ${sensorData.soil.fertility >= 400 ? 'Adequate nutrients' : 'May need fertilizing'}
- **pH Level**: ${sensorData.soil.ph} - ${sensorData.soil.ph >= 6.0 && sensorData.soil.ph <= 7.0 ? 'Optimal range' : 'Consider pH adjustment'}
- **Temperature**: ${sensorData.soil.temperature}°${sensorData.soil.temperatureUnit} - ${sensorData.soil.temperature >= 18 && sensorData.soil.temperature <= 25 ? 'Good growing temperature' : 'Temperature may need adjustment'}

Please try again in a few moments when the service is restored.`;

    } else if (isNetworkError) {
      fallbackMessage = `I'm experiencing network connectivity issues at the moment. Based on your current sensor readings, here's a quick assessment:

**Basic Soil Health Check:**
Your soil moisture is at ${sensorData.soil.moisture}%, fertility at ${sensorData.soil.fertility} µS/cm, and pH at ${sensorData.soil.ph}.

For immediate concerns:
- If moisture is below 40%, consider watering
- If pH is outside 6.0-7.0 range, monitor plant health
- Ensure good drainage if readings seem too high

Please try your question again once connectivity is restored.`;

    } else {
      fallbackMessage = `I'm experiencing some technical difficulties right now, but I can see your sensor readings show ${sensorData.soil.moisture}% soil moisture, ${sensorData.soil.fertility} µS/cm fertility, and ${sensorData.soil.ph} pH.

Please try asking your question again in a moment.`;
    }

    // Return a 200 response with a helpful message instead of an error
    return NextResponse.json({
      message: fallbackMessage,
      isTemporaryResponse: true
    });
  }
}