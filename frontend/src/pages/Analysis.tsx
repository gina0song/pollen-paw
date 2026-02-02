// ============================================
// Analysis Page
// Correlation analysis between symptoms and pollen levels
// ============================================

import React, { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import './styles/AllPages.css';

const Analysis: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle analysis request
   */
  const handleApply = () => {
    setLoading(true);
    // TODO: Fetch correlation data from API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="analysis-page">
      <h2>Correlation Analysis</h2>

      {/* Date Range Selector */}
      <div className="date-range-selector">
        <div className="date-input">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="date-input">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button onClick={handleApply} disabled={loading}>
          {loading ? 'Loading...' : 'Apply'}
        </button>
      </div>

      {/* Chart Placeholder */}
      <div className="chart-section">
        <h3>Symptom vs Pollen Correlation</h3>
        <div className="chart-placeholder">
          <BarChart3 size={1} className="chart-icon" />
          {/* <p>Chart will display symptom and pollen correlation over time</p> */}
          <div className="chart-legend">
            <span className="legend-item blue">● Symptoms</span>
            <span className="legend-item orange">● Pollen Level</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-grid">
        <div className="summary-card">
          <h4>Top Trigger</h4>
          <div className="stat-box blue">
            <TrendingUp size={32} />
            <p>Pollen</p>
          </div>
        </div>

        <div className="summary-card">
          <h4>Trigger Point</h4>
          <div className="stat-box orange">
            <TrendingUp size={32} />
            <p>High Days</p>
          </div>
        </div>
      </div>

      {/* Photo Comparison */}
      <div className="comparison-section">
        <h3>Symptom Photo Comparison</h3>
        <div className="comparison-grid">
          <div className="comparison-item">
            <div className="comparison-photo"></div>
            <p>Low Pollen Day</p>
          </div>
          <div className="comparison-item">
            <div className="comparison-photo"></div>
            <p>High Pollen Day</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
