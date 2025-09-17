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
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { Users, Vote, UserCheck, CheckCircle, Settings, XCircle} from "lucide-react";
import { toast } from "sonner";
import ConnButton from "./ConnButton";
import { PollStatus } from "@/types";
import type { DashboardPoll } from "@/types";
import Loading from "@/components/utils/Loading";
import BackButton from "@/components/utils/BackButton";


const PollStatusLabel: Record<PollStatus, string> = {
    [PollStatus.CREATED]: "Created",
    [PollStatus.ACTIVE]: "Active",
    [PollStatus.ENDED]: "Ended",
    [PollStatus.FINALIZED]: "Finalized",
    [PollStatus.DISPUTED]: "Disputed",
};

function getStatusBadge(status: PollStatus) {
    let color = "";
    switch (status) {
        case PollStatus.ACTIVE:
            color = "bg-green-900/30 text-green-400";
            break;
        case PollStatus.FINALIZED:
            color = "bg-blue-900/30 text-blue-400";
            break;
        case PollStatus.DISPUTED:
            color = "bg-red-900/30 text-red-400";
            break;
        case PollStatus.CREATED:
            color = "bg-blue-900/30 text-blue-400";
            break;
        case PollStatus.ENDED:
            color = "bg-orange-900/30 text-orange-400";
            break;
        default:
            color = "bg-neutral-900/30 text-neutral-400";
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {PollStatusLabel[status]}
        </span>
    );
}

