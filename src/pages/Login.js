import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function FamilyMembers() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: 'https://with-me-backend.onrender.com/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  const [members, setMembers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', relation: '', age: '' });
  const [error, setError] = useState('');

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/health/members');
      setMembers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAdd = async () => {
    if (!newMember.name || !newMember.relation || !newMember.age) {
      setError('Please fill all fields'); return;
    }
    if (members.length >= 5) {
      setError('Maximum 5 family members allowed'); return;
    }
    try {
      const res = await api.post('/health/members', {
        name: newMember.name,
        relation: newMember.relation,
        age: parseInt(newMember.age)
      });
      setMembers([...members, res.data]);
      setNewMember({ name: '', relation: '', age: '' });
      setShowAdd(false);
      setError('');
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/health/members/${id}`);
      setMembers(members.filter(m => m.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleSelect = (member) => {
    localStorage.setItem('selectedMember', JSON.stringify(member));
    navigate('/dashboard');
  };

  const getEmoji = (relation) => {
    const r = relation.toLowerCase();
    if (r.includes('mother') || r.includes('mom')) return '👩';
    if (r.includes('father') || r.includes('dad')) return '👨';
    if (r.includes('grand')) return '👴';
    if (r.includes('sister')) return '👧';
    if (r.includes('brother')) return '👦';
    return '👤';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="/logo.png" alt="logo" style={styles.logo} />
          <div>
            <h2 style={styles.headerTitle}>With Me</h2>
            <p style={styles.headerSub}>Welcome, {user.name?.split(' ')[0] || 'Guardian'} 👋</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.iconBtn} onClick={() => navigate('/profile')}>👤</button>
          <button style={styles.iconBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>🚪</button>
        </div>
      </div>

      <div style={styles.content}>
        <h3 style={styles.title}>Who are you checking today?</h3>
        <p style={styles.subtitle}>Select a family member to view their health dashboard</p>

        <div style={styles.grid}>
          {members.map((member) => (
            <div key={member.id} style={styles.memberCard} onClick={() => handleSelect(member)}>
              <button style={styles.deleteBtn} onClick={(e) => handleDelete(member.id, e)}>🗑</button>
              <div style={styles.memberEmoji}>{getEmoji(member.relation)}</div>
              <h4 style={styles.memberName}>{member.name}</h4>
              <p style={styles.memberRelation}>{member.relation}</p>
              <p style={styles.memberAge}>Age: {member.age}</p>
              <span style={styles.selectBtn}>View Dashboard →</span>
            </div>
          ))}
          {members.length < 5 && (
            <div style={styles.addCard} onClick={() => setShowAdd(true)}>
              <div style={styles.addIcon}>+</div>
              <p style={styles.addText}>Add Member</p>
              <p style={styles.addSubText}>{members.length}/5 members</p>
            </div>
          )}
        </div>

        {showAdd && (
          <div style={styles.formBox}>
            <h4 style={styles.formTitle}>Add Family Member</h4>
            {error && <p style={styles.errorText}>{error}</p>}
            <input style={styles.input} placeholder="Full name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
            <select style={styles.input} value={newMember.relation} onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}>
              <option value="">Select relation</option>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Grandmother">Grandmother</option>
              <option value="Grandfather">Grandfather</option>
              <option value="Sister">Sister</option>
              <option value="Brother">Brother</option>
              <option value="Other">Other</option>
            </select>
            <input style={styles.input} placeholder="Age" type="number" value={newMember.age} onChange={(e) => setNewMember({ ...newMember, age: e.target.value })} />
            <div style={styles.formActions}>
              <button style={styles.cancelBtn} onClick={() => { setShowAdd(false); setError(''); }}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleAdd}>Save Member</button>
            </div>
          </div>
        )}

        {members.length >= 5 && (
          <p style={styles.maxText}>✋ Maximum 5 family members reached</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  header: { backgroundColor: '#1d3e38', color: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  headerRight: { display: 'flex', gap: '8px' },
  logo: { width: '40px', height: '40px', borderRadius: '10px', objectFit: 'contain' },
  headerTitle: { margin: 0, fontSize: '18px' },
  headerSub: { margin: '2px 0 0', fontSize: '12px', opacity: 0.8 },
  iconBtn: { backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '16px' },
  content: { padding: '20px 16px' },
  title: { color: '#1d3e38', fontSize: '20px', marginBottom: '6px' },
  subtitle: { color: '#666', marginBottom: '20px', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px', marginBottom: '20px' },
  memberCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px 14px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '2px solid transparent', position: 'relative' },
  memberEmoji: { fontSize: '42px', marginBottom: '10px' },
  memberName: { margin: '0 0 4px', color: '#1d3e38', fontSize: '15px' },
  memberRelation: { margin: '0 0 4px', color: '#666', fontSize: '12px' },
  memberAge: { margin: '0 0 10px', color: '#999', fontSize: '12px' },
  selectBtn: { color: '#1d3e38', fontSize: '12px', fontWeight: 'bold' },
  deleteBtn: { position: 'absolute', top: '8px', right: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' },
  addCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px 14px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '2px dashed #1d3e38' },
  addIcon: { fontSize: '36px', color: '#1d3e38', marginBottom: '8px' },
  addText: { margin: '0 0 4px', color: '#1d3e38', fontWeight: 'bold', fontSize: '14px' },
  addSubText: { margin: 0, color: '#999', fontSize: '12px' },
  formBox: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', maxWidth: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  formTitle: { margin: '0 0 14px', color: '#1d3e38' },
  input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
  formActions: { display: 'flex', gap: '10px', marginTop: '6px' },
  cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#f0f4f8', color: '#666', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  saveBtn: { flex: 1, padding: '10px', backgroundColor: '#1d3e38', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  errorText: { color: 'red', fontSize: '13px', marginBottom: '10px' },
  maxText: { color: '#e74c3c', marginTop: '12px', fontSize: '14px' },
};

export default FamilyMembers;