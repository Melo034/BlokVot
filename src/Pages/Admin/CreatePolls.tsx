import { useState } from "react"
import { prepareContractCall } from "thirdweb"
import { TransactionButton } from "thirdweb/react"
import { contract } from "@/client"
import { AppSidebar } from "@/components/utils/app-sidebar"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset, SidebarProvider, SidebarTrigger
} from "@/components/ui/sidebar"
import { Calendar } from "lucide-react"
import { toast } from "sonner"
import ConnButton from "./ConnButton"


const CreatePolls = () => {
    const [pollTitle, setPollTitle] = useState("")
    const [pollDescription, setPollDescription] = useState("")
    const [minVoters, setMinVoters] = useState("10")

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
                                    <BreadcrumbPage className="text-white">Create Poll</BreadcrumbPage>
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
                                    <Calendar className="h-5 w-5 mr-2 text-green-500" />
                                    Create New Poll
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Create a new poll. Candidates can be added after creation.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="poll-title">Poll Title *</Label>
                                        <Input
                                            id="poll-title"
                                            value={pollTitle}
                                            onChange={(e) => setPollTitle(e.target.value)}
                                            placeholder="e.g., Presidential Election 2024"
                                            className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="poll-description">Description *</Label>
                                        <Textarea
                                            id="poll-description"
                                            value={pollDescription}
                                            onChange={(e) => setPollDescription(e.target.value)}
                                            placeholder="Describe the purpose and scope of this poll"
                                            rows={4}
                                            className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="min-voters">Minimum Voters Required *</Label>
                                        <Input
                                            id="min-voters"
                                            type="number"
                                            value={minVoters}
                                            onChange={(e) => setMinVoters(e.target.value)}
                                            min="10"
                                            placeholder="10"
                                            className="bg-neutral-900 text-white border border-neutral-700"
                                        />
                                        <p className="text-sm text-neutral-400">Minimum 10 voters required</p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <TransactionButton
                                        transaction={() => {
                                            return prepareContractCall({
                                                contract,
                                                method:
                                                    "function createPoll(string title, string description, uint256 minVotersRequired) returns (uint256)",
                                                params: [
                                                    pollTitle,
                                                    pollDescription,
                                                    BigInt(parseInt(minVoters)),
                                                ]
                                            });
                                        }}
                                        onTransactionConfirmed={() => {
                                            toast.success("Poll created successfully!");

                                            // Reset form
                                            setPollTitle("");
                                            setPollDescription("");
                                            setMinVoters("10");
                                        }}
                                        onError={(error) => {
                                            let message = error?.message || "Transaction failed";
                                            if (message.includes("execution reverted:")) {
                                                message = message.split("execution reverted:")[1].trim();
                                            }
                                            toast.error(`Error: ${message}`);
                                            console.error("Create poll error:", error);
                                        }}
                                        disabled={!pollTitle || !pollDescription || parseInt(minVoters) < 10}
                                        unstyled
                                        className="min-w-[150px] px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white"
                                    >
                                        Create Poll
                                    </TransactionButton>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default CreatePolls
