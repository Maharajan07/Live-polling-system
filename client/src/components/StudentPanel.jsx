import React, { useState } from 'react';
import './StudentPanel.css';

const StudentPanel = () => {
  const [name, setName] = useState('');

  const handleContinue = () => {
    if (name.trim()) {
      console.log('Student name:', name);
      // Navigate or emit socket event here
    }
  };

  return (
    <div className="student-container">
      <div className="student-tag">✨ Intervue Poll</div>
      <h1 className="student-heading">
        Let’s <strong>Get Started</strong>
      </h1>
      <p className="student-subtext">
        If you’re a student, you’ll be able to <strong>submit your answers</strong>, participate in live
        polls, and see how your responses compare with your classmates
      </p>

      <label className="student-label">Enter your Name</label>
      <input
        type="text"
        className="student-input"
        placeholder="Rahul Bajaj"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button className="student-button" onClick={handleContinue} disabled={!name.trim()}>
        Continue
      </button>
    </div>
  );
};

export default StudentPanel;
