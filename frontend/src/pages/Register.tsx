import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './styles/AllPages.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // FIX: Use zipCode (camelCase) and include password to match RegisterRequest
      await authService.register({ 
        email, 
        zipCode, 
        password: 'simulated_password' 
      });
      
      // Auto-login after registration
      await authService.login({ 
        email, 
        password: 'simulated_password' 
      });
      
      navigate('/');
    } catch (error) {
      alert('Registration failed.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join Pollen Paw</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} maxLength={5} required />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;