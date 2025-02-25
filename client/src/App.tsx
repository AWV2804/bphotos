import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/signup" element={<div>Signup Page</div>} />
      </Routes>
    </Router>
  );
};

export default App; 