import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const api = axios.create({
baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  const [stats, setStats] = useState({ members: 0, doctors: 0, reminders: 0 });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const membersRes = await api.get('/health/members');
      const members = membersRes.data;
      let totalDoctors = 0, totalReminders = 0;
      for (const member of members) {
        const doctorsRes = await api.get(`/health/doctors?member_id=${member.id}`);
        const remindersRes = await api.get(`/health/reminders?member_id=${member.id}`);
        totalDoctors += doctorsRes.data.length;
        totalReminders += remindersRes.data.length;
      }
      setStats({ members: members.length, doctors: totalDoctors, reminders: totalReminders });
    } catch (err) { console.error(err); }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) { setError('Please fill all fields'); return; }
    if (passwords.newPass !== passwords.confirm) { setError('New passwords do not match'); return; }
    if (passwords.newPass.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      await api.post('/auth/change-password', { current_password: passwords.current, new_password: passwords.newPass });
      setMessage('✅ Password changed successfully!');
      setError('');
      setPasswords({ current: '', newPass: '', confirm: '' });
      setShowChangePassword(false);
    } catch (err) { setError('Current password is incorrect'); }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/members')}>← Back</button>
        <div style={styles.headerCenter}>
          <img src="/logo.png" alt="logo" style={styles.logo} />
          <h2 style={styles.headerTitle}>With Me</h2>
        </div>
        <div style={{ width: '60px' }} />
      </div>

      <div style={styles.content}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>{getInitials(user.name)}</div>
          <h2 style={styles.userName}>{user.name}</h2>
          <p style={styles.userEmail}>{user.email}</p>
          <span style={styles.roleBadge}>{user.role || 'Guardian'}</span>
        </div>

        <div style={styles.statsRow}>
          {[
            { label: 'Members', value: stats.members },
            { label: 'Doctors', value: stats.doctors },
            { label: 'Reminders', value: stats.reminders },
          ].map(stat => (
            <div key={stat.label} style={styles.statCard}>
              <p style={styles.statNumber}>{stat.value}</p>
              <p style={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>⚙️ Settings</h3>
          {message && <p style={styles.success}>{message}</p>}
          <div style={styles.settingItem} onClick={() => setShowChangePassword(!showChangePassword)}>
            <span style={styles.settingLabel}>🔑 Change Password</span>
            <span style={styles.arrow}>{showChangePassword ? '▲' : '▼'}</span>
          </div>
          {showChangePassword && (
            <div style={styles.passwordForm}>
              {error && <p style={styles.errorText}>{error}</p>}
              {[
                { placeholder: 'Current password', key: 'current' },
                { placeholder: 'New password', key: 'newPass' },
                { placeholder: 'Confirm new password', key: 'confirm' },
              ].map(f => (
                <input key={f.key} style={styles.input} type="password" placeholder={f.placeholder}
                  value={passwords[f.key]} onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })} />
              ))}
              <button style={styles.saveBtn} onClick={handleChangePassword}>Save Password</button>
            </div>
          )}
          {[
            { icon: '👤', label: 'Name', value: user.name },
            { icon: '📧', label: 'Email', value: user.email },
            { icon: '🏥', label: 'Role', value: user.role || 'Guardian' },
          ].map(item => (
            <div key={item.label} style={styles.settingItem}>
              <span style={styles.settingLabel}>{item.icon} {item.label}</span>
              <span style={styles.settingValue}>{item.value}</span>
            </div>
          ))}
        </div>

        <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  header: { backgroundColor: '#1d3e38', color: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  headerCenter: { display: 'flex', alignItems: 'center', gap: '8px' },
  logo: { width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain' },
  backBtn: { backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' },
  headerTitle: { margin: 0, fontSize: '18px' },
  content: { padding: '16px', maxWidth: '600px', margin: '0 auto' },
  profileCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '16px' },
  avatar: { width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#1d3e38', color: '#fff', fontSize: '26px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' },
  userName: { margin: '0 0 6px', color: '#1d3e38', fontSize: '20px' },
  userEmail: { margin: '0 0 10px', color: '#666', fontSize: '13px' },
  roleBadge: { backgroundColor: '#e3f2fd', color: '#1565c0', padding: '4px 14px', borderRadius: '20px', fontSize: '13px' },
  statsRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  statNumber: { margin: '0 0 4px', fontSize: '26px', fontWeight: 'bold', color: '#1d3e38' },
  statLabel: { margin: 0, color: '#666', fontSize: '11px' },
  section: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  sectionTitle: { margin: '0 0 14px', color: '#1d3e38', fontSize: '16px' },
  settingItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f4f8', cursor: 'pointer' },
  settingLabel: { fontSize: '14px', color: '#333' },
  settingValue: { color: '#666', fontSize: '13px', maxWidth: '180px', textAlign: 'right', wordBreak: 'break-all' },
  arrow: { color: '#1d3e38', fontSize: '12px' },
  passwordForm: { padding: '12px 0' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
  saveBtn: { backgroundColor: '#1d3e38', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', width: '100%', fontSize: '14px' },
  success: { color: '#356e61', fontSize: '13px', marginBottom: '8px' },
  errorText: { color: 'red', fontSize: '13px', marginBottom: '8px' },
  logoutBtn: { backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', cursor: 'pointer', width: '100%', fontSize: '16px', marginBottom: '20px' },
};

export default Profile;
