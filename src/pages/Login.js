import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) setSuccess(location.state.message);
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/members');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <img src="/logo.png" alt="With Me Logo" style={styles.logo} />
          <h1 style={styles.appName}>With Me</h1>
          <p style={styles.tagline}>AI Family Health Monitor</p>
        </div>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your account</p>
        {success && <div style={styles.success}>{success}</div>}
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <div style={styles.links}>
          <Link to="/forgot-password" style={styles.link}>Forgot Password?</Link>
          <span style={styles.divider}>•</span>
          <Link to="/register" style={styles.link}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  card: { backgroundColor: '#fff', borderRadius: '20px', padding: '32px 24px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  logoSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' },
  logo: { width: '64px', height: '64px', borderRadius: '16px', objectFit: 'contain', marginBottom: '8px' },
  appName: { margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#1d3e38' },
  tagline: { margin: '4px 0 0', fontSize: '13px', color: '#999' },
  title: { margin: '0 0 4px', fontSize: '20px', fontWeight: 'bold', color: '#1d3e38', textAlign: 'center' },
  subtitle: { margin: '0 0 20px', fontSize: '13px', color: '#999', textAlign: 'center' },
  success: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' },
  error: { backgroundColor: '#fff5f5', color: '#e53e3e', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#444' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', padding: '14px', backgroundColor: '#1d3e38', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  links: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', flexWrap: 'wrap' },
  link: { color: '#1d3e38', fontSize: '14px', textDecoration: 'none' },
  divider: { color: '#ccc' },
};

export default Login;