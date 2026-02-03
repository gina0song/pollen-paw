import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Activity, TrendingUp, X } from 'lucide-react';
import { symptomService } from '../services/symptomService';
import { petService } from '../services/petService';
import { SymptomLog, Pet } from '../types';
import './styles/AllPages.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    daysLogged: 0,
    avgPollen: 0,
    avgSymptoms: 0,
  });
  const [recentSymptoms, setRecentSymptoms] = useState<SymptomLog[]>([]);
  const [pollenData, setPollenData] = useState<{
    treePollen: number;
    grassPollen: number;
    weedPollen: number;
  } | null>(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const fetchedPets = await petService.getPets();
        const petList = Array.isArray(fetchedPets) ? fetchedPets : [];
        setPets(petList);

        if (petList.length > 0) {
          setSelectedPetId(petList[0].id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch pets:', error);
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  useEffect(() => {
    if (selectedPetId) {
      loadDashboardData(selectedPetId);
    }
  }, [selectedPetId]);

  const loadDashboardData = async (petId: number) => {
    try {
      setLoading(true);

      const symptoms = await symptomService.getSymptoms(petId);
      const symptomList = Array.isArray(symptoms) ? symptoms : [];

      setRecentSymptoms(symptomList.slice(0, 3));

      const uniqueDays = new Set(
        symptomList.map(s => {
          const date = s.logDate instanceof Date ? s.logDate : new Date(s.logDate);
          return date.toISOString().split('T')[0];
        })
      ).size;

      const latestSymptom = symptomList.length > 0 ? symptomList[0] : null;

      if (latestSymptom && latestSymptom.pollen_data) {
        const latestPollen = {
          treePollen: latestSymptom.pollen_data.treePollen || 0,
          grassPollen: latestSymptom.pollen_data.grassPollen || 0,
          weedPollen: latestSymptom.pollen_data.weedPollen || 0,
        };

        setPollenData(latestPollen);

        const avgPollen =
          (latestPollen.treePollen +
            latestPollen.grassPollen +
            latestPollen.weedPollen) /
          3;

        setStats({
          daysLogged: uniqueDays,
          avgPollen: avgPollen, 
          avgSymptoms: symptomList.length > 0
            ? symptomList.length / (uniqueDays || 1)
            : 0,
        });
      } else {
        setStats({
          daysLogged: uniqueDays,
          avgPollen: 0,
          avgSymptoms: symptomList.length > 0
            ? symptomList.length / (uniqueDays || 1)
            : 0,
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSymptom = async (symptomId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this symptom log? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await symptomService.deleteSymptom(symptomId);
      if (selectedPetId) {
        await loadDashboardData(selectedPetId);
      }
    } catch (error) {
      console.error('Failed to delete symptom:', error);
      alert('Failed to delete symptom. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading app-page-container">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard app-page-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        {pets.length > 0 && (
          <select
            value={selectedPetId || ''}
            onChange={(e) => setSelectedPetId(Number(e.target.value))}
            className="pet-selector-mini"
          >
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Welcome Card */}
      <div className="welcome-card card">
        <div className="welcome-content">
          <h3>Welcome back!</h3>
          <p>Track your pet's health today</p>
        </div>
        <div className="welcome-avatar">
          <div className="avatar-circle"></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue card">
          <Calendar size={24} />
          <div className="stat-value">{stats.daysLogged}</div>
          <div className="stat-label">Days Logged</div>
        </div>

        <div className="stat-card green card">
          <TrendingUp size={24} />
          <div className="stat-value">{stats.avgPollen.toFixed(2)}</div>
          <div className="stat-label">Avg Pollen</div>
        </div>

        <div className="stat-card orange card">
          <Activity size={24} />
          <div className="stat-value">{stats.avgSymptoms.toFixed(1)}</div>
          <div className="stat-label">Avg Symptoms</div>
        </div>
      </div>

      {/* Pollen Levels Section */}
      <div className="pollen-section card">
        <h3>Pollen Levels (Current)</h3>
        <div className="pollen-bars">
          <div className="pollen-item">
            <span>Tree</span>
            <div className="pollen-bar-bg">
              <div
                className="pollen-bar yellow"
                style={{
                  width: pollenData ? `${Math.min(pollenData.treePollen * 10, 100)}%` : '0%',
                }}
              ></div>
            </div>
            {pollenData && <small>{pollenData.treePollen.toFixed(1)}</small>}
          </div>

          <div className="pollen-item">
            <span>Grass</span>
            <div className="pollen-bar-bg">
              <div
                className="pollen-bar green"
                style={{
                  width: pollenData ? `${Math.min(pollenData.grassPollen * 10, 100)}%` : '0%',
                }}
              ></div>
            </div>
            {pollenData && <small>{pollenData.grassPollen.toFixed(1)}</small>}
          </div>

          <div className="pollen-item">
            <span>Weed</span>
            <div className="pollen-bar-bg">
              <div
                className="pollen-bar orange"
                style={{
                  width: pollenData ? `${Math.min(pollenData.weedPollen * 10, 100)}%` : '0%',
                }}
              ></div>
            </div>
            {pollenData && <small>{pollenData.weedPollen.toFixed(1)}</small>}
          </div>
        </div>
      </div>

      <div className="photos-section card">
        <h3>Recent Records</h3>
        <div className="recent-logs">
          {recentSymptoms.length > 0 ? (
            recentSymptoms.slice(0, 3).map(symptom => (
              <div
                key={symptom.id}
                className="log-card"
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  backgroundColor: '#f9fafb',
                  position: 'relative',
                }}
              >
                <button
                  onClick={() => handleDeleteSymptom(symptom.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                  }}
                >
                  <X size={18} />
                </button>

                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '10px',
                    paddingRight: '40px',
                  }}
                >
                  {new Date(symptom.logDate).toISOString().split('T')[0]}
                </div>

                {/* Photo */}
                <div
                  style={{
                    marginBottom: '10px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {symptom.photoUrl ? (
                    <img
                      src={symptom.photoUrl}
                      alt="Symptom"
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                      }}
                    />
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>No Photo</span>
                  )}
                </div>

                {/* Notes */}
                <div
                  style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    lineHeight: '1.5',
                  }}
                >
                  {symptom.notes ? symptom.notes : 'No notes'}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No symptoms logged yet.</div>
          )}
        </div>
      </div>

      <button
        className="primary-btn log-btn"
        onClick={() => navigate('/log-symptoms')}
      >
        Log Today's Symptoms
      </button>
    </div>
  );
};

export default Dashboard;
