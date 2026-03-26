import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function GuardianDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const member = JSON.parse(localStorage.getItem('selectedMember') || '{}');
  const memberId = member.id || member.name;
  const token = localStorage.getItem('token');
  const remindersRef = useRef([]);

  const api = axios.create({
    baseURL: 'https://with-me-backend.onrender.com/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  const [doctors, setDoctors] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [progress, setProgress] = useState([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', speciality: '' });
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', type: 'medication', foodTiming: '', time: '' });
  const [reminderError, setReminderError] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastSpoken, setLastSpoken] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchReminders();
    fetchProgress();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { remindersRef.current = reminders; }, [reminders]);

  const speakReminder = (text) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
      setLastSpoken(text);
    }
  };

  const checkReminders = () => {
    const now = new Date();
    const currentTime = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    remindersRef.current.forEach(reminder => {
      if (reminder.time && reminder.status === 'pending') {
        if (reminder.time.slice(0, 16) === currentTime) {
          const foodText = reminder.foodTiming ? `, ${reminder.foodTiming} food` : '';
          speakReminder(`Reminder for ${member.name}: ${reminder.title}${foodText}`);
        }
      }
    });
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get(`/health/doctors?member_id=${memberId}`);
      setDoctors(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchReminders = async () => {
    try {
      const res = await api.get(`/health/reminders?member_id=${memberId}`);
      setReminders(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProgress = async () => {
    try {
      const res = await api.get(`/health/health-progress/${memberId}`);
      setProgress(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.speciality) return;
    try {
      const res = await api.post('/health/doctors', { ...newDoctor, member_id: memberId });
      setDoctors([...doctors, res.data]);
      setNewDoctor({ name: '', speciality: '' });
      setShowAddDoctor(false);
    } catch (err) { console.error(err); }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title) { setReminderError('Please enter a title'); return; }
    try {
      const res = await api.post('/health/reminders', {
        ...newReminder,
        time: newReminder.time || new Date().toISOString(),
        member_id: memberId
      });
      setReminders([...reminders, res.data]);
      setNewReminder({ title: '', type: 'medication', foodTiming: '', time: '' });
      setShowAddReminder(false);
      setReminderError('');
    } catch (err) { console.error(err); }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await api.delete(`/health/reminders/${id}`);
      setReminders(reminders.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
  };

  const getTypeIcon = (type) => ({ medication: '💊', appointment: '📅', exercise: '🏃' }[type] || '🔔');
  const getFoodLabel = (f) => ({ before: '• Before Food', after: '• After Food', with: '• With Food', empty: '• Empty Stomach' }[f] || '');
  const formatTime = (time) => {
    if (!time) return '';
    return new Date(time).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/members')}>← Members</button>
        <div style={styles.headerCenter}>
          <img src="/logo.png" alt="logo" style={styles.logo} />
          <div>
            <h2 style={styles.headerTitle}>{member.name || 'Family Member'}</h2>
            <p style={styles.headerSub}>by {user.name || 'Guardian'}</p>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>🚪</button>
      </div>

      <div style={styles.content}>
        <div style={styles.voiceBox}>
          <div style={styles.voiceLeft}>
            <span style={{ fontSize: '24px' }}>🔊</span>
            <div>
              <p style={styles.voiceTitle}>Voice Reminders</p>
              {lastSpoken && <p style={styles.voiceLast} title={lastSpoken}>Last: {lastSpoken.length > 30 ? lastSpoken.slice(0, 30) + '...' : lastSpoken}</p>}
            </div>
          </div>
          <div style={styles.voiceRight}>
            <button style={styles.testBtn} onClick={() => speakReminder(`Test reminder for ${member.name}. Voice is working!`)}>🔔 Test</button>
            <button style={voiceEnabled ? styles.voiceOnBtn : styles.voiceOffBtn} onClick={() => setVoiceEnabled(!voiceEnabled)}>
              {voiceEnabled ? '✅ On' : '❌ Off'}
            </button>
          </div>
        </div>

        {progress.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📈 Health Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, 'Health Score']} />
                <Line type="monotone" dataKey="score" stroke="#1d3e38" strokeWidth={3} dot={{ fill: '#356e61', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>👨‍⚕️ Doctors</h3>
            <button style={styles.addBtn} onClick={() => setShowAddDoctor(!showAddDoctor)}>+ Add</button>
          </div>
          {showAddDoctor && (
            <div style={styles.addForm}>
              <input style={styles.input} placeholder="Doctor's name" value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} />
              <input style={styles.input} placeholder="Speciality (e.g. Cardiology)" value={newDoctor.speciality} onChange={(e) => setNewDoctor({ ...newDoctor, speciality: e.target.value })} />
              <div style={styles.formActions}>
                <button style={styles.cancelBtn} onClick={() => setShowAddDoctor(false)}>Cancel</button>
                <button style={styles.saveBtn} onClick={handleAddDoctor}>Save</button>
              </div>
            </div>
          )}
          {doctors.length === 0 && <p style={styles.emptyText}>No doctors added yet.</p>}
          <div style={styles.doctorGrid}>
            {doctors.map((doc) => (
              <div key={doc.id} style={styles.doctorCard} onClick={() => navigate(`/doctor/${doc.id}`, { state: { doctor: doc } })}>
                <div style={styles.doctorIcon}>👨‍⚕️</div>
                <h4 style={styles.doctorName}>{doc.name}</h4>
                <p style={styles.doctorSpeciality}>{doc.speciality}</p>
                <span style={styles.viewBtn}>View Records →</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>🔔 Reminders</h3>
            <button style={styles.addBtn} onClick={() => setShowAddReminder(!showAddReminder)}>+ Add</button>
          </div>
          {showAddReminder && (
            <div style={styles.addForm}>
              {reminderError && <p style={styles.errorText}>{reminderError}</p>}
              <input style={styles.input} placeholder="Reminder title (e.g. Take Metformin)" value={newReminder.title} onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })} />
              <select style={styles.input} value={newReminder.type} onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value, foodTiming: '' })}>
                <option value="medication">💊 Medication</option>
                <option value="appointment">📅 Appointment</option>
                <option value="exercise">🏃 Exercise</option>
                <option value="other">🔔 Other</option>
              </select>
              {newReminder.type === 'medication' && (
                <select style={styles.input} value={newReminder.foodTiming} onChange={(e) => setNewReminder({ ...newReminder, foodTiming: e.target.value })}>
                  <option value="">🍽 Before or after food?</option>
                  <option value="before">Before Food</option>
                  <option value="after">After Food</option>
                  <option value="with">With Food</option>
                  <option value="empty">Empty Stomach</option>
                </select>
              )}
              <label style={styles.label}>Date & Time</label>
              <input style={styles.input} type="datetime-local" value={newReminder.time} onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })} />
              <div style={styles.formActions}>
                <button style={styles.cancelBtn} onClick={() => { setShowAddReminder(false); setReminderError(''); }}>Cancel</button>
                <button style={styles.saveBtn} onClick={handleAddReminder}>💾 Save</button>
              </div>
            </div>
          )}
          {reminders.length === 0 && <p style={styles.emptyText}>No reminders yet.</p>}
          {reminders.map((reminder) => (
            <div key={reminder.id} style={styles.reminderCard}>
              <div style={styles.reminderLeft}>
                <span style={styles.reminderIcon}>{getTypeIcon(reminder.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={styles.reminderTitle}>{reminder.title}</p>
                  <p style={styles.reminderTime}>
                    {reminder.type}
                    {reminder.foodTiming && <span style={styles.foodBadge}> {getFoodLabel(reminder.foodTiming)}</span>}
                    {' • '}{formatTime(reminder.time)}
                  </p>
                </div>
              </div>
              <div style={styles.reminderRight}>
                <span style={reminder.status === 'acknowledged' ? styles.statusDone : styles.statusPending}>
                  {reminder.status === 'acknowledged' ? '✅' : '⏳'}
                </span>
                <button style={styles.deleteBtn} onClick={() => handleDeleteReminder(reminder.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  header: { backgroundColor: '#1d3e38', color: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  headerCenter: { display: 'flex', alignItems: 'center', gap: '8px' },
  logo: { width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain' },
  headerTitle: { margin: 0, fontSize: '16px' },
  headerSub: { margin: '2px 0 0', fontSize: '11px', opacity: 0.8 },
  backBtn: { backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' },
  logoutBtn: { backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '16px' },
  content: { padding: '16px' },
  voiceBox: { backgroundColor: '#fff', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  voiceLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  voiceRight: { display: 'flex', gap: '8px', alignItems: 'center' },
  voiceTitle: { margin: 0, fontWeight: 'bold', color: '#1d3e38', fontSize: '14px' },
  voiceLast: { margin: '2px 0 0', fontSize: '11px', color: '#666', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  testBtn: { backgroundColor: '#f0f4f8', color: '#1d3e38', border: '1px solid #1d3e38', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' },
  voiceOnBtn: { backgroundColor: '#356e61', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' },
  voiceOffBtn: { backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' },
  section: { backgroundColor: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  sectionTitle: { margin: 0, color: '#1d3e38', fontSize: '16px' },
  addBtn: { backgroundColor: '#1d3e38', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px' },
  addForm: { backgroundColor: '#f0f4f8', padding: '14px', borderRadius: '8px', marginBottom: '14px' },
  input: { width: '100%', padding: '10px 12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
  label: { fontSize: '13px', color: '#555', marginBottom: '4px', display: 'block' },
  formActions: { display: 'flex', gap: '10px', marginTop: '4px' },
  cancelBtn: { flex: 1, padding: '9px', backgroundColor: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  saveBtn: { flex: 1, padding: '9px', backgroundColor: '#356e61', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  errorText: { color: 'red', fontSize: '13px', marginBottom: '8px' },
  emptyText: { color: '#999', textAlign: 'center', padding: '16px', fontSize: '14px' },
  doctorGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' },
  doctorCard: { backgroundColor: '#f0f4f8', borderRadius: '12px', padding: '16px 12px', textAlign: 'center', cursor: 'pointer' },
  doctorIcon: { fontSize: '32px', marginBottom: '6px' },
  doctorName: { margin: '0 0 4px', color: '#1d3e38', fontSize: '13px' },
  doctorSpeciality: { margin: '0 0 8px', color: '#666', fontSize: '11px' },
  viewBtn: { color: '#1d3e38', fontSize: '11px', fontWeight: 'bold' },
  reminderCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#f9f9f9', borderRadius: '10px', marginBottom: '8px', gap: '8px' },
  reminderLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  reminderRight: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 },
  reminderIcon: { fontSize: '22px', flexShrink: 0 },
  reminderTitle: { margin: 0, fontWeight: 'bold', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  reminderTime: { margin: '2px 0 0', color: '#666', fontSize: '11px' },
  foodBadge: { color: '#356e61', fontWeight: 'bold' },
  statusPending: { backgroundColor: '#fff3cd', color: '#856404', padding: '3px 8px', borderRadius: '20px', fontSize: '12px' },
  statusDone: { backgroundColor: '#d4edda', color: '#155724', padding: '3px 8px', borderRadius: '20px', fontSize: '12px' },
  deleteBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' },
};

export default GuardianDashboard;