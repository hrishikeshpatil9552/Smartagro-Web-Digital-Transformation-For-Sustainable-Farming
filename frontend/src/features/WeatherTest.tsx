import React from 'react';

interface WeatherTestProps {
  onBack: () => void;
}

export function WeatherTest({ onBack }: WeatherTestProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-800">Weather Forecasting</h1>
      <p className="mb-4">This is a test version to check if routing works.</p>
      <button 
        onClick={onBack}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Back to Home
      </button>
    </div>
  );
}