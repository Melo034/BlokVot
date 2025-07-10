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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import ConnButton from "./ConnButton";
import { PollStatus } from "@/types";
import type { CandidatePoll } from "@/types";

// Utility to validate URLs
const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return url.startsWith("https://");
    } catch {
        return false;
    }
};

const AddCandidates = () => {
    const [candidatePollId, setCandidatePollId] = useState<string>("");
    const [candidateName, setCandidateName] = useState<string>("");
    const [candidateParty, setCandidateParty] = useState<string>("");
    const [candidateDescription, setCandidateDescription] = useState<string>("");
    const [candidateImageUrl, setCandidateImageUrl] = useState<string>("");
    const [existingPolls, setExistingPolls] = useState<CandidatePoll[]>([]);
    const [selectedPollTitle, setSelectedPollTitle] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [urlError, setUrlError] = useState<string>("");

    const { data: pollIds } = useReadContract({
        contract,
        method: "function getAllPolls() view returns (uint256[])",
        params: [],
    }) as { data: bigint[] | undefined };

    useEffect(() => {
        const fetchPolls = async () => {
            if (!pollIds || !Array.isArray(pollIds)) {
                console.log("No pollIds received:", { pollIds });
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const polls = await Promise.all(
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
                            toast.error(`Failed to fetch poll ${id}`);
                            console.error("Failed to fetch poll", id, err);
                            return null;
                        }
                    })
                );
                const filteredPolls = polls.filter(Boolean) as CandidatePoll[];
                setExistingPolls(filteredPolls);
            } catch (err) {
                toast.error("Failed to fetch polls");
                console.error("Fetch polls error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPolls();
    }, [pollIds]);

    const resetForm = () => {
        setCandidateName("");
        setCandidateParty("");
        setCandidateDescription("");
        setCandidateImageUrl("");
        setUrlError("");
    };

    const handleImageUrlChange = (value: string) => {
        setCandidateImageUrl(value);
        if (value && !isValidUrl(value)) {
            setUrlError("Please enter a valid HTTPS URL");
        } else {
            setUrlError("");
        }
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
                                    <BreadcrumbPage className="text-white">Add Candidate</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex-1 flex justify-end pr-4">
                        <ConnButton />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 bg-neutral-900 py-28">
                    <div className="w-full max-w-5xl mx-auto">
                        <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                    <Users className="h-5 w-5 mr-2 text-green-500" />
                                    Add Candidate
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Add candidates to polls in CREATED status only
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="candidate-poll">Select Poll *</Label>
                                    <Select
                                        value={candidatePollId}
                                        onValueChange={(val) => {
                                            setCandidatePollId(val);
                                            const selected = existingPolls.find(p => p.id === val);
                                            setSelectedPollTitle(selected?.title || "");
                                        }}
                                    >
                                        <SelectTrigger
                                            id="candidate-poll"
                                            className="bg-neutral-900 text-white border border-neutral-700"
                                            aria-describedby="poll-error"
                                        >
                                            <SelectValue placeholder="Choose a poll" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 text-white border border-neutral-700">
                                            {isLoading ? (
                                                <SelectItem value="loading" disabled>
                                                    Loading polls...
                                                </SelectItem>
                                            ) : existingPolls.length === 0 ? (
                                                <SelectItem value="empty" disabled>
                                                    No polls available. Create a poll first.
                                                </SelectItem>
                                            ) : (
                                                existingPolls.map((poll) => (
                                                    <SelectItem key={poll.id} value={poll.id}>
                                                        {poll.title}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {selectedPollTitle && (
                                        <p className="text-sm text-neutral-400">Selected: {selectedPollTitle}</p>
                                    )}
                                    {existingPolls.length === 0 && !isLoading && (
                                        <p id="poll-error" className="text-sm text-red-500">
                                            No polls available. Please create a poll first.
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="candidate-name">Candidate Name *</Label>
                                        <Input
                                            id="candidate-name"
                                            value={candidateName}
                                            onChange={(e) => setCandidateName(e.target.value)}
                                            placeholder="Full name"
                                            className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="candidate-party">Party/Affiliation</Label>
                                        <Input
                                            id="candidate-party"
                                            value={candidateParty}
                                            onChange={(e) => setCandidateParty(e.target.value)}
                                            placeholder="Political party or Independent"
                                            className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center" htmlFor="candidate-image-url">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Candidate Image URL (Optional)
                                        </Label>
                                        <Input
                                            id="candidate-image-url"
                                            value={candidateImageUrl}
                                            onChange={(e) => handleImageUrlChange(e.target.value)}
                                            placeholder="https://ipfs.io/ipfs/..."
                                            className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                            aria-describedby="url-error"
                                        />
                                        {urlError && (
                                            <p id="url-error" className="text-sm text-red-500">
                                                {urlError}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="candidate-description">Description</Label>
                                        <Textarea
                                            id="candidate-description"
                                            value={candidateDescription}
                                            onChange={(e) => setCandidateDescription(e.target.value)}
                                            placeholder="Candidate background and platform"
                                            rows={3}
                                            className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <TransactionButton
                                        transaction={() =>
                                            prepareContractCall({
                                                contract,
                                                method:
                                                    "function addCandidate(string name, string party, string imageUrl, string description, uint256 pollId) returns (uint256)",
                                                params: [
                                                    candidateName,
                                                    candidateParty,
                                                    candidateImageUrl || "",
                                                    candidateDescription,
                                                    candidatePollId ? BigInt(candidatePollId) : 0n,
                                                ],
                                            })
                                        }
                                        onTransactionConfirmed={() => {
                                            toast.success(`Candidate added successfully to ${selectedPollTitle}!`);
                                            resetForm();
                                        }}
                                        onError={(error) => {
                                            let message = error?.message || "Transaction failed";
                                            if (message.includes("execution reverted:")) {
                                                message = message.split("execution reverted:")[1]?.trim() || "Transaction failed";
                                            }
                                            toast.error(`Error: ${message}`);
                                            console.error("Add candidate error:", error);
                                        }}
                                        disabled={!candidatePollId || !candidateName || !!urlError}
                                        unstyled
                                        className="min-w-[150px] px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Candidate
                                        </div>
                                    </TransactionButton>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AddCandidates;