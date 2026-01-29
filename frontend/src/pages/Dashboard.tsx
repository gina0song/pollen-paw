import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Activity, TrendingUp } from 'lucide-react';
import { symptomService } from '../services/symptomService';
import { petService } from '../services/petService'; // 引入 petService
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
      setRecentSymptoms(symptomList.slice(0, 4)); 
      
      const uniqueDays = new Set(symptomList.map(s => {
        const date = s.logDate instanceof Date ? s.logDate : new Date(s.logDate);
        return date.toISOString().split('T')[0];
      })).size;
      
      setStats({
        daysLogged: uniqueDays,
        avgPollen: 0, 
        avgSymptoms: symptomList.length > 0 ? (symptomList.length / (uniqueDays || 1)) : 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
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
              <option key={pet.id} value={pet.id}>{pet.name}</option>
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
          <div className="stat-value">{stats.avgPollen.toFixed(0)}</div>
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
            <div className="pollen-bar-bg"><div className="pollen-bar yellow" style={{ width: '80%' }}></div></div>
          </div>
          <div className="pollen-item">
            <span>Grass</span>
            <div className="pollen-bar-bg"><div className="pollen-bar green" style={{ width: '60%' }}></div></div>
          </div>
          <div className="pollen-item">
            <span>Weed</span>
            <div className="pollen-bar-bg"><div className="pollen-bar orange" style={{ width: '40%' }}></div></div>
          </div>
        </div>
      </div>

      {/* Recent Symptom Photos */}
      <div className="photos-section card">
        <h3>Recent Records</h3>
        <div className="photo-grid">
          {recentSymptoms.length > 0 ? (
            recentSymptoms.map((symptom) => (
              <div key={symptom.id} className="photo-item">
                {symptom.photoUrl ? (
                  <img src={symptom.photoUrl} alt="Symptom" className="dashboard-img" />
                ) : (
                  <div className="no-photo">No Photo</div>
                )}
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