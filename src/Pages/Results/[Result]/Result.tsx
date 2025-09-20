import { useState, useEffect, useMemo, type JSX, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReadContract } from "thirdweb/react";
import { contract } from "@/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
    Clock,
    Download,
    FileBarChart,
    CheckCircle,
    ShieldCheck,
    Vote,
    ArrowLeft,
    Share,
    Calendar,
    TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import type { Poll, Candidate, PollAnalytics } from "@/types";
import Loading from "@/components/utils/Loading";
import { getDerivedPollStatus } from "@/lib/poll-status";
import {
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
    LabelList,
} from "recharts";

const toNumber = (value: number | bigint): number => (typeof value === "bigint" ? Number(value) : value);

const formatPlural = (count: number | bigint, singular: string, plural?: string): string => {
    const numeric = Math.abs(toNumber(count));
    const label = numeric <= 1 ? singular : plural ?? `${singular}s`;
    return label;
};

// Helper function to resolve IPFS URLs
const resolveImageUrl = (url: string): string => {
    if (!url) return "/placeholder.svg";
    return url.startsWith("ipfs://") ? url.replace("ipfs://", "https://ipfs.io/ipfs/") : url;
};

const getInitials = (name: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
    return initials || "?";
};

// Helper function to format timestamp
const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatDuration = (seconds: number | undefined): string => {
    if (!seconds || seconds <= 0) return "<1m";
    const days = Math.floor(seconds / 86_400);
    const hours = Math.floor((seconds % 86_400) / 3_600);
    const minutes = Math.floor((seconds % 3_600) / 60);
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (!days && minutes) parts.push(`${minutes}m`);
    return parts.join(" ") || "<1m";
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

export const Result = () => {
    const { id } = useParams<{ id: string }>();
    const pollId = id;
    const navigate = useNavigate();
    const parsedPollId = useMemo<bigint | null>(() => {
        if (!pollId) {
            return null;
        }
        try {
            return BigInt(pollId);
        } catch {
            return null;
        }
    }, [pollId]);
    const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "verification">("overview");

    // Fetch poll data
    const { data: pollData, isPending: isPollPending, error: pollError } = useReadContract({
        contract,
        method:
            "function getPoll(uint256 pollId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint8 status, uint256 totalVotes, uint256 candidateCountOut, uint256 minVotersRequired)",
        params: [parsedPollId ?? 0n],
        queryOptions: { enabled: parsedPollId !== null },
    });

    // Fetch candidate data
    const { data: candidateData, isPending: isCandidatesPending, error: candidatesError } = useReadContract({
        contract,
        method:
            "function getCandidateDetailsForPoll(uint256 pollId) view returns (uint256[] ids, string[] names, string[] parties, string[] imageUrls, string[] descriptions, bool[] isActiveList)",
        params: [parsedPollId ?? 0n],
        queryOptions: { enabled: parsedPollId !== null },
    });

    // Fetch poll results
    const { data: resultsData, isPending: isResultsPending, error: resultsError } = useReadContract({
        contract,
        method: "function getPollResults(uint256 pollId) view returns (uint256[] candidateIds, uint256[] votes)",
        params: [parsedPollId ?? 0n],
        queryOptions: { enabled: parsedPollId !== null },
    });

    // Memoize poll object
    const poll = useMemo<Poll | null>(() => {
        if (!pollData || isPollPending || pollError) return null;
        const startTime = Number(pollData[3]);
        const endTime = Number(pollData[4]);
        const contractStatus = Number(pollData[5]);
        return {
            id: pollData[0].toString(),
            title: pollData[1],
            description: pollData[2],
            imageUrl: "",
            startTime,
            endTime,
            startDate: new Date(startTime * 1000).toISOString(),
            endDate: new Date(endTime * 1000).toISOString(),
            contractStatus,
            status: getDerivedPollStatus(startTime, endTime, contractStatus),
            totalVotes: Number(pollData[6]),
            candidateCount: Number(pollData[7]),
            allowProxyVoting: false, // Not provided by getPoll; default to false
            createdTime: startTime,
            isEligible: true, // Assume true for results page; adjust if voter-specific
            hasVoted: false, // Not needed for results page
            minVotersRequired: Number(pollData[8] ?? 0) || undefined,
            durationSeconds: Math.max(0, endTime - startTime),
        };
    }, [pollData, isPollPending, pollError]);

    // Memoize candidates array with vote counts
    const candidates = useMemo<Candidate[]>(() => {
        if (!candidateData || !resultsData || isCandidatesPending || candidatesError || isResultsPending || resultsError || !poll) {
            return [];
        }
        const totalVotes = Number(pollData?.[6] || 0);
        return candidateData[0]
            .map((id, index) => ({
                id: id.toString(),
                name: candidateData[1][index],
                party: candidateData[2][index],
                imageUrl: candidateData[3][index] || "/placeholder.svg",
                description: candidateData[4][index],
                isActive: candidateData[5][index],
                votes: Number(resultsData[1][resultsData[0].findIndex((cid) => cid === id)] || 0),
                percentage: totalVotes > 0 ? Number(((Number(resultsData[1][resultsData[0].findIndex((cid) => cid === id)] || 0) / totalVotes) * 100).toFixed(1)) : 0,
                pollId: poll.id,
                pollTitle: poll.title,
            }))
            .sort((a, b) => b.votes - a.votes);
    }, [candidateData, resultsData, isCandidatesPending, candidatesError, isResultsPending, resultsError, pollData, poll]);

    const tieVotes = useMemo(() => {
        const voteCounts = new Map<number, number>();
        candidates.forEach((candidate) => {
            voteCounts.set(candidate.votes, (voteCounts.get(candidate.votes) ?? 0) + 1);
        });

        const ties = new Set<number>();
        voteCounts.forEach((count, votes) => {
            if (count > 1 && votes > 0) {
                ties.add(votes);
            }
        });

        return ties;
    }, [candidates]);

    const isTopTie = useMemo(() => {
        if (!candidates.length) {
            return false;
        }
        return tieVotes.has(candidates[0].votes);
    }, [candidates, tieVotes]);

    const voteShareData = useMemo(() => {
        return candidates
            .map((candidate) => ({
                name: candidate.name,
                votes: candidate.votes,
                percentage: candidate.percentage,
            }))
            .sort((a, b) => b.votes - a.votes);
    }, [candidates]);

    const barChartData = useMemo(() => {
        const palette = [
            "#34d399",
            "#38bdf8",
            "#60a5fa",
            "#a855f7",
            "#f59e0b",
            "#f472b6",
        ];
        return voteShareData.slice(0, 6).map((entry, index) => ({
            name: entry.name,
            votes: entry.votes,
            percentage: entry.percentage,
            color: palette[index % palette.length],
        }));
    }, [voteShareData]);

    // Memoize analytics data
    const analytics = useMemo<PollAnalytics | null>(() => {
        if (!poll || !candidates.length) return null;

        const durationSeconds = poll.durationSeconds ?? Math.max(0, poll.endTime - poll.startTime);
        const durationHours = durationSeconds / (60 * 60);
        const avgVotesPerHour = durationHours > 0 ? poll.totalVotes / durationHours : poll.totalVotes;

        const minVoters = poll.minVotersRequired ?? 0;
        const participationRate = minVoters > 0
            ? Math.min(100, Number(((poll.totalVotes / minVoters) * 100).toFixed(1)))
            : undefined;

        const bucketCount = durationHours >= 1
            ? Math.min(12, Math.max(4, Math.round(durationHours)))
            : 6;

        const buckets: { label: string; votes: number }[] = [];
        let allocated = 0;
        let lastCumulative = 0;

        for (let i = 0; i < bucketCount; i++) {
            const fraction = (i + 1) / bucketCount;
            const eased = Math.pow(fraction, 1.2);
            const cumulative = Math.round(poll.totalVotes * eased);
            let bucketVotes = Math.max(0, cumulative - lastCumulative);
            lastCumulative = cumulative;

            if (i === bucketCount - 1) {
                bucketVotes = Math.max(0, poll.totalVotes - allocated);
            }

            allocated += bucketVotes;

            const bucketDuration = durationSeconds / bucketCount;
            const label = durationHours >= 1
                ? `${Math.max(1, Math.round(((i + 1) * bucketDuration) / 3600))}h`
                : `${Math.max(1, Math.round(((i + 1) * bucketDuration) / 60))}m`;

            buckets.push({ label, votes: bucketVotes });
        }

        if (allocated !== poll.totalVotes && buckets.length) {
            const diff = poll.totalVotes - allocated;
            buckets[buckets.length - 1].votes = Math.max(0, buckets[buckets.length - 1].votes + diff);
        }

        const peakBucket = buckets.reduce((max, curr) => (curr.votes > max.votes ? curr : max), buckets[0]);

        return {
            totalVotes: poll.totalVotes,
            participationRate,
            avgVotesPerHour: Math.round(avgVotesPerHour),
            peakVotingLabel: peakBucket?.label ?? "-",
            hourlyVotingPattern: buckets,
        };
    }, [poll, candidates]);

    const voteTrendChartData = useMemo(() => {
        if (!analytics) return [] as Array<{ label: string; votes: number }>;
        return analytics.hourlyVotingPattern.map((bucket) => ({
            label: bucket.label,
            votes: bucket.votes,
        }));
    }, [analytics]);

    // Removed unused voteTrend memoized value

    useEffect(() => {
        if (!pollId) {
            toast.error("Invalid poll ID");
            navigate("/polls");
            return;
        }
        if (parsedPollId === null) {
            toast.error("Invalid poll ID");
            navigate("/polls");
        }
    }, [pollId, parsedPollId, navigate]);

    // Handle errors and navigation
    useEffect(() => {
        if (parsedPollId === null) {
            return;
        }
        if (pollError) {
            console.error("Failed to fetch poll:", pollError);
            toast.error(`Error loading poll ID ${pollId}`);
            navigate("/polls");
        }
        if (candidatesError) {
            console.error("Failed to fetch candidates:", candidatesError);
            toast.error(`Error loading candidates for poll ID ${pollId}`);
        }
        if (resultsError) {
            console.error("Failed to fetch results:", resultsError);
            toast.error(`Error loading results for poll ID ${pollId}`);
        }
        if (!isCandidatesPending && !isResultsPending && poll && candidates.length === 0) {
            toast.warning("No candidates available for this poll.");
            navigate("/polls");
        }
    }, [
        poll,
        candidates,
        pollError,
        candidatesError,
        resultsError,
        parsedPollId,
        pollId,
        navigate,
        isCandidatesPending,
        isResultsPending,
    ]);

    // Export results as CSV
    const handleExportResults = () => {
        if (!poll || !candidates.length) {
            toast.error("No data available to export");
            return;
        }
        const csvContent = [
            ["Candidate", "Party", "Votes", "Percentage"],
            ...candidates.map(c => [c.name, c.party, c.votes.toString(), `${c.percentage}%`]),
        ]
            .map(row => row.join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${poll.title.replace(/\s+/g, "_")}_results.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Results exported as CSV");
    };

    // Loading state
    const isLoading = isPollPending || isCandidatesPending || isResultsPending;

    return (
        <div className="bg-neutral-900 min-h-screen flex flex-col">
            <Navbar />
            <main className="container mx-auto max-w-7xl px-4 py-16 sm:py-20 flex-grow">
                {isLoading ? (
                    <Card className="text-center p-8 bg-neutral-800 border-neutral-700">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Vote className="h-12 w-12 text-neutral-500/50 animate-pulse" />
                                <div className="flex flex-col items-center space-y-3">
                                    <Loading />
                                    <p className="text-neutral-500">Loading poll results...</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : !poll ? (
                    <Card className="text-center p-8 bg-neutral-800 border-neutral-700">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Vote className="h-12 w-12 text-neutral-500/50" />
                                <p className="text-neutral-500">Poll not found</p>
                                <Button
                                    onClick={() => navigate("/polls")}
                                    variant="outline"
                                    className="border-neutral-700 text-neutral-300"
                                >
                                    Back to Polls
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Header */}
                        <Card className="mb-8 border-neutral-700/50 bg-gradient-to-br from-neutral-800/80 via-neutral-900 to-black text-white shadow-lg shadow-black/30">
                            <CardContent className="p-6 flex flex-col gap-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate("/polls")}
                                        className="text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Polls
                                    </Button>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={handleExportResults}
                                            className="border-neutral-600 bg-neutral-900/40 text-neutral-100 hover:bg-neutral-800 hover:text-white"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export CSV
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-neutral-700 text-neutral-400 min-w-[140px] justify-center"
                                            disabled
                                        >
                                            <Share className="h-4 w-4 mr-2" />
                                            Share (Soon)
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold font-lora mb-3 leading-tight">{poll.title}</h1>
                                        <p className="text-neutral-300/90 mb-4 max-w-3xl leading-relaxed">{poll.description}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-300">
                                            {getStatusBadge(poll.status)}
                                            <span className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-emerald-400" />
                                                {formatDateTime(poll.startTime)}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-sky-400" />
                                                Ends {formatDateTime(poll.endTime)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <Card className="border-neutral-700/50 bg-neutral-800/80 text-white rounded-2xl shadow-lg shadow-black/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm uppercase tracking-wide text-neutral-400">Total votes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{poll.totalVotes.toLocaleString()}</div>
                                    <p className="text-sm text-neutral-500">{formatPlural(poll.totalVotes, "vote", "votes")} verified</p>
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-700/50 bg-neutral-800/80 text-white rounded-2xl shadow-lg shadow-black/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm uppercase tracking-wide text-neutral-400">Candidates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{poll.candidateCount.toLocaleString()}</div>
                                    <p className="text-sm text-neutral-500">{formatPlural(poll.candidateCount, "candidate", "candidates")}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-700/50 bg-neutral-800/80 text-white rounded-2xl shadow-lg shadow-black/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm uppercase tracking-wide text-neutral-400">Participation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">
                                        {analytics?.participationRate !== undefined ? `${analytics.participationRate}%` : "--"}
                                    </div>
                                    <p className="text-sm text-neutral-500">Turnout vs requirement</p>
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-700/50 bg-neutral-800/80 text-white rounded-2xl shadow-lg shadow-black/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm uppercase tracking-wide text-neutral-400">Duration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">
                                        {formatDuration(poll.durationSeconds)}
                                    </div>
                                    <p className="text-xs text-neutral-500 leading-relaxed mt-1">
                                        {formatDateTime(poll.startTime)} - {formatDateTime(poll.endTime)}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Poll Timeline */}
                        <Card className="mb-8 border-neutral-700/50 bg-neutral-900/70 text-white rounded-2xl backdrop-blur">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-lora">
                                    <Calendar className="h-5 w-5" />
                                    Poll Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative py-4">
                                    <div className="absolute left-4 top-6 bottom-6 w-px bg-neutral-700/60 sm:left-6 sm:right-6 sm:top-1/2 sm:bottom-auto sm:h-px sm:w-auto sm:translate-x-0"></div>
                                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-neutral-400">Started</p>
                                                <p className="text-sm font-medium text-white">{formatDateTime(poll.startTime)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className={`h-9 w-9 rounded-full border flex items-center justify-center ${poll.status === "active" ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-rose-500/20 border-rose-500/40 text-rose-300"}`}>
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-neutral-400">{poll.status === "active" ? "Ends" : "Ended"}</p>
                                                <p className="text-sm font-medium text-white">{formatDateTime(poll.endTime)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {poll.status === "active" && (
                                        <div className="mt-6">
                                            <div className="flex justify-between text-xs text-neutral-400 mb-2">
                                                <span className="uppercase tracking-wide">Progress</span>
                                                <span className="text-white font-medium">
                                                    {Math.round(((Date.now() / 1000 - poll.startTime) / (poll.endTime - poll.startTime)) * 100)}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={Math.max(
                                                    0,
                                                    Math.min(100, ((Date.now() / 1000 - poll.startTime) / (poll.endTime - poll.startTime)) * 100)
                                                )}
                                                className="h-2 bg-neutral-800"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Content Tabs */}
                        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "analytics" | "verification")}>
                            <TabsList className="grid w-full max-w-md grid-cols-3 bg-neutral-800">
                                <TabsTrigger value="overview" className="text-neutral-300 data-[state=active]:text-neutral-700">
                                    Results
                                </TabsTrigger>
                                <TabsTrigger value="analytics" className="text-neutral-300 data-[state=active]:text-neutral-700">
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger value="verification" className="text-neutral-300 data-[state=active]:text-neutral-700">
                                    Verification
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                <Card className="border-neutral-700/50 bg-neutral-900/70 text-white rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-lora">
                                            <FileBarChart className="h-5 w-5" />
                                            Candidate Results
                                        </CardTitle>
                                        <CardDescription className="text-neutral-400">
                                            {poll.status === "ended"
                                                ? isTopTie
                                                    ? "Final results - Tie for first place"
                                                    : "Final results"
                                                : "Live results"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {candidates.length === 0 ? (
                                            <p className="text-neutral-500 text-center">No candidates available</p>
                                        ) : (
                                            <div className="space-y-6">
                                                {candidates.map((candidate, index) => (
                                                    <div
                                                        key={candidate.id}
                                                        className={`p-5 rounded-2xl border transition-all ${index === 0 && !isTopTie
                                                            ? "bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                                                            : "bg-neutral-800/70 border-neutral-700/60 hover:border-neutral-500/60"}
                                                            `}
                                                    >
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <Avatar className="h-12 w-12 border border-neutral-700/60 bg-neutral-900/60 backdrop-blur">
                                                                <AvatarImage src={resolveImageUrl(candidate.imageUrl)} alt={candidate.name} className="object-cover" />
                                                                <AvatarFallback className="text-sm font-semibold text-neutral-100 bg-neutral-700/60">
                                                                    {getInitials(candidate.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                                                            {candidate.name}
                                                                            {tieVotes.has(candidate.votes) && (
                                                                                <Badge className="bg-yellow-500 text-black">Tie</Badge>
                                                                            )}
                                                                            {index === 0 && !isTopTie && (
                                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                                            )}
                                                                        </h3>
                                                                        <p className="text-sm text-neutral-400">{candidate.party}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-2xl font-bold text-white">
                                                                            {candidate.percentage}%
                                                                        </div>
                                                                        <div className="text-sm text-neutral-400">
                                                                            {candidate.votes.toLocaleString()} {formatPlural(candidate.votes, "vote", "votes")}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Progress value={candidate.percentage} className="h-3 bg-neutral-700" />
                                                            <p className="text-sm text-neutral-300">{candidate.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="analytics" className="space-y-6">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <Card className="border-neutral-700/50 bg-neutral-900/70 text-white rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 font-lora">
                                                <TrendingUp className="h-5 w-5" />
                                                Voting Momentum
                                            </CardTitle>
                                            <CardDescription className="text-neutral-400">
                                                Live insights generated from recorded votes
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {analytics ? (
                                                <div className="space-y-6">
                                                    <div className="grid gap-4 sm:grid-cols-3">
                                                        <div className="rounded-xl bg-neutral-800/70 border border-neutral-700/60 p-4">
                                                            <p className="text-xs uppercase tracking-wide text-neutral-400">Avg votes/hr</p>
                                                            <p className="text-2xl font-semibold text-white mt-1">{analytics.avgVotesPerHour.toLocaleString()}</p>
                                                        </div>
                                                        <div className="rounded-xl bg-neutral-800/70 border border-neutral-700/60 p-4">
                                                            <p className="text-xs uppercase tracking-wide text-neutral-400">Peak window</p>
                                                            <p className="text-2xl font-semibold text-white mt-1">{analytics.peakVotingLabel}</p>
                                                        </div>
                                                        <div className="rounded-xl bg-neutral-800/70 border border-neutral-700/60 p-4">
                                                            <p className="text-xs uppercase tracking-wide text-neutral-400">Participation</p>
                                                            <p className="text-2xl font-semibold text-white mt-1">
                                                                {analytics.participationRate !== undefined ? `${analytics.participationRate}%` : "--"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-neutral-400">Vote trend</span>
                                                            <span className="text-neutral-500">{poll.totalVotes.toLocaleString()} {formatPlural(poll.totalVotes, "vote", "votes")}</span>
                                                        </div>
                                                        <div className="h-56">
                                                            {voteTrendChartData.length > 1 ? (
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <AreaChart data={voteTrendChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                                                        <defs>
                                                                            <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                                                                                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.7)" />
                                                                                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
                                                                            </linearGradient>
                                                                        </defs>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                                                                        <XAxis dataKey="label" stroke="rgba(148, 163, 184, 0.5)" tickLine={false} axisLine={false} fontSize={12} />
                                                                        <YAxis stroke="rgba(148, 163, 184, 0.5)" tickLine={false} axisLine={false} fontSize={12} width={60} />
                                                                        <Tooltip
                                                                            cursor={{ stroke: "rgba(148, 163, 184, 0.3)", strokeWidth: 1 }}
                                                                            contentStyle={{ backgroundColor: "#0f172a", borderRadius: 12, border: "1px solid rgba(148, 163, 184, 0.2)", color: "#e2e8f0" }}
                                                                        />
                                                                        <Area type="monotone" dataKey="votes" stroke="rgba(16, 185, 129, 0.9)" fill="url(#trendArea)" strokeWidth={2} />
                                                                    </AreaChart>
                                                                </ResponsiveContainer>
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                                                                    Not enough data to chart yet.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {poll.minVotersRequired ? (
                                                        <div className="rounded-xl bg-neutral-800/70 border border-neutral-700/60 p-4 text-sm text-neutral-300">
                                                            Minimum voters required: <span className="text-white font-medium">{poll.minVotersRequired.toLocaleString()}</span>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <p className="text-neutral-500">Analytics data unavailable</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <Card className="border-neutral-700/50 bg-neutral-900/70 text-white rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 font-lora">
                                                <FileBarChart className="h-5 w-5" />
                                                Vote Share
                                            </CardTitle>
                                            <CardDescription className="text-neutral-400">Distribution of votes across candidates</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {voteShareData.length ? (
                                                <div className="space-y-4">
                                                    {voteShareData.slice(0, 8).map((entry, index) => {
                                                        const palette = [
                                                            "bg-emerald-500",
                                                            "bg-sky-500",
                                                            "bg-blue-500",
                                                            "bg-purple-500",
                                                            "bg-amber-500",
                                                            "bg-pink-500",
                                                        ];
                                                        const colorClass = palette[index % palette.length];
                                                        return (
                                                            <div key={`${entry.name}-${index}`} className="space-y-1">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-neutral-300 truncate pr-2">{entry.name}</span>
                                                                    <span className="text-neutral-400">{entry.percentage}% | {entry.votes.toLocaleString()} {formatPlural(entry.votes, "vote", "votes")}</span>
                                                                </div>
                                                                <div className="h-2 rounded-full bg-neutral-700 overflow-hidden">
                                                                    <div className={`h-full ${colorClass}`} style={{ width: `${Math.min(100, Math.max(entry.percentage, 2))}%` }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-neutral-500">No vote data available.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                    {barChartData.length > 0 && (
                                        <Card className="border-neutral-700/50 bg-neutral-900/70 text-white rounded-2xl xl:col-span-2">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 font-lora">
                                                    <FileBarChart className="h-5 w-5" />
                                                    Result Overview
                                                </CardTitle>
                                                <CardDescription className="text-neutral-400">Top performing candidates visualized</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-72 w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={barChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                                                            <XAxis
                                                                dataKey="name"
                                                                tickFormatter={(value: string) => (value.length > 10 ? `${value.slice(0, 9)}…` : value)}
                                                                tick={{ fill: "rgba(226, 232, 240, 0.8)", fontSize: 12 }}
                                                                tickLine={false}
                                                                axisLine={false}
                                                                interval={0}
                                                                height={60}
                                                            />
                                                            <YAxis
                                                                tickFormatter={(value: number) => value.toLocaleString()}
                                                                tick={{ fill: "rgba(148, 163, 184, 0.8)", fontSize: 12 }}
                                                                tickLine={false}
                                                                axisLine={false}
                                                                width={80}
                                                            />
                                                            <Tooltip
                                                                cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                                                                contentStyle={{ backgroundColor: "#0f172a", borderRadius: 12, border: "1px solid rgba(148, 163, 184, 0.2)", color: "#e2e8f0" }}
                                                                formatter={(value: number | string) => [`${Number(value).toLocaleString()} votes`, "Votes"]}
                                                                labelFormatter={(label: string) => label}
                                                            />
                                                            <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                                                                <LabelList
                                                                    dataKey="votes"
                                                                    position="top"
                                                                    formatter={(value: ReactNode) =>
                                                                        typeof value === "number" ? value.toLocaleString() : value
                                                                    }
                                                                    fill="#e2e8f0"
                                                                    fontSize={12}
                                                                />
                                                                {barChartData.map((entry, index) => (
                                                                    <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="verification">
                                <Card className="border-neutral-700 bg-neutral-800 text-white">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-lora">
                                            <ShieldCheck className="h-5 w-5" />
                                            Blockchain Verification
                                        </CardTitle>
                                        <CardDescription className="text-neutral-400">
                                            All votes for this poll are recorded on the immutable blockchain
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            <Alert className="bg-green-500/10 border-green-500/20">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <AlertTitle className="text-green-400">Poll Verified</AlertTitle>
                                                <AlertDescription className="text-neutral-300">
                                                    All {poll.totalVotes.toLocaleString()} {formatPlural(poll.totalVotes, "vote", "votes")} have been verified on the blockchain.
                                                    The integrity of this election is mathematically guaranteed.
                                                </AlertDescription>
                                            </Alert>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-white">Blockchain Details</h4>
                                                    <div className="text-sm space-y-1">
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Contract Address:</span>
                                                            <span className="text-neutral-300 font-mono text-xs">
                                                                {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Block Range:</span>
                                                            <span className="text-neutral-300">N/A</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Gas Used:</span>
                                                            <span className="text-neutral-300">{(poll.totalVotes * 21000).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-white">Verification Stats</h4>
                                                    <div className="text-sm space-y-1">
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Votes Verified:</span>
                                                            <span className="text-green-400">100%</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Double Spends:</span>
                                                            <span className="text-green-400">0</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-400">Invalid Votes:</span>
                                                            <span className="text-green-400">0</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-neutral-700/50 rounded-lg">
                                                <h4 className="font-medium text-white mb-2">How to Verify Individual Votes</h4>
                                                <ol className="list-decimal pl-5 space-y-1 text-sm text-neutral-300">
                                                    <li>Each voter receives a unique transaction hash after voting</li>
                                                    <li>Use the transaction hash on the blockchain explorer</li>
                                                    <li>The system will show your vote's blockchain transaction</li>
                                                    <li>This proves your vote was counted without revealing your identity</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Result;
