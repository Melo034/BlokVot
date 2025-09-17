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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Vote, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConnButton from "./ConnButton";
import { PollStatus } from "@/types";
import type { PollDetails } from "@/types";
import Loading from "@/components/utils/Loading";
import BackButton from "@/components/utils/BackButton";

const getStatusText = (status: PollStatus): string => {
    switch (status) {
        case PollStatus.CREATED: return "Created";
        case PollStatus.ACTIVE: return "Active";
        case PollStatus.ENDED: return "Ended";
        case PollStatus.FINALIZED: return "Finalized";
        case PollStatus.DISPUTED: return "Disputed";
        default: return "Unknown";
    }
};

const getStatusColor = (status: PollStatus): string => {
    switch (status) {
        case PollStatus.CREATED: return "bg-blue-900/30 text-blue-400";
        case PollStatus.ACTIVE: return "bg-green-900/30 text-green-400";
        case PollStatus.ENDED: return "bg-orange-900/30 text-orange-400";
        case PollStatus.FINALIZED: return "bg-gray-900/30 text-gray-400";
        case PollStatus.DISPUTED: return "bg-red-900/30 text-red-400";
        default: return "bg-gray-900/30 text-gray-400";
    }
};

const ManagePolls = () => {
    const [polls, setPolls] = useState<PollDetails[]>([]);
    const [selectedPoll, setSelectedPoll] = useState<PollDetails | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [titleError, setTitleError] = useState("");
    const [urlError, setUrlError] = useState("");

    // Form state
    const [updateTitle, setUpdateTitle] = useState("");
    const [updateDescription, setUpdateDescription] = useState("");
    const [updateStatus, setUpdateStatus] = useState<PollStatus>(PollStatus.CREATED);
    const [updateMinVotersRequired, setUpdateMinVotersRequired] = useState("");
    const [updateImageUrl, setUpdateImageUrl] = useState("");

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
                                description: poll[2],
                                candidateCount: Number(poll[7]),
                                status: parseInt(poll[5].toString()) as PollStatus,
                                imageUrl: "",
                                createdAt: new Date(Number(poll[3]) * 1000).toISOString().split('T')[0],
                                minVotersRequired: Number(poll[8]),
                            };
                        } catch (err) {
                            console.error(`Failed to fetch poll ${id}:`, err);
                            return null;
                        }
                    })
                );
                const filteredPolls = pollData.filter(Boolean) as PollDetails[];
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

    const handleUpdateClick = (poll: PollDetails) => {
        setSelectedPoll(poll);
        setUpdateTitle(poll.title);
        setUpdateDescription(poll.description);
        setUpdateStatus(poll.status);
        setUpdateMinVotersRequired(poll.minVotersRequired.toString());
        setUpdateImageUrl(poll.imageUrl);
        setIsUpdateModalOpen(true);
        setTitleError("");
        setUrlError("");
    };

    const resetForm = () => {
        setUpdateTitle("");
        setUpdateDescription("");
        setUpdateStatus(PollStatus.CREATED);
        setUpdateMinVotersRequired("");
        setUpdateImageUrl("");
        setSelectedPoll(null);
        setImageFile(null);
        setTitleError("");
        setUrlError("");
    };

    const handleCloseModal = () => {
        setIsUpdateModalOpen(false);
        resetForm();
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
                                    <BreadcrumbLink className="hover:text-neutral-500" href="/admin-dashboard">
                                        Admin Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-white">Manage Polls</BreadcrumbPage>
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
                    <div className="w-full max-w-7xl mx-auto">
                        <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                    <Vote className="h-5 w-5 mr-2 text-green-500" />
                                    Manage Polls
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    View and manage all polls in the system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading || isPollsPending ? (
                                    <div className="text-center flex justify-center py-4"><Loading /></div>
                                ) : polls.length === 0 ? (
                                    <div className="text-center py-4">No polls available</div>
                                ) : (
                                    <div className="rounded-md border border-neutral-700">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-neutral-700 hover:bg-neutral-700/50">
                                                    <TableHead className="text-neutral-300">Image</TableHead>
                                                    <TableHead className="text-neutral-300">Title</TableHead>
                                                    <TableHead className="text-neutral-300">Description</TableHead>
                                                    <TableHead className="text-neutral-300">Candidates</TableHead>
                                                    <TableHead className="text-neutral-300">Status</TableHead>
                                                    <TableHead className="text-neutral-300">Created</TableHead>
                                                    <TableHead className="text-neutral-300">Min Voters</TableHead>
                                                    <TableHead className="text-neutral-300">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {polls.map((poll) => (
                                                    <TableRow key={poll.id} className="border-neutral-700 hover:bg-neutral-700/30">
                                                        <TableCell>
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarImage
                                                                    src={poll.imageUrl}
                                                                    alt={poll.title}
                                                                    className="object-cover"
                                                                />
                                                                <AvatarFallback className="bg-neutral-700 text-white">
                                                                    {poll.title.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-white">
                                                            {poll.title}
                                                        </TableCell>
                                                        <TableCell className="text-neutral-300 max-w-xs truncate">
                                                            {poll.description || "No description"}
                                                        </TableCell>
                                                        <TableCell className="text-neutral-300">
                                                            {poll.candidateCount}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span
                                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(poll.status)}`}
                                                            >
                                                                {getStatusText(poll.status)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-neutral-300">
                                                            {poll.createdAt}
                                                        </TableCell>
                                                        <TableCell className="text-neutral-300">
                                                            {poll.minVotersRequired}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleUpdateClick(poll)}
                                                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                                                    aria-label={`Edit ${poll.title}`}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <TransactionButton
                                                                    transaction={() =>
                                                                        prepareContractCall({
                                                                            contract,
                                                                            method: "function endPoll(uint256 pollId)",
                                                                            params: [BigInt(poll.id)],
                                                                        })
                                                                    }
                                                                    onTransactionConfirmed={() => {
                                                                        toast.success("Poll ended successfully");
                                                                        setPolls(prev =>
                                                                            prev.map(p =>
                                                                                p.id === poll.id ? { ...p, status: PollStatus.ENDED } : p
                                                                            )
                                                                        );
                                                                    }}
                                                                    onError={(error) => {
                                                                        let message = error?.message || "Unknown error";
                                                                        if (message.includes("execution reverted:")) {
                                                                            message = message.split("execution reverted:")[1]?.trim() || "End poll failed";
                                                                        }
                                                                        toast.error(`Error: ${message}`);
                                                                    }}
                                                                    unstyled
                                                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                                    disabled={poll.status !== PollStatus.ACTIVE}
                                                                    aria-label={`End ${poll.title}`}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </TransactionButton>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Dialog open={isUpdateModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="bg-neutral-800 text-white border border-neutral-700 max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">Update Poll</DialogTitle>
                            <DialogDescription className="text-neutral-400">
                                Modify poll details and settings
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="update-title">Title *</Label>
                                <Input
                                    id="update-title"
                                    value={updateTitle}
                                    onChange={(e) => {
                                        setUpdateTitle(e.target.value);
                                        setTitleError(e.target.value ? "" : "Title is required");
                                    }}
                                    placeholder="Poll title"
                                    className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                    aria-describedby="title-error"
                                />
                                {titleError && (
                                    <p id="title-error" className="text-sm text-red-500">
                                        {titleError}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="update-description">Description</Label>
                                    <Textarea
                                        id="update-description"
                                        value={updateDescription}
                                        onChange={(e) => setUpdateDescription(e.target.value)}
                                        placeholder="Poll description"
                                        rows={3}
                                        className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="update-min-voters">Minimum Voters Required *</Label>
                                    <Input
                                        id="update-min-voters"
                                        type="number"
                                        value={updateMinVotersRequired}
                                        onChange={(e) => setUpdateMinVotersRequired(e.target.value)}
                                        placeholder="Minimum voters required"
                                        className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleCloseModal}
                                className="border-neutral-600 text-neutral-600 hover:bg-neutral-700 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <TransactionButton
                                transaction={() =>
                                    prepareContractCall({
                                        contract,
                                        method:
                                            "function updatePoll(uint256 pollId, string title, string description, uint256 minVotersRequired)",
                                        params: [
                                            BigInt(selectedPoll!.id),
                                            updateTitle,
                                            updateDescription,
                                            BigInt(updateMinVotersRequired || 0),
                                        ],
                                    })
                                }
                                onTransactionSent={() => setIsUpdating(true)}
                                onTransactionConfirmed={() => {
                                    toast.success("Poll updated successfully!");
                                    setPolls(prev =>
                                        prev.map(p =>
                                            p.id === selectedPoll?.id
                                                ? {
                                                    ...p,
                                                    title: updateTitle,
                                                    description: updateDescription,
                                                    status: updateStatus,
                                                    minVotersRequired: Number(updateMinVotersRequired),
                                                    imageUrl: imageFile ? updateImageUrl : p.imageUrl,
                                                }
                                                : p
                                        )
                                    );
                                    setIsUpdateModalOpen(false);
                                    resetForm();
                                    setIsUpdating(false);
                                }}
                                onError={(error) => {
                                    let message = error?.message || "Unknown error";
                                    if (message.includes("execution reverted:")) {
                                        message = message.split("execution reverted:")[1]?.trim() || "Update failed";
                                    }
                                    toast.error(`Error: ${message}`);
                                    setIsUpdating(false);
                                }}
                                disabled={!updateTitle || !updateMinVotersRequired || isUpdating || !!urlError}
                                unstyled
                                className="min-w-[150px] px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
                                        Updating...
                                    </div>
                                ) : (
                                    "Update Poll"
                                )}
                            </TransactionButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default ManagePolls;