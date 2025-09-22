'use client';

import { useState } from 'react';

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

const HumidityIcon = () => (
  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const MoistureIcon = () => (
  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.75 4.845C9.25 4.845 10.5 3.595 10.5 2.095c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 1.5 1.25 2.75 2.75 2.75.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5c-1.5 0-2.75 1.25-2.75 2.75 0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5c0-1.5-1.25-2.75-2.75-2.75-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5zm0 9c2.485 0 4.5 2.015 4.5 4.5S10.235 22.845 7.75 22.845 3.25 20.83 3.25 18.345s2.015-4.5 4.5-4.5z" />
  </svg>
);

const FertilityIcon = () => (
  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const PHIcon = () => (
  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const TemperatureIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 8a2.5 2.5 0 11-5 0v7a4.5 4.5 0 109 0V8z" />
  </svg>
);

const SunlightIcon = () => (
  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

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
  const angle = (percentage / 100) * 270 - 135; // 270 degree range, starting from -135 degrees
  const circumference = 2 * Math.PI * 40; // radius = 40 (increased)
  const strokeDasharray = circumference * 0.75; // 270 degrees = 75% of circle
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      let mouseAngle = Math.atan2(mouseY, mouseX) * (180 / Math.PI);

      // Normalize angle to 0-270 range
      if (mouseAngle < -135) mouseAngle += 360;
      if (mouseAngle < -135) mouseAngle = -135;
      if (mouseAngle > 135) mouseAngle = 135;

      const normalizedAngle = mouseAngle + 135;
      const newPercentage = normalizedAngle / 270;
      const newValue = Math.round((min + (max - min) * newPercentage) / step) * step;

      if (newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-40 h-40 cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
      >
        {/* Outer Shadow Ring */}
        <div className="absolute inset-0 rounded-full shadow-lg opacity-20"></div>

        {/* SVG Track and Progress */}
        <svg className="w-full h-full transform -rotate-[135deg]" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#374151"
            strokeWidth="6"
            strokeDasharray={strokeDasharray}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="opacity-20"
          />

          {/* Progress Arc with Glow */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="6"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: 'drop-shadow(0 0 4px #14b8a6)',
            }}
          />
        </svg>

        {/* Center Content Area */}
        <div
          className="absolute inset-6 rounded-full shadow-lg flex flex-col items-center justify-center select-none"
          style={{
            backgroundColor: knobColor,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none'
          }}
        >
          {/* Field Label */}
          <div className="text-xs font-light text-gray-600 mb-2 text-center leading-tight px-2">
            {label}
          </div>

          {/* Value */}
          <div className="text-lg font-light text-gray-800 leading-none text-center px-2">
            {displayValue || value}
          </div>

          {/* Secondary Value (for temperature) */}
          {secondaryValue && (
            <div className="text-sm font-light text-gray-400 leading-none text-center px-2 mt-1">
              {secondaryValue}
            </div>
          )}

          {/* Unit */}
          {unit && (
            <div className="text-xs text-gray-500 mt-2">
              {unit}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Helper functions for temperature conversion
const celsiusToFahrenheit = (celsius: number): number => Math.round((celsius * 9/5) + 32);
const fahrenheitToCelsius = (fahrenheit: number): number => Math.round((fahrenheit - 32) * 5/9);

const formatTemperatureDisplay = (temp: number, unit: 'C' | 'F'): { main: string; secondary: string } => {
  if (unit === 'C') {
    const fahrenheit = celsiusToFahrenheit(temp);
    return { main: `${temp} °C`, secondary: `${fahrenheit} °F` };
  } else {
    const celsius = fahrenheitToCelsius(temp);
    return { main: `${temp} °F`, secondary: `${celsius} °C` };
  }
};

export default function Home() {
  const [sensorData, setSensorData] = useState<SensorData>({
    soil: {
      moisture: 30,
      fertility: 1500,
      ph: 7,
      temperature: 20,
      temperatureUnit: 'C',
    },
    environment: {
      humidity: 50,
      sunlightIntensity: 750,
    },
  });
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          sensorData: sensorData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        type: 'ai',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light text-gray-800 mb-3">
            Soil Health Monitoring AI
          </h1>
          <p className="text-gray-600 font-light">
            Get professional soil analysis powered by artificial intelligence
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 min-h-[800px]">
          {/* Sensor Data Form */}
          <div style={{backgroundColor: '#C5E2D9'}} className="rounded-3xl shadow-xl p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-light text-black mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Sensor Readings
            </h2>

            <div className="space-y-6">
              {/* Soil Data Row */}
              <div className="grid grid-cols-3 gap-4">
                <Dial
                  value={sensorData.soil.moisture}
                  min={0}
                  max={100}
                  unit="%"
                  label="Soil Moisture"
                  onChange={(value) => setSensorData(prev => ({ ...prev, soil: { ...prev.soil, moisture: value } }))}
                />

                <Dial
                  value={sensorData.soil.fertility}
                  min={0}
                  max={3000}
                  unit="µS/cm"
                  label="Fertility"
                  onChange={(value) => setSensorData(prev => ({ ...prev, soil: { ...prev.soil, fertility: value } }))}
                  step={50}
                />

                <Dial
                  value={parseFloat(sensorData.soil.ph.toFixed(1))}
                  min={1}
                  max={14}
                  unit="pH"
                  label="pH Level"
                  onChange={(value) => setSensorData(prev => ({ ...prev, soil: { ...prev.soil, ph: value } }))}
                  step={0.1}
                />
              </div>

              {/* Environment Data Row */}
              <div className="grid grid-cols-3 gap-4">
                <Dial
                  value={sensorData.soil.temperature}
                  min={sensorData.soil.temperatureUnit === 'C' ? -10 : 14}
                  max={sensorData.soil.temperatureUnit === 'C' ? 50 : 122}
                  unit=""
                  label="Temperature"
                  knobColor="#EDB55E"
                  displayValue={formatTemperatureDisplay(sensorData.soil.temperature, sensorData.soil.temperatureUnit).main}
                  secondaryValue={formatTemperatureDisplay(sensorData.soil.temperature, sensorData.soil.temperatureUnit).secondary}
                  onChange={(value) => setSensorData(prev => ({ ...prev, soil: { ...prev.soil, temperature: value } }))}
                />

                <Dial
                  value={sensorData.environment.humidity}
                  min={0}
                  max={100}
                  unit="%"
                  label="Air Humidity"
                  knobColor="#EDB55E"
                  onChange={(value) => setSensorData(prev => ({ ...prev, environment: { ...prev.environment, humidity: value } }))}
                />

                <Dial
                  value={sensorData.environment.sunlightIntensity}
                  min={0}
                  max={2000}
                  unit="lux"
                  label="Sunlight Intensity"
                  knobColor="#EDB55E"
                  onChange={(value) => setSensorData(prev => ({ ...prev, environment: { ...prev.environment, sunlightIntensity: value } }))}
                  step={50}
                />
              </div>
            </div>
          </div>

          {/* AI Consultation Interface */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl p-6 flex flex-col h-fit">
            <h2 className="text-2xl font-light text-gray-800 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              AI Consultation
            </h2>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto border-0 bg-gray-50 bg-opacity-50 rounded-2xl p-4 space-y-4 mb-4 max-h-96">
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center font-light py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  Adjust your sensor readings and ask a question to get AI analysis!
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-sm lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg'
                          : 'bg-white text-gray-800 shadow-md border border-gray-100'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-light leading-relaxed">{message.content}</div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl shadow-md border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="question" className="flex items-center gap-2 text-sm font-light text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ask about your soil and environment
                </label>
                <textarea
                  id="question"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="e.g., How is my soil health? What should I plant? Any recommendations based on these conditions?"
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 font-light placeholder-gray-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-light py-3 px-6 rounded-2xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 hover:from-blue-600 hover:to-green-600"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing sensor data...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Get AI Analysis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
