// src/components/TeacherPanel.jsx
import React, { useState } from 'react';
import './TeacherPanel.css';
import { socket } from "../socket";

const TeacherPanel = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: null },
    { text: '', isCorrect: null },
  ]);
  const [duration, setDuration] = useState(60);

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

  // send poll with correct structure for StudentPanel
  socket.emit('createPoll', {
    question,
    options: options.map(o => ({
      text: o.text,
      votes: 0
    }))
  });

  console.log('Poll sent:', {
    question,
    options: options.map(o => ({ text: o.text, votes: 0 }))
  });

  setQuestion('');
  setOptions([
    { text: '', isCorrect: null },
    { text: '', isCorrect: null },
  ]);
};


  return (
    <div className="teacher-panel">
      <div className="label">✨ Intervue Poll</div>
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
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
            <option value={90}>90 seconds</option>
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
    </div>
  );
};

export default TeacherPanel;
