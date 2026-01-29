import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Share2, AlertCircle } from 'lucide-react';
import { analysisService, CorrelationResponse } from '../services/analysisService';
import './styles/AllPages.css';

const AIInsights: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CorrelationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPetId = 1; 

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analysisService.getCorrelation(currentPetId);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRegenerate = () => {
    fetchInsights();
  };

  const handleShare = () => {
    alert('Sharing functionality coming soon!');
  };

  return (
    <div className="ai-insights-page">
      <h2>AI-Generated Health Insights</h2>

      {error && (
        <div className="insight-item yellow" style={{ marginBottom: '20px' }}>
          <AlertCircle size={20} />
          <p>{error} (Need more symptom logs to analyze)</p>
        </div>
      )}

      <div className="key-insight">
        <Sparkles size={24} className="insight-icon" />
        <div className="insight-content">
          <h3>Key Insight</h3>
          <p>
            {loading ? 'Analyzing patterns...' : 
             data?.suggestion || 'Keep logging symptoms to see AI-generated insights.'}
          </p>
        </div>
      </div>

      <div className="insights-section">
        <h3>Pattern Detection</h3>
        <div className="insight-list">
          <div className="insight-item green">
            <span className="bullet">●</span>
            <p>
              Your pet's symptoms are {data ? Math.round(data.correlations.treePollen * 100) : '0'}% 
              correlated with tree pollen levels
            </p>
          </div>
          <div className="insight-item yellow">
            <span className="bullet">●</span>
            <p>Analyzed based on {data?.daysAnalyzed || 0} days of logged data</p>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>Personalized Recommendations</h3>
        <div className="insight-list">
          <div className="insight-item green">
            <span className="bullet">●</span>
            <p>Wipe paws and fur after outdoor walks to reduce pollen exposure</p>
          </div>
          <div className="insight-item green">
            <span className="bullet">●</span>
            <p>Schedule outdoor activities in early morning when pollen counts are lower</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="secondary-btn" onClick={handleRegenerate} disabled={loading}>
          <RefreshCw size={20} className={loading ? 'spin' : ''} />
          {loading ? 'Generating...' : 'Regenerate'}
        </button>
        <button className="primary-btn" onClick={handleShare}>
          <Share2 size={20} />
          Share with Vet
        </button>
      </div>
    </div>
  );
};

export default AIInsights;