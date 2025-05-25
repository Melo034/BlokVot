import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MoreHorizontal, Edit, Trash2, Play, Pause, Eye, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export interface ElectionManagementProps {
  searchQuery: string;
  polls: Poll[];
  getStatusBadge: (status: string) => React.ReactNode;
  handlePublishPoll: (pollId: string) => void;
  handleAddCandidate: () => Promise<void>;
  isLoading: boolean;
}

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

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "ended";
  candidateCount: number;
  voterCount: number;
  totalVotes: number;
}

const electionSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start date." }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end date." }),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after start date.",
  path: ["endDate"],
});

export function ElectionManagement({ searchQuery }: ElectionManagementProps) {
  const [elections, setElections] = useState<Election[]>([
    {
      id: "presidential-2025",
      title: "Presidential Election 2025",
      description: "General election for the President of Sierra Leone",
      startDate: "2025-05-15T00:00:00Z",
      endDate: "2025-05-15T23:59:59Z",
      status: "active",
      candidateCount: 4,
      voterCount: 1245789,
      totalVotes: 987654,
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
      totalVotes: 892341,
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
      totalVotes: 0,
    },
  ]);

  const [isCreateElectionModalOpen, setIsCreateElectionModalOpen] = useState(false);

  const filteredElections = elections.filter((election) => {
    return (
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "ended":
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateElection = () => {
    setIsCreateElectionModalOpen(true);
  };

  const handleEditElection = (id: string) => {
    toast("Edit Election", {
      description: `Navigating to edit election with ID: ${id}`,
    });
  };

  const handleManageCandidates = (id: string) => {
    toast("Manage Candidates", {
      description: `Navigating to manage candidates for election with ID: ${id}`,
    });
  };

  const handleViewResults = (id: string) => {
    toast("View Results", {
      description: `Viewing results for election with ID: ${id}`,
    });
  };

  const handlePublishElection = (id: string) => {
    setElections(elections.map((election) => (election.id === id ? { ...election, status: "active" } : election)));
    toast("Success", {
      description: `Election with ID: ${id} has been published.`,
    });
  };

  const handleEndElection = (id: string) => {
    setElections(elections.map((election) => (election.id === id ? { ...election, status: "ended" } : election)));
    toast("Success", {
      description: `Election with ID: ${id} has been ended.`,
    });
  };

  const handleDeleteElection = (id: string) => {
    setElections(elections.filter((election) => election.id !== id));
    toast.success("Success", {
      description: `Election with ID: ${id} has been deleted.`,
    });
  };

  const CreateElectionForm = () => {
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<z.infer<typeof electionSchema>>({
      resolver: zodResolver(electionSchema),
    });

    const onSubmit = (data: z.infer<typeof electionSchema>) => {
      const newElection: Election = {
        id: `election-${Date.now()}`,
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        status: "draft",
        candidateCount: 0,
        voterCount: 0,
        totalVotes: 0,
      };

      setElections([...elections, newElection]);
      setIsCreateElectionModalOpen(false);
      reset();
      toast.success("Success", {
        description: "New election created successfully.",
      });
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm sm:text-base">Election Title</Label>
          <Input
            id="title"
            placeholder="Enter election title"
            {...register("title")}
            className="text-sm sm:text-base"
          />
          {errors.title && <p className="text-red-500 text-xs sm:text-sm">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm sm:text-base">Description</Label>
          <Input
            id="description"
            placeholder="Enter election description"
            {...register("description")}
            className="text-sm sm:text-base"
          />
          {errors.description && <p className="text-red-500 text-xs sm:text-sm">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm sm:text-base">Start Date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              {...register("startDate")}
              className="text-sm sm:text-base"
            />
            {errors.startDate && <p className="text-red-500 text-xs sm:text-sm">{errors.startDate.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm sm:text-base">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              {...register("endDate")}
              className="text-sm sm:text-base"
            />
            {errors.endDate && <p className="text-red-500 text-xs sm:text-sm">{errors.endDate.message}</p>}
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreateElectionModalOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            Create Election
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-primary">Election Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage elections and actions</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm sm:text-base"
          onClick={handleCreateElection}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Election
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Elections</CardTitle>
          <CardDescription className="text-sm">{filteredElections.length} elections found</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Election</TableHead>
                <TableHead className="text-xs sm:text-sm">Date Range</TableHead>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-xs sm:text-sm">Candidates</TableHead>
                <TableHead className="text-xs sm:text-sm">Votes Cast</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredElections.map((election) => (
                <TableRow key={election.id}>
                  <TableCell>
                    <div className="font-medium text-sm sm:text-base">{election.title}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{election.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs sm:text-sm">{new Date(election.startDate).toLocaleDateString()} -</div>
                    <div className="text-xs sm:text-sm">{new Date(election.endDate).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(election.status)}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{election.candidateCount}</TableCell>
                  <TableCell>
                    {election.totalVotes > 0 ? (
                      <div>
                        <div className="font-medium text-sm sm:text-base">{election.totalVotes.toLocaleString()}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {((election.totalVotes / election.voterCount) * 100).toFixed(1)}% turnout
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs sm:text-sm">No votes yet</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditElection(election.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Election
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageCandidates(election.id)}>
                          <Users className="mr-2 h-4 w-4" />
                          Manage Candidates
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewResults(election.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Results
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {election.status === "draft" && (
                          <DropdownMenuItem onClick={() => handlePublishElection(election.id)}>
                            <Play className="mr-2 h-4 w-4" />
                            Publish Election
                          </DropdownMenuItem>
                        )}
                        {election.status === "active" && (
                          <DropdownMenuItem onClick={() => handleEndElection(election.id)}>
                            <Pause className="mr-2 h-4 w-4" />
                            End Election
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Election
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-lg sm:text-xl">Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm">
                                This action cannot be undone. This will permanently delete the election and all
                                associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteElection(election.id)}
                                className="w-full sm:w-auto"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Election Dialog */}
      <Dialog open={isCreateElectionModalOpen} onOpenChange={setIsCreateElectionModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Create New Election</DialogTitle>
            <DialogDescription className="text-sm">
              Enter details for the new election. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <CreateElectionForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}