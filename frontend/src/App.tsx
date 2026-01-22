import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface PollenDay {
  date: string;
  pollenLevel: string;
  grassPollen: number;
  treePollen: number;
  weedPollen: number;
  recommendation: string;
}

interface PollenResponse {
  zipCode: string;
  location: string;
  forecast: PollenDay[];
}

function App() {
  const [zipCode, setZipCode] = useState('');
  const [pollenData, setPollenData] = useState<PollenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!zipCode) {
      setError('Please enter a ZIP code');
      return;
    }

    setLoading(true);
    setError('');
    setPollenData(null);

    try {
      const response = await axios.get(
        `https://fhykriij99.execute-api.us-east-2.amazonaws.com/dev/environmental/pollen?zipCode=${zipCode}`
      );
      setPollenData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch pollen data');
    } finally {
      setLoading(false);
    }
  };

  const getPollenLevelClass = (level: string) => {
    switch (level) {
      case 'VERY_HIGH': return 'pollen-level pollen-level-very-high';
      case 'HIGH': return 'pollen-level pollen-level-high';
      case 'MODERATE': return 'pollen-level pollen-level-moderate';
      default: return 'pollen-level pollen-level-low';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐾 Pollen Paw</h1>
        <p>Check pollen levels in your area</p>

        {/* Input Box */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Enter ZIP code (e.g., 98074)"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="search-button"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Display Pollen Data */}
        {pollenData && (
          <div className="results-container">
            <h2 className="location-title">
              📍 {pollenData.location} ({pollenData.zipCode})
            </h2>
            <h3 className="forecast-title">5-Day Pollen Forecast:</h3>
            
            <div className="forecast-grid">
              {pollenData.forecast.map((day, index) => (
                <div key={index} className="pollen-card">
                  <h4 className="pollen-date">{day.date}</h4>
                  <p className={getPollenLevelClass(day.pollenLevel)}>
                    {day.pollenLevel}
                  </p>
                  <p className="pollen-detail">🌾 Grass: {day.grassPollen}/10</p>
                  <p className="pollen-detail">🌳 Tree: {day.treePollen}/10</p>
                  <p className="pollen-detail">🌿 Weed: {day.weedPollen}/10</p>
                  <p className="pollen-recommendation">
                    💡 {day.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;