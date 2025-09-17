import { useEffect, useState } from "react";
import { TransactionButton, useReadContract } from "thirdweb/react";
import { prepareContractCall, readContract } from "thirdweb";
import { contract } from "@/client";
import { AppSidebar } from "@/components/utils/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Users, Upload, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConnButton from "./ConnButton";
import { PollStatus, } from "@/types";
import type { CandidatePoll, Candidate } from "@/types";
import Loading from "@/components/utils/Loading";
import BackButton from "@/components/utils/BackButton";



const ManageCandidates = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [polls, setPolls] = useState<CandidatePoll[]>([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [nameError, setNameError] = useState("");
    const [pollError, setPollError] = useState("");
    const [urlError, setUrlError] = useState("");

    // Form state
    const [updateName, setUpdateName] = useState("");
    const [updateParty, setUpdateParty] = useState("");
    const [updateDescription, setUpdateDescription] = useState("");
    const [updatePollId, setUpdatePollId] = useState("");
    const [updateImageUrl, setUpdateImageUrl] = useState("");

    const { data: pollIds, isPending: isPollsPending } = useReadContract({
        contract,
        method: "function getAllPolls() view returns (uint256[])",
        params: [],
    }) as { data: bigint[] | undefined; isPending: boolean };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch polls
                if (!pollIds || !Array.isArray(pollIds)) {
                    setPolls([]);
                    return;
                }

                const pollData = await Promise.all(
                    pollIds.map(async (id) => {
                        try {
                            const poll = await readContract({
                                contract,
                                method:
                                    "function getPoll(uint256 pollId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint8 status, uint256 totalVotes, uint256 candidateCountOut, uint256 minVotersRequired)",
                                params: [id],
                            });
                            const status = parseInt(poll[6].toString());
                            if (status === PollStatus.CREATED) {
                                return {
                                    id: id.toString(),
                                    title: poll[1],
                                    status,
                                };
                            }
                            return null;
                        } catch (err) {
                            console.error(`Failed to fetch poll ${id}:`, err);
                            return null;
                        }
                    })
                );
                const filteredPolls = pollData.filter(Boolean) as CandidatePoll[];
                setPolls(filteredPolls);

                // Fetch candidates
                const allCandidates: Candidate[] = [];
                for (const pollId of pollIds) {
                    try {
                        const [ids, names, parties, imageUrls, descriptions, isActiveList] = await readContract({
                            contract,
                            method:
                                "function getCandidateDetailsForPoll(uint256 pollId) view returns (uint256[] ids, string[] names, string[] parties, string[] imageUrls, string[] descriptions, bool[] isActiveList)",
                            params: [pollId],
                        });
                        const pollTitle = filteredPolls.find(p => p.id === pollId.toString())?.title || `Poll ${pollId.toString()}`;
                        for (let i = 0; i < ids.length; i++) {
                            allCandidates.push({
                                id: ids[i].toString(),
                                name: names[i],
                                party: parties[i],
                                imageUrl: imageUrls[i],
                                description: descriptions[i],
                                isActive: isActiveList[i],
                                pollId: pollId.toString(),
                                pollTitle,
                                votes: 0,
                                percentage: 0,
                            });
                        }
                    } catch (err) {
                        console.error(`Failed to fetch candidates for poll ${pollId}:`, err);
                    }
                }
                setCandidates(allCandidates);
            } catch (error) {
                console.error("Failed to load data:", error);
                toast.error("Error loading data from contract");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [pollIds]);

    const handleUpdateClick = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setUpdateName(candidate.name);
        setUpdateParty(candidate.party);
        setUpdateDescription(candidate.description);
        setUpdatePollId(candidate.pollId);
        setUpdateImageUrl(candidate.imageUrl);
        setIsUpdateModalOpen(true);
        setNameError("");
        setPollError("");
        setUrlError("");
    };

    const resetForm = () => {
        setUpdateName("");
        setUpdateParty("");
        setUpdateDescription("");
        setUpdatePollId("");
        setUpdateImageUrl("");
        setSelectedCandidate(null);
        setImageFile(null);
        setNameError("");
        setPollError("");
        setUrlError("");
    };

    const handleCloseModal = () => {
        setIsUpdateModalOpen(false);
        resetForm();
    };


    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-neutral-950">
                    <div className="flex items-center gap-2 px-3">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink className="hover:text-neutral-500" href="/admin-dashboard">
                                        Admin Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-white">Manage Candidates</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex-1 flex justify-end gap-3 sm:gap-3 pr-2 sm:pr-4">
                        <BackButton />
                        <ConnButton />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 bg-neutral-900 py-16">
                    <div className="w-full max-w-7xl mx-auto">
                        <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                    <Users className="h-5 w-5 mr-2 text-green-500" />
                                    Manage Candidates
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Update or remove candidates from polls
                                </CardDescription>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => setShowInactive(!showInactive)}
                                    >
                                        {showInactive ? "Show Active Only" : "Show All Candidates"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading || isPollsPending ? (
                                    <div className="text-center flex justify-center py-4"><Loading /></div>
                                ) : candidates.length === 0 ? (
                                    <div className="text-center py-4">No candidates available</div>
                                ) : (
                                    <div className="rounded-md border border-neutral-700">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-neutral-700 hover:bg-neutral-700/50">
                                                    <TableHead className="text-neutral-300">Candidate</TableHead>
                                                    <TableHead className="text-neutral-300">Party</TableHead>
                                                    <TableHead className="text-neutral-300">Poll</TableHead>
                                                    <TableHead className="text-neutral-300">Status</TableHead>
                                                    <TableHead className="text-neutral-300">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {candidates
                                                    .filter(c => showInactive || c.isActive)
                                                    .map((candidate) => (
                                                        <TableRow key={candidate.id} className="border-neutral-700 hover:bg-neutral-700/30">
                                                            <TableCell className="font-medium text-white">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                                                                        <AvatarFallback className="bg-neutral-700 text-white">
                                                                            {candidate.name.split(' ').map(n => n[0]).join('')}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <div className="font-medium">{candidate.name}</div>
                                                                        <div className="text-sm text-neutral-400 truncate max-w-[200px]">
                                                                            {candidate.description}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-neutral-300">{candidate.party}</TableCell>
                                                            <TableCell className="text-neutral-300">{candidate.pollTitle}</TableCell>
                                                            <TableCell>
                                                                <span
                                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${candidate.isActive
                                                                            ? "bg-green-900/30 text-green-400"
                                                                            : "bg-red-900/30 text-red-400"
                                                                        }`}
                                                                >
                                                                    {candidate.isActive ? "Active" : "Inactive"}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleUpdateClick(candidate)}
                                                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                                                        aria-label={`Edit ${candidate.name}`}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <TransactionButton
                                                                        transaction={() =>
                                                                            prepareContractCall({
                                                                                contract,
                                                                                method: "function removeCandidate(uint256 candidateId, uint256 pollId)",
                                                                                params: [BigInt(candidate.id), BigInt(candidate.pollId)],
                                                                            })
                                                                        }
                                                                        onTransactionConfirmed={() => {
                                                                            toast.success("Candidate removed successfully");
                                                                            setCandidates(prev =>
                                                                                prev.map(c =>
                                                                                    c.id === candidate.id ? { ...c, isActive: false } : c
                                                                                )
                                                                            );
                                                                        }}
                                                                        onError={(error) => {
                                                                            let message = error?.message || "Unknown error";
                                                                            if (message.includes("execution reverted:")) {
                                                                                message = message.split("execution reverted:")[1]?.trim() || "Remove failed";
                                                                            }
                                                                            toast.error(`Error: ${message}`);
                                                                        }}
                                                                        unstyled
                                                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                                        disabled={!candidate.isActive}
                                                                        aria-label={`Remove ${candidate.name}`}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </TransactionButton>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Dialog open={isUpdateModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="bg-neutral-800 text-white border border-neutral-700 max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">Update Candidate</DialogTitle>
                            <DialogDescription className="text-neutral-400">
                                Modify candidate information and poll assignment
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="update-poll">Assign to Poll *</Label>
                                <Select value={updatePollId} onValueChange={setUpdatePollId}>
                                    <SelectTrigger
                                        id="update-poll"
                                        className="bg-neutral-900 text-white border border-neutral-700"
                                        aria-describedby="poll-error"
                                    >
                                        <SelectValue placeholder="Choose a poll" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 text-white border border-neutral-700">
                                        {polls.length === 0 ? (
                                            <SelectItem value="empty" disabled>
                                                No polls available
                                            </SelectItem>
                                        ) : (
                                            polls.map((poll) => (
                                                <SelectItem key={poll.id} value={poll.id}>
                                                    {poll.title}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {pollError && (
                                    <p id="poll-error" className="text-sm text-red-500">
                                        {pollError}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="update-name">Candidate Name *</Label>
                                    <Input
                                        id="update-name"
                                        value={updateName}
                                        onChange={(e) => setUpdateName(e.target.value)}
                                        placeholder="Full name"
                                        className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                        required
                                        aria-describedby="name-error"
                                    />
                                    {nameError && (
                                        <p id="name-error" className="text-sm text-red-500">
                                            {nameError}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="update-party">Party/Affiliation</Label>
                                    <Input
                                        id="update-party"
                                        value={updateParty}
                                        onChange={(e) => setUpdateParty(e.target.value)}
                                        placeholder="Political party or Independent"
                                        className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center" htmlFor="update-image">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Candidate Image (Optional)
                                    </Label>
                                    <Input
                                        id="update-image"
                                        placeholder="https://ipfs.io/ipfs/..."
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                        className="bg-neutral-900 text-white file:text-white file:bg-primary file:border-none file:px-4 file:py-1 file:rounded-md border border-neutral-700"
                                    />
                                    {updateImageUrl && (
                                        <p className="text-sm text-neutral-400">Current: {updateImageUrl}</p>
                                    )}
                                    {urlError && (
                                        <p id="url-error" className="text-sm text-red-500">
                                            {urlError}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="update-description">Description</Label>
                                    <Textarea
                                        id="update-description"
                                        value={updateDescription}
                                        onChange={(e) => setUpdateDescription(e.target.value)}
                                        placeholder="Candidate background and platform"
                                        rows={3}
                                        className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleCloseModal}
                                className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <TransactionButton
                                transaction={async () => {
                                    const imageUrl = imageFile
                                        ? updateImageUrl || selectedCandidate?.imageUrl || ""
                                        : updateImageUrl || selectedCandidate?.imageUrl || "";
                                    return prepareContractCall({
                                        contract,
                                        method:
                                            "function updateCandidate(uint256 candidateId, string name, string party, string imageUrl, string description, uint256 pollId)",
                                        params: [
                                            BigInt(selectedCandidate!.id),
                                            updateName,
                                            updateParty,
                                            imageUrl,
                                            updateDescription,
                                            BigInt(updatePollId),
                                        ],
                                    });
                                }}
                                onTransactionSent={() => setIsUpdating(true)}
                                onTransactionConfirmed={() => {
                                    toast.success("Candidate updated successfully!");
                                    setCandidates(prev =>
                                        prev.map(c =>
                                            c.id === selectedCandidate?.id
                                                ? {
                                                    ...c,
                                                    name: updateName,
                                                    party: updateParty,
                                                    description: updateDescription,
                                                    pollId: updatePollId,
                                                    pollTitle: polls.find(p => p.id === updatePollId)?.title || c.pollTitle,
                                                    imageUrl: imageFile ? updateImageUrl : c.imageUrl,
                                                }
                                                : c
                                        )
                                    );
                                    setIsUpdateModalOpen(false);
                                    resetForm();
                                    setIsUpdating(false);
                                }}
                                onError={(error) => {
                                    let message = error?.message || "Unknown error";
                                    if (message.includes("execution reverted:")) {
                                        message = message.split("execution reverted:")[1]?.trim() || "Update failed";
                                    }
                                    toast.error(`Error: ${message}`);
                                    setIsUpdating(false);
                                }}
                                disabled={!updateName || !updatePollId || isUpdating || !!urlError}
                                unstyled
                                className="min-w-[150px] px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
                                        Updating...
                                    </div>
                                ) : (
                                    "Update Candidate"
                                )}
                            </TransactionButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default ManageCandidates;