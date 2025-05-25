import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Filter, PlusCircle, Menu } from "lucide-react";
import { AdminSidebar } from "@/components/utils/admin-sidebar";
import { UserManagement } from "@/components/utils/user-management";
import { AdminManagement } from "@/components/utils/admin-management";
import { ElectionManagement } from "@/components/utils/election-management";
import { SystemSettings } from "@/components/utils/system-settings";
import { AuditLogs } from "@/components/utils/audit-logs";
import { DashboardOverview } from "@/components/utils/dashboard-overview";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerWithRange } from "@/components/utils/date-range-picker";
import type { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Logo from "@/assets/blockchain_logo.png";

interface Poll {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "ended";
  candidateCount: number;
  voterCount: number;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  pollId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  [key: string]: string | undefined;
}

export interface ElectionManagementProps {
  searchQuery: string;
  polls: Poll[];
  getStatusBadge: (status: string) => React.ReactNode;
  handlePublishPoll: (pollId: string) => void;
  handleAddCandidate: () => Promise<void>;
  isLoading: boolean;
}

export interface AdminManagementProps {
  searchQuery: string;
  admins: User[];
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPoll, setShowNewPoll] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDescription, setNewPollDescription] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [candidateBio, setCandidateBio] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: "presidential-2025",
      title: "Presidential Election 2025",
      description: "General election for the President of Sierra Leone",
      startDate: "2025-05-15T00:00:00Z",
      endDate: "2025-05-15T23:59:59Z",
      status: "active",
      candidateCount: 4,
      voterCount: 1245789,
    },
    {
      id: "parliamentary-2025",
      title: "Parliamentary Election 2025",
      description: "Election for Members of Parliament",
      startDate: "2025-05-15T00:00:00Z",
      endDate: "2025-05-15T23:59:59Z",
      status: "active",
      candidateCount: 12,
      voterCount: 1156789,
    },
    {
      id: "local-council-2025",
      title: "Local Council Election 2025",
      description: "Election for Local Council Representatives",
      startDate: "2025-05-20T00:00:00Z",
      endDate: "2025-05-20T23:59:59Z",
      status: "draft",
      candidateCount: 8,
      voterCount: 0,
    },
  ]);
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: "candidate1", name: "Julius Maada Bio", party: "Sierra Leone People's Party", pollId: "presidential-2025" },
    { id: "candidate2", name: "Samura Kamara", party: "All People's Congress", pollId: "presidential-2025" },
    { id: "candidate3", name: "Kandeh Yumkella", party: "National Grand Coalition", pollId: "presidential-2025" },
    { id: "candidate4", name: "Samuel Williams", party: "National Unity Party", pollId: "presidential-2025" },
    { id: "mp1", name: "Michael Brown", party: "Sierra Leone People's Party", pollId: "parliamentary-2025" },
    { id: "mp2", name: "Elizabeth Taylor", party: "All People's Congress", pollId: "parliamentary-2025" },
    { id: "mp3", name: "David Wilson", party: "National Grand Coalition", pollId: "parliamentary-2025" },
    { id: "mp4", name: "Patricia Garcia", party: "National Unity Party", pollId: "parliamentary-2025" },
  ]);
  const [publishingProgress, setPublishingProgress] = useState(0);
  const [publishingError, setPublishingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock admin data
  const adminData = {
    name: "Dr. Mohamed Kamara",
    role: "Super Administrator",
    email: "m.kamara@nec.gov.sl",
    lastLogin: "2025-05-23T10:30:00Z",
    permissions: ["all"],
  };

  // Mock system stats
  const systemStats = {
    totalVoters: 2547893,
    activeElections: 2,
    totalAdmins: 12,
    systemUptime: "99.9%",
    pendingVerifications: 156,
    flaggedAccounts: 8,
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCreatePoll = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newPoll: Poll = {
        id: `poll-${Date.now()}`,
        title: newPollTitle,
        description: newPollDescription,
        startDate: dateRange?.from?.toISOString() || new Date().toISOString(),
        endDate: dateRange?.to?.toISOString() || new Date().toISOString(),
        status: "draft",
        candidateCount: 0,
        voterCount: 0,
      };
      setPolls([...polls, newPoll]);
      setShowNewPoll(false);
      setNewPollTitle("");
      setNewPollDescription("");
      setDateRange(undefined);
      toast.success("Poll Created", {
        description: "The poll has been successfully created.",
      });
    } catch {
      toast.error("Error", {
        description: "Failed to create poll.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishPoll = (pollId: string) => {
    setIsPublishing(true);
    setPublishingProgress(0);
    setPublishingError(null);
    const interval = setInterval(() => {
      setPublishingProgress((prevProgress) => {
        const newProgress = prevProgress + 20;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsPublishing(false);
            setPolls(polls.map((poll) => (poll.id === pollId ? { ...poll, status: "active" } : poll)));
            toast.success("Poll Published", {
              description: "The poll has been successfully published.",
            });
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const handleAddCandidate = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!selectedPollId) {
        throw new Error("No poll selected");
      }
      const newCandidate = {
        id: `candidate-${Date.now()}`,
        name: candidateName,
        party: candidateParty,
        pollId: selectedPollId,
      };
      setCandidates([...candidates, newCandidate]);
      setShowAddCandidate(false);
      setCandidateName("");
      setCandidateParty("");
      setCandidateBio("");
      toast.success("Candidate Added", {
        description: "The candidate has been successfully added.",
      });
    } catch (error: unknown) {
      let message = "Failed to add candidate.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error("Error", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-green-500">Active</Badge>;
    } else if (status === "draft") {
      return <Badge variant="outline">Draft</Badge>;
    } else {
      return <Badge variant="secondary">Ended</Badge>;
    }
  };

  const filteredPolls = polls.filter((poll) => poll.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-60 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="md:hidden" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Logo" className="h-12 w-16 object-contain sm:h-16 sm:w-20" />
            </div>
            <Badge className="ml-2 text-white bg-primary text-xs sm:text-sm">Admin Panel</Badge>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm">
              <span>Welcome, {adminData.name}</span>
              <Badge variant="outline" className="border-primary text-primary">
                {adminData.role}
              </Badge>
            </div>
            <Link to="/">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm"
              >
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users, elections, or logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button variant="outline" className="border-primary text-primary w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </div>

          {activeTab === "dashboard" && <DashboardOverview stats={systemStats} />}
          {activeTab === "voters" && <UserManagement searchQuery={searchQuery} />}
          {activeTab === "admins" && <AdminManagement searchQuery={searchQuery} />}
          {activeTab === "elections" && (
            <ElectionManagement
              searchQuery={searchQuery}
              polls={filteredPolls}
              getStatusBadge={getStatusBadge}
              handlePublishPoll={handlePublishPoll}
              handleAddCandidate={handleAddCandidate}
              isLoading={isLoading}
            />
          )}
          {activeTab === "audit" && <AuditLogs searchQuery={searchQuery} />}
          {activeTab === "settings" && <SystemSettings />}
        </main>
      </div>

      <Dialog open={showNewPoll} onOpenChange={setShowNewPoll}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Election/Poll</DialogTitle>
            <DialogDescription>
              Add the details for the new election or poll. You can add candidates after creating the poll.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="poll-title">Title</Label>
              <Input
                id="poll-title"
                placeholder="e.g., Presidential Election 2025"
                value={newPollTitle}
                onChange={(e) => setNewPollTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poll-description">Description</Label>
              <Textarea
                id="poll-description"
                placeholder="Provide a description of the election or poll"
                value={newPollDescription}
                onChange={(e) => setNewPollDescription(e.target.value)}
              />
            </div>
            <DatePickerWithRange
              className="w-full"
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowNewPoll(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleCreatePoll}
              className="bg-teal-700 hover:bg-teal-800 w-full sm:w-auto"
              disabled={!newPollTitle || !newPollDescription || isLoading}
            >
              Create Poll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Candidate</DialogTitle>
            <DialogDescription>Add a new candidate to the selected poll.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="poll-select">Select Poll</Label>
              <select
                id="poll-select"
                value={selectedPollId || ""}
                onChange={(e) => setSelectedPollId(e.target.value || null)}
                className="w-full border rounded-md p-2"
              >
                <option value="" disabled>
                  Select a poll
                </option>
                {polls.map((poll) => (
                  <option key={poll.id} value={poll.id}>
                    {poll.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-name">Candidate Name</Label>
              <Input
                id="candidate-name"
                placeholder="Full name of the candidate"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-party">Political Party</Label>
              <Input
                id="candidate-party"
                placeholder="Name of the political party"
                value={candidateParty}
                onChange={(e) => setCandidateParty(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-bio">Biography</Label>
              <Textarea
                id="candidate-bio"
                placeholder="Brief biography of the candidate"
                value={candidateBio}
                onChange={(e) => setCandidateBio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Candidate Photo</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <PlusCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (max. 2MB)</p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowAddCandidate(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              className="bg-teal-700 hover:bg-teal-800 w-full sm:w-auto"
              onClick={handleAddCandidate}
              disabled={!candidateName || !candidateParty || !selectedPollId || isLoading}
            >
              {isLoading ? "Adding..." : "Add Candidate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPublishing}>
        <DialogContent className="w-[95vw] max-w-[400px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publishing to Blockchain</DialogTitle>
            <DialogDescription>
              Your poll is being published to the blockchain. This may take a few moments.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Publishing progress</span>
                <span>{publishingProgress}%</span>
              </div>
              <Progress value={publishingProgress} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              The poll data is being encrypted and recorded on the blockchain. This ensures transparency and
              immutability of the election process.
            </p>
            {publishingError && <div className="mt-4 text-red-500">Error: {publishingError}</div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;