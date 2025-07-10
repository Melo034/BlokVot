import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Results from "./Pages/Results/Results";
import HowItWorks from "./Pages/HowitWorks/HowItWorks";
import Polls from "./Pages/Polls/Polls";
import Dashboard from "./Pages/Admin/Dashboard";
import CreatePolls from "./Pages/Admin/CreatePolls";
import StartPoll from "./Pages/Admin/StartPoll";
import ManagePolls from "./Pages/Admin/ManagePolls";
import AddCandidates from "./Pages/Admin/AddCandidates";
import ManageCandidates from "./Pages/Admin/ManageCandidates";
import SystemSettings from "./Pages/Admin/SystemSettings";
import { AddVoters } from "./Pages/Admin/AddVoters";
import Result from "./Pages/Results/[Result]/Result";
import { Toaster } from "@/components/ui/sonner"
import AddAdmin from "./Pages/Admin/AddAdmin";
import ManageVoters from "./Pages/Admin/ManageVoters";
import PollVote from "./Pages/Polls/[id]/PollVote";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/admin-dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard/polls/create" element={<CreatePolls />} />
        <Route path="/admin-dashboard/polls/start" element={<StartPoll />} />
        <Route path="/admin-dashboard/polls/manage" element={<ManagePolls />} />
        <Route path="/admin-dashboard/candidates/add" element={<AddCandidates />} />
        <Route path="/admin-dashboard/candidates/manage" element={<ManageCandidates />} />
        <Route path="/admin-dashboard/admins/add" element={<AddAdmin />} />
        <Route path="/admin-dashboard/voters/add" element={<AddVoters />} />
        <Route path="/admin-dashboard/voters/manage" element={<ManageVoters />} />
        <Route path="/admin-dashboard/settings" element={<SystemSettings />} />
        <Route path="/polls" element={<Polls />} />
        <Route path="/polls/:id" element={<PollVote />} />
        <Route path="/polls/:id/results" element={<Result />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;