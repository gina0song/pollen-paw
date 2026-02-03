// ============================================
// AI Insights Page - MVP 5
// Shows AI-generated insights and recommendations
// ============================================

import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { analysisService } from '../services/analysisService';
import './styles/AllPages.css';

const AIInsights: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [petId, setPetId] = useState<number | null>(null);

  // Get current pet ID
  useEffect(() => {
    const savedPetId = localStorage.getItem('selectedPetId');
    if (savedPetId) {
      setPetId(parseInt(savedPetId));
    }
  }, []);

  // Fetch correlation data for insights
  const fetchInsights = async () => {
    if (!petId) {
      setError('Please select a pet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analysisService.getCorrelation(petId);
      setData(result);
      if (result.status === "insufficient_data") {
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load insights');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (petId) {
      fetchInsights();
    }
  }, [petId]);

  // If insufficient data
  if (data?.status === "insufficient_data") {
    return (
      <div className="ai-insights-page">
        <h2>AI-Generated Health Insights</h2>
        
        <div className="insight-item yellow" style={{ marginBottom: '20px', padding: '20px' }}>
          <AlertCircle size={20} />
          <p>📊 Need more data. Have {data.daysLogged} day(s), need {data.daysNeeded} more day(s) for insights</p>
        </div>
      </div>
    );
  }

  // If error
  if (error && !data) {
    return (
      <div className="ai-insights-page">
        <h2>AI-Generated Health Insights</h2>
        <div style={{
          padding: '20px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          ❌ {error}
        </div>
      </div>
    );
  }

  // Success state with insights
  if (data?.status === "success" && data.insights && data.correlations) {
    const insights = data.insights;
    const corr = data.correlations;

    return (
      <div className="ai-insights-page">
        <h2>AI-Generated Health Insights</h2>

        {/* Key Insight */}
        <div className="key-insight" style={{
          backgroundColor: '#eff6ff',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '25px'
        }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <Sparkles size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <div>
              <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>Key Insight</h3>
              <p style={{ color: '#1f2937', fontSize: '16px' }}>
                {insights.topTriggerInsight}
              </p>
            </div>
          </div>
        </div>

        {/* Pattern Detection */}
        <div className="insights-section" style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '25px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Pattern Detection</h3>
          <div className="insight-list">
            <div className="insight-item green" style={{
              backgroundColor: '#ecfdf5',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '10px',
              borderLeft: '4px solid #10b981'
            }}>
              <span className="bullet">●</span>
              <p>
                Correlation coefficient: r = {corr.topTriggerValue}
              </p>
            </div>
            <div className="insight-item yellow" style={{
              backgroundColor: '#fefce8',
              padding: '15px',
              borderRadius: '8px',
              borderLeft: '4px solid #eab308'
            }}>
              <span className="bullet">●</span>
              <p>Analyzed based on {data.daysLogged} days of logged data</p>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="insights-section" style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '25px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Personalized Recommendations</h3>
          <div className="insight-list">
            <div className="insight-item green" style={{
              backgroundColor: '#ecfdf5',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '10px',
              borderLeft: '4px solid #10b981'
            }}>
              <span className="bullet">●</span>
              <p>{insights.thresholdInsight}</p>
            </div>
            <div className="insight-item green" style={{
              backgroundColor: '#ecfdf5',
              padding: '15px',
              borderRadius: '8px',
              borderLeft: '4px solid #10b981'
            }}>
              <span className="bullet">●</span>
              <p>{insights.actionRecommendation}</p>
            </div>
          </div>
        </div>

        {/* Trigger Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
              TOP TRIGGER
            </p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              {corr.topTrigger.toUpperCase()} Pollen
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
              THRESHOLD
            </p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f97316' }}>
              7.0
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
              CORRELATION
            </p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {(corr.topTriggerValue * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="ai-insights-page">
      <h2>AI-Generated Health Insights</h2>
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f0f4f8',
        borderRadius: '12px'
      }}>
        <p style={{ color: '#6b7280' }}>
          {loading ? 'Generating insights...' : 'Select a pet to view insights'}
        </p>
      </div>
    </div>
  );
};

export default AIInsights;
