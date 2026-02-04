// ============================================
// Pet Profile Page - Pure Inline Styles (No Tailwind)
// ============================================

import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { petService } from '../services/petService';
import { authService } from '../services/authService';
import { Pet } from '../types';
import './styles/AllPages.css';

const PetProfile: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog');
  const [petAge, setPetAge] = useState('');
  const [petBreed, setPetBreed] = useState('');

  const user = authService.getCurrentUser();
  const userEmail = user?.email || '';

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet);
    setPetName(pet.name || '');
    setPetType(pet.species ? (pet.species.charAt(0).toUpperCase() + pet.species.slice(1)) : 'Dog');
    setPetAge(pet.age?.toString() || '');
    setPetBreed(pet.breed || '');
  };

  const fetchPets = async () => {
    try {
      const fetchedPets = await petService.getPets();
      const validPets = (fetchedPets || []).filter(p => p && p.id);
      setPets(validPets);
      
      if (validPets.length > 0) {
        handleSelectPet(validPets[0]);
      } else {
        setSelectedPet(null);
        setPetName('');
        setPetAge('');
        setPetBreed('');
      }
    } catch (err) {
      console.error('Failed to load pets:', err);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!petName) {
      alert('Please enter a pet name');
      return;
    }
    
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      
      const petData = {
        name: petName,
        species: petType.toLowerCase() as 'cat' | 'dog',
        breed: petBreed || undefined,
        age: petAge ? parseInt(petAge) : undefined,
        userId: currentUser?.id,
      };

      if (selectedPet && selectedPet.id) {
        const updatedPet = await petService.updatePet(selectedPet.id, petData);
        setPets(prev => prev.map(p => p.id === updatedPet.id ? updatedPet : p));
        alert('✨ Success: Pet information updated!');
      } else {
        const newPet = await petService.createPet(petData);
        if (newPet && newPet.id) {
          setPets(prev => [...prev, newPet]);
          handleSelectPet(newPet);
          alert(`🎉 Success! ${newPet.name} has been added to your profile.`);
        } else {
          throw new Error('No pet ID returned from server');
        }
      }
    } catch (err) {
      console.error('Operation failed:', err);
      alert('❌ Action failed. Please check your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async () => {
    if (!selectedPet || !selectedPet.id) {
      alert('No pet selected to delete');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedPet.name}? This will also delete all symptom logs for this pet. This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      await petService.deletePet(selectedPet.id);
      
      const updatedPets = pets.filter(p => p.id !== selectedPet.id);
      setPets(updatedPets);
      
      if (updatedPets.length > 0) {
        handleSelectPet(updatedPets[0]);
      } else {
        setSelectedPet(null);
        setPetName('');
        setPetAge('');
        setPetBreed('');
      }
      
      alert(`${selectedPet.name} has been deleted successfully.`);
    } catch (err) {
      console.error('Failed to delete pet:', err);
      alert('Failed to delete pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Pet Profile Management</h2>
      
      {/* Account Settings */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ fontWeight: '600', color: '#374151' }}>Account Settings</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>Logged in as: {userEmail}</p>
      </div>

      {/* My Pets Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '16px' }}>My Pets</h3>
          <button
            title="Add New Pet"
            onClick={() => {
              setSelectedPet(null);
              setPetName('');
              setPetAge('');
              setPetBreed('');
            }}
            style={{
              padding: '8px',
              backgroundColor: '#dbeafe',
              color: '#2563eb',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
            }}
          >
            <Plus size={24} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px' }}>
          {pets && pets.length > 0 ? (
            pets.map(pet => (pet && pet.id) ? (
              <div
                key={pet.id}
                onClick={() => handleSelectPet(pet)}
                style={{
                  border: selectedPet?.id === pet.id ? '2px solid #2563eb' : '1px solid #ddd',
                  minWidth: '140px',
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedPet?.id === pet.id ? '#2563eb' : 'white',
                  color: selectedPet?.id === pet.id ? 'white' : 'black',
                  position: 'relative',
                  boxShadow: selectedPet?.id === pet.id ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
                  transform: selectedPet?.id === pet.id ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {/* ✅ Delete Button - Small Red Circle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPet(pet);
                    setTimeout(() => handleDeletePet(), 0);
                  }}
                  title="Delete pet"
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    right: '1px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                >
                  ✕
                </button>

                <h4 style={{ fontWeight: 'bold', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {pet.name}
                </h4>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>
                  {pet.species} • {pet.age || 0} yrs
                </p>
              </div>
            ) : null)
          ) : (
            <p style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic', padding: '16px 0' }}>
              No pets found. Click the (+) button to add your first pet!
            </p>
          )}
        </div>
      </div>

      {/* Pet Form Section */}
      <div style={{ backgroundColor: 'white', border: '1px solid #f3f4f6', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '24px', color: '#374151', fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
          {selectedPet ? `Editing: ${selectedPet.name}` : 'Add New Pet'}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Pet Name */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563', marginBottom: '4px', display: 'block' }}>
              Pet Name *
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Buddy"
              style={{
                border: '1px solid #d1d5db',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '14px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Type and Age */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563', marginBottom: '4px', display: 'block' }}>
                Type
              </label>
              <select
                value={petType}
                onChange={(e) => setPetType(e.target.value)}
                style={{
                  border: '1px solid #d1d5db',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                }}
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563', marginBottom: '4px', display: 'block' }}>
                Age (Years)
              </label>
              <input
                type="number"
                value={petAge}
                onChange={(e) => setPetAge(e.target.value)}
                placeholder="0"
                style={{
                  border: '1px solid #d1d5db',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Breed */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563', marginBottom: '4px', display: 'block' }}>
              Breed
            </label>
            <input
              type="text"
              value={petBreed}
              onChange={(e) => setPetBreed(e.target.value)}
              placeholder="e.g. Golden Retriever"
              style={{
                border: '1px solid #d1d5db',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '14px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
        
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button
            onClick={handleCreateOrUpdate}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px',
              borderRadius: '12px',
              fontWeight: 'bold',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Save size={20} />
            {loading ? 'Saving...' : (selectedPet ? 'Update Pet' : 'Save New Pet')}
          </button>

          {selectedPet && (
            <button
              onClick={handleDeletePet}
              disabled={loading}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 'bold',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Trash2 size={20} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
