import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function DoctorRecords() {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor || { name: 'Doctor', speciality: 'General' };
  const token = localStorage.getItem('token');
  const member = JSON.parse(localStorage.getItem('selectedMember') || '{}');

 const api = axios.create({
  baseURL: 'https://with-me-backend.onrender.com/api',
  headers: { Authorization: `Bearer ${token}` }
});

  const [records, setRecords] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [analyzingId, setAnalyzingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await api.get(`/health/records/${doctor.id}`);
      setRecords(res.data);
    } catch (err) {
      console.error('Error fetching records', err);
    }
  };

  const handleUpload = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await api.post('/health/records', {
        doctor_id: doctor.id,
        diagnosis: newDiagnosis,
        note: newNote
      });
      setRecords([res.data, ...records]);
      setNewNote('');
      setNewDiagnosis('');
      setShowUpload(false);
    } catch (err) {
      console.error('Error saving record', err);
    }
  };

  const handleAnalyse = async (record) => {
    setAnalyzingId(record.id);
    try {
      const res = await api.post('/health/ai-analysis', {
        note: record.note,
        diagnosis: record.diagnosis,
        record_id: record.id
      });
      setRecords(records.map(r =>
        r.id === record.id ? { ...r, analysis: res.data.analysis } : r
      ));
    } catch (err) {
      console.error('AI analysis error', err);
    }
    setAnalyzingId(null);
  };

  const handleExportPDF = (record) => {
    setExportingId(record.id);

    const sections = parseAnalysis(record.analysis);
    const patientName = member.name || 'Patient';
    const patientAge = member.age || '';
    const patientRelation = member.relation || '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Health Report - ${patientName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #222; background: #fff; }

          .cover {
            background: linear-gradient(135deg, #1d3e38, #356e61);
            color: white;
            padding: 60px 40px;
            text-align: center;
            min-height: 200px;
          }
          .cover h1 { font-size: 36px; margin-bottom: 8px; letter-spacing: 2px; }
          .cover p { font-size: 16px; opacity: 0.85; margin-top: 4px; }
          .cover .tagline { font-size: 13px; opacity: 0.6; margin-top: 8px; font-style: italic; }

          .info-bar {
            background: #f0f4f8;
            padding: 20px 40px;
            display: flex;
            gap: 40px;
            border-bottom: 3px solid #1d3e38;
          }
          .info-item label { font-size: 11px; color: #888; text-transform: uppercase; display: block; }
          .info-item span { font-size: 15px; font-weight: bold; color: #1d3e38; }

          .content { padding: 32px 40px; }

          .section {
            margin-bottom: 28px;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #e0e0e0;
          }
          .section-header {
            padding: 12px 18px;
            font-size: 15px;
            font-weight: bold;
            color: white;
          }
          .section-body {
            padding: 16px 18px;
            font-size: 14px;
            line-height: 1.8;
            color: #333;
            background: #fff;
            white-space: pre-line;
          }

          .food-header { background: #2e7d32; }
          .med-header { background: #1565c0; }
          .reminder-header { background: #6a1b9a; }
          .tips-header { background: #e65100; }
          .warning-header { background: #c62828; }
          .exercise-header { background: #00695c; }
          .trend-header { background: #4527a0; }

          .score-box {
            background: linear-gradient(135deg, #1d3e38, #356e61);
            color: white;
            border-radius: 12px;
            padding: 28px;
            text-align: center;
            margin-bottom: 28px;
          }
          .score-box .score-number { font-size: 72px; font-weight: bold; line-height: 1; }
          .score-box .score-label { font-size: 16px; opacity: 0.8; margin-top: 8px; }
          .score-box .score-note { font-size: 13px; opacity: 0.7; margin-top: 6px; font-style: italic; }

          .original-note {
            background: #fffde7;
            border-left: 4px solid #f9a825;
            padding: 16px 18px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 28px;
            font-size: 14px;
            line-height: 1.7;
            color: #555;
          }
          .original-note h4 { color: #f57f17; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; }

          .footer {
            margin-top: 40px;
            padding: 20px 40px;
            background: #f0f4f8;
            border-top: 2px solid #1d3e38;
            font-size: 12px;
            color: #888;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>

        <div class="cover">
          <h1>WITH ME</h1>
          <p>AI Health Analysis Report</p>
          <p class="tagline">AI-Based Family Health Monitoring System</p>
        </div>

        <div class="info-bar">
          <div class="info-item">
            <label>Patient Name</label>
            <span>${patientName}</span>
          </div>
          <div class="info-item">
            <label>Age</label>
            <span>${patientAge}</span>
          </div>
          <div class="info-item">
            <label>Relation</label>
            <span>${patientRelation}</span>
          </div>
          <div class="info-item">
            <label>Doctor</label>
            <span>Dr. ${doctor.name}</span>
          </div>
          <div class="info-item">
            <label>Speciality</label>
            <span>${doctor.speciality}</span>
          </div>
          <div class="info-item">
            <label>Report Date</label>
            <span>${record.date}</span>
          </div>
        </div>

        <div class="content">

          ${record.diagnosis ? `
          <div class="section">
            <div class="section-header" style="background:#37474f;">📋 Diagnosis</div>
            <div class="section-body">${record.diagnosis}</div>
          </div>` : ''}

          <div class="original-note">
            <h4>📄 Original Doctor's Note</h4>
            ${record.note}
          </div>

          ${sections.score ? `
          <div class="score-box">
            <div class="score-label">Health Improvement Score</div>
            <div class="score-number">${sections.score.match(/\d+/)?.[0] || '—'}%</div>
            <div class="score-note">${sections.score.replace(/^\d+%\s*[-–]?\s*/, '')}</div>
          </div>` : ''}

          ${sections.food ? `
          <div class="section">
            <div class="section-header food-header">🥗 Food Recommendations</div>
            <div class="section-body">${sections.food}</div>
          </div>` : ''}

          ${sections.medication ? `
          <div class="section">
            <div class="section-header med-header">💊 Medication Schedule</div>
            <div class="section-body">${sections.medication}</div>
          </div>` : ''}

          ${sections.reminders ? `
          <div class="section">
            <div class="section-header reminder-header">🔔 Suggested Reminders</div>
            <div class="section-body">${sections.reminders}</div>
          </div>` : ''}

          ${sections.tips ? `
          <div class="section">
            <div class="section-header tips-header">💡 Health Tips</div>
            <div class="section-body">${sections.tips}</div>
          </div>` : ''}

          ${sections.warning ? `
          <div class="section">
            <div class="section-header warning-header">⚠️ Warning Signs</div>
            <div class="section-body">${sections.warning}</div>
          </div>` : ''}

          ${sections.exercise ? `
          <div class="section">
            <div class="section-header exercise-header">🏃 Exercise Recommendations</div>
            <div class="section-body">${sections.exercise}</div>
          </div>` : ''}

          ${sections.trend ? `
          <div class="section">
            <div class="section-header trend-header">📈 Health Trend Analysis</div>
            <div class="section-body">${sections.trend}</div>
          </div>` : ''}

        </div>

        <div class="footer">
          <span>Generated by With Me — AI Family Health Monitor</span>
          <span>Student: Wyshnavi Thaneswaran | ICBT Campus Colombo</span>
          <span>Generated on: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</span>
        </div>

      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      setExportingId(null);
    }, 500);
  };

  const parseAnalysis = (text) => {
    const sections = { food: '', medication: '', reminders: '', tips: '', warning: '', exercise: '', trend: '', score: '' };
    if (!text) return sections;

    const foodMatch = text.match(/FOOD RECOMMENDATIONS:([\s\S]*?)(?=MEDICATION SCHEDULE:|SUGGESTED REMINDERS:|$)/i);
    const medMatch = text.match(/MEDICATION SCHEDULE:([\s\S]*?)(?=SUGGESTED REMINDERS:|$)/i);
    const remindersMatch = text.match(/SUGGESTED REMINDERS:([\s\S]*?)(?=HEALTH TIPS:|$)/i);
    const tipsMatch = text.match(/HEALTH TIPS:([\s\S]*?)(?=WARNING SIGNS:|$)/i);
    const warningMatch = text.match(/WARNING SIGNS:([\s\S]*?)(?=EXERCISE RECOMMENDATIONS:|$)/i);
    const exerciseMatch = text.match(/EXERCISE RECOMMENDATIONS:([\s\S]*?)(?=HEALTH TREND ANALYSIS:|$)/i);
    const trendMatch = text.match(/HEALTH TREND ANALYSIS:([\s\S]*?)(?=HEALTH SCORE:|$)/i);
    const scoreMatch = text.match(/HEALTH SCORE:([\s\S]*?)$/i);

    if (foodMatch) sections.food = foodMatch[1].trim();
    if (medMatch) sections.medication = medMatch[1].trim();
    if (remindersMatch) sections.reminders = remindersMatch[1].trim();
    if (tipsMatch) sections.tips = tipsMatch[1].trim();
    if (warningMatch) sections.warning = warningMatch[1].trim();
    if (exerciseMatch) sections.exercise = exerciseMatch[1].trim();
    if (trendMatch) sections.trend = trendMatch[1].trim();
    if (scoreMatch) sections.score = scoreMatch[1].trim();

    return sections;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
        <div style={styles.headerCenter}>
          <img src="/logo.png" alt="logo" style={styles.logo} />
          <div>
            <h2 style={styles.headerTitle}>{doctor.name}</h2>
            <p style={styles.headerSub}>{doctor.speciality}</p>
          </div>
        </div>
        <button style={styles.uploadBtn} onClick={() => setShowUpload(!showUpload)}>
          + Upload Note
        </button>
      </div>

      <div style={styles.content}>
        {showUpload && (
          <div style={styles.uploadForm}>
            <h4 style={styles.uploadTitle}>📝 Add New Doctor Note</h4>
            <input
              style={styles.input}
              placeholder="Diagnosis (e.g. Arthritis, Diabetes)"
              value={newDiagnosis}
              onChange={(e) => setNewDiagnosis(e.target.value)}
            />
            <textarea
              style={styles.textarea}
              placeholder="Type or paste the doctor's notes here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={5}
            />
            <div style={styles.uploadActions}>
              <button style={styles.cancelBtn} onClick={() => setShowUpload(false)}>Cancel</button>
              <button style={styles.saveBtn} onClick={handleUpload}>💾 Save Note</button>
            </div>
          </div>
        )}

        <h3 style={styles.sectionTitle}>📋 Medical History</h3>

        {records.length === 0 && (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
            No records yet. Click <strong>+ Upload Note</strong> to add the first one!
          </p>
        )}

        {records.map((record) => {
          const sections = parseAnalysis(record.analysis);
          return (
            <div key={record.id} style={styles.recordCard}>
              <div style={styles.recordHeader}>
                <span style={styles.recordDate}>📅 {record.date}</span>
                {record.diagnosis && (
                  <span style={styles.diagnosisBadge}>{record.diagnosis}</span>
                )}
              </div>

              <details style={styles.details}>
                <summary style={styles.detailsSummary}>📄 View original doctor note</summary>
                <p style={styles.noteText}>{record.note}</p>
              </details>

              {!record.analysis ? (
                <button
                  style={styles.analyseBtn}
                  onClick={() => handleAnalyse(record)}
                  disabled={analyzingId === record.id}
                >
                  {analyzingId === record.id ? '🤖 Analysing...' : '🤖 Analyse with AI'}
                </button>
              ) : (
                <div style={styles.analysisBox}>
                  <div style={styles.analysisTopRow}>
                    <h4 style={styles.analysisTitle}>🤖 AI Health Analysis</h4>
                    <button
                      style={exportingId === record.id ? styles.exportingBtn : styles.exportBtn}
                      onClick={() => handleExportPDF(record)}
                      disabled={exportingId === record.id}
                    >
                      {exportingId === record.id ? '⏳ Preparing...' : '📤 Export PDF'}
                    </button>
                  </div>

                  {sections.food && (
                    <div style={styles.analysisSection}>
                      <p style={styles.analysisSectionTitle}>🥗 Food Recommendations</p>
                      <p style={styles.analysisSectionText}>{sections.food}</p>
                    </div>
                  )}

                  {sections.medication && (
                    <div style={styles.analysisSection}>
                      <p style={styles.analysisSectionTitle}>💊 Medication Schedule</p>
                      <p style={styles.analysisSectionText}>{sections.medication}</p>
                    </div>
                  )}

                  {sections.reminders && (
                    <div style={styles.analysisSection}>
                      <p style={styles.analysisSectionTitle}>🔔 Suggested Reminders</p>
                      <p style={styles.analysisSectionText}>{sections.reminders}</p>
                    </div>
                  )}

                  {sections.tips && (
                    <div style={styles.analysisSection}>
                      <p style={styles.analysisSectionTitle}>💡 Health Tips</p>
                      <p style={styles.analysisSectionText}>{sections.tips}</p>
                    </div>
                  )}

                  {sections.warning && (
                    <div style={styles.analysisSection}>
                      <p style={styles.analysisSectionTitle}>⚠️ Warning Signs</p>
                      <p style={styles.analysisSectionText}>{sections.warning}</p>
                    </div>
                  )}

                  {sections.exercise && (
                    <div style={styles.analysisSection}>
                      <p style={styles.analysisSectionTitle}>🏃 Exercise Recommendations</p>
                      <p style={styles.analysisSectionText}>{sections.exercise}</p>
                    </div>
                  )}

                  {sections.trend && (
                    <div style={styles.analysisSection}>
                      <p style={styles.analysisSectionTitle}>📈 Health Trend Analysis</p>
                      <p style={styles.analysisSectionText}>{sections.trend}</p>
                    </div>
                  )}

                  {sections.score && (
                    <div style={styles.scoreBox}>
                      <p style={styles.scoreTitle}>📈 Health Improvement Score</p>
                      <p style={styles.scoreText}>{sections.score}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  header: {
    backgroundColor: '#1d3e38', color: '#fff',
    padding: '20px 32px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center'
  },
  headerCenter: { display: 'flex', alignItems: 'center', gap: '10px' },
  logo: { width: '45px', height: '45px', borderRadius: '10px', objectFit: 'contain' },
  backBtn: {
    backgroundColor: 'transparent', color: '#fff',
    border: '1px solid #fff', borderRadius: '8px',
    padding: '8px 16px', cursor: 'pointer'
  },
  headerTitle: { margin: 0, fontSize: '20px', textAlign: 'center' },
  headerSub: { margin: '4px 0 0', fontSize: '14px', opacity: 0.8, textAlign: 'center' },
  uploadBtn: {
    backgroundColor: '#356e61', color: '#fff',
    border: 'none', borderRadius: '8px',
    padding: '8px 16px', cursor: 'pointer'
  },
  content: { padding: '24px 32px' },
  uploadForm: {
    backgroundColor: '#fff', borderRadius: '12px',
    padding: '24px', marginBottom: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
  },
  uploadTitle: { margin: '0 0 16px', color: '#1d3e38' },
  input: {
    width: '100%', padding: '12px', marginBottom: '12px',
    borderRadius: '8px', border: '1px solid #ddd',
    fontSize: '14px', boxSizing: 'border-box'
  },
  textarea: {
    width: '100%', padding: '12px',
    borderRadius: '8px', border: '1px solid #ddd',
    fontSize: '14px', boxSizing: 'border-box', resize: 'vertical'
  },
  uploadActions: { display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' },
  cancelBtn: {
    backgroundColor: '#f0f4f8', color: '#666',
    border: 'none', borderRadius: '8px',
    padding: '10px 20px', cursor: 'pointer'
  },
  saveBtn: {
    backgroundColor: '#1d3e38', color: '#fff',
    border: 'none', borderRadius: '8px',
    padding: '10px 20px', cursor: 'pointer'
  },
  sectionTitle: { color: '#1d3e38', marginBottom: '16px' },
  recordCard: {
    backgroundColor: '#fff', borderRadius: '12px',
    padding: '20px', marginBottom: '16px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
  },
  recordHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  recordDate: { color: '#666', fontSize: '14px' },
  diagnosisBadge: {
    backgroundColor: '#e3f2fd', color: '#1565c0',
    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
  },
  details: { cursor: 'pointer', marginBottom: '12px' },
  detailsSummary: { color: '#1d3e38', fontSize: '13px' },
  noteText: { color: '#555', fontSize: '13px', lineHeight: '1.6', marginTop: '8px' },
  analyseBtn: {
    backgroundColor: '#7c3aed', color: '#fff',
    border: 'none', borderRadius: '8px',
    padding: '10px 20px', cursor: 'pointer',
    fontSize: '14px', width: '100%', marginTop: '8px'
  },
  analysisBox: {
    backgroundColor: '#f8f4ff', borderRadius: '10px',
    padding: '16px', marginTop: '12px',
    border: '1px solid #e0d4ff'
  },
  analysisTopRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '12px'
  },
  analysisTitle: { margin: 0, color: '#7c3aed', fontSize: '16px' },
  exportBtn: {
    backgroundColor: '#1d3e38', color: '#fff',
    border: 'none', borderRadius: '8px',
    padding: '8px 16px', cursor: 'pointer',
    fontSize: '13px', fontWeight: 'bold'
  },
  exportingBtn: {
    backgroundColor: '#999', color: '#fff',
    border: 'none', borderRadius: '8px',
    padding: '8px 16px', cursor: 'not-allowed',
    fontSize: '13px'
  },
  analysisSection: {
    backgroundColor: '#fff', borderRadius: '8px',
    padding: '12px', marginBottom: '10px'
  },
  analysisSectionTitle: { margin: '0 0 6px', fontWeight: 'bold', color: '#1d3e38', fontSize: '14px' },
  analysisSectionText: { margin: 0, color: '#444', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line' },
  scoreBox: {
    backgroundColor: '#e8f5e9', borderRadius: '8px',
    padding: '12px', textAlign: 'center'
  },
  scoreTitle: { margin: '0 0 6px', fontWeight: 'bold', color: '#2e7d32', fontSize: '14px' },
  scoreText: { margin: 0, color: '#1b5e20', fontSize: '16px', fontWeight: 'bold' },
};

export default DoctorRecords;