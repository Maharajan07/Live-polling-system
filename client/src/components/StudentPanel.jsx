// src/components/StudentPanel.jsx
import React, { useState, useEffect } from 'react';
import './StudentPanel.css';
import { socket } from '../socket';

const StudentPanel = () => {
  const [name, setName] = useState('');
  const [poll, setPoll] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleContinue = () => {
    if (name.trim()) {
      socket.emit('joinStudent', name);
    }
  };

  const handleVote = (index) => {
    socket.emit('submitVote', index);
    setAnswered(true);
  };

  useEffect(() => {
    socket.on('pollData', (data) => {
      setPoll(data);
      setAnswered(false);
    });

    return () => {
      socket.off('pollData');
    };
  }, []);

  return (
    <div className="student-container">
      {!poll ? (
        <>
          <div className="student-tag">✨ Intervue Poll</div>
          <h1 className="student-heading">Let’s <strong>Get Started</strong></h1>
          <p className="student-subtext">
            Enter your name to join the poll
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
        </>
      ) : (
        <div className="poll-section">
          <h2>{poll.question}</h2>

          {poll.options && poll.options.length > 0 ? (
            poll.options.map((opt, idx) => (
              <button
                key={idx}
                className="student-button"
                onClick={() => handleVote(idx)}
                disabled={answered}
              >
                {opt.text}
              </button>
            ))
          ) : (
            <p>No options available</p>
          )}

          {answered && (
            <div className="poll-results">
              {poll.options.map((opt, idx) => (
                <p key={idx}>
                  {opt.text}: {opt.votes} votes
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPanel;
