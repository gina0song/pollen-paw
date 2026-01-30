import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Activity, TrendingUp } from 'lucide-react';
import { symptomService } from '../services/symptomService';
import { petService } from '../services/petService';
import { environmentalService, PollenForecast } from '../services/environmentalService';
import { authService } from '../services/authService';
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
 const [pollenData, setPollenData] = useState<PollenForecast | null>(null); // ← 新增


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


 // ===== 新增：获取 Pollen 数据的逻辑 =====
 const loadPollenData = async () => {
   try {
     // 步骤 1: 从 localStorage 获取用户信息
     const user = authService.getCurrentUser();
     
     if (!user) {
       console.warn('User not found in localStorage');
       return;
     }

     const zipCode = user.zipCode;
     if (!zipCode) {
       console.warn('User zipCode not found');
       return;
     }

     // 步骤 2: 调用 environmentalService 获取 pollen 数据
     console.log(`📍 Fetching pollen data for ZIP: ${zipCode}`);
     const response = await environmentalService.getPollenData(zipCode);
     
     // 步骤 3: 获取今天的 pollen 数据（forecast 的第一项）
     const todayPollen = response.forecast && response.forecast.length > 0 
       ? response.forecast[0] 
       : null;
     
     if (todayPollen) {
       console.log('✅ Pollen data loaded:', todayPollen);
       setPollenData(todayPollen);

       // 同时更新 stats 里的 avgPollen（用树花粉作为主要指标）
       setStats(prev => ({
         ...prev,
         avgPollen: todayPollen.treePollen,
       }));
     }
   } catch (error) {
     console.error('Failed to load pollen data:', error);
     // 不中断流程，pollen data 失败不影响其他功能
   }
 };


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
    
     setStats(prev => ({
       ...prev,
       daysLogged: uniqueDays,
       avgSymptoms: symptomList.length > 0 ? (symptomList.length / (uniqueDays || 1)) : 0,
     }));

     // ===== 新增：加载 pollen 数据 =====
     await loadPollenData();

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
         {/* ===== 修改：显示真实的 pollen 值 ===== */}
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
         {/* ===== 修改：用真实 pollen 数据动态计算宽度 ===== */}
         <div className="pollen-item">
           <span>Tree</span>
           <div className="pollen-bar-bg">
             <div 
               className="pollen-bar yellow" 
               style={{ width: pollenData ? `${Math.min(pollenData.treePollen, 100)}%` : '0%' }}
             ></div>
           </div>
           {pollenData && <small>{pollenData.treePollen.toFixed(0)}</small>}
         </div>

         <div className="pollen-item">
           <span>Grass</span>
           <div className="pollen-bar-bg">
             <div 
               className="pollen-bar green" 
               style={{ width: pollenData ? `${Math.min(pollenData.grassPollen, 100)}%` : '0%' }}
             ></div>
           </div>
           {pollenData && <small>{pollenData.grassPollen.toFixed(0)}</small>}
         </div>

         <div className="pollen-item">
           <span>Weed</span>
           <div className="pollen-bar-bg">
             <div 
               className="pollen-bar orange" 
               style={{ width: pollenData ? `${Math.min(pollenData.weedPollen, 100)}%` : '0%' }}
             ></div>
           </div>
           {pollenData && <small>{pollenData.weedPollen.toFixed(0)}</small>}
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
