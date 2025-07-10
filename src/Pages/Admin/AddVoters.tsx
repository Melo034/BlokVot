import { useState } from "react";
import { TransactionButton } from "thirdweb/react";
import { prepareContractCall} from "thirdweb";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCheck, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import ConnButton from "./ConnButton";



export const AddVoters = () => {
    const [voterAddress, setVoterAddress] = useState("");
    const [voterName, setVoterName] = useState("");
    const [voterEmail, setVoterEmail] = useState("");
    

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
                                    <BreadcrumbPage className="text-white">Add Voter</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex-1 flex justify-end pr-4">
                        <ConnButton />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-6 p-4 bg-neutral-900 py-28">
                    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Register New Voter */}
                        <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                    <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                                    Register New Voter
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Register and optionally verify a new voter
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="voter-address">Wallet Address *</Label>
                                    <Input
                                        id="voter-address"
                                        value={voterAddress}
                                        onChange={(e) => setVoterAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="voter-name">Full Name *</Label>
                                        <Input
                                            id="voter-name"
                                            value={voterName}
                                            onChange={(e) => setVoterName(e.target.value)}
                                            placeholder="John Doe"
                                            className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="voter-email">Email Address *</Label>
                                        <Input
                                            id="voter-email"
                                            type="email"
                                            value={voterEmail}
                                            onChange={(e) => setVoterEmail(e.target.value)}
                                            placeholder="john.doe@example.com"
                                            className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 justify-end">
                                    <TransactionButton
                                        transaction={() =>
                                            prepareContractCall({
                                                contract,
                                                method: "function registerVoter(address voterAddr, string name, string email)",
                                                params: [voterAddress, voterName, voterEmail],
                                            })
                                        }
                                        onTransactionConfirmed={() => {
                                            toast.success("Voter registered successfully!");
                                            setVoterAddress("");
                                            setVoterName("");
                                            setVoterEmail("");
                                        }}
                                        onError={(error) => {
                                            let message = error?.message || "Unknown error";
                                            if (message.includes("execution reverted:")) {
                                                message = message.split("execution reverted:")[1]?.trim() || "Register failed";
                                            }
                                            toast.error(`Error: ${message}`);
                                        }}
                                        disabled={!voterAddress || !voterName || !voterEmail}
                                        unstyled
                                        className="min-w-[150px] px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Register Voter
                                    </TransactionButton>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Verify Existing Voter */}
                        <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                                    Verify Existing Voter
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Verify or update verification for registered voters
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="verify-address">Voter Address</Label>
                                    <Input
                                        id="verify-address"
                                        value={voterAddress}
                                        onChange={(e) => setVoterAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <TransactionButton
                                        transaction={() =>
                                            prepareContractCall({
                                                contract,
                                                method: "function verifyVoter(address voterAddr)",
                                                params: [voterAddress],
                                            })
                                        }
                                        onTransactionConfirmed={() => {
                                            toast.success("Voter verified successfully!");
                                        }}
                                        onError={(error) => {
                                            let message = error?.message || "Unknown error";
                                            if (message.includes("execution reverted:")) {
                                                message = message.split("execution reverted:")[1]?.trim() || "Verify failed";
                                            }
                                            toast.error(`Error: ${message}`);
                                        }}
                                        disabled={!voterAddress}
                                        unstyled
                                        className="min-w-[150px] px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Verify Voter
                                    </TransactionButton>
                                    <TransactionButton
                                        transaction={() =>
                                            prepareContractCall({
                                                contract,
                                                method: "function unverifyVoter(address voterAddr)",
                                                params: [voterAddress],
                                            })
                                        }
                                        onTransactionConfirmed={() => {
                                            toast.success("Voter unverified successfully!");
                                        }}
                                        onError={(error) => {
                                            let message = error?.message || "Unknown error";
                                            if (message.includes("execution reverted:")) {
                                                message = message.split("execution reverted:")[1]?.trim() || "Unverify failed";
                                            }
                                            toast.error(`Error: ${message}`);
                                        }}
                                        disabled={!voterAddress}
                                        unstyled
                                        className="min-w-[150px] px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Unverify Voter
                                    </TransactionButton>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AddVoters;