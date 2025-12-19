import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReadContract } from "thirdweb/react";
import { contract } from "@/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Clock, Download, Users, Eye, Calendar, Sparkles, BarChart3, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import Loading from "@/components/utils/Loading";
import type { Poll, Candidate } from "@/types";
import { getDerivedPollStatus } from "@/lib/poll-status";
import {
    formatPlural,
    formatCountLabel,
    formatCompactNumber,
    formatDate,
    getStatusBadge
} from "@/lib/poll-helpers";

type PollResultEntry = Poll & {
    results: Array<{
        name: string;
        party: string;
        votes: number;
        percentage: number;
        isTie?: boolean;
        rank?: number;
    }>;
};

type PollResultsFetcherProps = {
    pollId: bigint;
    onComplete: (pollId: string, poll: PollResultEntry | null) => void;
    onError: (pollId: string, details: {
        pollError?: unknown;
        resultsError?: unknown;
        candidatesError?: unknown;
    }) => void;
};

const PollResultsFetcher = ({ pollId, onComplete, onError }: PollResultsFetcherProps) => {
    const poll = useReadContract({
        contract,
        method:
            "function getPoll(uint256 pollId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint8 status, uint256 totalVotes, uint256 candidateCountOut, uint256 minVotersRequired)",
        params: [pollId],
        queryOptions: { refetchInterval: 15000 },
    });

    const results = useReadContract({
        contract,
        method: "function getPollResults(uint256 pollId) view returns (uint256[] candidateIds, uint256[] votes)",
        params: [pollId],
        queryOptions: { enabled: !poll.error, refetchInterval: 15000 },
    });

    const candidates = useReadContract({
        contract,
        method:
            "function getCandidateDetailsForPoll(uint256 pollId) view returns (uint256[] ids, string[] names, string[] parties, string[] imageUrls, string[] descriptions, bool[] isActiveList)",
        params: [pollId],
        queryOptions: { enabled: !poll.error, refetchInterval: 15000 },
    });

    useEffect(() => {
        if (poll.isPending || results.isPending || candidates.isPending) {
            return;
        }

        if (poll.error || results.error || candidates.error) {
            onError(pollId.toString(), {
                pollError: poll.error,
                resultsError: results.error,
                candidatesError: candidates.error,
            });
            onComplete(pollId.toString(), null);
            return;
        }

        if (!poll.data || !results.data || !candidates.data) {
            onComplete(pollId.toString(), null);
            return;
        }

        const startTime = Number(poll.data[3]);
        const endTime = Number(poll.data[4]);
        const contractStatus = Number(poll.data[5]);

        const pollObj: Poll = {
            id: poll.data[0].toString(),
            title: poll.data[1],
            description: poll.data[2],
            startTime,
            endTime,
            startDate: new Date(startTime * 1000).toISOString(),
            endDate: new Date(endTime * 1000).toISOString(),
            contractStatus,
            status: getDerivedPollStatus(startTime, endTime, contractStatus),
            totalVotes: Number(poll.data[6]),
            candidateCount: Number(poll.data[7]),
            createdTime: startTime,
            isEligible: true,
            hasVoted: false,
            minVotersRequired: Number(poll.data[8] ?? 0) || undefined,
            durationSeconds: Math.max(0, endTime - startTime),
        };

        const candidateIds = Array.isArray(results.data[0]) ? results.data[0] : [];
        const votes = Array.isArray(results.data[1]) ? results.data[1] : [];

        const candidateIdsList = Array.isArray(candidates.data[0]) ? candidates.data[0] : [];
        const candidateNames = Array.isArray(candidates.data[1]) ? candidates.data[1] : [];
        const candidateParties = Array.isArray(candidates.data[2]) ? candidates.data[2] : [];
        const candidateImages = Array.isArray(candidates.data[3]) ? candidates.data[3] : [];
        const candidateDescriptions = Array.isArray(candidates.data[4]) ? candidates.data[4] : [];
        const candidateActive = Array.isArray(candidates.data[5]) ? candidates.data[5] : [];

        const candidatesList: Candidate[] = candidateIdsList
            .map((id, idx) => {
                const voteIndex = candidateIds.findIndex((cid) => cid === id);
                const voteCount = voteIndex >= 0 ? Number(votes[voteIndex]) : 0;
                const percentage = pollObj.totalVotes > 0 ? Number(((voteCount / pollObj.totalVotes) * 100).toFixed(1)) : 0;

                return {
                    id: id.toString(),
                    name: candidateNames[idx] ?? "",
                    party: candidateParties[idx] ?? "",
                    imageUrl: candidateImages[idx] || "/placeholder.svg",
                    description: candidateDescriptions[idx] ?? "",
                    isActive: candidateActive[idx] ?? false,
                    votes: voteCount,
                    percentage,
                    pollId: pollObj.id,
                    pollTitle: pollObj.title,
                };
            })
            .filter((candidate) => candidate.isActive)
            .sort((a, b) => b.votes - a.votes);

        const tieCounts = new Map<number, number>();
        candidatesList.forEach((candidate) => {
            tieCounts.set(candidate.votes, (tieCounts.get(candidate.votes) ?? 0) + 1);
        });

        const tieVotes = new Set<number>();
        tieCounts.forEach((count, votes) => {
            if (count > 1 && votes > 0) {
                tieVotes.add(votes);
            }
        });

        const pollWithResults: PollResultEntry = {
            ...pollObj,
            results: candidatesList.map((candidate, index) => ({
                name: candidate.name,
                party: candidate.party,
                votes: candidate.votes,
                percentage: candidate.percentage,
                isTie: tieVotes.has(candidate.votes),
                rank: index + 1,
            })),
        };

        onComplete(pollId.toString(), pollWithResults);
    }, [
        pollId,
        poll.data,
        poll.error,
        poll.isPending,
        results.data,
        results.error,
        results.isPending,
        candidates.data,
        candidates.error,
        candidates.isPending,
        onComplete,
        onError,
    ]);

    return null;
};

