import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import TeacherPanel from './components/TeacherPanel';
import StudentPanel from './components/StudentPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teacher" element={<TeacherPanel />} />
        <Route path="/student" element={<StudentPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