const Dashboard = () => {
    const [polls, setPolls] = useState<DashboardPoll[]>([]);
    const [managePollId, setManagePollId] = useState<string | undefined>(undefined);
    const [isFinalizingPoll, setIsFinalizingPoll] = useState(false);
    const [isEndingPoll, setIsEndingPoll] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // System stats
    const { data: stats, isPending: isStatsPending } = useReadContract({
        contract,
        method: "function getSystemStats() view returns (uint256 totalPolls, uint256 totalCandidates, uint256 totalVoters, uint256 totalVotes, uint256 activePolls)",
        params: [],
    }) as { data: [bigint, bigint, bigint, bigint, bigint] | undefined; isPending: boolean };

    // Polls
    const { data: pollIds, isPending: isPollsPending } = useReadContract({
        contract,
        method: "function getAllPolls() view returns (uint256[])",
        params: [],
    }) as { data: bigint[] | undefined; isPending: boolean };

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                setIsLoading(true);

                if (!pollIds || !Array.isArray(pollIds)) {
                    setPolls([]);
                    return;
                }

                const pollData = await Promise.all(
                    pollIds.map(async (id) => {
                        try {
                            const poll = await readContract({
                                contract,
                                method:
                                    "function getPoll(uint256 pollId) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint8 status, uint256 totalVotes, uint256 candidateCountOut, uint256 minVotersRequired)",
                                params: [id],
                            });
                            return {
                                id: id.toString(),
                                title: poll[1],
                                status: parseInt(poll[5].toString()) as PollStatus,
                                candidateCount: Number(poll[7]),
                                totalVotes: Number(poll[6]),
                                minVotersRequired: Number(poll[8]),
                            };
                        } catch (err) {
                            console.error(`Failed to fetch poll ${id}:`, err);
                            return null;
                        }
                    })
                );
                const filteredPolls = pollData.filter(Boolean) as DashboardPoll[];
                setPolls(filteredPolls);
            } catch (error) {
                console.error("Failed to load polls:", error);
                toast.error("Error loading polls from contract");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPolls();
    }, [pollIds]);

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
                                    <BreadcrumbPage className="text-white">Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex-1 flex justify-end gap-3 sm:gap-3 pr-2 sm:pr-4">
                        <BackButton />
                        <ConnButton />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 bg-neutral-900 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="border-neutral-700 bg-neutral-800 text-white rounded-2xl shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{Number(stats?.[0] ?? 0) === 1 ? "Total Poll" : "Total Polls"}</CardTitle>
                                <Vote className="h-4 w-4 text-neutral-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary/80">
                                    {isStatsPending ? "..." : stats ? Number(stats[0]) : 0}
                                </div>
                                <p className="text-xs text-neutral-400">All-time created</p>
                            </CardContent>
                        </Card>
                        <Card className="border-neutral-700 bg-neutral-800 text-white rounded-2xl shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{Number(stats?.[4] ?? 0) === 1 ? "Active Poll" : "Active Polls"}</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-400">
                                    {isStatsPending ? "..." : stats ? Number(stats[4]) : 0}
                                </div>
                                <p className="text-xs text-neutral-400">Currently running</p>
                            </CardContent>
                        </Card>
                        <Card className="border-neutral-700 bg-neutral-800 text-white rounded-2xl shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{Number(stats?.[2] ?? 0) === 1 ? "Total Voter" : "Total Voters"}</CardTitle>
                                <Users className="h-4 w-4 text-neutral-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isStatsPending ? "..." : stats ? Number(stats[2]) : 0}
                                </div>
                                <p className="text-xs text-neutral-400">Registered users</p>
                            </CardContent>
                        </Card>
                        <Card className="border-neutral-700 bg-neutral-800 text-white rounded-2xl shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{Number(stats?.[1] ?? 0) === 1 ? "Total Candidate" : "Total Candidates"}</CardTitle>
                                <UserCheck className="h-4 w-4 text-neutral-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isStatsPending ? "..." : stats ? Number(stats[1]) : 0}
                                </div>
                                <p className="text-xs text-neutral-400">All polls combined</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                    <Settings className="h-5 w-5 mr-2 text-green-500" />
                                    Poll Status Overview
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Current status of all polls in the system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading || isPollsPending ? (
                                    <div className="text-center flex justify-center py-4"><Loading/></div>
                                ) : polls.length === 0 ? (
                                    <div className="text-center py-4">No polls available</div>
                                ) : (
                                    <div className="space-y-4">
                                        {polls.map((poll) => (
                                            <div key={poll.id} className="flex items-center justify-between p-4 rounded-lg border border-neutral-700 bg-neutral-900">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-medium text-white">{poll.title}</h3>
                                                        {getStatusBadge(poll.status)}
                                                    </div>
                                                    <p className="text-sm text-neutral-400">
                                                        {poll.candidateCount} candidates • {poll.totalVotes} votes •
                                                        Min voters: {poll.minVotersRequired}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                    <Vote className="h-5 w-5 mr-2 text-green-500" />
                                    Poll Actions
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Finalize or end polls
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Select value={managePollId} onValueChange={setManagePollId}>
                                        <SelectTrigger className="bg-neutral-900 text-white border border-neutral-700 placeholder:text-neutral-400">
                                            <SelectValue placeholder="Choose a poll to manage" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 text-white border border-neutral-700">
                                            {polls.map((poll) => (
                                                <SelectItem key={poll.id} value={poll.id}>
                                                    {poll.title} - {PollStatusLabel[poll.status]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Separator className="bg-neutral-700" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="bg-neutral-900 border border-neutral-700">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm text-white">Finalize Poll</CardTitle>
                                            <CardDescription className="text-xs text-neutral-400">
                                                Mark poll as officially completed
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <TransactionButton
                                                transaction={() =>
                                                    prepareContractCall({
                                                        contract,
                                                        method: "function finalizePoll(uint256 pollId)",
                                                        params: [BigInt(managePollId || 0)],
                                                    })
                                                }
                                                onTransactionSent={() => setIsFinalizingPoll(true)}
                                                onTransactionConfirmed={() => {
                                                    toast.success(`Poll with ID ${managePollId} finalized successfully`);
                                                    setPolls(prev =>
                                                        prev.map(p =>
                                                            p.id === managePollId
                                                                ? { ...p, status: PollStatus.FINALIZED }
                                                                : p
                                                        )
                                                    );
                                                    setIsFinalizingPoll(false);
                                                    setManagePollId(undefined);
                                                }}
                                                onError={(error) => {
                                                    let message = error?.message || "Unknown error";
                                                    if (message.includes("execution reverted:")) {
                                                        message = message.split("execution reverted:")[1]?.trim() || "Finalize failed";
                                                    }
                                                    toast.error(`Error: ${message}`);
                                                    setIsFinalizingPoll(false);
                                                }}
                                                disabled={!managePollId || isFinalizingPoll || isEndingPoll}
                                                unstyled
                                                className="w-full px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isFinalizingPoll ? (
                                                    <div className="flex items-center">
                                                        <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
                                                        Finalizing...
                                                    </div>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Finalize
                                                    </>
                                                )}
                                            </TransactionButton>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-neutral-900 border border-neutral-700">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm text-white">End Poll</CardTitle>
                                            <CardDescription className="text-xs text-neutral-400">
                                                Terminate an active poll
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <TransactionButton
                                                transaction={() =>
                                                    prepareContractCall({
                                                        contract,
                                                        method: "function endPoll(uint256 pollId)",
                                                        params: [BigInt(managePollId || 0)],
                                                    })
                                                }
                                                onTransactionSent={() => setIsEndingPoll(true)}
                                                onTransactionConfirmed={() => {
                                                    toast.success(`Poll with ID ${managePollId} ended successfully`);
                                                    setPolls(prev =>
                                                        prev.map(p =>
                                                            p.id === managePollId
                                                                ? { ...p, status: PollStatus.ENDED }
                                                                : p
                                                        )
                                                    );
                                                    setIsEndingPoll(false);
                                                    setManagePollId(undefined);
                                                }}
                                                onError={(error) => {
                                                    let message = error?.message || "Unknown error";
                                                    if (message.includes("execution reverted:")) {
                                                        message = message.split("execution reverted:")[1]?.trim() || "End poll failed";
                                                    }
                                                    toast.error(`Error: ${message}`);
                                                    setIsEndingPoll(false);
                                                }}
                                                disabled={!managePollId || isEndingPoll || isFinalizingPoll}
                                                unstyled
                                                className="w-full px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isEndingPoll ? (
                                                    <div className="flex items-center">
                                                        <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
                                                        Ending...
                                                    </div>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        End Poll
                                                    </>
                                                )}
                                            </TransactionButton>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Dashboard;