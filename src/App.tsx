import { Routes, Route } from "react-router-dom";
import type { JSX } from "react";
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
import { Toaster } from "@/components/ui/sonner";
import AddAdmin from "./Pages/Admin/AddAdmin";
import ManageVoters from "./Pages/Admin/ManageVoters";
import PollVote from "./Pages/Polls/[id]/PollVote";
import { AdminGuard } from "./components/auth/AdminGuard";

const withAdminGuard = (element: JSX.Element) => <AdminGuard>{element}</AdminGuard>;

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/admin-dashboard" element={withAdminGuard(<Dashboard />)} />
        <Route path="/admin-dashboard/polls/create" element={withAdminGuard(<CreatePolls />)} />
        <Route path="/admin-dashboard/polls/start" element={withAdminGuard(<StartPoll />)} />
        <Route path="/admin-dashboard/polls/manage" element={withAdminGuard(<ManagePolls />)} />
        <Route path="/admin-dashboard/candidates/add" element={withAdminGuard(<AddCandidates />)} />
        <Route path="/admin-dashboard/candidates/manage" element={withAdminGuard(<ManageCandidates />)} />
        <Route path="/admin-dashboard/admins/add" element={withAdminGuard(<AddAdmin />)} />
        <Route path="/admin-dashboard/voters/add" element={withAdminGuard(<AddVoters />)} />
        <Route path="/admin-dashboard/voters/manage" element={withAdminGuard(<ManageVoters />)} />
        <Route path="/admin-dashboard/settings" element={withAdminGuard(<SystemSettings />)} />
        <Route path="/polls" element={<Polls />} />
        <Route path="/polls/:id" element={<PollVote />} />
        <Route path="/polls/:id/results" element={<Result />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
