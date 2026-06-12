import React, { useState, useEffect } from 'react';
import { FileText, Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: (email: string) => void;
}

interface UserAccount {
  name: string;
  email: string;
  password?: string; // stored simple hash or plaintext for mock DB purposes
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pre-seed a default administrator account if localStorage mock DB is empty
  useEffect(() => {
    const existing = localStorage.getItem('md2pdf_registered_users');
    let users: UserAccount[] = [];
    if (existing) {
      try {
        users = JSON.parse(existing);
      } catch (e) {
        users = [];
      }
    }
    
    const adminEmail = 'imujahidafridi@gmail.com';
    const adminPassword = 'MUJ@hid.786';
    
    const adminIndex = users.findIndex(u => u.email.toLowerCase() === adminEmail.toLowerCase());
    if (adminIndex === -1) {
      users.push({
        name: 'Mujahid Afridi',
        email: adminEmail,
        password: adminPassword
      });
      localStorage.setItem('md2pdf_registered_users', JSON.stringify(users));
    } else {
      users[adminIndex].password = adminPassword;
      users[adminIndex].name = 'Mujahid Afridi';
      localStorage.setItem('md2pdf_registered_users', JSON.stringify(users));
    }
  }, []);

  // Clear messages when toggling screens
  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Simple Validations
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!name) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsLoading(true);

    // Simulate API network roundtrip delay
    setTimeout(() => {
      const usersStr = localStorage.getItem('md2pdf_registered_users') || '[]';
      const users: UserAccount[] = JSON.parse(usersStr);

      if (mode === 'login') {
        const foundUser = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (foundUser) {
          setIsLoading(false);
          onLoginSuccess(foundUser.email);
        } else {
          setIsLoading(false);
          setErrorMsg('Invalid email address or password.');
        }
      } else {
        // Sign Up Mode
        const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          setIsLoading(false);
          setErrorMsg('Email address is already registered.');
        } else {
          const newUser: UserAccount = { name, email, password };
          users.push(newUser);
          localStorage.setItem('md2pdf_registered_users', JSON.stringify(users));
          
          setIsLoading(false);
          setSuccessMsg('Account registered successfully! Redirecting to login...');
          
          // Redirect to login after brief duration
          setTimeout(() => {
            setMode('login');
            setPassword('');
            setConfirmPassword('');
            setSuccessMsg(null);
          }, 1500);
        }
      }
    }, 850);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Branding Title */}
        <div className="auth-header">
          <h1>
            <FileText size={24} style={{ color: 'var(--accent-color)' }} />
            MD2PDF Workspace
          </h1>
          <p>{mode === 'login' ? 'Log in to access your converter workspace' : 'Create an account to start exporting PDFs'}</p>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="auth-alert-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert-success">
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Input Forms */}
        <form className="auth-form" onSubmit={handleAuthSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                  disabled={isLoading}
                />
                <User size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '36px' }}
                disabled={isLoading}
              />
              <Mail size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '36px', paddingRight: '36px' }}
                disabled={isLoading}
              />
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-muted)'
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '36px', paddingRight: '36px' }}
                  disabled={isLoading}
                />
                <Lock size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--text-muted)'
                  }}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="auth-btn-primary" disabled={isLoading}>
            {isLoading ? <div className="auth-spinner" /> : null}
            <span>{mode === 'login' ? 'Log In' : 'Create Account'}</span>
          </button>
        </form>

        {/* Screen Switch Trigger */}
        <div className="auth-switch-text">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <span className="auth-switch-link" onClick={handleToggleMode}>
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </span>
        </div>
      </div>
    </div>
  );
};
