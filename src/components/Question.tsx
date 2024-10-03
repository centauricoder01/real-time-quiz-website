"use client";

import { getSocket } from "@/config/socket";
import React, { useEffect, useMemo, useState } from "react";
import Ranking from "./Ranking";

export default function Question() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [checkAnswer, setCheckAnswer] = useState(0);
  const [user, setUser] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [ranking, setRanking] = useState([]);

  // Socket connection memoized
  const socket = useMemo(() => {
    const socket = getSocket();
    return socket.connect();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (answer !== checkAnswer.toString()) {
      return alert("You have entered the wrong answer");
    }
    if (answer) {
      socket.emit("submit-answer", { answer, userId: user });
      setAnswer("");
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert("Please enter a name");
      return;
    }
    const response = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user }),
    });

    const userData = await response.json();
    localStorage.setItem("username", JSON.stringify(userData.user.name));

    setShowPopup(false);
    setIsLogin(true);
    window.location.reload();
  };

  // Moved UpdateRanking inside useEffect to prevent infinite fetch
  const UpdateRanking = async () => {
    const response = await fetch("/api/user");
    const json = await response.json();
    setRanking(json.user);
  };

  const handleLogout = () => {
    // Remove the username from localStorage
    localStorage.removeItem("username");

    // Clear user state and show the popup for login
    setUser("");
    setIsLogin(false);
    setShowPopup(true);
  };

  useEffect(() => {
    // Prevent scroll when popup is shown
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Get stored username from localStorage
    const storedUser = JSON.parse(localStorage.getItem("username") || '""');
    if (storedUser !== "") {
      setUser(storedUser);
      setIsLogin(true);
    }

    // Listen for quiz questions and winner announcements
    socket.on("new-problem", (problem) => {
      setQuestion(problem.question);
      setCheckAnswer(problem.answer);
    });

    socket.on("winner", ({ userId }) => {
      alert(`Congratulations, User ${userId} won!`);
      UpdateRanking(); // Only update ranking when there's a winner
    });

    return () => {
      socket.off("new-problem");
      socket.off("winner");
      socket.disconnect();
      document.body.style.overflow = "auto";
    };
  }, [socket, showPopup]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white ${
        showPopup ? "fixed inset-0" : ""
      }`}
    >
      {!isLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Welcome to the Quiz!
            </h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Enter your name"
                onChange={(e) => setUser(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded text-gray-800"
                required
              />
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Start Quiz
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Quiz Time</h1>
          {isLogin && (
            <div className="flex items-center space-x-4">
              <p className="text-xl">Hello, {user}!</p>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Logout
              </button>
            </div>
          )}
        </header>

        <main className="mb-12">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Question:</h2>
            <p className="text-lg mb-4">{question}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-2 border border-purple-300 rounded bg-purple-100 bg-opacity-20 text-white placeholder-purple-200"
                required
              />
              <button
                type="submit"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Submit Answer
              </button>
            </form>
          </div>
        </main>
        <Ranking ranking={ranking} />
      </div>
    </div>
  );
}
