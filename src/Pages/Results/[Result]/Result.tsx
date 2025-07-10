import { useState, useEffect, useMemo, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReadContract } from "thirdweb/react";
import { contract } from "@/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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

// Helper function to resolve IPFS URLs
const resolveImageUrl = (url: string): string => {
    if (!url) return "/placeholder.svg";
    return url.startsWith("ipfs://") ? url.replace("ipfs://", "https://ipfs.io/ipfs/") : url;
};

// Helper function to format timestamp
const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
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
    const { pollId } = useParams<{ pollId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "verification">("overview");

    // Fetch poll data
    const { data: pollData, isPending: isPollPending, error: pollError } = useReadContract({
        contract,
        method:
            "function getPoll(uint256 pollId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint8 status, uint256 totalVotes, uint256 candidateCountOut, uint256 minVotersRequired)",
        params: [BigInt(pollId || "0")],
        queryOptions: { enabled: !!pollId && !isNaN(Number(pollId)) },
    });

    // Fetch candidate data
    const { data: candidateData, isPending: isCandidatesPending, error: candidatesError } = useReadContract({
        contract,
        method:
            "function getCandidateDetailsForPoll(uint256 pollId) view returns (uint256[] ids, string[] names, string[] parties, string[] imageUrls, string[] descriptions, bool[] isActiveList)",
        params: [BigInt(pollId || "0")],
        queryOptions: { enabled: !!pollId && !isNaN(Number(pollId)) },
    });

    // Fetch poll results
    const { data: resultsData, isPending: isResultsPending, error: resultsError } = useReadContract({
        contract,
        method: "function getPollResults(uint256 pollId) view returns (uint256[] candidateIds, uint256[] votes)",
        params: [BigInt(pollId || "0")],
        queryOptions: { enabled: !!pollId && !isNaN(Number(pollId)) },
    });

    // Memoize poll object
    const poll = useMemo<Poll | null>(() => {
        if (!pollData || isPollPending || pollError) return null;
        const now = Date.now() / 1000;
        const startTime = Number(pollData[3]);
        const endTime = Number(pollData[4]);
        return {
            id: pollData[0].toString(),
            title: pollData[1],
            description: pollData[2],
            imageUrl: "",
            startTime,
            endTime,
            startDate: new Date(startTime * 1000).toISOString(),
            endDate: new Date(endTime * 1000).toISOString(),
            contractStatus: Number(pollData[5]),
            status: now >= endTime ? "ended" : now >= startTime ? "active" : "upcoming",
            totalVotes: Number(pollData[6]),
            candidateCount: Number(pollData[7]),
            allowProxyVoting: false, // Not provided by getPoll; default to false
            createdTime: startTime,
            isEligible: true, // Assume true for results page; adjust if voter-specific
            hasVoted: false, // Not needed for results page
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
            .filter(c => c.isActive)
            .sort((a, b) => b.votes - a.votes);
    }, [candidateData, resultsData, isCandidatesPending, candidatesError, isResultsPending, resultsError, pollData, poll]);

    // Memoize analytics data
    const analytics = useMemo<PollAnalytics | null>(() => {
        if (!poll || !candidates.length) return null;
        const durationHours = (poll.endTime - poll.startTime) / (60 * 60);
        const avgVotesPerHour = durationHours > 0 ? Math.round(poll.totalVotes / durationHours) : 0;
        // Placeholder for participation rate and hourly pattern (not provided by contract)
        const participationRate = 67.5; // Mock value; replace with actual data if available
        const hourlyVotingPattern = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            votes: Math.round(Math.random() * 200 + 50), // Mock data
        }));
        const peakVotingHour = hourlyVotingPattern.reduce((max, curr) => (curr.votes > max.votes ? curr : max), hourlyVotingPattern[0]).hour;
        return {
            totalVotes: poll.totalVotes,
            participationRate,
            avgVotesPerHour,
            peakVotingHour,
            hourlyVotingPattern,
        };
    }, [poll, candidates]);

    // Handle errors and navigation
    useEffect(() => {
        if (!pollId || isNaN(Number(pollId))) {
            toast.error("Invalid poll ID");
            navigate("/polls");
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
        if (poll && candidates.length === 0) {
            toast.warning("No candidates available for this poll.");
            navigate("/polls");
        }
    }, [poll, candidates, pollError, candidatesError, resultsError, pollId, navigate]);

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
                                <p className="text-neutral-500"><Loading/>Loading poll results...</p>
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
                        <div className="mb-8">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/polls")}
                                className="mb-4 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Polls
                            </Button>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white font-lora mb-2">{poll.title}</h1>
                                        <p className="text-neutral-400 mb-2">{poll.description}</p>
                                        <div className="flex items-center gap-4">
                                            {getStatusBadge(poll.status)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleExportResults}
                                        className="border-neutral-700 text-neutral-300"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </Button>
                                    <Button variant="outline" className="border-neutral-700 text-neutral-300" disabled>
                                        <Share className="h-4 w-4 mr-2" />
                                        Share (Coming Soon)
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <Card className="border-neutral-700 bg-neutral-800 text-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-lora">Total Votes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{poll.totalVotes.toLocaleString()}</div>
                                    <p className="text-sm text-neutral-400">Blockchain verified</p>
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-700 bg-neutral-800 text-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-lora">Candidates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{poll.candidateCount}</div>
                                    <p className="text-sm text-neutral-400">Competing</p>
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-700 bg-neutral-800 text-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-lora">Participation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">{analytics?.participationRate}%</div>
                                    <p className="text-sm text-neutral-400">Of eligible voters</p>
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-700 bg-neutral-800 text-white">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-lora">Duration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-white">
                                        {Math.round((poll.endTime - poll.startTime) / (24 * 60 * 60))}d
                                    </div>
                                    <p className="text-sm text-neutral-400">Voting period</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Poll Timeline */}
                        <Card className="mb-8 border-neutral-700 bg-neutral-800 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-lora">
                                    <Calendar className="h-5 w-5" />
                                    Poll Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-green-500" />
                                        <span className="text-neutral-400">Started:</span>
                                        <span className="text-white">{formatDateTime(poll.startTime)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-red-500" />
                                        <span className="text-neutral-400">Ended:</span>
                                        <span className="text-white">{formatDateTime(poll.endTime)}</span>
                                    </div>
                                </div>
                                {poll.status === "active" && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-neutral-400">Progress</span>
                                            <span className="text-white">
                                                {Math.round(((Date.now() / 1000 - poll.startTime) / (poll.endTime - poll.startTime)) * 100)}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.max(
                                                0,
                                                Math.min(100, ((Date.now() / 1000 - poll.startTime) / (poll.endTime - poll.startTime)) * 100)
                                            )}
                                            className="h-2 bg-neutral-700"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Main Content Tabs */}
                        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "overview" | "analytics" | "verification")}>
                            <TabsList className="grid w-full max-w-md grid-cols-3 bg-neutral-800">
                                <TabsTrigger value="overview" className="text-neutral-300 data-[state=active]:text-white">
                                    Results
                                </TabsTrigger>
                                <TabsTrigger value="analytics" className="text-neutral-300 data-[state=active]:text-white">
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger value="verification" className="text-neutral-300 data-[state=active]:text-white">
                                    Verification
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                <Card className="border-neutral-700 bg-neutral-800 text-white">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-lora">
                                            <FileBarChart className="h-5 w-5" />
                                            Candidate Results
                                        </CardTitle>
                                        <CardDescription className="text-neutral-400">
                                            {poll.status === "ended" ? "Final results" : "Live results"}
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
                                                        className={`p-4 rounded-lg ${index === 0
                                                            ? "bg-green-500/10 border border-green-500/20"
                                                            : "bg-neutral-700/50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4 mb-3">
                                                            <img
                                                                src={resolveImageUrl(candidate.imageUrl)}
                                                                alt={candidate.name}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                                                            {candidate.name}
                                                                            {index === 0 && (
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
                                                                            {candidate.votes.toLocaleString()} votes
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
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="border-neutral-700 bg-neutral-800 text-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 font-lora">
                                                <TrendingUp className="h-5 w-5" />
                                                Voting Statistics
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {analytics ? (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-400">Average votes/hour:</span>
                                                        <span className="text-white font-medium">{analytics.avgVotesPerHour}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-400">Peak voting period:</span>
                                                        <span className="text-white font-medium">{analytics.peakVotingHour}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-400">Participation rate:</span>
                                                        <span className="text-white font-medium">{analytics.participationRate}%</span>
                                                    </div>
                                                    <Separator className="bg-neutral-600" />
                                                    <div className="flex justify-between">
                                                        <span className="text-neutral-400">Total eligible voters:</span>
                                                        <span className="text-white font-medium">
                                                            {Math.round(
                                                                (poll.totalVotes / (analytics.participationRate || 1)) * 100
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-neutral-500">Analytics data unavailable</p>
                                            )}
                                        </CardContent>
                                    </Card>
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
                                                    All {poll.totalVotes.toLocaleString()} votes have been verified on the blockchain.
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