import React, { useState, useEffect, useCallback, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useReadContract, useActiveAccount } from "thirdweb/react";
import { contract } from "@/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vote, ChevronRight, Users, Clock, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import type { Poll } from "@/types";
import Loading from "@/components/utils/Loading";
import { getDerivedPollStatus } from "@/lib/poll-status";

// Helper function to format timestamp to locale string
const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
};

// Helper function to calculate time remaining or until start
const getTimeDisplay = (
    startTime: number,
    endTime: number,
    status: Poll["status"]
): { remaining: string | null; untilStart: string | null } => {
    const now = Date.now() / 1000;
    const remainingSeconds = endTime - now;
    const untilStartSeconds = startTime - now;

    if (status === "ended" || remainingSeconds <= 0) {
        return { remaining: "Ended", untilStart: null };
    }

    if (status === "upcoming" && untilStartSeconds > 0) {
        const days = Math.floor(untilStartSeconds / (24 * 60 * 60));
        const hours = Math.floor((untilStartSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((untilStartSeconds % (60 * 60)) / 60);
        if (days > 0) return { remaining: null, untilStart: `${days}d ${hours}h until start` };
        if (hours > 0) return { remaining: null, untilStart: `${hours}h ${minutes}m until start` };
        return { remaining: null, untilStart: `${minutes}m until start` };
    }

    const days = Math.floor(remainingSeconds / (24 * 60 * 60));
    const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    if (days > 0) return { remaining: `${days}d ${hours}h remaining`, untilStart: null };
    if (hours > 0) return { remaining: `${hours}h ${minutes}m remaining`, untilStart: null };
    return { remaining: `${minutes}m remaining`, untilStart: null };
};

// Helper function to get status badge
const getStatusBadge = (status: Poll["status"]): JSX.Element => {
    switch (status) {
        case "active":
            return <Badge className="bg-green-500 text-white">Active</Badge>;
        case "upcoming":
            return <Badge className="bg-blue-500 text-white">Upcoming</Badge>;
        default:
            return <Badge variant="outline" className="text-neutral-400">Ended</Badge>;
    }
};

// Component to fetch and process individual poll data
const PollItem = ({
    pollId,
    voterAddress,
    setPolls,
    setLoadedPollIds,
}: {
    pollId: number;
    voterAddress: string | undefined;
    setPolls: React.Dispatch<React.SetStateAction<Poll[]>>;
    setLoadedPollIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}) => {
    const { data: pollData, isPending, error } = useReadContract({
        contract,
        method:
            "function getPoll(uint256 pollId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint8 status, uint256 totalVotes, uint256 candidateCountOut, uint256 minVotersRequired)",
        params: [BigInt(pollId)],
        queryOptions: {
            refetchInterval: 15000,
        },
    });

    const { data: hasVotedData } = useReadContract({
        contract,
        method: "function hasVoted(address voter, uint256 pollId) view returns (bool)",
        params: [voterAddress ?? "", BigInt(pollId)],
        queryOptions: { enabled: !!voterAddress },
    });

    const { data: isEligibleToVote } = useReadContract({
        contract,
        method: "function isEligibleToVote(address voter, uint256 pollId) view returns (bool)",
        params: [voterAddress ?? "", BigInt(pollId)],
        queryOptions: { enabled: !!voterAddress },
    });

    useEffect(() => {
        if (error) {
            console.error(`Failed to fetch poll ${pollId}:`, error);
            toast.error(`Error loading poll ID ${pollId}`);
            setLoadedPollIds((prev) => new Set([...prev, pollId]));
            return;
        }

        if (pollData && !isPending) {
            const startTime = Number(pollData[3]);
            const endTime = Number(pollData[4]);

            const contractStatus = Number(pollData[5]);
            const status = getDerivedPollStatus(startTime, endTime, contractStatus);

            const poll: Poll = {
                id: pollData[0].toString(),
                title: pollData[1],
                description: pollData[2],
                startTime,
                endTime,
                startDate: new Date(startTime * 1000).toISOString(),
                endDate: new Date(endTime * 1000).toISOString(),
                contractStatus,
                status,
                totalVotes: Number(pollData[6]),
                candidateCount: Number(pollData[7]),
                createdTime: startTime,
                hasVoted: hasVotedData ?? false,
                isEligible: isEligibleToVote ?? false,
                minVotersRequired: Number(pollData[8] ?? 0) || undefined,
                durationSeconds: Math.max(0, endTime - startTime),
            };

            setPolls((prevPolls) => {
                const existingIndex = prevPolls.findIndex((p) => p.id === poll.id);
                if (existingIndex >= 0) {
                    const nextPolls = [...prevPolls];
                    nextPolls[existingIndex] = {
                        ...nextPolls[existingIndex],
                        ...poll,
                        status: getDerivedPollStatus(poll.startTime, poll.endTime, poll.contractStatus),
                    };
                    return nextPolls;
                }
                return [...prevPolls, poll]
                    .sort((a, b) => Number(a.id) - Number(b.id));
            });

            setLoadedPollIds((prev) => new Set([...prev, pollId]));
        }
    }, [pollData, isPending, error, hasVotedData, isEligibleToVote, pollId, voterAddress, setPolls, setLoadedPollIds]);

    return null;
};

export const Polls = () => {
    const navigate = useNavigate();
    const account = useActiveAccount();
    const voterAddress = account?.address;
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loadedPollIds, setLoadedPollIds] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState<"all" | "active" | "upcoming" | "completed">("all");
    const refreshPollStatuses = useCallback(() => {
        setPolls((prevPolls) => {
            let changed = false;
            const nextPolls = prevPolls.map((poll) => {
                const nextStatus = getDerivedPollStatus(poll.startTime, poll.endTime, poll.contractStatus);
                if (nextStatus !== poll.status) {
                    changed = true;
                    return { ...poll, status: nextStatus };
                }
                return poll;
            });

            return changed ? nextPolls : prevPolls;
        });
    }, [setPolls]);

    useEffect(() => {
        refreshPollStatuses();
        if (typeof window === "undefined") {
            return;
        }
        const interval = window.setInterval(refreshPollStatuses, 15000);
        return () => window.clearInterval(interval);
    }, [refreshPollStatuses]);

    // Fetch all poll IDs
    const { data: pollIds, isPending: isPendingPollIds, error: pollIdsError } = useReadContract({
        contract,
        method: "function getAllPolls() view returns (uint256[])",
        params: [],
    });

    useEffect(() => {
        if (pollIdsError) {
            console.error("Failed to fetch poll IDs:", pollIdsError);
            toast.error("Error loading polls from contract");
        }
    }, [pollIdsError]);

    // Map poll IDs to numbers
    const pollIdsToFetch = pollIds && Array.isArray(pollIds) ? pollIds.map((id) => Number(id)) : [];

    // Filter polls based on active tab
    const filteredPolls = polls.filter((poll) => {
        switch (activeTab) {
            case "active":
                return poll.status === "active";
            case "upcoming":
                return poll.status === "upcoming";
            case "completed":
                return poll.status === "ended" || poll.hasVoted;
            default:
                return true;
        }
    });

    // Handle poll navigation
    const handleViewPoll = (poll: Poll) => {
        if (poll.status === "active" && !poll.isEligible) {
            toast.warning("You are not eligible to vote in this poll. Please check your voter registration status.");
            navigate(`/polls/${poll.id}`);
            return;
        }
        if (poll.hasVoted) {
            toast.info("You have already cast your vote in this poll. You can view your receipt or check the results.");
            navigate(`/polls/${poll.id}/results`);
            return;
        }
        if (poll.status === "ended") {
            navigate(`/polls/${poll.id}/results`);
            return;
        }
        navigate(`/polls/${poll.id}`);
    };

    // Loading states
    const isLoading = isPendingPollIds;
    const isLoadingPolls = pollIdsToFetch.length > 0 && loadedPollIds.size < pollIdsToFetch.length;

    return (
        <div className="bg-neutral-900 min-h-screen flex flex-col">
            <Navbar />
            {/* Fetch individual polls */}
            {pollIdsToFetch.map((pollId) => (
                <PollItem
                    key={pollId}
                    pollId={pollId}
                    voterAddress={voterAddress}
                    setPolls={setPolls}
                    setLoadedPollIds={setLoadedPollIds}
                />
            ))}
            <main className="container max-w-7xl mx-auto py-16 sm:py-20 px-4 flex-grow">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white font-lora">Available Polls</h1>
                    <p className="text-neutral-500 mt-2">
                        Select a poll to view candidates and cast your vote
                        {isLoadingPolls && ` (Loading ${loadedPollIds.size}/${pollIdsToFetch.length} polls...)`}
                    </p>
                </div>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-4 bg-neutral-800">
                        <TabsTrigger value="all" className="text-neutral-300 data-[state=active]:bg-neutral-700">
                            All ({polls.length})
                        </TabsTrigger>
                        <TabsTrigger value="active" className="text-neutral-300 data-[state=active]:bg-neutral-700">
                            Active
                        </TabsTrigger>
                        <TabsTrigger value="upcoming" className="text-neutral-300 data-[state=active]:bg-neutral-700">
                            Upcoming
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="text-neutral-300 data-[state=active]:bg-neutral-700">
                            Completed
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                {isLoading ? (
                    <Card className="text-center p-8 bg-neutral-800 border-neutral-700">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Vote className="h-12 w-12 text-neutral-500/50 animate-pulse" />
                                <p className="text-neutral-500"><Loading/>Loading available polls...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : pollIdsToFetch.length === 0 ? (
                    <Card className="text-center p-8 bg-neutral-800 border-neutral-700">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Vote className="h-12 w-12 text-neutral-500/50" />
                                <p className="text-neutral-500">No polls found in the smart contract</p>
                                <p className="text-neutral-400 text-sm">
                                    Poll IDs: {pollIds ? `[${pollIds.join(", ")}]` : "None"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredPolls.length === 0 && !isLoadingPolls ? (
                    <Card className="text-center p-8 bg-neutral-800 border-neutral-700">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Vote className="h-12 w-12 text-neutral-500/50" />
                                <p className="text-neutral-500">No polls available in this category</p>
                                <p className="text-neutral-400 text-sm">Try switching to a different tab or check back later</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPolls.map((poll) => {
                            const { remaining, untilStart } = getTimeDisplay(poll.startTime, poll.endTime, poll.status);
                            return (
                                <Card key={poll.id} className="overflow-hidden bg-neutral-800 border-neutral-700">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl text-white font-lora">{poll.title}</CardTitle>
                                            <div className="flex gap-2">{getStatusBadge(poll.status)}</div>
                                        </div>
                                        <CardDescription className="text-neutral-400">{poll.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <div className="space-y-4">
                                            {/* Basic Info */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="h-4 w-4 text-neutral-500" />
                                                    <span className="text-neutral-400">
                                                        {poll.candidateCount <= 0
                                                            ? "No candidates"
                                                            : `${poll.candidateCount} candidate${poll.candidateCount === 1 ? "" : "s"}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <BarChart3 className="h-4 w-4 text-neutral-500" />
                                                    <span className="text-neutral-400">
                                                        {poll.status === "upcoming"
                                                            ? "Votes: N/A"
                                                            : poll.totalVotes <= 0
                                                                ? "No votes"
                                                                : `${poll.totalVotes} vote${poll.totalVotes === 1 ? "" : "s"}`}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Timing Information */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-green-500" />
                                                    <span className="text-neutral-400">Start:</span>
                                                    <span className="text-neutral-300">{formatDateTime(poll.startTime)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-red-500" />
                                                    <span className="text-neutral-400">End:</span>
                                                    <span className="text-neutral-300">{formatDateTime(poll.endTime)}</span>
                                                </div>
                                            </div>
                                            {/* Time Remaining or Until Start */}
                                            {(remaining || untilStart) && (
                                                <div className="pt-2 border-t border-neutral-700">
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-neutral-400">{untilStart ? "Starts in:" : "Time Remaining:"}</span>
                                                        <span className="font-medium text-white">{untilStart || remaining}</span>
                                                    </div>
                                                    {poll.status === "active" && (
                                                        <Progress
                                                            value={Math.max(
                                                                0,
                                                                Math.min(
                                                                    100,
                                                                    ((Date.now() / 1000 - poll.startTime) / (poll.endTime - poll.startTime)) * 100
                                                                )
                                                            )}
                                                            className="h-2 bg-neutral-700"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            {/* Voting Stats for Ended Polls */}
                                            {poll.status === "ended" && poll.totalVotes > 0 && (
                                                <div className="pt-2 border-t border-neutral-700">
                                                    <div className="text-sm space-y-1">
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Total Votes:</span>
                                                            <span className="text-white font-medium">{poll.totalVotes.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Avg per Candidate:</span>
                                                            <span className="text-neutral-300">
                                                                {Math.round(poll.totalVotes / poll.candidateCount).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <Separator className="bg-neutral-700" />
                                    <CardFooter className="pt-3">
                                        <Button
                                            onClick={() => handleViewPoll(poll)}
                                            className="w-full bg-primary hover:bg-primary/90 text-white"
                                            aria-label={
                                                poll.hasVoted
                                                    ? "View vote receipt"
                                                    : poll.status === "active"
                                                        ? "View and vote in poll"
                                                        : poll.status === "upcoming"
                                                            ? "View poll details"
                                                            : "View poll results"
                                            }
                                        >
                                            {poll.hasVoted
                                                ? "View Receipt"
                                                : poll.status === "active"
                                                    ? "View & Vote"
                                                    : poll.status === "upcoming"
                                                        ? "View Details"
                                                        : "View Results"}
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                        {/* Loading placeholders */}
                        {isLoadingPolls &&
                            Array.from({ length: Math.min(3, pollIdsToFetch.length - loadedPollIds.size) }).map((_, i) => (
                                <Card
                                    key={`loading-${i}`}
                                    className="overflow-hidden bg-neutral-800 border-neutral-700 animate-pulse"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div className="h-6 bg-neutral-700 rounded w-3/4" />
                                            <div className="h-6 bg-neutral-700 rounded w-16" />
                                        </div>
                                        <div className="h-4 bg-neutral-700 rounded w-full mt-2" />
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <div className="space-y-3">
                                            <div className="h-4 bg-neutral-700 rounded w-2/3" />
                                            <div className="h-4 bg-neutral-700 rounded w-1/2" />
                                        </div>
                                    </CardContent>
                                    <Separator className="bg-neutral-700" />
                                    <CardFooter className="pt-3">
                                        <div className="h-10 bg-neutral-700 rounded w-full" />
                                    </CardFooter>
                                </Card>
                            ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Polls;
