import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

// Sample questions for the quiz (Random English Grammar and Vocabulary)
const sampleQuestions = [
  { question: 'What is the synonym of "big"?', options: ['A. Small', 'B. Large', 'C. Tiny', 'D. Little'], correct: 'B' },
  { question: 'What is the antonym of "happy"?', options: ['A. Sad', 'B. Joyful', 'C. Content', 'D. Excited'], correct: 'A' },
  { question: 'Choose the correct form of the verb: "She ____ to the store."', options: ['A. Go', 'B. Goes', 'C. Going', 'D. Went'], correct: 'B' },
  { question: 'Which is the correct spelling?', options: ['A. Accomodate', 'B. Acommodate', 'C. Accommodate', 'D. Accomodete'], correct: 'C' },
  { question: 'What is the plural form of "child"?', options: ['A. Childs', 'B. Childes', 'C. Children', 'D. Child'], correct: 'C' },
  { question: 'What is the correct preposition: "He is good ____ math"?', options: ['A. On', 'B. At', 'C. In', 'D. With'], correct: 'B' },
  { question: 'Which word is an adjective?', options: ['A. Run', 'B. Quickly', 'C. Beautiful', 'D. Often'], correct: 'C' },
  { question: 'What is the correct sentence?', options: ['A. I am go home', 'B. I went home', 'C. I am gone home', 'D. I home go'], correct: 'B' },
  { question: 'What is the past tense of "swim"?', options: ['A. Swimmed', 'B. Swam', 'C. Swim', 'D. Swum'], correct: 'B' },
  { question: 'What is the comparative form of "fast"?', options: ['A. Fastest', 'B. More fast', 'C. Faster', 'D. Fastier'], correct: 'C' }
];

const Quiz = () => {
  const [answers, setAnswers] = useState(new Array(10).fill(null)); // Stores user's selected answers
  const [leaderboard, setLeaderboard] = useState([]); // Leaderboard data
  const navigate = useNavigate();  // Use navigate instead of useHistory
  const username = localStorage.getItem('username');
  const quiz_id = localStorage.getItem('quiz_id');
  const session_id = localStorage.getItem('session_id');

  // Function to handle answer selection
  const handleAnswerChange = (index, answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = answer;
    setAnswers(updatedAnswers);
  };

  // Handle quiz submission
  const handleSubmitQuiz = async () => {
    const points = answers.reduce(
      (score, answer, index) => score + (answer === sampleQuestions[index].correct ? 5 : 0),
      0
    );

    try {
      const response = await fetch('http://127.0.0.1:8000/api/sapi/store_points/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          quiz_id,
          session_id,
          points
        })
      });

      if (response.ok) {
        fetchLeaderboard(); // Refresh the leaderboard after submission
      } else {
        console.error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  // Fetch leaderboard data from the API
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/sapi/leaderboard/?quiz_id=${quiz_id}&session_id=${session_id}`);
      const data = await response.json();
      setLeaderboard(data.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  // Fetch leaderboard on page load
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Connect to WebSocket for leaderboard updates
  useEffect(() => {
    const socket = new WebSocket(`ws://127.0.0.1:8001/ws/quiz/${quiz_id}/${session_id}/`);

    socket.onmessage = (event) => {
      var point_message = JSON.parse(event.data)
      const [username, points] = point_message.message.split(':');
      setLeaderboard((prevLeaderboard) => {
        const existingUser = prevLeaderboard.find(user => user.username === username);
        if (existingUser) {
          return prevLeaderboard.map(user =>
            user.username === username ? { ...user, points: parseInt(points) } : user
          );
        } else {
          return [...prevLeaderboard, { username, points: parseInt(points) }];
        }
      });
    };

    // Cleanup socket when component unmounts
    return () => {
      socket.close();
    };
  }, [quiz_id, session_id]);

  // Sort leaderboard by points descending
  const sortedLeaderboard = leaderboard.sort((a, b) => b.points - a.points);

  // Handle cancel quiz and remove local storage
  const handleCancelQuiz = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('quiz_id');
    localStorage.removeItem('session_id');
    navigate('/');  // Use navigate instead of history.push
  };

  return (
    <div className="container mx-auto mt-5">
      <div className="grid grid-cols-3 gap-4">
        {/* Quiz Section */}
        <div className="quiz-section p-4 border border-gray-300 rounded col-span-2 overflow-y-auto" style={{ height: '500px' }}>
          <h2 className="text-xl font-bold mb-4">Quiz</h2>
          {sampleQuestions.map((question, index) => (
            <div key={index} className="mb-4">
              <p className="mb-2">{question.question}</p>
              {question.options.map((option, i) => (
                <label key={i} className="block mb-1">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option.charAt(0)}
                    onChange={() => handleAnswerChange(index, option.charAt(0))}
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          ))}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleSubmitQuiz}
          >
            Submit Quiz
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded ml-2 hover:bg-red-700"
            onClick={handleCancelQuiz}
          >
            Cancel Quiz
          </button>
        </div>

        {/* Leaderboard Section */}
        <div className="leaderboard-section p-4 border border-gray-300 rounded fixed right-0 top-0 h-[500px] w-[250px] bg-white shadow-lg">
          <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
          {sortedLeaderboard.length > 0 ? (
            sortedLeaderboard.map((user, index) => (
              <div key={index} className="flex justify-between">
                <span>{user.username}</span>
                <span>{user.points} points</span>
              </div>
            ))
          ) : (
            <p>No leaderboard data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
