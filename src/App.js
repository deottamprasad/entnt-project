import React from 'react';
// The failing import './index.css' has been removed.
// 'index.css' is already imported by src/main.jsx, making it global.

/**
 * This is a placeholder component for Phase 1.
 * Its only job is to prove that the app is running
 * after the mock server and database are ready.
 */
function App() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif', 
      textAlign: 'center', 
      lineHeight: '1.6' 
    }}>
      <h1>TalentFlow App</h1>
      <p style={{ fontSize: '1.1rem' }}>
        Phase 1 (Mock Backend & Database) is running.
      </p>
      <div style={{ 
        backgroundColor: '#f4f4f4', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginTop: '2rem',
        textAlign: 'left',
        display: 'inline-block'
      }}>
        <p><strong>Verification Steps:</strong></p>
        <ol style={{ paddingLeft: '2rem', margin: 0 }}>
          <li>Open your browser's console (F12).</li>
          <li>You should see logs like "MSW worker started."</li>
          <li>You should see "Database (src/seeder.js) is..."</li>
          <li>Go to Application &gt; IndexedDB to see `TalentFlowDB`.</li>
        </ol>
      </div>
    </div>
  );
}

export default App;




