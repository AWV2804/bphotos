import { Link } from "react-router-dom";
import { constructBackendUrl } from "../utils/backendurl";
import { useNavigate } from "react-router-dom";
import React, { useState } from 'react';

const LandingPage = () => {
  const [newUser, setNewUser] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    try {
      const backendUrl = await constructBackendUrl("/users/all");
      const response = await fetch(backendUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
      console.log(data.users.length);
      if (data.users.length === 0) {
        setNewUser(true);
        navigate("/get-started");
      } else {
        alert("At least one user already exists. Please log in to add more users.");
        setNewUser(false);
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      alert(`Something went wrong. Please try again later. Error: ${error}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-blue-100 to-gray-100">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4 text-center">
        Welcome to <span className="text-blue-600">BPhotos 📸</span>
      </h1>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-lg">
        Your secure and self-hosted photo storage solution.
      </p>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <Link
          to="/login"
          className="px-6 py-3 text-lg text-white bg-blue-600 rounded-lg shadow-md transition hover:bg-blue-700 focus:outline-1 focus:ring-2 focus:ring-blue-700 text-center"
        >
          Log In
        </Link>
        <button
          onClick={handleGetStarted}
          className="px-6 py-3 text-lg text-blue-600 border-2 border-blue-500  rounded-lg shadow-md transition hover:bg-blue-100 hover:text-blue-700 focus:outline-1 focus:ring-2 focus:ring-blue-500"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;