import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend later
    setSent(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>
          Choose how you want to reset your password
        </p>

        {/* Toggle buttons */}
        <div style={styles.toggleRow}>
          <button
            style={method === 'email' ? styles.toggleActive : styles.toggleInactive}
            onClick={() => { setMethod('email'); setValue(''); setSent(false); }}
            type="button"
          >
            📧 Email
          </button>
          <button
            style={method === 'phone' ? styles.toggleActive : styles.toggleInactive}
            onClick={() => { setMethod('phone'); setValue(''); setSent(false); }}
            type="button"
          >
            📱 Phone Number
          </button>
        </div>

        {/* Success message */}
        {sent ? (
          <div style={styles.successBox}>
            {method === 'email'
              ? `✅ A password reset link has been sent to ${value}. Please check your inbox.`
              : `✅ An OTP code has been sent to ${value}. Please check your messages.`}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              style={styles.input}
              type={method === 'email' ? 'email' : 'tel'}
              placeholder={method === 'email' ? 'Enter your email address' : 'Enter your phone number'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
            <button style={styles.button} type="submit">
              {method === 'email' ? 'Send Reset Link' : 'Send OTP Code'}
            </button>
          </form>
        )}

        <p style={styles.link}>
          <Link to="/">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    color: '#1d3e38',
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: '24px',
    fontSize: '14px',
  },
  toggleRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  toggleActive: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#1d3e38',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  toggleInactive: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f0f4f8',
    color: '#1d3e38',
    border: '1px solid #1d3e38',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1d3e38',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  successBox: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  link: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px',
  }
};

export default ForgotPassword;

