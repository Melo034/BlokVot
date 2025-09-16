import { useState, useEffect, useMemo, useCallback, useRef, type JSX } from "react";
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
import { Clock, Download, Users, Eye, Calendar, Sparkles, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import Loading from "@/components/utils/Loading";
import type { Poll, Candidate } from "@/types";
import { getDerivedPollStatus } from "@/lib/poll-status";

const toNumber = (value: number | bigint): number => (typeof value === "bigint" ? Number(value) : value);

const formatPlural = (count: number | bigint, singular: string, plural?: string): string => {
    const numeric = Math.abs(toNumber(count));
    const label = numeric <= 1 ? singular : plural ?? `${singular}s`;
    return label;
};

const formatCountLabel = (count: number | bigint, singular: string, plural?: string): string => {
    const numeric = toNumber(count);
    return `${numeric.toLocaleString()} ${formatPlural(numeric, singular, plural)}`;
};

const formatCompactNumber = (value: number | bigint): string => {
    const numeric = toNumber(value);
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(numeric);
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const getStatusBadge = (status: "upcoming" | "active" | "ended"): JSX.Element => {
    switch (status) {
        case "active":
            return <Badge className="bg-emerald-500/80 text-white">Active</Badge>;
        case "ended":
            return <Badge variant="outline" className="border-neutral-700 text-neutral-400">Ended</Badge>;
        default:
            return <Badge className="bg-sky-500/80 text-white">Upcoming</Badge>;
    }
};

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
        <div className="bg-neutral-950 min-h-screen flex flex-col text-white">
            <Navbar />
            {pollIdsToFetch.map((pollId) => (
                <PollResultsFetcher
                    key={pollId.toString()}
                    pollId={pollId}
                    onComplete={handlePollComplete}
                    onError={handlePollError}
                />
            ))}
            <main className="flex-grow">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
                    {isLoading ? (
                        <Card className="text-center p-10 bg-neutral-900/70 border-neutral-800 rounded-3xl">
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <Loading />
                                    <p className="text-neutral-400">Loading election results...</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : pollsMatchingYear.length === 0 ? (
                        <Card className="text-center p-10 bg-neutral-900/70 border-neutral-800 rounded-3xl">
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <Users className="h-12 w-12 text-neutral-500/60" />
                                    <p className="text-neutral-400">No poll results available.</p>
                                    <Button onClick={() => navigate("/polls")} variant="outline" className="border-neutral-700 text-neutral-100">
                                        Back to polls
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card className=" border-neutral-700/50 bg-gradient-to-br from-neutral-800/80 via-neutral-900 to-black text-white shadow-lg shadow-black/30 rounded-3xl">
                                <CardContent className="p-8 flex flex-col gap-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-2">
                                            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
                                                Tamper-proof tallies
                                            </p>
                                            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100 font-lora">Election results overview</h1>
                                            <p className="text-neutral-400 max-w-2xl">
                                                {formatCountLabel(pollsMatchingYear.length, "poll result", "poll results")} available for your filters.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-neutral-400 text-sm">
                                            <Clock className="h-5 w-5" />
                                            <span>Last updated {new Date().toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {summaryCards.map(({ label, value, description, icon: Icon }) => (
                                            <div key={label} className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur p-4 shadow-lg shadow-black/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
                                                    <Icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <p className="text-2xl font-semibold text-white">{value}</p>
                                                <p className="text-xs text-neutral-500 mt-1">{description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as "all" | "active" | "ended")} className="space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <TabsList className="bg-neutral-900/60  border border-neutral-800 rounded-full p-1 w-full sm:w-auto">
                                        <TabsTrigger value="all" className="rounded-full px-4 text-white data-[state=active]:bg-primary/80 data-[state=active]:text-white">
                                            All  ({formatCountLabel(pollsMatchingYear.length, "result", "results")})
                                        </TabsTrigger>
                                        <TabsTrigger value="active" className="rounded-full px-4 text-white data-[state=active]:bg-primary/80 data-[state=active]:text-white">
                                            Active ({formatCountLabel(summaryStats.activeCount, "result", "results")})
                                        </TabsTrigger>
                                        <TabsTrigger value="ended" className="rounded-full px-4 text-white data-[state=active]:bg-primary/80 data-[state=active]:text-white">
                                            Completed ({formatCountLabel(summaryStats.endedCount, "result", "results")})
                                        </TabsTrigger>
                                    </TabsList>
                                    <div className="flex items-center gap-2">
                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger className="w-32 bg-neutral-900/70 border-neutral-800 text-white">
                                                <SelectValue placeholder="Year" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-neutral-900/90 border-neutral-800 text-white">
                                                <SelectItem value="all">All Years</SelectItem>
                                                <SelectItem value="2024">2024</SelectItem>
                                                <SelectItem value="2025">2025</SelectItem>
                                                <SelectItem value="2026">2026</SelectItem>
                                                <SelectItem value="2027">2027</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" size="icon" className="border-primary text-primary" disabled>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <TabsContent value={selectedFilter}>
                                    <div className="space-y-6">
                                        {filteredPolls.length === 0 ? (
                                            <Card className="bg-neutral-900/70 border-neutral-800 text-center p-8 rounded-3xl">
                                                <CardContent className="pt-6">
                                                    <p className="text-neutral-400">No polls match the selected filters.</p>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            filteredPolls.map((poll) => (
                                                <Card key={poll.id} className="bg-neutral-900/70 border-neutral-800 rounded-3xl">
                                                    <CardHeader>
                                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <CardTitle className="text-xl text-white font-lora">{poll.title}</CardTitle>
                                                                    {getStatusBadge(poll.status)}
                                                                </div>
                                                                <CardDescription className="text-neutral-400">{poll.description}</CardDescription>
                                                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-400">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="h-4 w-4" />
                                                                        Ends: {formatDate(poll.endDate)}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Users className="h-4 w-4" />
                                                                        {poll.totalVotes.toLocaleString()} {formatPlural(poll.totalVotes, "vote", "votes")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row gap-2">
                                                                <Button onClick={() => navigate(`/polls/${poll.id}/results`)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View details
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    className="border-neutral-700 text-neutral-300"
                                                                    onClick={() => handleExportPoll(poll)}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="font-semibold text-white">Leading candidates</h4>
                                                                {poll.results.some((candidate) => candidate.isTie) && (
                                                                    <Badge variant="secondary" className="bg-yellow-500 text-black border-yellow-400">
                                                                        Tie detected
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="space-y-3">
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
                                                                            <div className="flex justify-between items-center">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className={`w-3 h-3 rounded-full ${indicatorColor}`} />
                                                                                    <span className="font-medium text-white">{candidate.name}</span>
                                                                                    {candidate.isTie && (
                                                                                        <Badge className="bg-yellow-500 text-black">Tie</Badge>
                                                                                    )}
                                                                                    <Badge variant="outline" className="text-xs text-neutral-400">
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
                                                                            <Progress value={candidate.percentage} className="h-2 bg-neutral-800" />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Results;
