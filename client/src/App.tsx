import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import GetStartedPage from "./pages/GetStartedPage";
import PhotosPage from "./pages/PhotosPage";
import Header from "./Header";

const App = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/photos" element={<PhotosPage />} />
      </Routes>
    </div>
  );
};

export default App;