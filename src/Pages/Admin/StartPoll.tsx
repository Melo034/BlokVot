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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Vote } from "lucide-react";
import { toast } from "sonner";
import ConnButton from "./ConnButton";
import type { Startpoll } from "@/types";
import { PollStatus } from "@/types";
import BackButton from "@/components/utils/BackButton";



const StartPoll = () => {
    const [polls, setPolls] = useState<Startpoll[]>([]);
    const [selectedPollId, setSelectedPollId] = useState("");
    const [startDateTime, setStartDateTime] = useState("");
    const [endDateTime, setEndDateTime] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const { data: pollIds } = useReadContract({
        contract,
        method: "function getAllPolls() view returns (uint256[])",
        params: [],
    });

    useEffect(() => {
        const fetchPolls = async () => {
            if (!pollIds || !Array.isArray(pollIds)) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const results = await Promise.all(
                pollIds.map(async (id) => {
                    try {
                        const poll = await readContract({
                            contract,
                            method:
                                "function getPoll(uint256 pollId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint8 status, uint256 totalVotes, uint256 candidateCountOut, uint256 minVotersRequired)",
                            params: [id],
                        });
                        const status = Number(poll[5]);
                        if (status === PollStatus.CREATED) {
                            return {
                                id: id.toString(),
                                title: poll[1],
                                candidateCount: Number(poll[7]) || 0,
                                minVotersRequired: Number(poll[8]) || 0,
                                status,
                            };
                        }
                        return null;
                    } catch (err) {
                        console.error("Failed to fetch poll", id, err);
                        return null;
                    }
                })
            );
            const filteredPolls = results.filter(Boolean) as Startpoll[];
            setPolls(filteredPolls);
            setIsLoading(false);
        };
        fetchPolls();
    }, [pollIds]);

    const handlePollSelection = (pollId: string) => {
        const selectedPoll = polls.find(p => p.id === pollId);
        if (selectedPoll && selectedPoll.candidateCount < 2) {
            toast.error(`Cannot select ${selectedPoll.title}: Poll must have at least 2 candidates.`);
            setSelectedPollId("");
        } else {
            setSelectedPollId(pollId);
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
                                    <BreadcrumbPage className="text-white">Start Poll</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex-1 flex justify-end gap-3 sm:gap-3 pr-2 sm:pr-4">
                        <BackButton />
                        <ConnButton />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 bg-neutral-900 py-28">
                    <div className="w-full max-w-5xl mx-auto">
                        <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                    <Vote className="h-5 w-5 mr-2 text-green-500" />
                                    Start Poll
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Activate a created poll with voting schedule
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="select-poll">Select Poll to Start</Label>
                                    <Select value={selectedPollId} onValueChange={handlePollSelection}>
                                        <SelectTrigger className="bg-neutral-900 text-white border border-neutral-700">
                                            <SelectValue placeholder="Choose a poll" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 text-white border border-neutral-700">
                                            {isLoading ? (
                                                <SelectItem value="loading" disabled>
                                                    Loading polls...
                                                </SelectItem>
                                            ) : polls.length === 0 ? (
                                                <SelectItem value="empty" disabled>
                                                    No polls available. Create a poll first.
                                                </SelectItem>
                                            ) : (
                                                polls.map((poll) => (
                                                    <SelectItem
                                                        key={poll.id}
                                                        value={poll.id}
                                                        disabled={poll.candidateCount < 2}
                                                    >
                                                        {poll.title} ({poll.candidateCount} candidates)
                                                        {poll.candidateCount < 2 && " - Add at least 2 candidates"}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-datetime">Start Date & Time</Label>
                                        <Input
                                            id="start-datetime"
                                            type="datetime-local"
                                            value={startDateTime}
                                            onChange={(e) => setStartDateTime(e.target.value)}
                                            className="bg-neutral-900 text-white border border-neutral-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end-datetime">End Date & Time</Label>
                                        <Input
                                            id="end-datetime"
                                            type="datetime-local"
                                            value={endDateTime}
                                            onChange={(e) => setEndDateTime(e.target.value)}
                                            className="bg-neutral-900 text-white border border-neutral-700"
                                        />
                                    </div>
                                </div>
                                <Alert className="bg-neutral-700/40 text-neutral-400 border border-neutral-400">
                                    <AlertDescription>
                                        <strong>Requirements:</strong> Poll must have at least 2 candidates (Selected: {polls.find(p => p.id === selectedPollId)?.candidateCount || 0}).
                                        Duration must be between 1 hour and 365 days.
                                        Minimum voters required: {polls.find(p => p.id === selectedPollId)?.minVotersRequired || 0}.
                                    </AlertDescription>
                                </Alert>
                                <div className="flex justify-end">
                                    <TransactionButton
                                        transaction={async () => {
                                            const startTime = Math.floor(new Date(startDateTime).getTime() / 1000);
                                            const endTime = Math.floor(new Date(endDateTime).getTime() / 1000);

                                            const poll = polls.find(p => p.id === selectedPollId);
                                            if (!poll || poll.candidateCount < 2) {
                                                throw new Error("Poll must have at least 2 candidates.");
                                            }

                                            if (endTime - startTime < 3600 || endTime - startTime > 365 * 24 * 60 * 60) {
                                                throw new Error("Poll duration must be between 1 hour and 365 days.");
                                            }

                                            return prepareContractCall({
                                                contract,
                                                method: "function startPoll(uint256 pollId, uint256 startTime, uint256 endTime)",
                                                params: [BigInt(selectedPollId), BigInt(startTime), BigInt(endTime)],
                                            });
                                        }}
                                        onTransactionConfirmed={() => {
                                            toast.success("Poll started successfully!");
                                            setSelectedPollId("");
                                            setStartDateTime("");
                                            setEndDateTime("");
                                            setPolls(prev => prev.filter(p => p.id !== selectedPollId));
                                        }}
                                        onError={(error) => {
                                            let message = error?.message || "Transaction failed";
                                            if (message.includes("execution reverted:")) {
                                                message = message.split("execution reverted:")[1].trim();
                                            }
                                            toast.error(`Error: ${message}`);
                                            console.error("Poll start error:", error);
                                        }}
                                        disabled={!selectedPollId || !startDateTime || !endDateTime || (polls.find(p => p.id === selectedPollId)?.candidateCount || 0) < 2}
                                        unstyled
                                        className="min-w-[150px] px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Start Poll
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

export default StartPoll;