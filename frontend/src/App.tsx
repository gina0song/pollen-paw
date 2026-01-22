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

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐾 Pollen Paw</h1>
        <p>Check pollen levels in your area</p>

        {/* Input Box */}
        <div style={{ margin: '20px' }}>
          <input
            type="text"
            placeholder="Enter ZIP code (e.g., 98074)"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              padding: '10px',
              fontSize: '16px',
              width: '200px',
              marginRight: '10px'
            }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ color: 'red', margin: '10px' }}>
            ❌ {error}
          </div>
        )}

        {/* Display Pollen Data */}
        {pollenData && (
          <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '600px' }}>
            <h2>📍 {pollenData.location} ({pollenData.zipCode})</h2>
            <h3>5-Day Pollen Forecast:</h3>
            
            {pollenData.forecast.map((day, index) => (
              <div
                key={index}
                style={{
                  background: '#f0f0f0',
                  padding: '15px',
                  margin: '10px 0',
                  borderRadius: '8px',
                  color: '#333'
                }}
              >
                <h4>{day.date} - {day.pollenLevel}</h4>
                <p>🌾 Grass: {day.grassPollen}/10</p>
                <p>🌳 Tree: {day.treePollen}/10</p>
                <p>🌿 Weed: {day.weedPollen}/10</p>
                <p style={{ fontStyle: 'italic', color: '#666' }}>
                  💡 {day.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;