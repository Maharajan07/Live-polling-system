// src/components/TeacherPanel.jsx
import React, { useState, useEffect } from 'react';
import './TeacherPanel.css';
import { socket } from "../socket";

const TeacherPanel = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: null },
    { text: '', isCorrect: null },
  ]);
  const [duration, setDuration] = useState(60);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [resultsVisible, setResultsVisible] = useState(false);

  // History overlay state
  const [showHistory, setShowHistory] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);

  useEffect(() => {
    // When a new poll is created or a client joins, server emits 'pollData'
    const handlePollData = (poll) => {
      setCurrentPoll({ ...poll });
      setResultsVisible(true);
    };

    // When votes update, server emits 'updateResult'
    const handleUpdateResult = (updatedPoll) => {
      setCurrentPoll({ ...updatedPoll });
      setResultsVisible(true);
    };

    const handleHistory = (history) => {
      setPollHistory(history || []);
    };

    socket.on('pollData', handlePollData);
    socket.on('updateResult', handleUpdateResult);
    socket.on('pollHistory', handleHistory);

    return () => {
      socket.off('pollData', handlePollData);
      socket.off('updateResult', handleUpdateResult);
      socket.off('pollHistory', handleHistory);
    };
  }, []);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index].text = value;
    setOptions(updated);
  };

  const handleCorrectChange = (index, isCorrect) => {
    const updated = [...options];
    updated[index].isCorrect = isCorrect;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: null }]);
  };

  const handleAskQuestion = () => {
    if (!question.trim() || options.some(o => !o.text.trim())) {
      alert("Please enter a question and all options");
      return;
    }

    // Build the newPoll object locally so teacher can see immediately
    const newPoll = {
      id: Date.now(),
      question,
      duration,
      options: options.map(o => ({ text: o.text, votes: 0 }))
    };

    // Emit to server (server will set official id/timestamps/etc and broadcast)
    socket.emit('createPoll', {
      question,
      duration,
      options: options.map(o => ({ text: o.text, votes: 0 }))
    });

    // Show the initial empty results immediately (0% for all)
    setCurrentPoll(newPoll);
    setResultsVisible(true);

    // reset form
    setQuestion('');
    setOptions([
      { text: '', isCorrect: null },
      { text: '', isCorrect: null },
    ]);
  };

  const openHistory = () => {
    // request history from server and open overlay
    socket.emit('getPollHistory');
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
  };

  // helper to compute percentage
  const computePercentage = (opt, poll) => {
    const total = (poll?.options || []).reduce((s, o) => s + (o.votes || 0), 0);
    return total === 0 ? 0 : Math.round(((opt.votes || 0) / total) * 100);
  };

  return (
    <div className="teacher-panel">
      <div className="label">✨ Intervue Poll</div>

      {/* Top right history button */}
      <button className="history-btn" onClick={openHistory}>
        <span className="eye">👁</span> View Poll history
      </button>

      <h1 className="title">Let’s <strong>Get Started</strong></h1>
      <p className="description">
        Create and manage polls, ask questions, and monitor responses in real-time.
      </p>

      <div className="section">
        <label className="section-title">Enter your question</label>
        <div className="question-box-wrapper">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={100}
            placeholder="Type your question here"
          />
          <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            <option value={15}>15 seconds</option>
            <option value={30}>30 seconds</option>
          </select>
        </div>
        <div className="char-count">{question.length}/100</div>
      </div>

      <div className="section options-section">
        <label className="section-title">Edit Options</label>
        <div className="options-header">
          <span></span>
          <span>Is it Correct?</span>
        </div>

        {options.map((option, index) => (
          <div className="option-row" key={index}>
            <div className="option-number">{index + 1}</div>
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <div className="correct-toggle">
              <label>
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={option.isCorrect === true}
                  onChange={() => handleCorrectChange(index, true)}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={option.isCorrect === false}
                  onChange={() => handleCorrectChange(index, false)}
                />
                No
              </label>
            </div>
          </div>
        ))}

        <button className="add-option" onClick={addOption}>+ Add More option</button>
      </div>

      <div className="footer">
        <button className="ask-button" onClick={handleAskQuestion}>Ask Question</button>
      </div>

      {/* ---------- RESULTS CARD (centered) ---------- */}
      {resultsVisible && currentPoll && (
        <div className="teacher-results-wrap">
          <div className="poll-card teacher-card">
            <div className="poll-header">
              <h3>Question</h3>
              <span className="poll-timer">⏱ {currentPoll.duration ? `${currentPoll.duration}s` : '00:15'}</span>
            </div>

            <div className="card-question">{currentPoll.question}</div>

            <div className="card-options">
              {currentPoll.options.map((opt, idx) => {
                const percentage = computePercentage(opt, currentPoll);
                return (
                  <div key={idx} className="teacher-result-row">
                    <div className="teacher-option-left">
                      <div className="circle-num">{idx + 1}</div>
                      <div className="option-text">{opt.text}</div>
                    </div>
                    <div className="teacher-option-right">
                      <div className="result-bar">
                        <div className="fill" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="percentage">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ask a new question button below/ to the right */}
          <div className="ask-new-wrap">
            <button
              className="ask-new-btn"
              onClick={() => {
                // revert to the create form (teacher can add another question)
                setResultsVisible(false);
                setCurrentPoll(null);
              }}
            >
              + Ask a new question
            </button>
          </div>
        </div>
      )}

      {/* ---------- Poll History Overlay ---------- */}
      {showHistory && (
        <div className="history-overlay">
          <div className="history-panel">
            <div className="history-header">
              <h2>View Poll History</h2>
              <button className="close-history" onClick={closeHistory}>✕</button>
            </div>

            <div className="history-list">
              {pollHistory.length === 0 && <p>No polls yet.</p>}

              {pollHistory.map((p, i) => (
                <div className="history-item" key={p.id || i}>
                  <h4>Question {i + 1}</h4>
                  <div className="history-question">{p.question}</div>

                  <div className="history-card">
                    {p.options.map((opt, idx) => {
                      const total = (p.options || []).reduce((s, o) => s + (o.votes || 0), 0);
                      const percent = total === 0 ? 0 : Math.round(((opt.votes || 0) / total) * 100);
                      return (
                        <div className="history-row" key={idx}>
                          <div className="history-left">
                            <div className="circle-num small">{idx + 1}</div>
                            <div className="history-text">{opt.text}</div>
                          </div>
                          <div className="history-right">
                            <div className="history-bar"><div className="history-fill" style={{ width: `${percent}%` }}></div></div>
                            <div className="history-percent">{percent}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPanel;
