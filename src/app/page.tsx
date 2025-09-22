'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// --- TYPE DEFINITIONS ---
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

// --- DIAL COMPONENT ---
interface DialProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  onChange: (value: number) => void;
  step?: number;
  knobColor?: string;
  displayValue?: string;
  secondaryValue?: string;
}

const Dial: React.FC<DialProps> = ({ value, min, max, unit, label, onChange, step = 1, knobColor = "#ffffff", displayValue, secondaryValue }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const strokeDasharray = (2 * Math.PI * 40) * 0.75;
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  const handleInteraction = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const moveHandler = (clientX: number, clientY: number) => {
        const mouseX = clientX - centerX;
        const mouseY = clientY - centerY;
        let mouseAngle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);

        if (mouseAngle < -135) mouseAngle += 360;
        if (mouseAngle < -135) mouseAngle = -135;
        if (mouseAngle > 135) mouseAngle = 135;

        const normalizedAngle = mouseAngle + 135;
        const newPercentage = normalizedAngle / 270;
        let newValue = min + (max - min) * newPercentage;
        newValue = Math.round(newValue / step) * step;


        if (newValue >= min && newValue <= max) {
            onChange(newValue);
        }
    };
    
    const onMouseMove = (e: MouseEvent) => moveHandler(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        moveHandler(e.touches[0].clientX, e.touches[0].clientY)
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    const onTouchEnd = () => {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    };

    if ('touches' in event.nativeEvent) {
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    } else {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-36 h-36 sm:w-40 sm:h-40 cursor-pointer select-none touch-none"
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
        style={{ userSelect: 'none' }}
      >
        <svg className="w-full h-full transform -rotate-[135deg]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#374151" strokeWidth="6" strokeDasharray={strokeDasharray} strokeDashoffset="0" strokeLinecap="round" className="opacity-20" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#14b8a6" strokeWidth="6" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-500 ease-out" style={{ filter: 'drop-shadow(0 0 4px #14b8a6)' }} />
        </svg>
        <div className="absolute inset-6 rounded-full shadow-lg flex flex-col items-center justify-center select-none" style={{ backgroundColor: knobColor }}>
          <div className="text-xs font-light text-gray-600 mb-2 text-center leading-tight px-2">{label}</div>
          <div className="text-lg font-light text-gray-800 leading-none text-center px-2">{displayValue || value.toFixed(step < 1 ? 1 : 0)}</div>
          {secondaryValue && <div className="text-sm font-light text-gray-400 leading-none text-center px-2 mt-1">{secondaryValue}</div>}
          {unit && <div className="text-xs text-gray-500 mt-2">{unit}</div>}
        </div>
      </div>
    </div>
  );
};

