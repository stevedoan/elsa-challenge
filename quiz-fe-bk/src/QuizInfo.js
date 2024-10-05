import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QuizInfo = () => {
  const [username, setUsername] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("1");
  const [selectedSessionId, setSelectedSessionId] = useState("11");
  
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/sapi/subscribe/', {
        username,
        quiz_id: selectedQuizId,
        session_id: selectedSessionId,
      });

      if (response.status === 200) {
        // Store the response data in local storage
        localStorage.setItem('username', username);
        localStorage.setItem('quiz_id', selectedQuizId);
        localStorage.setItem('session_id', selectedSessionId);
        
        // Navigate to the quiz page
        navigate("/quiz");
      } else {
        console.error("Error subscribing:", response);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz Info</h1>

      <div className="mb-4">
        <label className="block mb-2">Username</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Quiz</label>
        <select
          className="w-full p-2 border border-gray-300 rounded"
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
        >
          <option value="1">Basic English Quiz</option>
          <option value="2">Intermediate English Quiz</option>
          <option value="3">Advanced English Quiz</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Session</label>
        <select
          className="w-full p-2 border border-gray-300 rounded"
          value={selectedSessionId}
          onChange={(e) => setSelectedSessionId(e.target.value)}
        >
          <option value="11">Session 1</option>
          <option value="12">Session 2</option>
          <option value="13">Session 3</option>
          <option value="21">Session 1</option>
          <option value="22">Session 2</option>
          <option value="23">Session 3</option>
          <option value="31">Session 1</option>
          <option value="32">Session 2</option>
          <option value="33">Session 3</option>
        </select>
      </div>

      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default QuizInfo;
