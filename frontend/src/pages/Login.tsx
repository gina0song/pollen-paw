import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './styles/AllPages.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await authService.login({ 
        email, 
        password: 'simulated_password' 
      });
      navigate('/');
    } catch (error) {
      alert('Login failed. Please check your email.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🐾 Pollen Paw</h2>
        <p>Track your pet's health with environmental data</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="auth-footer">Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
};

export default Login;