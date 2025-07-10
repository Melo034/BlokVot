import { useState, useEffect, useMemo, type JSX } from "react";
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

// Custom hook for dynamic poll discovery
const usePollDiscovery = (maxPolls: number = 10) => {
    const [discoveredPollIds, setDiscoveredPollIds] = useState<bigint[]>([]);
    const [currentPollId, setCurrentPollId] = useState(1);
    const [isDiscovering, setIsDiscovering] = useState(true);
    const [consecutiveFailures, setConsecutiveFailures] = useState(0);

    // Check one poll at a time
    const { data: pollData, isPending, error } = useReadContract({
        contract,
        method: "function getPoll(uint256 pollId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint8 status, uint256 totalVotes, uint256 candidateCountOut, uint256 minVotersRequired)",
        params: [BigInt(currentPollId)],
        queryOptions: {
            enabled: isDiscovering && currentPollId <= maxPolls,
        }
    });

    useEffect(() => {
        if (!isDiscovering || isPending) return;

        if (pollData && !error) {
            // Poll exists, add it to discovered list
            setDiscoveredPollIds(prev => {
                if (!prev.includes(BigInt(currentPollId))) {
                    return [...prev, BigInt(currentPollId)].sort((a, b) => Number(a) - Number(b));
                }
                return prev;
            });
            setConsecutiveFailures(0);
        } else {
            // Poll doesn't exist
            setConsecutiveFailures(prev => prev + 1);
        }

        // Move to next poll
        if (currentPollId < maxPolls && consecutiveFailures < 3) {
            setCurrentPollId(prev => prev + 1);
        } else {
            // Done discovering
            setIsDiscovering(false);
        }
    }, [pollData, error, isPending, currentPollId, maxPolls, consecutiveFailures, isDiscovering]);

    return {
        pollIds: discoveredPollIds,
        isDiscovering,
        currentlyChecking: isDiscovering ? currentPollId : null,
        totalFound: discoveredPollIds.length
    };
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

// Hook to fetch poll data with error handling
const usePollData = (pollId: bigint | null) => {
    const poll = useReadContract({
        contract,
        method:
            "function getPoll(uint256 pollId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint8 status, uint256 totalVotes, uint256 candidateCountOut, uint256 minVotersRequired)",
        params: [pollId || BigInt(0)],
        queryOptions: { enabled: !!pollId },
    });

    const results = useReadContract({
        contract,
        method: "function getPollResults(uint256 pollId) view returns (uint256[] candidateIds, uint256[] votes)",
        params: [pollId || BigInt(0)],
        queryOptions: { enabled: !!pollId && !poll.error },
    });

    const candidates = useReadContract({
        contract,
        method:
            "function getCandidateDetailsForPoll(uint256 pollId) view returns (uint256[] ids, string[] names, string[] parties, string[] imageUrls, string[] descriptions, bool[] isActiveList)",
        params: [pollId || BigInt(0)],
        queryOptions: { enabled: !!pollId && !poll.error },
    });

    return { poll, results, candidates };
};

export const Results = () => {
    const navigate = useNavigate();
    const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "ended">("all");
    const [selectedYear, setSelectedYear] = useState<string>("2025");
    const [availablePollIds, setAvailablePollIds] = useState<bigint[]>([]);
    const [hasShownErrors, setHasShownErrors] = useState(new Set<string>());

    // Use custom hook for dynamic poll discovery
    const { pollIds: discoveredPollIds, isDiscovering, totalFound } = usePollDiscovery(20);

    // Update available poll IDs when discovery completes
    useEffect(() => {
        if (!isDiscovering && discoveredPollIds.length > 0) {
            setAvailablePollIds(discoveredPollIds);
            console.log(`Discovered ${totalFound} polls:`, discoveredPollIds.map(id => id.toString()));
        }
    }, [isDiscovering, discoveredPollIds, totalFound]);

    // Fetch data for all available polls
    const poll1Data = usePollData(availablePollIds[0] || null);
    const poll2Data = usePollData(availablePollIds[1] || null);
    const poll3Data = usePollData(availablePollIds[2] || null);
    const poll4Data = usePollData(availablePollIds[3] || null);
    const poll5Data = usePollData(availablePollIds[4] || null);

    // Combine all poll data
    const allPollsData = useMemo(() => {
        const polls = [poll1Data, poll2Data, poll3Data, poll4Data, poll5Data];
        return polls
            .map((pollData, index) => ({
                ...pollData,
                pollId: availablePollIds[index],
            }))
            .filter(item => item.pollId !== undefined);
    }, [poll1Data, poll2Data, poll3Data, poll4Data, poll5Data, availablePollIds]);

    // Process polls with error handling
    const pollsWithResults = useMemo(() => {
        return allPollsData
            .map(({ poll, results, candidates, pollId }) => {
                // Skip if any data is still loading
                if (poll.isPending || results.isPending || candidates.isPending) {
                    return null;
                }

                // Handle errors gracefully
                if (poll.error || results.error || candidates.error) {
                    const errorKey = `poll-${pollId}`;
                    if (!hasShownErrors.has(errorKey)) {
                        console.warn(`Failed to load complete data for poll ${pollId}:`, {
                            pollError: poll.error,
                            resultsError: results.error,
                            candidatesError: candidates.error,
                        });

                        // Only show error toast if it's a critical error, not just missing data
                        if (poll.error) {
                            toast.error(`Failed to load poll ${pollId}`);
                        }

                        setHasShownErrors(prev => new Set(prev).add(errorKey));
                    }
                    return null;
                }

                // Skip if no data available
                if (!poll.data || !results.data || !candidates.data) {
                    return null;
                }

                const now = Date.now() / 1000;
                const startTime = Number(poll.data[3]);
                const endTime = Number(poll.data[4]);

                const pollObj: Poll = {
                    id: poll.data[0].toString(),
                    title: poll.data[1],
                    description: poll.data[2],
                    startTime,
                    endTime,
                    startDate: new Date(startTime * 1000).toISOString(),
                    endDate: new Date(endTime * 1000).toISOString(),
                    contractStatus: Number(poll.data[5]),
                    status: now >= endTime ? "ended" : now >= startTime ? "active" : "upcoming",
                    totalVotes: Number(poll.data[6]),
                    candidateCount: Number(poll.data[7]),
                    createdTime: startTime,
                    isEligible: true,
                    hasVoted: false,
                };

                const candidatesList: Candidate[] = candidates.data[0]
                    .map((id, idx) => ({
                        id: id.toString(),
                        name: candidates.data[1][idx],
                        party: candidates.data[2][idx],
                        imageUrl: candidates.data[3][idx] || "/placeholder.svg",
                        description: candidates.data[4][idx],
                        isActive: candidates.data[5][idx],
                        votes: Number(results.data[1][results.data[0].findIndex((cid) => cid === id)] || 0),
                        percentage: pollObj.totalVotes > 0
                            ? Number(((Number(results.data[1][results.data[0].findIndex((cid) => cid === id)] || 0) / pollObj.totalVotes) * 100).toFixed(1))
                            : 0,
                        pollId: pollObj.id,
                        pollTitle: pollObj.title,
                    }))
                    .filter(c => c.isActive)
                    .sort((a, b) => b.votes - a.votes);

                return {
                    ...pollObj,
                    results: candidatesList.map(c => ({
                        name: c.name,
                        party: c.party,
                        votes: c.votes,
                        percentage: c.percentage,
                    })),
                };
            })
            .filter((p): p is NonNullable<typeof p> => p !== null);
    }, [allPollsData, hasShownErrors]);

    // Filter polls based on status and year
    const filteredPolls = useMemo(() => {
        return pollsWithResults.filter(poll => {
            const pollYear = new Date(poll.endDate).getFullYear().toString();
            if (selectedYear !== "all" && pollYear !== selectedYear) return false;
            if (selectedFilter === "all") return true;
            return poll.status === selectedFilter;
        });
    }, [pollsWithResults, selectedFilter, selectedYear]);

    // Check if still loading (including poll discovery)
    const isLoading = isDiscovering || allPollsData.some(({ poll, results, candidates }) =>
        poll.isPending || results.isPending || candidates.isPending
    );

    // Handle view details
    const handleViewDetails = (pollId: string) => {
        navigate(`/polls/${pollId}/results`);
    };

    // Handle CSV export for a poll
    const handleExportPoll = (poll: typeof pollsWithResults[0]) => {
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
                                <p className="text-neutral-500">No polls found</p>
                                <div className="text-sm space-y-1">
                                    <p className="text-neutral-600">
                                        Checked poll IDs 1-10: Found {totalFound} polls
                                    </p>
                                    {totalFound > 0 ? (
                                        <>
                                            <p className="text-neutral-600">
                                                Poll IDs: {discoveredPollIds.map(id => id.toString()).join(', ')}
                                            </p>
                                            <p className="text-orange-400">
                                                Polls found but couldn't load complete data (missing results or candidates)
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-neutral-600">
                                            No polls exist yet or they have different ID numbers
                                        </p>
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
                                                        </div>
                                                        <div className="space-y-3">
                                                            {poll.results.slice(0, 3).map((candidate, index) => (
                                                                <div key={index} className="space-y-2">
                                                                    <div className="flex justify-between items-center">
                                                                        <div className="flex items-center gap-2">
                                                                            <div
                                                                                className={`w-3 h-3 rounded-full ${index === 0
                                                                                    ? "bg-green-500"
                                                                                    : index === 1
                                                                                        ? "bg-blue-500"
                                                                                        : "bg-yellow-500"
                                                                                    }`}
                                                                            />
                                                                            <span className="font-medium text-white">{candidate.name}</span>
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
                                                            ))}
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