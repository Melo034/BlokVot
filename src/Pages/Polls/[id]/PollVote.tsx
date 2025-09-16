import { useState, useEffect, useMemo, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReadContract, useActiveAccount } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { TransactionButton } from "thirdweb/react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, CheckCircle, AlertCircle, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import Loading from "@/components/utils/Loading";
import type { Poll } from "@/types";
import { getDerivedPollStatus } from "@/lib/poll-status";

// Define Candidate type based on getCandidateDetailsForPoll
interface Candidate {
    id: string;
    name: string;
    party: string;
    imageUrl: string;
    description: string;
    isActive: boolean;
}

// Helper function to format time remaining or until start
const getTimeDisplay = (startTime: number, endTime: number, status: Poll["status"]): string => {
    const now = Date.now() / 1000;
    const remainingSeconds = endTime - now;
    const untilStartSeconds = startTime - now;

    if (status === "ended" || remainingSeconds <= 0) return "Ended";
    if (status === "upcoming" && untilStartSeconds > 0) {
        const days = Math.floor(untilStartSeconds / (24 * 60 * 60));
        const hours = Math.floor((untilStartSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((untilStartSeconds % (60 * 60)) / 60);
        if (days > 0) return `${days}d ${hours}h until start`;
        if (hours > 0) return `${hours}h ${minutes}m until start`;
        return `${minutes}m until start`;
    }
    const days = Math.floor(remainingSeconds / (24 * 60 * 60));
    const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
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

export const PollVote = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const account = useActiveAccount();
    const voterAddress = account?.address;
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);
    const [showCandidateInfo, setShowCandidateInfo] = useState<string | null>(null);

    // Fetch poll data
    const { data: pollData, isPending: isPollPending, error: pollError } = useReadContract({
        contract,
        method:
            "function getPoll(uint256 pollId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint8 status, uint256 totalVotes, uint256 candidateCountOut, uint256 minVotersRequired)",
        params: [BigInt(id || "0")],
        queryOptions: { enabled: !!id && !isNaN(Number(id)) },
    });

    // Fetch candidate data
    const { data: candidateData, isPending: isCandidatesPending, error: candidatesError } = useReadContract({
        contract,
        method:
            "function getCandidateDetailsForPoll(uint256 pollId) view returns (uint256[] ids, string[] names, string[] parties, string[] imageUrls, string[] descriptions, bool[] isActiveList)",
        params: [BigInt(id || "0")],
        queryOptions: { enabled: !!id && !isNaN(Number(id)) },
    });

    // Check if voter has voted
    const { data: hasVotedData, error: hasVotedError } = useReadContract({
        contract,
        method: "function hasVoted(address voter, uint256 pollId) view returns (bool)",
        params: [voterAddress ?? "", BigInt(id || "0")],
        queryOptions: { enabled: !!voterAddress && !!id && !isNaN(Number(id)) },
    });

    // Check if voter is eligible
    const { data: isEligibleData, error: isEligibleError } = useReadContract({
        contract,
        method: "function isEligibleToVote(address voter, uint256 pollId) view returns (bool)",
        params: [voterAddress ?? "", BigInt(id || "0")],
        queryOptions: { enabled: !!voterAddress && !!id && !isNaN(Number(id)) },
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
            startTime,
            endTime,
            startDate: new Date(startTime * 1000).toISOString(),
            endDate: new Date(endTime * 1000).toISOString(),
            contractStatus,
            status: getDerivedPollStatus(startTime, endTime, contractStatus),
            totalVotes: Number(pollData[6]),
            candidateCount: Number(pollData[7]),
            createdTime: startTime,
            hasVoted: hasVotedData ?? false,
            isEligible: isEligibleData ?? false,
        };
    }, [pollData, isPollPending, pollError, hasVotedData, isEligibleData]);

    // Memoize candidates array
    const candidates = useMemo<Candidate[]>(() => {
        if (!candidateData || isCandidatesPending || candidatesError) return [];
        return candidateData[0]
            .map((_, index) => ({
                id: candidateData[0][index].toString(),
                name: candidateData[1][index],
                party: candidateData[2][index],
                imageUrl: candidateData[3][index] || "/placeholder.svg",
                description: candidateData[4][index],
                isActive: candidateData[5][index],
            }))
            .filter(c => c.isActive);
    }, [candidateData, isCandidatesPending, candidatesError]);

    // Handle errors and navigation
    useEffect(() => {
        if (!id || isNaN(Number(id))) {
            toast.error("Invalid poll ID");
            navigate("/polls");
            return;
        }
        if (pollError) {
            console.error("Failed to fetch poll:", pollError);
            toast.error(`Error loading poll ID ${id}`);
            navigate("/polls");
        }
        if (candidatesError) {
            console.error("Failed to fetch candidates:", candidatesError);
            toast.error(`Error loading candidates for poll ID ${id}`);
        }
        if (hasVotedError) {
            console.error("Failed to check hasVoted:", hasVotedError);
            toast.error("Error checking voting status");
        }
        if (isEligibleError) {
            console.error("Failed to check eligibility:", isEligibleError);
            toast.error("Error checking voter eligibility");
        }
        if (poll && poll.hasVoted) {
            setStep(3);
            toast.info("You have already voted in this poll.");
            return;
        }
        if (poll && poll.status !== "active") {
            toast.warning(`Poll is ${poll.status}. You can only vote in active polls.`);
            navigate(`/polls/${id}/results`);
            return;
        }
        if (poll && !poll.isEligible) {
            toast.warning("You are not eligible to vote in this poll.");
            navigate(`/polls/${id}`);
            return;
        }
        if (poll && candidates.length === 0) {
            toast.warning("No candidates available for this poll.");
            navigate(`/polls/${id}`);
        }
    }, [poll, candidates, pollError, candidatesError, hasVotedError, isEligibleError, id, navigate]);

    // Handlers
    const handleSelectCandidate = (candidateId: string) => {
        setSelectedCandidate(candidateId);
    };

    const handleReview = () => {
        if (selectedCandidate) {
            setStep(2);
        } else {
            toast.error("Please select a candidate");
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else if (step === 1) {
            navigate("/polls");
        }
    };

    const handleFinish = () => {
        navigate("/polls");
    };

    const handleViewResults = () => {
        navigate(`/polls/${id}/results`);
    };

    const getSelectedCandidate = (): Candidate | undefined => {
        return candidates.find((c) => c.id === selectedCandidate);
    };

    const getCandidateInfo = (candidateId: string): Candidate | undefined => {
        return candidates.find((c) => c.id === candidateId);
    };

    // Loading state
    const isLoading = isPollPending || isCandidatesPending;

    return (
        <div className="bg-neutral-900 min-h-screen flex flex-col">
            <Navbar />
            <main className="container mx-auto max-w-7xl py-16 sm:py-20 px-4 flex-grow">
                {isLoading ? (
                    <div className="text-center flex justify-center py-4">
                        <Loading />
                    </div>
                ) : !poll ? (
                    <Card className="text-center p-8 bg-neutral-800 border-neutral-700">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <AlertCircle className="h-12 w-12 text-neutral-500/50" />
                                <p className="text-neutral-500">Poll not found</p>
                                <Button onClick={() => navigate("/polls")} variant="outline" className="border-neutral-700 text-neutral-300">
                                    Back to Polls
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="flex justify-end py-2 gap-2">
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                                <Clock className="h-4 w-4 text-green-500" />
                                <span>{getTimeDisplay(poll.startTime, poll.endTime, poll.status)}</span>
                            </div>
                        </div>
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-2xl font-bold text-white font-lora">{poll.title}</h1>
                                {getStatusBadge(poll.status)}
                            </div>
                            <p className="text-neutral-400">{poll.description}</p>
                        </div>
                        <div className="mb-6">
                            <Progress value={step * 33.33} className="h-2 bg-neutral-700" />
                            <div className="flex justify-between text-sm text-neutral-400 mt-2">
                                <span className={step >= 1 ? "text-primary font-medium" : ""}>View Candidates</span>
                                <span className={step >= 2 ? "text-primary font-medium" : ""}>Confirm Vote</span>
                                <span className={step >= 3 ? "text-primary font-medium" : ""}>Receipt</span>
                            </div>
                        </div>
                        {step === 1 && (
                            <>
                                <Alert className="mb-6 bg-neutral-800 border-neutral-700 text-neutral-300">
                                    <Info className="h-4 w-4 text-blue-500" />
                                    <AlertTitle>Important</AlertTitle>
                                    <AlertDescription>
                                        You can cast only one vote in this election. Your vote will be securely recorded on the blockchain.
                                    </AlertDescription>
                                </Alert>
                                <Card className="bg-neutral-800 border-neutral-700">
                                    <CardHeader>
                                        <CardTitle className="text-white font-lora">Select a Candidate</CardTitle>
                                        <CardDescription className="text-neutral-400">
                                            Choose one candidate from the list below
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {candidates.length === 0 ? (
                                            <p className="text-neutral-500 text-center">No candidates available</p>
                                        ) : (
                                            <RadioGroup
                                                value={selectedCandidate || ""}
                                                onValueChange={handleSelectCandidate}
                                                className="space-y-4"
                                            >
                                                {candidates.map((candidate) => (
                                                    <div
                                                        key={candidate.id}
                                                        className="flex items-center space-x-2 rounded-md border border-neutral-700 p-4 hover:bg-neutral-700/30 transition-colors"
                                                    >
                                                        <RadioGroupItem value={candidate.id} id={candidate.id} className="text-primary" />
                                                        <div className="flex flex-1 items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar>
                                                                    <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
                                                                    <AvatarFallback>
                                                                        {candidate.name
                                                                            .split(" ")
                                                                            .map((n) => n[0])
                                                                            .join("")}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <Label htmlFor={candidate.id} className="flex flex-col cursor-pointer">
                                                                    <span className="font-medium text-white">{candidate.name}</span>
                                                                    <span className="text-sm text-neutral-400">{candidate.party}</span>
                                                                </Label>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setShowCandidateInfo(candidate.id)}
                                                                className="text-neutral-300 hover:text-white"
                                                            >
                                                                View Profile
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="outline" onClick={handleBack} className="border-neutral-700 text-neutral-300">
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Back to Polls
                                        </Button>
                                        <Button
                                            onClick={handleReview}
                                            disabled={!selectedCandidate || candidates.length === 0}
                                            className="bg-primary hover:bg-primary/90 text-white"
                                        >
                                            Review Selection
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </>
                        )}
                        {step === 2 && (
                            <Card className="bg-neutral-800 border-neutral-700">
                                <CardHeader>
                                    <CardTitle className="text-white font-lora">Confirm Your Vote</CardTitle>
                                    <CardDescription className="text-neutral-400">
                                        Please review your selection carefully before submitting
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-md border border-neutral-700 p-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={getSelectedCandidate()?.imageUrl} alt={getSelectedCandidate()?.name} />
                                                <AvatarFallback className="text-lg">
                                                    {getSelectedCandidate()
                                                        ?.name.split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{getSelectedCandidate()?.name}</h3>
                                                <p className="text-neutral-400">{getSelectedCandidate()?.party}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Alert className="bg-neutral-800/50 border-amber-500/50 text-neutral-300">
                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                        <AlertTitle className="text-amber-500">Important Notice</AlertTitle>
                                        <AlertDescription>
                                            <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-400">
                                                <li>Your vote is final and cannot be changed once submitted</li>
                                                <li>Your vote will be anonymously recorded on the blockchain</li>
                                                <li>You will receive a transaction hash to verify your vote</li>
                                            </ul>
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                                <CardFooter className="flex flex-wrap justify-between gap-2 sm:flex-nowrap">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="flex-1 sm:flex-none border-neutral-700 text-neutral-300"
                                        disabled={isSubmitting}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Change Selection
                                    </Button>
                                    <TransactionButton
                                        transaction={() =>
                                            prepareContractCall({
                                                contract,
                                                method: "function castVote(uint256 candidateId, uint256 pollId)",
                                                params: [BigInt(selectedCandidate || "0"), BigInt(id || "0")],
                                            })
                                        }
                                        onTransactionSent={() => setIsSubmitting(true)}
                                        onTransactionConfirmed={(receipt) => {
                                            setIsSubmitting(false);
                                            setTransactionHash(receipt.transactionHash);
                                            setStep(3);
                                            toast.success("Vote successfully recorded!");
                                        }}
                                        onError={(error) => {
                                            setIsSubmitting(false);
                                            let message = error?.message || "Failed to cast vote";
                                            if (message.includes("execution reverted:")) {
                                                message = message.split("execution reverted:")[1]?.trim() || "Vote submission failed";
                                            }
                                            toast.error(`Error: ${message}`);
                                            console.error("Cast vote error:", error);
                                        }}
                                        disabled={isSubmitting || !selectedCandidate || !poll?.isEligible || poll?.status !== "active"}
                                        unstyled
                                        className="flex-1 sm:flex-none min-w-[150px] px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                                                Recording Vote...
                                            </div>
                                        ) : (
                                            <>
                                                Submit Vote to Blockchain
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </>
                                        )}
                                    </TransactionButton>
                                </CardFooter>
                            </Card>
                        )}
                        {step === 3 && (
                            <Card className="max-w-md mx-auto bg-neutral-800 border-neutral-700">
                                <CardHeader className="text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-900/30 mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                    </div>
                                    <CardTitle className="text-xl text-white font-lora">Vote Successfully Recorded</CardTitle>
                                    <CardDescription className="text-neutral-400">
                                        Your vote has been securely recorded on the blockchain
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-md border border-neutral-700 bg-neutral-900 p-4">
                                        <div className="text-center font-mono text-lg text-white">{transactionHash || "N/A"}</div>
                                    </div>
                                    <p className="text-sm text-neutral-400 text-center">
                                        This is your transaction hash. Use it to verify your vote on the blockchain.
                                    </p>
                                    <div className="rounded-md bg-neutral-900 p-4 space-y-2">
                                        <div className="text-sm text-neutral-300">
                                            <span className="font-medium">Transaction ID:</span>
                                            <div className="font-mono text-xs break-all mt-1">{transactionHash || "N/A"}</div>
                                        </div>
                                        <div className="text-sm text-neutral-300">
                                            <span className="font-medium">Block Number:</span>
                                            <span className="font-mono ml-2">N/A</span>
                                        </div>
                                        <div className="text-sm text-neutral-300">
                                            <span className="font-medium">Timestamp:</span>
                                            <span className="ml-2">{new Date().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-2">
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        <Button
                                            variant="outline"
                                            onClick={handleFinish}
                                            className="border-neutral-700 text-neutral-300"
                                        >
                                            Return to Polls
                                        </Button>
                                        <Button onClick={handleViewResults} className="bg-primary hover:bg-primary/90 text-white">
                                            View Results
                                        </Button>
                                    </div>
                                    <Button variant="link" className="text-primary" disabled>
                                        Download Receipt (Coming Soon)
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </>
                )}
            </main>
            <Dialog open={!!showCandidateInfo} onOpenChange={() => setShowCandidateInfo(null)}>
                {showCandidateInfo && (
                    <DialogContent className="sm:max-w-md bg-neutral-800 border-neutral-700 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white font-lora">Candidate Profile</DialogTitle>
                            <DialogDescription className="text-neutral-400">
                                Information about this candidate
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4 py-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={getCandidateInfo(showCandidateInfo)?.imageUrl} alt={getCandidateInfo(showCandidateInfo)?.name} />
                                <AvatarFallback className="text-2xl">
                                    {getCandidateInfo(showCandidateInfo)
                                        ?.name.split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h3 className="font-bold text-lg text-white">{getCandidateInfo(showCandidateInfo)?.name}</h3>
                                <p className="text-neutral-400">{getCandidateInfo(showCandidateInfo)?.party}</p>
                            </div>
                            <Separator className="bg-neutral-700" />
                            <div className="w-full">
                                <h4 className="font-medium mb-2 text-white">Biography</h4>
                                <p className="text-sm text-neutral-400">{getCandidateInfo(showCandidateInfo)?.description}</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => setShowCandidateInfo(null)}
                                className="bg-neutral-700 hover:bg-neutral-600 text-white"
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
            <Footer />
        </div>
    );
};

export default PollVote;