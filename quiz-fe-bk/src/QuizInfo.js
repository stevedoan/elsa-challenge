import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QuizInfo = () => {
  const [username, setUsername] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("1");
  const [selectedSessionId, setSelectedSessionId] = useState("11");

  const navigate = useNavigate();

  // Define the sessions based on quiz_id
  const sessionOptions = {
    1: [
      { value: "11", label: "Session 1" },
      { value: "12", label: "Session 2" },
      { value: "13", label: "Session 3" },
    ],
    2: [
      { value: "21", label: "Session 1" },
      { value: "22", label: "Session 2" },
      { value: "23", label: "Session 3" },
    ],
    3: [
      { value: "31", label: "Session 1" },
      { value: "32", label: "Session 2" },
      { value: "33", label: "Session 3" },
    ],
  };

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
          onChange={(e) => {
            setSelectedQuizId(e.target.value);
            setSelectedSessionId(sessionOptions[e.target.value][0].value); // Automatically set the first session of the quiz
          }}
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
          {sessionOptions[selectedQuizId].map((session) => (
            <option key={session.value} value={session.value}>
              {session.label}
            </option>
          ))}
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
