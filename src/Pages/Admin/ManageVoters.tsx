import { useState } from "react";
import { useReadContract } from "thirdweb/react";
import { contract } from "@/client";
import { AppSidebar } from "@/components/utils/app-sidebar";
import { Label } from "@/components/ui/label";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { toast } from "sonner";
import ConnButton from "./ConnButton";
import Loading from "@/components/utils/Loading";

interface Voter {
    address: string;
    name: string;
    email: string;
    isRegistered: boolean;
    isVerified: boolean;
    registrationTime: number;
    totalVotesCast: number;
}

const getStatusColor = (isVerified: boolean): string => {
    return isVerified
        ? "bg-green-900/30 text-green-400"
        : "bg-red-900/30 text-red-400";
};

const getStatusText = (isVerified: boolean): string => {
    return isVerified ? "Verified" : "Unverified";
};

export const ManageVoters = () => {
    const [voterAddress, setVoterAddress] = useState<string>("");
    const [voter, setVoter] = useState<Voter | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch voter details for a single address
    const { data: voterData, isPending: isVoterPending } = useReadContract({
        contract,
        method:
            "function getVoterInfo(address voterAddr) view returns (string name, string email, bool isRegistered, bool isVerified, uint256 registrationTime, uint256 votesCastByVoter)",
        params: [voterAddress],
        queryOptions: { enabled: !!voterAddress }, // Only fetch when address is provided
    }) as {
        data: [string, string, boolean, boolean, bigint, bigint] | undefined;
        isPending: boolean;
    };

    const handleFetchVoter = async () => {
        if (!voterAddress) {
            toast.error("Please enter a voter address");
            return;
        }
        try {
            setIsLoading(true);
            if (voterData && voterData[2]) { // Check isRegistered
                const voterInfo: Voter = {
                    address: voterAddress,
                    name: voterData[0] || "N/A",
                    email: voterData[1] || "N/A",
                    isRegistered: voterData[2],
                    isVerified: voterData[3],
                    registrationTime: Number(voterData[4]),
                    totalVotesCast: Number(voterData[5]),
                };
                setVoter(voterInfo);
            } else {
                setVoter(null);
                toast.error("No registered voter found for this address");
            }
        } catch (error) {
            console.error("Failed to fetch voter:", error);
            toast.error("Error fetching voter details");
        } finally {
            setIsLoading(false);
        }
    };

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
                                    <BreadcrumbLink
                                        className="hover:text-neutral-500"
                                        href="/admin-dashboard"
                                    >
                                        Admin Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-white">Manage Voters</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex-1 flex justify-end pr-4">
                        <ConnButton />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 bg-neutral-900 py-28">
                    <div className="w-full max-w-5xl mx-auto">
                        <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                    <Users className="h-5 w-5 mr-2 text-green-500" />
                                    Manage Voters
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Enter a voter address to view their details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="voter-address">Voter Address *</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="voter-address"
                                                placeholder="Enter voter address (e.g., 0x...)"
                                                value={voterAddress}
                                                onChange={(e) => setVoterAddress(e.target.value)}
                                                className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                            />
                                            <Button
                                                onClick={handleFetchVoter}
                                                disabled={isLoading || isVoterPending}
                                                className="bg-primary hover:bg-primary/90 text-white min-w-[150px]"
                                            >
                                                {isLoading || isVoterPending ? (
                                                    <div className="flex items-center">
                                                        <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
                                                        Fetching...
                                                    </div>
                                                ) : (
                                                    "Fetch Voter"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {isLoading || isVoterPending ? (
                                    <div className="text-center flex justify-center py-4">
                                        <Loading />
                                    </div>
                                ) : !voter ? (
                                    <div className="text-center py-4">No voter data available. Enter an address above.</div>
                                ) : (
                                    <div className="rounded-md border border-neutral-700">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-neutral-700 hover:bg-neutral-700/50">
                                                    <TableHead className="text-neutral-300">Name</TableHead>
                                                    <TableHead className="text-neutral-300">Email</TableHead>
                                                    <TableHead className="text-neutral-300">Address</TableHead>
                                                    <TableHead className="text-neutral-300">Status</TableHead>
                                                    <TableHead className="text-neutral-300">Registered</TableHead>
                                                    <TableHead className="text-neutral-300">Votes Cast</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow
                                                    key={voter.address}
                                                    className="border-neutral-700 hover:bg-neutral-700/30"
                                                >
                                                    <TableCell className="font-medium text-white">
                                                        {voter.name || "N/A"}
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        {voter.email || "N/A"}
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        {voter.address}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(voter.isVerified)}`}
                                                        >
                                                            {getStatusText(voter.isVerified)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        {new Date(voter.registrationTime * 1000).toISOString().split('T')[0]}
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        {voter.totalVotesCast}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default ManageVoters;