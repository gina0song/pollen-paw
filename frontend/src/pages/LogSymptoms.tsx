import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { symptomService } from '../services/symptomService';
import { petService } from '../services/petService';
import { Pet, SymptomCategory } from '../types';
import './styles/AllPages.css';

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  { id: 'eyeSymptoms', name: 'Eye Symptoms', description: 'Watery, red eyes', min: 1, max: 5 },
  { id: 'furQuality', name: 'Fur Quality', description: 'Dull, patchy fur', min: 1, max: 5 },
  { id: 'skinIrritation', name: 'Skin Irritation', description: 'Redness, scratching', min: 1, max: 5 },
  { id: 'respiratory', name: 'Respiratory', description: 'Coughing, sneezing', min: 1, max: 5 },
];

const LogSymptoms: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  
  const [symptoms, setSymptoms] = useState<Record<string, number>>({
    eyeSymptoms: 1, 
    furQuality: 1, 
    skinIrritation: 1, 
    respiratory: 1,
  });

  useEffect(() => { loadPets(); }, []);

  const loadPets = async () => {
    try {
      const fetchedPets = await petService.getPets();
      setPets(Array.isArray(fetchedPets) ? fetchedPets : []);
      if (fetchedPets && fetchedPets.length > 0) {
        setSelectedPet(fetchedPets[0].id);
      }
    } catch (error) { 
      console.error('Failed to load pets:', error); 
    }
  };

  const handleSymptomChange = (categoryId: string, value: number) => {
    setSymptoms((prev) => ({ ...prev, [categoryId]: value }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 格式检查
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert("Unsupported format. Please use JPG or PNG.");
        return;
    }

    // 🚩 自动压缩逻辑：解决 IMG_0511 (2.1MB) 上传失败问题
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200; 
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
          setPhotoFile(compressedFile);
          setPhotoPreview(canvas.toDataURL('image/jpeg'));
        }
      }, 'image/jpeg', 0.8);
    };
  };

  const handleSubmit = async () => {
    if (!selectedPet) { alert('Please select a pet'); return; }
    
    try {
      setLoading(true);
      let uploadedPhotoUrl: string | undefined;

      if (photoFile) {
        uploadedPhotoUrl = await symptomService.uploadPhoto(photoFile);
      }

      const payload = {
        petId: Number(selectedPet), 
        eyeSymptoms: symptoms.eyeSymptoms,
        furQuality: symptoms.furQuality,
        skinIrritation: symptoms.skinIrritation,
        respiratory: symptoms.respiratory,
        notes: notes || undefined,
        photoUrl: uploadedPhotoUrl || undefined,
      };

      console.log("Sending payload to AWS:", payload);

      await symptomService.createSymptom(payload);
      alert('Symptoms logged successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Create symptom error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Please try again';
      alert(`Failed to log symptoms: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="log-symptoms app-page-container">
      <h2>Daily Symptom Logging</h2>
      
      <div className="pet-selector card">
        <label htmlFor="pet-select">Select Pet</label>
        <select 
          id="pet-select" 
          value={selectedPet || ''} 
          onChange={(e) => setSelectedPet(Number(e.target.value))}
        >
          <option value="">-- Select a pet --</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>{pet.name}</option>
          ))}
        </select>
      </div>

      <div className="photo-upload-section card">
        <input 
          type="file" 
          id="photo-input" 
          accept="image/*" 
          onChange={handlePhotoChange} 
          style={{ display: 'none' }} 
        />
        <label htmlFor="photo-input" className="photo-upload-area">
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="photo-preview" />
          ) : (
            <div className="upload-placeholder">
              <Camera size={48} />
              <p>Upload Symptom Photo (Optional)</p>
            </div>
          )}
        </label>
      </div>

      <div className="symptoms-section card">
        {SYMPTOM_CATEGORIES.map((category) => (
          <div key={category.id} className="symptom-slider">
            <div className="symptom-header">
              <span className="symptom-name">{category.name}</span>
            </div>
            {/* 🚩 关键修复：使用 Flex 布局强制拉开间距，解决“15”重叠 */}
            <div className="slider-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>1</span>
              <input 
                type="range" 
                min={category.min} 
                max={category.max} 
                value={symptoms[category.id]} 
                onChange={(e) => handleSymptomChange(category.id, Number(e.target.value))} 
                className="slider" 
                style={{ flex: 1 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', minWidth: '100px' }}>
                <span style={{ marginRight: '8px' }}>5</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: '#4A90E2',
                  whiteSpace: 'nowrap',
                  fontSize: '0.9rem'
                }}>
                  (Current: {symptoms[category.id]})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="notes-section card">
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Additional notes..."
        />
      </div>

      <button 
        className="primary-btn save-btn" 
        onClick={handleSubmit} 
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Symptom Log'}
      </button>
    </div>
  );
};

export default LogSymptoms;