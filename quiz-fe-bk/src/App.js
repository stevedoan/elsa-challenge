// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuizInfo from './QuizInfo';
import Quiz from './Quiz';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuizInfo />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </Router>
  );
}

export default App;
