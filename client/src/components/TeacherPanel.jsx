// src/components/TeacherPanel.jsx
import React, { useState, useEffect } from 'react';
import './TeacherPanel.css';
import { socket } from "../socket";
import ChatPop from './ChatPopup';
import pollIcon from '../assets/Vector.png';
import Eye from '../assets/Eye.png';



const TeacherPanel = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: null },
    { text: '', isCorrect: null },
  ]);
  const [duration, setDuration] = useState(60);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [resultsVisible, setResultsVisible] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);

  // Chat & participants
  const [joined, setJoined] = useState(true); // assume teacher is joined
  const [participants, setParticipants] = useState([]);
  const [name, setName] = useState("Teacher");

  useEffect(() => {
    // Listen for poll events
    const handlePollData = (poll) => {
      setCurrentPoll({ ...poll });
      setResultsVisible(true);
    };

    const handleUpdateResult = (updatedPoll) => {
      setCurrentPoll({ ...updatedPoll });
      setResultsVisible(true);
    };

    const handleHistory = (history) => {
      setPollHistory(history || []);
    };

    // Listen for participant updates
    const handleParticipants = (list) => {
      setParticipants(list || []);
    };

    socket.on('pollData', handlePollData);
    socket.on('updateResult', handleUpdateResult);
    socket.on('pollHistory', handleHistory);
    socket.on('participants', handleParticipants);

    return () => {
      socket.off('pollData', handlePollData);
      socket.off('updateResult', handleUpdateResult);
      socket.off('pollHistory', handleHistory);
      socket.off('participants', handleParticipants);
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

    const newPoll = {
      id: Date.now(),
      question,
      duration,
      options: options.map(o => ({ text: o.text, votes: 0 }))
    };

    socket.emit('createPoll', {
      question,
      duration,
      options: options.map(o => ({ text: o.text, votes: 0 }))
    });

    setCurrentPoll(newPoll);
    setResultsVisible(true);

    setQuestion('');
    setOptions([
      { text: '', isCorrect: null },
      { text: '', isCorrect: null },
    ]);
  };

  const openHistory = () => {
    socket.emit('getPollHistory');
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
  };

  const computePercentage = (opt, poll) => {
    const total = (poll?.options || []).reduce((s, o) => s + (o.votes || 0), 0);
    return total === 0 ? 0 : Math.round(((opt.votes || 0) / total) * 100);
  };

  // Kick out participant
  const handleKickOut = (participantId) => {
    if (window.confirm("Are you sure you want to remove this participant?")) {
      socket.emit("kickOut", participantId);
    }
  };

  return (
    <div className="teacher-panel">
      <div className="top-bar">
        <div className="label">
  <img 
    src={pollIcon} 
    alt="poll icon" 
    style={{
      height: '1em',
      width: '1em',
      verticalAlign: 'middle',
      marginRight: '0.3em'
    }} 
  />
  Intervue Poll
</div>

        <button className="history-btn" onClick={openHistory}>
          <span className="eye"><img 
                    src={Eye} 
                    alt="eye" 
                    style={{
                      height: '1.5em',
                      width: '1.5em',
                      verticalAlign: 'middle',
                      marginRight: '0.3em'
                    }} 
                  /></span> View Poll history
                        </button>
                      </div>

      <h1 className="title">
        Let’s <strong>Get Started</strong>
      </h1>
      <p className="description">
        If you’re a teacher, you'll have the ability to create and manage polls,
        ask questions, and monitor your students' responses in real-time.
      </p>

      {/* --- Question Section --- */}
      <div className="section-form">
        <div className="section-header">
          <label className="section-title">Enter your question</label>
          <div className="timer-dropdown">
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              <option value={60}>60 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={15}>15 seconds</option>
            </select>
          </div>
        </div>
        <div className="question-box-wrapper">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={100}
            placeholder="Enter your question"
          />
          <div className="char-count">{question.length}/100</div>
        </div>

        {/* --- Options Section --- */}
        <div className="options-section">
          <div className="section-header">
            <label className="section-title">Edit Options</label>
            <div className="correct-label">Is it Correct?</div>
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
          <button className="add-option" onClick={addOption}>
            + Add More option
          </button>
        </div>

        <button className="ask-button" onClick={handleAskQuestion}>
          Ask Question
        </button>
      </div>

      {/* --- Results --- */}
      {resultsVisible && currentPoll && (
        <div className="teacher-results-wrap">
          <div className="poll-card teacher-card">
            <div className="poll-header">
              <h3 className="poll-title">Question 1</h3>
              <span className="poll-timer">⏱ {currentPoll.duration ? `00:${currentPoll.duration}` : '00:15'}</span>
            </div>
            <div className="poll-question-text">{currentPoll.question}</div>

            <div className="card-options">
              {currentPoll.options.map((opt, idx) => {
                const percentage = computePercentage(opt, currentPoll);
                return (
                  <div key={idx} className="teacher-result-row">
                    <div className="result-bar-container">
                      <div className="result-bar">
                        <div className="fill" style={{ width: `${percentage}%` }} />
                        <div className="bar-overlay">
                          <div className="bar-num">{idx + 1}</div>
                          <div className="bar-text" title={opt.text}>
                            {opt.text}
                          </div>
                        </div>
                      </div>
                      <div className="percentage-text">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="ask-new-btn"
            onClick={() => {
              setResultsVisible(false);
              setCurrentPoll(null);
            }}
          >
            + Ask a new question
          </button>
        </div>
      )}

      {/* --- Poll History --- */}
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
                  <div className="poll-card teacher-card">
                    <div className="poll-question-text">{p.question}</div>
                    <div className="card-options">
                      {p.options.map((opt, idx) => {
                        const percentage = computePercentage(opt, p);
                        return (
                          <div key={idx} className="teacher-result-row">
                            <div className="result-bar-container">
                              <div className="result-bar">
                                <div className="fill" style={{ width: `${percentage}%` }} />
                                <div className="bar-overlay">
                                  <div className="bar-num">{idx + 1}</div>
                                  <div className="bar-text" title={opt.text}>{opt.text}</div>
                                </div>
                              </div>
                              <div className="percentage-text">{percentage}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Chat popup for teacher with kick out --- */}
      {joined && (
        <ChatPop
          userType="teacher"
          socket={socket}
          participants={participants}
          role="teacher"
          name={name}
          onKickOut={handleKickOut}
        />
      )}
    </div>
  );
};

export default TeacherPanel;

