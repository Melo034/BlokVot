import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Auth/Login";
import Profile from "./Pages/Voter/Profile/Profile";
import Results from "./Pages/Results/Results";
import HowItWorks from "./Pages/HowitWorks/HowItWorks";
import Admin from "./Pages/Admin/Admin";
import Polls from "./Pages/Polls/Polls";
import Poll from "./Pages/Polls/[id]/Polls";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/auth/login" element={<Login/>} />
      <Route path="/my-profile" element={<Profile/>} />
      <Route path="/results" element={<Results/>} />
      <Route path="/how-it-works" element={<HowItWorks/>} />
      <Route path="/admin" element={<Admin/>} />
      <Route path="/polls" element={<Polls/>} />
      <Route path="/polls/:id" element={<Poll />} />

    </Routes>
  );
}

export default App;