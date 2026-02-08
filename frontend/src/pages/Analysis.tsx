import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { analysisService, CorrelationResponse } from '../services/analysisService';
import { petService } from '../services/petService';
import { Pet } from '../types';
import './styles/AllPages.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analysis: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [data, setData] = useState<CorrelationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets on mount
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const fetchedPets = await petService.getPets();
        setPets(fetchedPets);
        if (fetchedPets.length > 0) {
          setSelectedPetId(fetchedPets[0].id);
        }
      } catch (err) {
        console.error('Failed to load pets:', err);
      }
    };
    fetchPets();
  }, []);

  // Fetch correlation data when pet changes
  useEffect(() => {
    if (selectedPetId) {
      fetchAnalysis();
    }
  }, [selectedPetId]);

  // Fetch correlation data
  const fetchAnalysis = async () => {
    if (!selectedPetId) {
      setError('Please select a pet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analysisService.getCorrelation(selectedPetId);
      setData(result);
      if (result.status === "insufficient_data") {
        setError(null); 
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analysis');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (data?.status === "insufficient_data") {
    return (
      <div className="analysis-page">
        <h2>Correlation Analysis</h2>

        {/* Pet Selector */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
            Select Pet
          </label>
          <select
            value={selectedPetId || ''}
            onChange={(e) => setSelectedPetId(parseInt(e.target.value))}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </option>
            ))}
          </select>
        </div>

        <div className="insufficient-data-card" style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f0f4f8',
          borderRadius: '12px',
          border: '2px solid #3b82f6',
          marginBottom: '30px'
        }}>
          <AlertCircle size={48} style={{ color: '#3b82f6', marginBottom: '20px' }} />
          <h3 style={{ marginBottom: '10px', color: '#1f2937' }}>
            📊 Need more data
          </h3>
          <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '15px' }}>
            Have <strong>{data.daysLogged}</strong> day(s), need <strong>{data.daysNeeded}</strong> more day(s) for accurate analysis
          </p>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Keep logging symptoms daily to unlock correlation insights!
          </p>
        </div>

        <button
          onClick={fetchAnalysis}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {loading ? 'Checking...' : 'Check again'}
        </button>
      </div>
    );
  }

  // Render error state
  if (error && !data) {
    return (
      <div className="analysis-page">
        <h2>Correlation Analysis</h2>

        {/* Pet Selector */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
            Select Pet
          </label>
          <select
            value={selectedPetId || ''}
            onChange={(e) => setSelectedPetId(parseInt(e.target.value))}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </option>
            ))}
          </select>
        </div>

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

  // Render success state with data
  if (data?.status === "success" && data.correlations && data.chartData) {
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        title: {
          display: true,
          text: 'Symptom Severity vs Pollen Levels Over Time'
        }
      },
      scales: {
        y: {
          type: 'linear' as const,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Symptom Severity (1-5)'
          },
          min: 0,
          max: 5
        },
        y1: {
          type: 'linear' as const,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Pollen Level (0-10)'
          },
          min: 0,
          max: 10,
          grid: {
            drawOnChartArea: false
          }
        }
      }
    };

    const chartData = {
      labels: data.chartData.map(d => d.date),
      datasets: [
        {
          label: 'Symptom Severity',
          data: data.chartData.map(d => d.symptomSeverity),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Top Trigger Pollen',
          data: data.chartData.map(d => {
            if (data.correlations?.topTrigger === 'tree') return d.treePollen;
            if (data.correlations?.topTrigger === 'grass') return d.grassPollen;
            return d.weedPollen;
          }),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          borderWidth: 2,
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    };

    const topTriggerName = {
      tree: 'Tree Pollen',
      grass: 'Grass Pollen',
      weed: 'Weed Pollen'
    }[data.correlations.topTrigger];

    return (
      <div className="analysis-page">
        <h2>Correlation Analysis</h2>

        {/* Pet Selector */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
            Select Pet
          </label>
          <select
            value={selectedPetId || ''}
            onChange={(e) => setSelectedPetId(parseInt(e.target.value))}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </option>
            ))}
          </select>
        </div>

        {/* Chart Section */}
        <div className="chart-section" style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h3>Symptom vs Pollen Correlation</h3>
          <div style={{ height: '400px', position: 'relative' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Key Insights Cards */}
        {data.insights && (
          <div className="insights-section" style={{
            backgroundColor: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#1e40af', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={24} />
              Key Insights
            </h3>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Card 1: Top Trigger with Correlation Comparison */}
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
                  🎯 TOP TRIGGER
                </p>
                <p style={{ color: '#1f2937', fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>
                  {data.petName}'s Main Allergen: {topTriggerName}
                </p>

                {/* Correlation Coefficients Comparison */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                    Correlation Strength (r-value):
                  </p>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>
                        🌳 Tree Pollen
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: data.correlations.topTrigger === 'tree' ? '#3b82f6' : '#6b7280'
                      }}>
                        r = {data.correlations.treeCorr}
                        {data.correlations.topTrigger === 'tree' ? ' ⭐' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>
                        🌾 Grass Pollen
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: data.correlations.topTrigger === 'grass' ? '#3b82f6' : '#6b7280'
                      }}>
                        r = {data.correlations.grassCorr}
                        {data.correlations.topTrigger === 'grass' ? ' ⭐' : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>
                        🌿 Weed Pollen
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: data.correlations.topTrigger === 'weed' ? '#3b82f6' : '#6b7280'
                      }}>
                        r = {data.correlations.weedCorr}
                        {data.correlations.topTrigger === 'weed' ? ' ⭐' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* What is correlation coefficient */}
                <div style={{
                  backgroundColor: '#ecfdf5',
                  padding: '12px',
                  borderRadius: '8px',
                  borderLeft: '3px solid #10b981'
                }}>
                  <p style={{ fontSize: '11px', color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                    📚 What is Correlation Coefficient (r)?
                  </p>
                  <ul style={{ fontSize: '11px', color: '#047857', margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li><strong>r &gt; 0.7:</strong> Strong positive correlation (symptoms ↑ when pollen ↑)</li>
                    <li><strong>0.3 - 0.7:</strong> Medium correlation</li>
                    <li><strong>&lt; 0.3:</strong> Weak correlation</li>
                  </ul>
                </div>
              </div>

              {/* Card 2: Recommendation with Threshold Explanation */}
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '4px solid #10b981'
              }}>
                <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
                  💡 RECOMMENDATION
                </p>
                <p style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                  {data.insights.actionRecommendation}
                </p>

                {/* Why 7.0 Threshold */}
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '15px',
                  borderRadius: '8px',
                  borderLeft: '3px solid #f59e0b'
                }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '10px' }}>
                    📊 Why is 7.0 the Threshold?
                  </p>
                  <div style={{ fontSize: '11px', color: '#b45309', lineHeight: '1.7' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Pollen Index Risk Levels:</p>
                    <div style={{ marginLeft: '10px' }}>
                      <p style={{ margin: '4px 0' }}>🟢 <strong>0.0 - 2.4 (Low):</strong> Minimal symptoms</p>
                      <p style={{ margin: '4px 0' }}>🟡 <strong>2.5 - 4.8 (Low-Medium):</strong> Sensitive individuals may react</p>
                      <p style={{ margin: '4px 0' }}>🟠 <strong>4.9 - 7.2 (Medium-High):</strong> Most allergy sufferers experience discomfort</p>
                      <p style={{ margin: '4px 0' }}>🔴 <strong>&gt; 7.3 (High):</strong> Severe symptoms, limit outdoor activity</p>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontStyle: 'italic' }}>
                      ✓ Setting threshold at 7.0 captures the Medium-High to High transition point
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Comparison (Placeholder for v2.0) */}
        <div className="comparison-section" style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3>Symptom Photo Comparison</h3>
          <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
            📸 Coming in v2.0: Side-by-side photo comparison of low vs high pollen days
          </p>
          <div className="comparison-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div className="comparison-item" style={{
              backgroundColor: '#f3f4f6',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ height: '150px', backgroundColor: '#e5e7eb', borderRadius: '8px', marginBottom: '10px' }}></div>
              <p>Low Pollen Day</p>
            </div>
            <div className="comparison-item" style={{
              backgroundColor: '#f3f4f6',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ height: '150px', backgroundColor: '#e5e7eb', borderRadius: '8px', marginBottom: '10px' }}></div>
              <p>High Pollen Day</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial loading state
  return (
    <div className="analysis-page">
      <h2>Correlation Analysis</h2>

      {/* Pet Selector */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#374151' }}>
          Select Pet
        </label>
        <select
          value={selectedPetId || ''}
          onChange={(e) => setSelectedPetId(parseInt(e.target.value))}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            width: '100%',
            maxWidth: '300px'
          }}
        >
          {pets.length === 0 ? (
            <option>Loading pets...</option>
          ) : (
            pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </option>
            ))
          )}
        </select>
      </div>

      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f0f4f8',
        borderRadius: '12px'
      }}>
        <p style={{ color: '#6b7280' }}>
          {loading ? '📊 Loading analysis...' : 'Select a pet to view correlation analysis'}
        </p>
      </div>
    </div>
  );
};

export default Analysis;
