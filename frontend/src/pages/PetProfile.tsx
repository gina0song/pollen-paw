// ============================================
// Pet Profile Page - WITH DELETE FUNCTIONALITY
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
        // Reset form if no pets
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
        userId: currentUser?.id
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

  // ✅ NEW: Delete pet functionality
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
      
      // Remove from local state
      const updatedPets = pets.filter(p => p.id !== selectedPet.id);
      setPets(updatedPets);
      
      // Select another pet or reset form
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
    <div className="pet-profile-page">
      <h2 className="page-title text-2xl font-bold mb-4">Pet Profile Management</h2>
      
      <div className="account-section bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-700">Account Settings</h3>
        <p className="text-sm text-gray-500 italic">Logged in as: {userEmail}</p>
      </div>

      <div className="pets-section mb-8">
        <div className="section-header flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">My Pets</h3>
          <button
            title="Add New Pet"
            className="add-pet-btn p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
            onClick={() => {
              setSelectedPet(null);
              setPetName('');
              setPetAge('');
              setPetBreed('');
            }}
          >
            <Plus size={24}/>
          </button>
        </div>
        
        <div className="pets-list flex gap-3 overflow-x-auto pb-4">
          {pets && pets.length > 0 ? (
            pets.map(pet => (pet && pet.id) ? (
              <div
                key={pet.id}
                className={`pet-card border min-w-[140px] p-4 rounded-xl cursor-pointer transition-all shadow-sm ${
                  selectedPet?.id === pet.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                    : 'bg-white hover:border-blue-300'
                }`}
                onClick={() => handleSelectPet(pet)}
              >
                <h4 className="font-bold truncate">{pet.name}</h4>
                <p className="text-xs opacity-80">{pet.species} • {pet.age || 0} yrs</p>
              </div>
            ) : null)
          ) : (
            <p className="text-gray-400 text-sm italic py-4">No pets found. Click the (+) button to add your first pet!</p>
          )}
        </div>
      </div>

      <div className="pet-form-section bg-white border p-6 rounded-2xl shadow-sm border-gray-100">
        <h3 className="font-bold mb-6 text-gray-700 text-lg border-b pb-2">
          {selectedPet ? `Editing: ${selectedPet.name}` : 'Add New Pet'}
        </h3>
        
        <div className="space-y-4">
          <div className="form-group flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Pet Name *</label>
            <input
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Buddy"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Type</label>
              <select
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                value={petType}
                onChange={(e) => setPetType(e.target.value)}
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
              </select>
            </div>
            <div className="form-group flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Age (Years)</label>
              <input
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                type="number"
                value={petAge}
                onChange={(e) => setPetAge(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Breed</label>
            <input
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              type="text"
              value={petBreed}
              onChange={(e) => setPetBreed(e.target.value)}
              placeholder="e.g. Golden Retriever"
            />
          </div>
        </div>
        
        <div className="button-group flex gap-3 mt-8">
          <button
            className="save-changes-btn flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 active:bg-blue-800 transition shadow-lg disabled:opacity-50"
            onClick={handleCreateOrUpdate}
            disabled={loading}
          >
            <Save size={20}/>
            {loading ? 'Saving...' : (selectedPet ? 'Update Pet' : 'Save New Pet')}
          </button>

          {/* ✅ NEW: Delete button (only show when editing existing pet) */}
          {selectedPet && (
            <button
              className="delete-btn bg-red-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 active:bg-red-800 transition shadow-lg disabled:opacity-50"
              onClick={handleDeletePet}
              disabled={loading}
              title="Delete this pet"
            >
              <Trash2 size={20}/>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
