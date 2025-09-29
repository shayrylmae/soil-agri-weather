import { Configuration, PipelinesApi } from "@vectorize-io/vectorize-client";

export interface VectorizeDocument {
  id: string;
  text: string;
  source: string;
  source_display_name?: string;
  relevancy?: number;
  similarity?: number;
}

export interface VectorizeResponse {
  documents: VectorizeDocument[];
}

export interface ChatSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  relevancy?: number;
  similarity?: number;
}

// Mock data for development/testing when vectorize is unavailable
const MOCK_PHILIPPINE_WEATHER_DATA: VectorizeDocument[] = [
  {
    id: "weekend-special-outlook-001",
    text: `Weekend/Special Farm Weather Outlook | | | -- - | | **Today (September 26);** Metro Manila, CALABARZON, and MIMAROPA will experience stormy weather while Bicol Region and Visayas will have rains with gusty winds due to Tropical Cyclone OPONG. Cloudy skies with scattered rains and thunderstorms will prevail over Zamboanga Peninsula, Northern Mindanao, and Caraga due to the Southwest Monsoon, while the rest of Luzon will be affected by the trough of OPONG. The rest of Mindanao will have partly cloudy to cloudy skies with isolated rainshowers or thunderstorms.

**Tomorrow (September 27);** OPONG will continue to affect the weather condition over Northern and Central Luzon. Meanwhile, the Southwest Monsoon will bring cloudy skies with scattered rains and thunderstorms over the western sections of Central and Southern Luzon, Visayas, and Mindanao.

**Humidity Forecast for Visayas:** 65-100% with regional variations:
- Western Visayas: 60-99% relative humidity
- Central Visayas: 53-98% relative humidity
- Eastern Visayas: 70-100% relative humidity

**Agricultural Implications:**
- High humidity favorable for rice transplanting
- Monitor for fungal diseases in vegetable crops
- Delay fertilizer application during heavy rains
- Ensure proper drainage in low-lying areas`,
    source: "https://www.pagasa.dost.gov.ph/weekend-special-outlook",
    source_display_name: "PAGASA Weekend/Special Farm Weather Outlook",
    relevancy: 0.6286,
    similarity: 0.8450
  }
];

export class VectorizeService {
  private pipelinesApi: any;
  private organizationId: string;
  private pipelineId: string;
  private isDevelopmentMode: boolean;

  constructor() {
    this.isDevelopmentMode = process.env.NODE_ENV === 'development' && process.env.VECTORIZE_DEV_MODE === 'true';

    const config = new Configuration({
      accessToken: process.env.VECTORIZE_ACCESS_TOKEN,
      basePath: "https://api.vectorize.io/v1",
      // Enhanced timeout and retry configuration
      fetchApi: (input: any, init: any = {}) => {
        return fetch(input, {
          ...init,
          signal: AbortSignal.timeout(8000), // Reduced to 8 seconds for faster fallback
          headers: {
            ...init.headers,
            'User-Agent': 'NextJS-AgriApp/1.0',
            'Connection': 'keep-alive',
          },
        });
      },
    });

    this.pipelinesApi = new PipelinesApi(config);
    this.organizationId = process.env.VECTORIZE_ORG_ID!;
    this.pipelineId = process.env.VECTORIZE_PIPELINE_ID!;
  }

  async retrieveDocuments(
    question: string,
    numResults: number = 2
  ): Promise<VectorizeDocument[]> {

    // Check if development mode with mock data is enabled
    if (this.isDevelopmentMode) {
      console.log(`🧪 DEV MODE: Using mock Philippine weather data for query: "${question.substring(0, 100)}..."`);

      // Check if query is weather-related
      const isWeatherQuery = /\b(forecast|weather|humidity|rain|storm|typhoon|temperature|visayas|luzon|mindanao|weekend|special|farm)\b/i.test(question);

      if (isWeatherQuery) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`🧪 DEV MODE: Returning ${MOCK_PHILIPPINE_WEATHER_DATA.length} mock documents`);
        return MOCK_PHILIPPINE_WEATHER_DATA.slice(0, numResults);
      }
    }

    console.log(`Vectorize: Retrieving ${numResults} documents for: "${question.substring(0, 100)}..."`);

    // Retry logic with exponential backoff
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.pipelinesApi.retrieveDocuments({
          organizationId: this.organizationId,
          pipelineId: this.pipelineId,
          retrieveDocumentsRequest: {
            question,
            numResults,
          },
        });

        const documents = response.documents || [];
        console.log(`✅ Vectorize: Successfully retrieved ${documents.length} documents on attempt ${attempt}`);
        return documents;

      } catch (error: any) {
        lastError = error;
        const isNetworkError = error?.cause?.code === 'ERR_SOCKET_CONNECTION_TIMEOUT' ||
                              error?.message?.includes('fetch failed') ||
                              error?.name === 'AbortError';

        console.warn(`⚠️ Vectorize API Error (attempt ${attempt}/${maxRetries}):`, {
          message: error?.message,
          cause: error?.cause?.message,
          code: error?.cause?.code,
          isNetworkError,
          org: this.organizationId,
          pipeline: this.pipelineId
        });

        // If it's the last attempt or not a network error, don't retry
        if (attempt === maxRetries || !isNetworkError) {
          break;
        }

        // Exponential backoff: wait 1s, then 2s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Check if we should use fallback data based on query type
    const isWeatherQuery = /\b(forecast|weather|humidity|rain|storm|typhoon|temperature|visayas|luzon|mindanao|weekend|special|farm)\b/i.test(question);

    if (isWeatherQuery && process.env.VECTORIZE_FALLBACK_ENABLED === 'true') {
      console.log(`🔄 Network failed, using fallback Philippine weather data for weather query`);
      return MOCK_PHILIPPINE_WEATHER_DATA.slice(0, numResults);
    }

    console.log(`❌ All vectorize attempts failed, returning empty array`);
    return [];
  }

  formatDocumentsForContext(documents: VectorizeDocument[]): string {
    if (!documents.length) {
      return "No relevant documents found.";
    }

    return documents
      .map((doc, index) => `Document ${index + 1}:\n${doc.text}`)
      .join("\n\n---\n\n");
  }

  convertDocumentsToChatSources(documents: VectorizeDocument[]): ChatSource[] {
    return documents.map((doc) => ({
      id: doc.id,
      title: doc.source_display_name || doc.source,
      url: doc.source,
      snippet: doc.text,
      relevancy: doc.relevancy,
      similarity: doc.similarity,
    }));
  }
}