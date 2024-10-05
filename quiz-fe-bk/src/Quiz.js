import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [currentPoints, setCurrentPoints] = useState(0); // Store current points
  const navigate = useNavigate(); // Use navigate instead of useHistory
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
    setCurrentPoints(points); // Set current points for display

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
      const point_message = JSON.parse(event.data);
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
    navigate('/'); // Use navigate instead of history.push
  };

  return (
    <div className="container mx-auto mt-5 h-screen">
      <div className="grid grid-cols-3 gap-4">
        {/* Quiz Section */}
        <div className="quiz-section col-span-2 flex flex-col h-full border border-gray-300 rounded bg-gray-100">
          {/* Part 1: Fixed Header */}
          <div className="flex justify-between items-center bg-blue-500 text-white p-2 rounded-t">
            <h2 className="text-xl font-bold">Quiz</h2>
            <span className="text-lg">{username}</span>
            <span className="text-lg">Points: {currentPoints}</span>
          </div>

          {/* Part 2: Scrollable Questions */}
          <div className="flex-grow overflow-y-auto p-2 bg-gray-200" style={{ height: '700px' }}>
            {sampleQuestions.map((question, index) => (
              <div key={index} className="mb-4">
                <p className="mb-2 font-semibold">{question.question}</p>
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
          </div>

          {/* Part 3: Fixed Buttons at the Bottom */}
          <div className="flex justify-between mt-4 p-2 bg-gray-300 rounded-b">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleSubmitQuiz}
            >
              Submit Quiz
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={handleCancelQuiz}
            >
              Cancel Quiz
            </button>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="leaderboard-section p-4 border border-gray-300 rounded bg-white shadow-lg h-full">
          <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
          {sortedLeaderboard.length > 0 ? (
            sortedLeaderboard.map((user, index) => (
              <div key={index} className={`flex justify-between ${user.username === username ? 'font-bold text-blue-600' : ''}`}>
                <span>{index + 1}. {user.username} {user.username === username && <span className="text-green-500">(You)</span>}</span>
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
