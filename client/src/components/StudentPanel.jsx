// src/components/StudentPanel.jsx
import React, { useState, useEffect } from 'react';
import './StudentPanel.css';
import { socket } from '../socket';
import ChatPop from './ChatPopup';
import KickedOut from './KickedOut';
import pollIcon from '../assets/Vector.png';


const StudentPanel = () => {
    const [name, setName] = useState('');
    const [poll, setPoll] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [joined, setJoined] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [kickedOut, setKickedOut] = useState(false);

    const handleContinue = () => {
        if (name.trim()) {
            socket.emit('joinStudent', name);
            setJoined(true);
        }
    };

    const handleSubmitVote = () => {
        if (selectedOption !== null && timeLeft > 0) {
            socket.emit('submitVote', selectedOption);
            setAnswered(true);
        }
    };

    useEffect(() => {
        socket.on('pollData', (data) => {
            setPoll(data);
            setAnswered(false);
            setSelectedOption(null);
            if (data.duration) setTimeLeft(data.duration);
        });

        socket.on('updateResult', (updatedPoll) => {
            if (answered) {
                setPoll(updatedPoll);
            }
        });

        socket.on('participants', (list) => {
            setParticipants(list);
        });

        socket.on('kickout', (kickedName) => {
            if (kickedName === name) {
                setKickedOut(true);
            }
        });

        return () => {
            socket.off('pollData');
            socket.off('updateResult');
            socket.off('participants');
            socket.off('kickout');
        };
    }, [answered, name]);

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

    if (kickedOut) {
        return <KickedOut />;
    }

    return (
        <div className="student-container">
            {!joined ? (
                <>
                    <div className="student-tag"><img 
    src={pollIcon} 
    alt="poll icon" 
    style={{
      height: '1em',
      width: '1em',
      verticalAlign: 'middle',
      marginRight: '0.3em'
    }} 
  /> Intervue Poll</div>
                    {/* Add a div for better centering */}
                    <div className="start-screen-content">
                      <h1 className="student-heading">Let’s <strong>Get Started</strong></h1>
                      <p className="student-subtext">If you're a student, you'll be able to <b>submit your answers</b>, participate in live polls, and see how your responses compare with your classmates</p>
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
                </>
            ) : joined && !poll ? (
                <div className="waiting-screen">
                    <div className="student-tag"><img 
    src={pollIcon} 
    alt="poll icon" 
    style={{
      height: '1em',
      width: '1em',
      verticalAlign: 'middle',
      marginRight: '0.3em'
    }} 
  /> Intervue Poll</div>
                    <div className="loader"></div>
                    <p className="waiting-text">Wait for the teacher to ask questions..</p>
                </div>
            ) : (
                <div className="poll-card student-poll">
                    <div className="poll-header">
                        <h3>Question 1</h3>
                        <span className="poll-timer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer">
                                <path d="M10 2h4"/>
                                <path d="M12 14v-4"/>
                                <circle cx="12" cy="14" r="8"/>
                            </svg>
                            {formatTime(timeLeft || 0)}
                        </span>
                    </div>
                    <h2 className="poll-question">{poll.question}</h2>
                    {!answered ? (
                        <>
                            <div className="poll-options">
                                {poll.options.map((opt, idx) => (
                                    // Updated class name to 'poll-option-wrapper' for clarity
                                    <div
                                        key={idx}
                                        className={`poll-option-wrapper ${selectedOption === idx ? 'selected' : ''}`}
                                        onClick={() => setSelectedOption(idx)}
                                    >
                                        <div className="option-number">{idx + 1}</div>
                                        <span className="option-text">{opt.text}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="student-submit"
                                onClick={handleSubmitVote}
                                disabled={selectedOption === null || timeLeft === 0}
                            >
                                Submit
                            </button>
                        </>
                    ) : (
                        // Results view
                        <div className="poll-results">
                            {poll.options.map((opt, idx) => {
                                const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
                                const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);

                                return (
                                    <div 
                                        key={idx} 
                                        className={`result-option ${selectedOption === idx ? 'selected' : ''}`}
                                    >
                                        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                                        <div className="result-content">
                                            <span className="result-text">
                                                <div className="option-number">{idx + 1}</div>
                                                <span>{opt.text}</span>
                                            </span>
                                            <span className="result-percent">{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {/* The waiting text for the next question is now inside the poll card */}
                    <p className="waiting-text" style={{marginTop: '25px'}}>Wait for the teacher to ask a new question..</p>
                </div>
            )}
            <ChatPop
                userType="student"
                socket={socket}
                participants={participants}
                role="student"
                name={name}
                onKicked={() => setKickedOut(true)}
            />
        </div>
    );
};

export default StudentPanel;