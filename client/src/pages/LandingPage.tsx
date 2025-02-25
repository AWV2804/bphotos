import { Link } from "react-router-dom";

const LandingPage = () => {
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
          className="px-6 py-3 text-lg text-white bg-blue-600 rounded-lg shadow-md transition hover:bg-blue-700 focus:outline-2 focus:ring-2 focus:ring-blue-700"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="px-6 py-3 text-lg text-blue-600 border border-blue-600 rounded-lg shadow-md transition hover:bg-blue-100 hover:text-blue-700 focus:outline-1 focus:ring-2 focus:ring-blue-500"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
