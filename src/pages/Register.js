import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'guardian' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirm) { setError('Please fill in all fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: form.name, email: form.email, password: form.password, role: form.role
      });
      navigate('/', { state: { message: 'Account created! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Register as a guardian to monitor your family</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleRegister}>
          {[
            { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter your full name' },
            { label: 'Email Address', name: 'email', type: 'email', placeholder: 'Enter your email' },
            { label: 'Password', name: 'password', type: 'password', placeholder: 'At least 6 characters' },
            { label: 'Confirm Password', name: 'confirm', type: 'password', placeholder: 'Re-enter your password' },
          ].map(field => (
            <div style={styles.formGroup} key={field.name}>
              <label style={styles.label}>{field.label}</label>
              <input style={styles.input} type={field.type} name={field.name} placeholder={field.placeholder} value={form[field.name]} onChange={handleChange} required />
            </div>
          ))}
          <div style={styles.formGroup}>
            <label style={styles.label}>Register As</label>
            <select style={styles.input} name="role" value={form.role} onChange={handleChange}>
              <option value="guardian">👨‍👩‍👧 Guardian (Family Member)</option>
              <option value="caretaker">🏥 Caretaker / Nurse</option>
            </select>
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div style={styles.links}>
          <span style={styles.linkText}>Already have an account?</span>
          <Link to="/" style={styles.link}>Login</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  card: { backgroundColor: '#fff', borderRadius: '20px', padding: '32px 24px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  logoSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' },
  logo: { width: '64px', height: '64px', borderRadius: '16px', objectFit: 'contain', marginBottom: '8px' },
  appName: { margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#1d3e38' },
  tagline: { margin: '4px 0 0', fontSize: '13px', color: '#999' },
  title: { margin: '0 0 4px', fontSize: '20px', fontWeight: 'bold', color: '#1d3e38', textAlign: 'center' },
  subtitle: { margin: '0 0 20px', fontSize: '13px', color: '#999', textAlign: 'center' },
  error: { backgroundColor: '#fff5f5', color: '#e53e3e', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#444' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', padding: '14px', backgroundColor: '#1d3e38', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  links: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', flexWrap: 'wrap' },
  linkText: { color: '#999', fontSize: '14px' },
  link: { color: '#1d3e38', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none' },
};

export default Register;