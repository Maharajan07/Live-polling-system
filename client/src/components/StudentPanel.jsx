// src/components/StudentPanel.jsx
import React, { useState, useEffect } from 'react';
import './StudentPanel.css';
import { socket } from '../socket';

const StudentPanel = () => {
  const [name, setName] = useState('');
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [joined, setJoined] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const handleContinue = () => {
    if (name.trim()) {
      socket.emit('joinStudent', name);
      setJoined(true);
    }
  };

  const handleSubmitVote = () => {
    if (selectedOption !== null && timeLeft > 0) {
      socket.emit('submitVote', selectedOption);
      setAnswered(true); // switch to results immediately
    }
  };

  useEffect(() => {
    socket.on('pollData', (data) => {
      setPoll(data);
      setAnswered(false); // reset view for new question
      setSelectedOption(null);
      if (data.duration) {
        setTimeLeft(data.duration);
      }
    });

    socket.on('updateResult', (updatedPoll) => {
  if (answered) {
    setPoll(updatedPoll); // just replace state, no reset
  }
});


    return () => {
      socket.off('pollData');
      socket.off('updateResult');
    };
  }, [answered]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="student-container">
      {/* Step 1: Name input screen */}
      {!joined ? (
        <>
          <div className="student-tag">✨ Intervue Poll</div>
          <h1 className="student-heading">Let’s <strong>Get Started</strong></h1>
          <p className="student-subtext">Enter your name to join the poll</p>

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
      ) : 

      /* Step 2: Waiting screen */
      joined && !poll ? (
        <div className="waiting-screen">
          <div className="student-tag">✨ Intervue Poll</div>
          <div className="loader"></div>
          <p className="waiting-text">Wait for the teacher to ask questions..</p>
        </div>
      ) : 

      /* Step 3: Poll view */
      (
        <div className="poll-card">
          <div className="poll-header">
            <h3>Question 1</h3>
            <span className="poll-timer">⏱ {formatTime(timeLeft || 0)}</span>
          </div>

          <h2 className="poll-question">{poll.question}</h2>

          {!answered ? (
            <>
              {poll.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`poll-option ${selectedOption === idx ? 'selected' : ''}`}
                  onClick={() => setSelectedOption(idx)}
                >
                  <span className="option-number">{idx + 1}</span> {opt.text}
                </button>
              ))}

              <button
                className="student-submit"
                onClick={handleSubmitVote}
                disabled={selectedOption === null || timeLeft === 0}
              >
                Submit
              </button>
            </>
          ) : (
            <div className="poll-results">
              {poll.options.map((opt, idx) => {
                const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
                const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);

                return (
                  <div key={idx} className="result-option">
                    <div className="result-header">
                      <span className="result-text">
                        <span className="option-number">{idx + 1}</span> {opt.text}
                      </span>
                      <span className="result-percent">{percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPanel;