export const Results = () => {
    const navigate = useNavigate();
    const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "ended">("all");
    const [selectedYear, setSelectedYear] = useState<string>("all");
    const [pollResultsMap, setPollResultsMap] = useState<Record<string, PollResultEntry>>({});
    const [processedPollIds, setProcessedPollIds] = useState<Set<string>>(() => new Set());
    const pollErrorTracker = useRef(new Set<string>());

    const { data: pollIdsData, isPending: isLoadingPollIds, error: pollIdsError } = useReadContract({
        contract,
        method: "function getAllPolls() view returns (uint256[])",
        params: [],
    });

    useEffect(() => {
        if (pollIdsError) {
            console.error("Failed to fetch poll IDs:", pollIdsError);
            toast.error("Failed to load polls from contract");
        }
    }, [pollIdsError]);

    const pollIdsToFetch = useMemo(() => {
        if (!Array.isArray(pollIdsData)) {
            return [] as bigint[];
        }
        return pollIdsData.map((id) => (typeof id === "bigint" ? id : BigInt(id)));
    }, [pollIdsData]);

    const refreshStoredStatuses = useCallback(() => {
        setPollResultsMap((prev) => {
            let changed = false;
            const next: Record<string, PollResultEntry> = {};

            Object.entries(prev).forEach(([id, poll]) => {
                const status = getDerivedPollStatus(poll.startTime, poll.endTime, poll.contractStatus);
                if (status !== poll.status) {
                    changed = true;
                    next[id] = { ...poll, status };
                } else {
                    next[id] = poll;
                }
            });

            return changed ? next : prev;
        });
    }, []);

    useEffect(() => {
        refreshStoredStatuses();
        if (typeof window === "undefined") {
            return;
        }
        const interval = window.setInterval(refreshStoredStatuses, 15000);
        return () => window.clearInterval(interval);
    }, [refreshStoredStatuses]);

    const handlePollComplete = useCallback(
        (pollId: string, poll: PollResultEntry | null) => {
            setProcessedPollIds((prev) => {
                const next = new Set(prev);
                next.add(pollId);
                return next;
            });

            if (poll) {
                setPollResultsMap((prev) => ({ ...prev, [pollId]: poll }));
                pollErrorTracker.current.delete(pollId);
                return;
            }

            setPollResultsMap((prev) => {
                if (!(pollId in prev)) {
                    return prev;
                }
                const updated = { ...prev };
                delete updated[pollId];
                return updated;
            });
        },
        []
    );

    const handlePollError = useCallback(
        (pollId: string, details: { pollError?: unknown; resultsError?: unknown; candidatesError?: unknown }) => {
            if (pollErrorTracker.current.has(pollId)) {
                return;
            }
            pollErrorTracker.current.add(pollId);
            console.warn(`Failed to load complete data for poll ${pollId}:`, details);
            toast.error(`Failed to load poll ${pollId}`);
        },
        []
    );

    const pollsWithResults = useMemo(() => {
        return pollIdsToFetch
            .map((id) => pollResultsMap[id.toString()])
            .filter((poll): poll is PollResultEntry => !!poll)
            .map((poll) => ({
                ...poll,
                status: getDerivedPollStatus(poll.startTime, poll.endTime, poll.contractStatus),
            }))
            .sort((a, b) => b.endTime - a.endTime);
    }, [pollIdsToFetch, pollResultsMap]);

    const availableYears = useMemo(() => {
        const years = new Set<string>();
        pollsWithResults.forEach((poll) => {
            const year = new Date(poll.endDate).getFullYear();
            if (!Number.isNaN(year)) {
                years.add(year.toString());
            }
        });
        return Array.from(years).sort((a, b) => Number(b) - Number(a));
    }, [pollsWithResults]);

    const handleExportPoll = useCallback((poll: PollResultEntry) => {
        try {
            const data = {
                id: poll.id,
                title: poll.title,
                description: poll.description,
                startDate: poll.startDate,
                endDate: poll.endDate,
                status: poll.status,
                totalVotes: poll.totalVotes,
                candidates: poll.results,
                exportedAt: new Date().toISOString(),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `poll-${poll.id}-results.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success(`Exported poll ${poll.id}`);
        } catch (e) {
            console.error("Failed to export poll", e);
            toast.error("Failed to export poll");
        }
    }, []);

    const pollsMatchingYear = useMemo(() => {
        return pollsWithResults.filter((poll) => {
            const pollYear = new Date(poll.endDate).getFullYear().toString();
            return selectedYear === "all" || pollYear === selectedYear;
        });
    }, [pollsWithResults, selectedYear]);

    const filteredPolls = useMemo(() => {
        if (selectedFilter === "all") {
            return pollsMatchingYear;
        }
        return pollsMatchingYear.filter((poll) => poll.status === selectedFilter);
    }, [pollsMatchingYear, selectedFilter]);

    const summaryStats = useMemo(() => {
        const activeCount = pollsMatchingYear.filter((poll) => poll.status === "active").length;
        const endedCount = pollsMatchingYear.filter((poll) => poll.status === "ended").length;
        const totalVotes = pollsMatchingYear.reduce((sum, poll) => sum + poll.totalVotes, 0);
        const totalCandidates = pollsMatchingYear.reduce((sum, poll) => sum + poll.candidateCount, 0);
        return { activeCount, endedCount, totalVotes, totalCandidates };
    }, [pollsMatchingYear]);

    const summaryCards = useMemo(() => (
        [
            {
                label: formatPlural(summaryStats.activeCount, "Active poll", "Active polls"),
                value: formatCompactNumber(summaryStats.activeCount),
                description: "Currently open for voting",
                icon: Sparkles,
            },
            {
                label: formatPlural(summaryStats.endedCount, "Completed poll", "Completed polls"),
                value: formatCompactNumber(summaryStats.endedCount),
                description: "Finalized on-chain",
                icon: BarChart3,
            },
            {
                label: "Total votes",
                value: summaryStats.totalVotes.toLocaleString(),
                description: "Across all matching polls",
                icon: Download,
            },
            {
                label: formatPlural(summaryStats.totalCandidates, "Candidate", "Candidates"),
                value: formatCompactNumber(summaryStats.totalCandidates),
                description: "Standing across these polls",
                icon: Users,
            },
        ]
    ), [summaryStats]);

    const isProcessingPolls = pollIdsToFetch.length > 0 && pollIdsToFetch.some((id) => !processedPollIds.has(id.toString()));
    const isLoading = isLoadingPollIds || isProcessingPolls;


    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
            <Navbar />
            {pollIdsToFetch.map((pollId) => (
                <PollResultsFetcher
                    key={pollId.toString()}
                    pollId={pollId}
                    onComplete={handlePollComplete}
                    onError={handlePollError}
                />
            ))}
            <main className="relative flex-grow overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_60%)]" />
                <div className="relative container mx-auto max-w-6xl px-6 py-16 sm:py-20">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-[32px] border border-white/10 bg-white/[0.03] py-20 text-neutral-400">
                            <Loading />
                            <p>Loading election results...</p>
                        </div>
                    ) : pollsMatchingYear.length === 0 ? (
                        <Card className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] shadow-[0_60px_120px_-90px_rgba(59,130,246,0.45)]">
                            <CardContent className="space-y-4 px-8 py-12 text-center">
                                <Users className="mx-auto h-12 w-12 text-neutral-400" />
                                <h2 className="text-2xl font-semibold text-white">No poll results available</h2>
                                <p className="text-neutral-400">Adjust filters or check back once ballots close.</p>
                                <Button
                                    onClick={() => navigate("/polls")}
                                    variant="outline"
                                    className="rounded-full border-white/20 bg-white/[0.02] px-6 text-white hover:bg-white/10"
                                >
                                    Back to polls
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <section className="space-y-10">
                                <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-[1px] shadow-[0_80px_160px_-120px_rgba(59,130,246,0.45)] backdrop-blur">
                                    <div className="rounded-[30px] bg-neutral-950/95 px-8 py-10 space-y-8">
                                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="space-y-4 max-w-2xl">
                                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1 text-xs uppercase tracking-[0.35em] text-primary/70">
                                                    Verified tallies
                                                </span>
                                                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl font-lora">Election results overview</h1>
                                                <p className="text-neutral-300">
                                                    {formatCountLabel(pollsMatchingYear.length, "poll result", "poll results")} currently match your filters.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400 justify-between sm:justify-end">
                                                <Clock className="h-4 w-4 text-primary/70" />
                                                <span>Last synced {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                            {summaryCards.map(({ label, value, description, icon: Icon }) => (
                                                <div
                                                    key={label}
                                                    className="rounded-3xl border border-white/10 bg-white/[0.06] px-5 py-6 shadow-[0_30px_80px_-60px_rgba(59,130,246,0.4)]"
                                                >
                                                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-400">
                                                        <span>{label}</span>
                                                        <Icon className="h-4 w-4 text-primary/70" />
                                                    </div>
                                                    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                                                    <p className="mt-2 text-xs text-neutral-400">{description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-12 pt-10">
                                <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as "all" | "active" | "ended")} className="space-y-8">
                                    <div className="flex flex-col gap-4 sm:gap-3 md:flex-row md:items-center md:justify-between px-4 sm:px-6">
                                        <TabsList className="flex w-full flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 sm:flex-nowrap sm:justify-start md:w-auto">
                                            <TabsTrigger
                                                value="all"
                                                className="flex-1 min-w-[80px] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-center text-neutral-300 transition data-[state=active]:bg-primary/25 data-[state=active]:text-white sm:flex-initial"
                                            >
                                                All ({formatCountLabel(pollsMatchingYear.length, "result", "results")})
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="active"
                                                className="flex-1 min-w-[80px] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-center text-neutral-300 transition data-[state=active]:bg-primary/25 data-[state=active]:text-white sm:flex-initial"
                                            >
                                                Active ({formatCountLabel(summaryStats.activeCount, "result", "results")})
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="ended"
                                                className="flex-1 min-w-[80px] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-center text-neutral-300 transition data-[state=active]:bg-primary/25 data-[state=active]:text-white sm:flex-initial"
                                            >
                                                Completed ({formatCountLabel(summaryStats.endedCount, "result", "results")})
                                            </TabsTrigger>
                                        </TabsList>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mt-10 md:mt-0">
                                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                                <SelectTrigger className="w-full rounded-lg border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs sm:text-sm text-neutral-200 sm:w-36 md:w-44">
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg border border-white/[0.08] bg-neutral-950/95 text-white max-h-[200px] overflow-y-auto">
                                                    <SelectItem value="all">All years</SelectItem>
                                                    {availableYears.map((year) => (
                                                        <SelectItem key={year} value={year}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-lg border-white/15 bg-white/[0.03] text-neutral-300 hover:bg-white/10 h-8 w-8 sm:h-9 sm:w-9"
                                                disabled
                                            >
                                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <TabsContent value={selectedFilter}>
                                        <div className="space-y-6">
                                            {filteredPolls.length === 0 ? (
                                                <Card className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.02] text-center">
                                                    <CardContent className="px-8 py-10">
                                                        <p className="text-neutral-400">No polls match the selected filters.</p>
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                filteredPolls.map((poll) => {
                                                    const topCandidate = poll.results[0];
                                                    const hasTopCandidate = Boolean(topCandidate);
                                                    const hasVotes = poll.totalVotes > 0;
                                                    const isTieForFirst = Boolean(topCandidate?.isTie);
                                                    const showOutcomeBanner = poll.status === "ended" && hasTopCandidate && hasVotes;
                                                    const winnerVoteLabel = hasTopCandidate
                                                        ? `${topCandidate.votes.toLocaleString()} ${formatPlural(topCandidate.votes, "vote", "votes")}`
                                                        : "";
                                                    const winnerPercentLabel = hasTopCandidate ? `${topCandidate.percentage}%` : "--";
                                                    const winnerName = hasTopCandidate ? topCandidate.name : "--";

                                                    return (
                                                        <Card
                                                            key={poll.id}
                                                            className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_60px_120px_-90px_rgba(59,130,246,0.45)] transition hover:border-primary/40 hover:bg-primary/5"
                                                    >
                                                        <CardHeader className="pb-4">
                                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                                <div>
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <CardTitle className="text-sm sm:text-xl font-lora text-white">{poll.title}</CardTitle>
                                                                        {getStatusBadge(poll.status)}
                                                                    </div>
                                                                    <CardDescription className="mt-2 text-sm text-neutral-300">{poll.description}</CardDescription>
                                                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                                                                        <span className="flex items-center gap-2">
                                                                            <Calendar className="h-4 w-4 text-primary/70" />
                                                                            Ends {formatDate(poll.endDate)}
                                                                        </span>
                                                                        <span className="flex items-center gap-2">
                                                                            <Users className="h-4 w-4 text-primary/70" />
                                                                            {poll.totalVotes.toLocaleString()} {formatPlural(poll.totalVotes, "vote", "votes")}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                                                    <Button
                                                                        onClick={() => navigate(`/polls/${poll.id}/results`)}
                                                                        className="rounded-xl bg-primary/90 px-5 py-2 text-white transition hover:bg-primary"
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View details
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="rounded-xl border-white/15 bg-white/[0.03] hover:text-white text-neutral-300 hover:bg-white/10"
                                                                        onClick={() => handleExportPoll(poll)}
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4 pb-6">
                                                            {showOutcomeBanner && (
                                                                <div
                                                                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isTieForFirst ? "border-yellow-400/60 bg-yellow-500/10" : "border-emerald-400/40 bg-emerald-500/10"}`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        {isTieForFirst ? (
                                                                            <Badge className="bg-yellow-500 text-black">Tie</Badge>
                                                                        ) : (
                                                                            <CheckCircle className="h-5 w-5 text-emerald-300" />
                                                                        )}
                                                                        <div>
                                                                            <p className="text-sm font-medium text-white">
                                                                                {isTieForFirst ? "Top spot tied" : `${winnerName} wins`}
                                                                            </p>
                                                                            <p className="text-xs text-neutral-300">
                                                                                {isTieForFirst
                                                                                    ? "Multiple candidates share the highest vote count."
                                                                                    : `${winnerVoteLabel} • ${winnerPercentLabel} of total votes`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {!isTieForFirst && (
                                                                        <Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/15 text-emerald-100">
                                                                            Winner
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-semibold text-white text-sm sm:text-lg">Leading candidates</h4>
                                                                {poll.results.some((candidate) => candidate.isTie) && (
                                                                    <Badge className="rounded-full border border-yellow-400/60 bg-yellow-500/20 px-3 py-1 text-xs text-yellow-200">
                                                                        Tie detected
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="space-y-4">
                                                                {poll.results.slice(0, 3).map((candidate, index) => {
                                                                    const topTie = poll.results.length > 0 && poll.results[0].isTie;
                                                                    const indicatorColor = topTie
                                                                        ? "bg-neutral-500"
                                                                        : index === 0
                                                                            ? "bg-emerald-500"
                                                                            : index === 1
                                                                                ? "bg-sky-500"
                                                                                : "bg-amber-500";
                                                                    return (
                                                                        <div key={`${candidate.name}-${index}`} className="space-y-2">
                                                                            <div className="flex items-center justify-between gap-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`h-3 w-3 rounded-full ${indicatorColor}`} />
                                                                                    <span className="font-medium text-white text-xs sm:text-lg">{candidate.name}</span>
                                                                                    {candidate.isTie && <Badge className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-200">Tie</Badge>}
                                                                                    <Badge variant="outline" className="border-white/15 text-xs text-neutral-300">
                                                                                        {candidate.party}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <div className="font-semibold text-white">{candidate.percentage}%</div>
                                                                                    <div className="text-xs text-neutral-400">
                                                                                        {candidate.votes.toLocaleString()} {formatPlural(candidate.votes, "vote", "votes")}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <Progress value={candidate.percentage} className="h-2 bg-white/10" />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                                })
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </section>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );

};

export default Results;