// --- HELPER FUNCTIONS ---
const celsiusToFahrenheit = (celsius: number): number => Math.round((celsius * 9/5) + 32);
const formatTemperatureDisplay = (temp: number, unit: 'C' | 'F'): { main: string; secondary: string } => {
  if (unit === 'C') {
    return { main: `${temp}°C`, secondary: `${celsiusToFahrenheit(temp)}°F` };
  } else {
    // This part is not used currently but good to have
    const celsius = Math.round((temp - 32) * 5/9);
    return { main: `${temp}°F`, secondary: `${celsius}°C` };
  }
};

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  const [sensorData, setSensorData] = useState<SensorData>({
    soil: { moisture: 30, fertility: 1500, ph: 7.0, temperature: 20, temperatureUnit: 'C' },
    environment: { humidity: 50, sunlightIntensity: 750 },
  });
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { type: 'user', content: userInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setUserInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          sensorData: sensorData,
          conversationHistory: messages
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API response error');
      }
      const data = await response.json();
      const aiMessage: Message = { type: 'ai', content: data.message, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorContent = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.';
      const errorMessage: Message = { type: 'ai', content: errorContent, timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 p-4 sm:p-6 lg:p-8 lg:overflow-hidden">
      <main className="max-w-7xl mx-auto flex flex-col lg:h-full">
        {/* --- HEADER --- */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-gray-800">Soil Health AI</h1>
          </div>
          <p className="text-gray-600 font-light mt-2">AI-powered analysis for optimal plant growth</p>
        </header>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="flex flex-col lg:flex-1 lg:grid lg:grid-cols-2 gap-6 lg:min-h-0">
          {/* --- LEFT PANEL: SENSOR READINGS --- */}
          <section style={{backgroundColor: '#C5E2D9'}} className="rounded-3xl shadow-xl p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-light text-black mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              Sensor Readings
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-2">
                <Dial value={sensorData.soil.moisture} min={0} max={100} unit="%" label="Moisture" onChange={(value) => setSensorData(prev => ({ ...prev, soil: { ...prev.soil, moisture: value } }))} />
                <Dial value={sensorData.soil.fertility} min={0} max={3000} unit="µS/cm" label="Fertility" onChange={(value) => setSensorData(prev => ({ ...prev, soil: { ...prev.soil, fertility: value } }))} step={50} />
                <Dial value={sensorData.soil.ph} min={1} max={14} unit="pH" label="pH Level" onChange={(value) => setSensorData(prev => ({ ...prev, soil: { ...prev.soil, ph: value } }))} step={0.1} />
                <Dial value={sensorData.soil.temperature} min={-10} max={50} unit="" label="Temperature" knobColor="#ffffff" displayValue={formatTemperatureDisplay(sensorData.soil.temperature, 'C').main} secondaryValue={formatTemperatureDisplay(sensorData.soil.temperature, 'C').secondary} onChange={(value) => setSensorData(prev => ({ ...prev, soil: { ...prev.soil, temperature: value } }))} />
                <Dial value={sensorData.environment.humidity} min={0} max={100} unit="%" label="Humidity" knobColor="#EDB55E" onChange={(value) => setSensorData(prev => ({ ...prev, environment: { ...prev.environment, humidity: value } }))} />
                <Dial value={sensorData.environment.sunlightIntensity} min={0} max={2000} unit="lux" label="Sunlight" knobColor="#EDB55E" onChange={(value) => setSensorData(prev => ({ ...prev, environment: { ...prev.environment, sunlightIntensity: value } }))} step={50} />
            </div>
          </section>

          {/* --- RIGHT PANEL: AI CONSULTATION --- */}
          <section className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl p-6 flex flex-col min-h-0 flex-1 lg:min-h-0 min-h-[60vh]">
            <h2 className="text-2xl font-light text-gray-800 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
              AI Consultation
            </h2>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-gray-50 bg-opacity-50 rounded-2xl p-4 space-y-4 mb-4 min-h-0">
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center font-light flex flex-col justify-center items-center h-full"><div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>Adjust sensor readings and ask a question!</div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-sm lg:max-w-md px-4 py-3 rounded-2xl ${message.type === 'user' ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg' : 'bg-white text-gray-800 shadow-md border border-gray-100'}`}>
                      {message.type === 'ai' ? (
                        <div className="prose prose-sm prose-gray max-w-none">
                          <ReactMarkdown
                            components={{
                              h2: ({children}) => {
                                const text = children?.toString() || '';
                                const targetHeadings = ['Current Status', 'Key Issues', 'Immediate Actions', 'Plant Suggestions'];
                                const shouldStyle = targetHeadings.some(heading => text.includes(heading));
                                if (shouldStyle) {
                                  const needsTopMargin = ['Key Issues', 'Immediate Actions', 'Plant Suggestions'].some(heading => text.includes(heading));
                                  return needsTopMargin ?
                                    <h2 className="font-bold italic mt-4 text-teal-600">{children}</h2> :
                                    <h2 className="font-bold italic text-teal-600">{children}</h2>;
                                }
                                return <h2>{children}</h2>;
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap font-light leading-relaxed">{message.content}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start"><div className="bg-white text-gray-800 px-4 py-3 rounded-2xl shadow-md border border-gray-100"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.1s]"></div><div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></div></div></div></div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="question" className="flex items-center gap-2 text-sm font-light text-gray-700 mb-2"><svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Ask about your soil</label>
                <textarea id="question" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="e.g., How is my soil health?" rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-800 font-light placeholder-gray-400 resize-none" />
              </div>
              <button type="submit" disabled={isLoading || !userInput.trim()} className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-light py-3 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 hover:from-blue-600 hover:to-green-600">
                {isLoading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Analyzing...</>) : (<><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Get AI Analysis</>)}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

