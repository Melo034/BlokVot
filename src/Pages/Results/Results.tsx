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
import {
    Clock,
    Download,
    Users,
    Eye,
    Calendar,
} from "lucide-react";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import Loading from "@/components/utils/Loading";
import type { Poll, Candidate } from "@/types";
import { getDerivedPollStatus } from "@/lib/poll-status";

const toNumber = (value: number | bigint): number => (typeof value === "bigint" ? Number(value) : value);

const formatPlural = (count: number | bigint, singular: string, plural?: string): string => {
    const numeric = Math.abs(toNumber(count));
    const label = numeric === 1 ? singular : plural ?? `${singular}s`;
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

// Helper function to format date
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Helper function to get status badge
const getStatusBadge = (status: "upcoming" | "active" | "ended"): JSX.Element => {
    switch (status) {
        case "active":
            return <Badge className="bg-green-500 text-white">Active</Badge>;
        case "ended":
            return <Badge variant="outline" className="text-neutral-400">Ended</Badge>;
        default:
            return <Badge className="bg-blue-500 text-white">Upcoming</Badge>;
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
        queryOptions: {
            refetchInterval: 15000,
        },
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

        const candidatesList = candidateIdsList
            .map((id, idx) => {
                const voteIndex = candidateIds.findIndex((cid) => cid === id);
                const voteCount = voteIndex >= 0 ? Number(votes[voteIndex]) : 0;
                const percentage = pollObj.totalVotes > 0 ? Number(((voteCount / pollObj.totalVotes) * 100).toFixed(1)) : 0;

                const candidate: Candidate = {
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

                return candidate;
            })
            .sort((a, b) => b.votes - a.votes);

        const pollWithResults: PollResultEntry = {
            ...pollObj,
            results: candidatesList.map((candidate) => ({
                name: candidate.name,
                party: candidate.party,
                votes: candidate.votes,
                percentage: candidate.percentage,
                isTie: false,
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
    const [selectedYear, setSelectedYear] = useState<string>("2025");
    const [pollResultsMap, setPollResultsMap] = useState<Record<string, PollResultEntry>>({});
    const [processedPollIds, setProcessedPollIds] = useState<Set<string>>(() => new Set());
    const pollErrorTracker = useRef(new Set<string>());
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
    }, [setPollResultsMap]);

    const { data: pollIdsData, isPending: isLoadingPollIds, error: pollIdsError } = useReadContract({
        contract,
        method: "function getAllPolls() view returns (uint256[])",
        params: [],
    });

    const pollIdsToFetch = useMemo(() => {
        if (!Array.isArray(pollIdsData)) {
            return [] as bigint[];
        }

        return pollIdsData.map((id) => (typeof id === "bigint" ? id : BigInt(id)));
    }, [pollIdsData]);

    useEffect(() => {
        if (pollIdsError) {
            console.error("Failed to fetch poll IDs:", pollIdsError);
            toast.error("Failed to load polls from contract");
        }
    }, [pollIdsError]);

    useEffect(() => {
        if (!pollIdsToFetch.length) {
            return;
        }

        refreshStoredStatuses();
        if (typeof window === "undefined") {
            return;
        }

        const interval = window.setInterval(refreshStoredStatuses, 15000);
        return () => window.clearInterval(interval);
    }, [pollIdsToFetch.length, refreshStoredStatuses]);

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
        [pollErrorTracker],
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
        [pollErrorTracker],
    );

    const pollsWithResults = useMemo(() => {
        const data = pollIdsToFetch
            .map((id) => pollResultsMap[id.toString()])
            .filter((poll): poll is PollResultEntry => !!poll)
            .map((poll) => {
                const tieVotes = new Map<number, number>();
                poll.results.forEach((candidate) => {
                    tieVotes.set(candidate.votes, (tieVotes.get(candidate.votes) ?? 0) + 1);
                });

                const ties = new Set<number>();
                tieVotes.forEach((count, votes) => {
                    if (count > 1 && votes > 0) {
                        ties.add(votes);
                    }
                });

                const resultsWithTie = poll.results.map((candidate, index) => ({
                    ...candidate,
                    isTie: ties.has(candidate.votes),
                    rank: index + 1,
                }));

                return {
                    ...poll,
                    status: getDerivedPollStatus(poll.startTime, poll.endTime, poll.contractStatus),
                    results: resultsWithTie,
                } satisfies PollResultEntry;
            });

        return data.sort((a, b) => b.endTime - a.endTime);
    }, [pollIdsToFetch, pollResultsMap]);

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

    // Handle view details
    const handleViewDetails = (pollId: string) => {
        navigate(`/polls/${pollId}/results`);
    };

    // Handle CSV export for a poll
    const handleExportPoll = (poll: PollResultEntry) => {
        if (!poll || !poll.results.length) {
            toast.error("No data available to export");
            return;
        }
        const csvContent = [
            ["Candidate", "Party", "Votes", "Percentage"],
            ...poll.results.map(c => [c.name, c.party, c.votes.toString(), `${c.percentage}%`]),
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
        toast.success("Poll results exported as CSV");
    };

    return (
        <div className="bg-neutral-900 min-h-screen flex flex-col">
            <Navbar />
            {pollIdsToFetch.map((pollId) => (
                <PollResultsFetcher
                    key={pollId.toString()}
                    pollId={pollId}
                    onComplete={handlePollComplete}
                    onError={handlePollError}
                />
            ))}
            <main className="container mx-auto max-w-7xl px-4 py-16 sm:py-24 flex-grow">
                {isLoading ? (
                    <Card className="text-center p-8 bg-neutral-800 border-neutral-700">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Loading />
                                <p className="text-neutral-500">
                                    Loading election results...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : pollsWithResults.length === 0 ? (
                    <Card className="text-center p-8 bg-neutral-800 border-neutral-700">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Users className="h-12 w-12 text-neutral-500/50" />
                                <p className="text-neutral-500">No poll results available</p>
                                <div className="text-sm space-y-1">
                                    {pollIdsToFetch.length === 0 ? (
                                        <p className="text-neutral-600">No polls exist yet or they may be hidden.</p>
                                    ) : (
                                        <p className="text-neutral-600">Poll data is not available right now. Please try again later.</p>
                                    )}
                                </div>
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
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white font-lora">Election Results Overview</h1>
                                <p className="text-neutral-400">Comprehensive results from all elections</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-neutral-400" />
                                <span className="text-sm text-neutral-400">Last updated: {new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-neutral-800 border-neutral-700">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-neutral-200 font-lora">Total Active Polls</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white">
                                        {pollsWithResults.filter(p => p.status === "active").length}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-neutral-800 border-neutral-700">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-neutral-200 font-lora">Total Votes Cast</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white">
                                        {pollsWithResults.reduce((sum, poll) => sum + poll.totalVotes, 0).toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-neutral-800 border-neutral-700">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-neutral-200 font-lora">Completed Polls</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white">
                                        {pollsWithResults.filter(p => p.status === "ended").length}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs
                            value={selectedFilter}
                            onValueChange={(value) => setSelectedFilter(value as "all" | "active" | "ended")}
                            className="mb-8"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <TabsList className="grid w-full max-w-md grid-cols-3 bg-neutral-800">
                                    <TabsTrigger value="all" className="text-neutral-300 data-[state=active]:bg-neutral-700">All Results</TabsTrigger>
                                    <TabsTrigger value="active" className="text-neutral-300 data-[state=active]:bg-neutral-700">Active</TabsTrigger>
                                    <TabsTrigger value="ended" className="text-neutral-300 data-[state=active]:bg-neutral-700">Completed</TabsTrigger>
                                </TabsList>
                                <div className="flex items-center gap-2">
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="w-32 bg-neutral-800 border-neutral-700 text-white">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
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
                                        <Card className="bg-neutral-800 border-neutral-700 text-center p-8">
                                            <CardContent className="pt-6">
                                                <p className="text-neutral-500">No polls match the selected filters</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        filteredPolls.map((poll) => (
                                            <Card key={poll.id} className="bg-neutral-800 border-neutral-700">
                                                <CardHeader>
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <CardTitle className="text-xl text-white font-lora">{poll.title}</CardTitle>
                                                                {getStatusBadge(poll.status)}
                                                            </div>
                                                            <CardDescription className="text-neutral-400">{poll.description}</CardDescription>
                                                            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    <span>Ends: {formatDate(poll.endDate)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Users className="h-4 w-4" />
                                                                    <span>{poll.totalVotes.toLocaleString()} votes</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <Button
                                                                onClick={() => handleViewDetails(poll.id)}
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
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
                                                            <h4 className="font-semibold text-white">Leading Candidates</h4>
                                                            {poll.results.some(candidate => candidate.isTie) && (
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
                                                                        ? "bg-green-500"
                                                                        : index === 1
                                                                            ? "bg-blue-500"
                                                                            : "bg-yellow-500";

                                                                return (
                                                                    <div key={`${candidate.name}-${index}`} className="space-y-2">
                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex items-center gap-2">
                                                                                <div
                                                                                    className={`w-3 h-3 rounded-full ${indicatorColor}`}
                                                                                />
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
                                                                                    {candidate.votes.toLocaleString()} votes
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <Progress
                                                                            value={candidate.percentage}
                                                                            className="h-2 bg-neutral-700"
                                                                        />
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
            </main>
            <Footer />
        </div>
    );
};

export default Results;

