import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // 👈 Import the CSS file

const Home = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (role === 'student') navigate('/student');
    else if (role === 'teacher') navigate('/teacher');
  };

  return (
    <div className="home-container">
      <div className="home-tag">✨ Intervue Poll</div>
      <h1 className="home-heading">
        Welcome to the <strong>Live Polling System</strong>
      </h1>
      <p className="home-subtext">
        Please select the role that best describes you to begin using the live polling system
      </p>

      <div className="home-role-container">
        <div
          className={`home-card ${role === 'student' ? 'selected' : ''}`}
          onClick={() => setRole('student')}
        >
          <strong>I’m a Student</strong>
          <p className="home-card-text">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry
          </p>
        </div>

        <div
          className={`home-card ${role === 'teacher' ? 'selected' : ''}`}
          onClick={() => setRole('teacher')}
        >
          <strong>I’m a Teacher</strong>
          <p className="home-card-text">
            Submit answers and view live poll results in real-time.
          </p>
        </div>
      </div>

      <button className="home-button" onClick={handleContinue} disabled={!role}>
        Continue
      </button>
    </div>
  );
};

export default Home;
