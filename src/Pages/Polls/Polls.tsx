import React, { useState, useEffect, useCallback, useMemo, type JSX } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vote, ChevronRight, Users, Clock, BarChart3, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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


    const pollInsights = useMemo(() => {
        const total = polls.length;
        const active = polls.filter((poll) => poll.status === "active").length;
        const upcoming = polls.filter((poll) => poll.status === "upcoming").length;
        const completed = polls.filter((poll) => poll.status === "ended").length;
        const engaged = polls.filter((poll) => poll.hasVoted).length;
        const totalVotes = polls.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0);
        return { total, active, upcoming, completed, engaged, totalVotes };
    }, [polls]);

    const insightHighlights = useMemo(
        () =>
            [
                {
                    label: "Active ballots",
                    value: pollInsights.active,
                    icon: Clock,
                    caption: pollInsights.active ? "Now accepting votes" : "Awaiting next launch",
                },
                {
                    label: "Upcoming launches",
                    value: pollInsights.upcoming,
                    icon: Calendar,
                    caption: pollInsights.upcoming ? "Scheduled openings" : "No events scheduled",
                },
                {
                    label: "Votes recorded",
                    value: pollInsights.totalVotes,
                    icon: BarChart3,
                    caption: pollInsights.totalVotes ? "Verified on-chain" : "Awaiting first ballot",
                },
                {
                    label: "Receipts issued",
                    value: pollInsights.engaged,
                    icon: Users,
                    caption: pollInsights.engaged ? "Voters have receipts" : "Be the first to vote",
                },
            ] as Array<{ label: string; value: number; icon: LucideIcon; caption: string }>,
        [pollInsights],
    );


    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <Navbar />
            {pollIdsToFetch.map((pollId) => (
                <PollItem
                    key={pollId}
                    pollId={pollId}
                    voterAddress={voterAddress}
                    setPolls={setPolls}
                    setLoadedPollIds={setLoadedPollIds}
                />
            ))}
            <main className="relative flex-grow overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_60%)]" />
                <div className="relative">
                    <section className="container mx-auto max-w-6xl px-6 pt-16">
                        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-[1px] shadow-[0_70px_160px_-110px_rgba(37,99,235,0.55)] backdrop-blur">
                            <div className="rounded-[30px] bg-neutral-950/95 px-8 py-12 sm:px-12">
                                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="max-w-2xl space-y-5">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-primary/70">
                                            <Vote className="h-3.5 w-3.5" />
                                            Poll center
                                        </span>
                                        <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">Ballots in motion</h1>
                                        <p className="text-neutral-300">
                                            Explore live, scheduled, and certified ballots. Every vote is anchored on-chain with instant receipts.
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                                            <span className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-primary/70" />
                                                {isLoadingPolls
                                                    ? `Syncing ${loadedPollIds.size}/${pollIdsToFetch.length} ballots...`
                                                    : `Tracking ${pollInsights.total} total ballot${pollInsights.total === 1 ? "" : "s"}`}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-primary/70" />
                                                {pollInsights.engaged
                                                    ? `${pollInsights.engaged} voter${pollInsights.engaged === 1 ? "" : "s"} already have receipts`
                                                    : "No receipts issued yet"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                        {insightHighlights.map(({ label, value, icon: Icon, caption }) => (
                                            <div
                                                key={label}
                                                className="rounded-3xl border border-white/10 bg-white/[0.06] px-5 py-6 shadow-[0_30px_80px_-60px_rgba(59,130,246,0.4)] transition hover:border-primary/40 hover:bg-primary/10"
                                            >
                                                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-neutral-400">
                                                    <span>{label}</span>
                                                    <Icon className="h-4 w-4 text-primary/70" />
                                                </div>
                                                <p className="mt-3 text-3xl font-semibold text-white">{value.toLocaleString()}</p>
                                                <p className="mt-2 text-xs text-neutral-400">{caption}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="container mx-auto max-w-6xl px-6 pb-24 mt-10">
                        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] shadow-[0_80px_160px_-120px_rgba(37,99,235,0.55)] backdrop-blur">
                            <div className="flex flex-col gap-8 px-6 py-8 sm:px-10 sm:py-12">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-white">Ballots by status</h2>
                                        <p className="text-neutral-400">
                                            Filter and jump straight into the ballot that matters. Results refresh in real time.
                                        </p>
                                    </div>
                                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full sm:w-auto">
                                        <TabsList className="flex w-full flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 sm:flex-nowrap sm:justify-start">
                                            <TabsTrigger value="all" className="w-full rounded-xl px-4 py-2 text-sm text-center text-neutral-300 transition data-[state=active]:bg-primary/25 data-[state=active]:text-white sm:w-auto">
                                                All ({polls.length})
                                            </TabsTrigger>
                                            <TabsTrigger value="active" className="w-full rounded-xl px-4 py-2 text-sm text-center text-neutral-300 transition data-[state=active]:bg-primary/25 data-[state=active]:text-white sm:w-auto">
                                                Active
                                            </TabsTrigger>
                                            <TabsTrigger value="upcoming" className="w-full rounded-xl mt-3 sm:mt-0 px-4 py-2 text-sm text-center text-neutral-300 transition data-[state=active]:bg-primary/25 data-[state=active]:text-white sm:w-auto">
                                                Upcoming
                                            </TabsTrigger>
                                            <TabsTrigger value="completed" className="w-full rounded-xl mt-3 sm:mt-0 px-4 py-2 text-sm text-center text-neutral-300 transition data-[state=active]:bg-primary/25 data-[state=active]:text-white sm:w-auto">
                                                Completed
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] py-16 text-neutral-400">
                                        <Loading />
                                        <p>Fetching ballot directory...</p>
                                    </div>
                                ) : pollIdsToFetch.length === 0 ? (
                                    <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] py-16 text-center text-neutral-400">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                                            <Vote className="h-5 w-5 text-primary/70" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-white">No ballots deployed yet</h3>
                                        <p className="mt-2 text-sm text-neutral-400">
                                            Poll IDs: {pollIds ? `[${pollIds.join(", ")}]` : "None"}
                                        </p>
                                    </div>
                                ) : filteredPolls.length === 0 && !isLoadingPolls ? (
                                    <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] py-16 text-center text-neutral-400">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                                            <Vote className="h-5 w-5 text-primary/70" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-white">No ballots in this category</h3>
                                        <p className="mt-2 text-sm text-neutral-400">Try another filter or check back soon.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 sm:grid-cols-2 mt-5">
                                        {filteredPolls.map((poll) => {
                                            const { remaining, untilStart } = getTimeDisplay(poll.startTime, poll.endTime, poll.status);
                                            return (
                                                <Card
                                                    key={poll.id}
                                                    className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.02] shadow-[0_60px_120px_-90px_rgba(37,99,235,0.45)] transition hover:border-primary/40 hover:bg-primary/5"
                                                >
                                                    <CardHeader className="pb-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <CardTitle className="text-lg sm:text-xl font-semibold text-white font-lora">{poll.title}</CardTitle>
                                                            <div className="flex gap-2">{getStatusBadge(poll.status)}</div>
                                                        </div>
                                                        <CardDescription className="text-sm text-neutral-300">{poll.description}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="space-y-5">
                                                        <div className="grid gap-4 text-sm sm:grid-cols-2">
                                                            <div className="flex items-center gap-2 text-neutral-300">
                                                                <Users className="h-4 w-4 text-primary/70" />
                                                                <span>
                                                                    {poll.candidateCount <= 0
                                                                        ? "No candidates"
                                                                        : `${poll.candidateCount} candidate${poll.candidateCount === 1 ? "" : "s"}`}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-neutral-300">
                                                                <BarChart3 className="h-4 w-4 text-primary/70" />
                                                                <span>
                                                                    {poll.status === "upcoming"
                                                                        ? "Votes: N/A"
                                                                        : poll.totalVotes <= 0
                                                                            ? "No votes yet"
                                                                            : `${poll.totalVotes} vote${poll.totalVotes === 1 ? "" : "s"}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm">
                                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-neutral-300 px-4 sm:px-6 w-full">
                                                                <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
                                                                    <span className="flex items-center gap-1.5 sm:gap-2 text-neutral-400 text-xs sm:text-sm">
                                                                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/70" />
                                                                        Start
                                                                    </span>
                                                                    <span className="text-xs sm:text-sm">{formatDateTime(poll.startTime)}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
                                                                    <span className="flex items-center gap-1.5 sm:gap-2 text-neutral-400 text-xs sm:text-sm">
                                                                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-400" />
                                                                        End
                                                                    </span>
                                                                    <span className="text-xs sm:text-sm">{formatDateTime(poll.endTime)}</span>
                                                                </div>
                                                            </div>
                                                            {(remaining || untilStart) && (
                                                                <div className="pt-3">
                                                                    <div className="flex items-center justify-between text-neutral-300 px-4 sm:px-6">
                                                                        <span className="text-sm sm:text-lg">{untilStart ? "Starts in" : "Time remaining"}</span>
                                                                        <span className="font-medium text-white text-sm sm:text-lg">{untilStart || remaining}</span>
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
                                                                            className="mt-2 h-2 bg-white/10"
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {poll.status === "ended" && poll.totalVotes > 0 && (
                                                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm">
                                                                <div className="flex justify-between text-neutral-300">
                                                                    <span>Total votes</span>
                                                                    <span className="font-medium text-white">{poll.totalVotes.toLocaleString()}</span>
                                                                </div>
                                                                <div className="mt-2 flex justify-between text-neutral-300">
                                                                    <span>Average per candidate</span>
                                                                    <span>{Math.round(poll.totalVotes / poll.candidateCount).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                    <CardFooter className="border-t border-white/5 bg-white/[0.02] px-6 py-4">
                                                        <Button
                                                            onClick={() => handleViewPoll(poll)}
                                                            className="w-full rounded-xl bg-primary/90 py-2 text-white transition hover:bg-primary"
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
                                                                ? "View receipt"
                                                                : poll.status === "active"
                                                                    ? "View & vote"
                                                                    : poll.status === "upcoming"
                                                                        ? "View details"
                                                                        : "View results"}
                                                            <ChevronRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            );
                                        })}
                                        {isLoadingPolls &&
                                            Array.from({ length: Math.min(3, pollIdsToFetch.length - loadedPollIds.size) }).map((_, i) => (
                                                <Card
                                                    key={`loading-${i}`}
                                                    className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.02] animate-pulse"
                                                >
                                                    <CardHeader className="pb-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="h-6 w-3/4 rounded bg-white/10" />
                                                            <div className="h-6 w-16 rounded bg-white/10" />
                                                        </div>
                                                        <div className="mt-2 h-4 w-full rounded bg-white/10" />
                                                    </CardHeader>
                                                    <CardContent className="space-y-3 pb-4">
                                                        <div className="h-4 w-2/3 rounded bg-white/10" />
                                                        <div className="h-4 w-1/2 rounded bg-white/10" />
                                                    </CardContent>
                                                    <CardFooter className="border-t border-white/5 py-4">
                                                        <div className="h-10 w-full rounded bg-white/10" />
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Polls;
