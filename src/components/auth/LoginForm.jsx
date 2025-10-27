import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { LogIn, UserPlus, Building } from 'lucide-react';
import './LoginForm.css';

export const LoginForm = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('business-owner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
        if (!success) setError('Invalid email or password');
      } else {
        if (!name.trim()) {
          setError('Name is required');
          return;
        }
        success = await signup(email, password, name, role);
        if (!success) setError('User with this email already exists');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'business-owner', label: 'Business Owner' },
    { value: 'accountant', label: 'Accountant' },
  ];

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Building className="login-icon" />
          </div>
          <h1 className="login-title">FinanceTracker</h1>
          <p className="login-subtitle">
            {isLogin ? 'Sign in to your account' : 'Create your business account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <Input
              type="text"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          )}

          <Input
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />

          {!isLogin && (
            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={roleOptions}
              required
            />
          )}

          {error && <p className="login-error">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (
              <>
                {isLogin
                  ? <LogIn className="login-btn-icon" />
                  : <UserPlus className="login-btn-icon" />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </Button>
        </form>

        <div className="login-toggle">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="login-toggle-btn"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        {isLogin && (
          <div className="login-demo">
            <p className="login-demo-title">Demo Credentials:</p>
            <div className="login-demo-credentials">
              <p><strong>Owner:</strong> owner@demo.com / password123</p>
              <p><strong>Accountant:</strong> accountant@demo.com / password123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
