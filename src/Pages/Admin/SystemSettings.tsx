import { useState } from "react";
import { TransactionButton, useReadContract } from "thirdweb/react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Siren, UserCheck, Settings, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ConnButton from "./ConnButton";

const SystemSettings = () => {
    const [contractPaused, setContractPaused] = useState(false);
    const [newSuperAdmin, setNewSuperAdmin] = useState("");
    const [newAdmin, setNewAdmin] = useState("");
    const [isExecutingRecovery, setIsExecutingRecovery] = useState(false);
    const [isCancelingRecovery, setIsCancelingRecovery] = useState(false);

    // Fetch emergency recovery status
    const { data: recoveryStatus, isPending: isRecoveryStatusPending } = useReadContract({
        contract,
        method: "function getEmergencyRecoveryStatus() view returns (bool isActive, address pendingAdmin, uint256 initiatedTime, uint256 executeTime)",
        params: [],
    }) as { data: [boolean, string, bigint, bigint] | undefined; isPending: boolean };

    const isRecoveryActive = recoveryStatus ? recoveryStatus[0] : false;
    const pendingAdmin = recoveryStatus ? recoveryStatus[1] : "0x0";
    const initiatedTime = recoveryStatus ? Number(recoveryStatus[2]) : 0;
    const executeTime = recoveryStatus ? Number(recoveryStatus[3]) : 0;
    const canExecuteRecovery = isRecoveryActive && Date.now() / 1000 >= executeTime;

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
                                    <BreadcrumbLink href="/admin-dashboard" className="hover:text-neutral-500">
                                        Admin Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-white">Settings</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex-1 flex justify-end pr-4">
                        <ConnButton />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 bg-neutral-900 py-14">
                    <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                <Shield className="h-5 w-5 mr-2 text-green-500" />
                                System Administration
                            </CardTitle>
                            <CardDescription className="text-neutral-400">
                                Contract-level administrative functions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert className="bg-red-900/20 border-red-500 text-red-200">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-neutral-400">
                                    <strong className="text-neutral-300">Warning:</strong> These actions affect the entire voting system. Use with extreme caution.
                                </AlertDescription>
                            </Alert>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-neutral-900 border border-neutral-700">
                                    <CardHeader>
                                        <CardTitle className="text-sm text-white flex items-center">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Contract Control
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-white">Contract Status</p>
                                                <p className="text-xs text-neutral-400">
                                                    {contractPaused ? 'Paused - No voting allowed' : 'Active - Normal operations'}
                                                </p>
                                            </div>
                                            {contractPaused ? (
                                                <TransactionButton
                                                    transaction={() =>
                                                        prepareContractCall({
                                                            contract,
                                                            method: "function unpauseContract()",
                                                            params: [],
                                                        })
                                                    }
                                                    onTransactionConfirmed={() => {
                                                        toast.success("Contract unpaused successfully!");
                                                        setContractPaused(false);
                                                    }}
                                                    onError={(err) => {
                                                        let message = err?.message || "Unknown error";
                                                        if (message.includes("execution reverted:")) {
                                                            message = message.split("execution reverted:")[1]?.trim() || "Unpause failed";
                                                        }
                                                        toast.error(`Error: ${message}`);
                                                    }}
                                                    unstyled
                                                    className="min-w-[150px] px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Unpause Contract
                                                </TransactionButton>
                                            ) : (
                                                <TransactionButton
                                                    transaction={() =>
                                                        prepareContractCall({
                                                            contract,
                                                            method: "function pauseContract()",
                                                            params: [],
                                                        })
                                                    }
                                                    onTransactionConfirmed={() => {
                                                        toast.success("Contract paused successfully!");
                                                        setContractPaused(true);
                                                    }}
                                                    onError={(err) => {
                                                        let message = err?.message || "Unknown error";
                                                        if (message.includes("execution reverted:")) {
                                                            message = message.split("execution reverted:")[1]?.trim() || "Pause failed";
                                                        }
                                                        toast.error(`Error: ${message}`);
                                                    }}
                                                    unstyled
                                                    className="min-w-[150px] px-6 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Pause Contract
                                                </TransactionButton>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-neutral-900 border border-neutral-700">
                                    <CardHeader>
                                        <CardTitle className="text-sm text-white flex items-center">
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Admin Transfer
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-super-admin" className="text-sm text-neutral-300">New Super Admin Address</Label>
                                            <Input
                                                id="new-super-admin"
                                                placeholder="0x..."
                                                value={newSuperAdmin}
                                                onChange={(e) => setNewSuperAdmin(e.target.value)}
                                                className="bg-neutral-800 text-white placeholder:text-neutral-500 border border-neutral-600"
                                            />
                                        </div>
                                        <TransactionButton
                                            transaction={() =>
                                                prepareContractCall({
                                                    contract,
                                                    method: "function transferSuperAdmin(address newSuperAdmin)",
                                                    params: [newSuperAdmin],
                                                })
                                            }
                                            onTransactionConfirmed={() => {
                                                toast.success("Admin rights transferred successfully!");
                                                setNewSuperAdmin("");
                                            }}
                                            onError={(err) => {
                                                let message = err?.message || "Unknown error";
                                                if (message.includes("execution reverted:")) {
                                                    message = message.split("execution reverted:")[1]?.trim() || "Transfer failed";
                                                }
                                                toast.error(`Error: ${message}`);
                                            }}
                                            disabled={!newSuperAdmin}
                                            unstyled
                                            className="min-w-[150px] px-6 py-2 rounded-xl bg-primary hover:bg-primary/80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Transfer Admin Rights
                                        </TransactionButton>
                                        <p className="text-xs text-neutral-400">
                                            Transfers super admin role to new address
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-neutral-900 border border-neutral-700">
                                    <CardHeader>
                                        <CardTitle className="text-sm text-white flex items-center">
                                            <Siren className="h-4 w-4 mr-2" />
                                            Emergency Recovery
                                        </CardTitle>
                                        <CardDescription className="text-sm text-neutral-400">
                                            This section allows you to recover the contract in case of critical issues. Use with extreme caution.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-recovery-admin" className="text-sm text-neutral-300">New Recovery Admin</Label>
                                            <Input
                                                id="new-recovery-admin"
                                                placeholder="0x..."
                                                value={newAdmin}
                                                onChange={(e) => setNewAdmin(e.target.value)}
                                                className="bg-neutral-800 text-white placeholder:text-neutral-500 border border-neutral-600"
                                            />
                                        </div>
                                        <TransactionButton
                                            transaction={() =>
                                                prepareContractCall({
                                                    contract,
                                                    method: "function initiateEmergencyRecovery(address newAdmin)",
                                                    params: [newAdmin],
                                                })
                                            }
                                            onTransactionConfirmed={() => {
                                                toast.success("Emergency recovery initiated successfully!");
                                                setNewAdmin("");
                                            }}
                                            onError={(err) => {
                                                let message = err?.message || "Unknown error";
                                                if (message.includes("execution reverted:")) {
                                                    message = message.split("execution reverted:")[1]?.trim() || "Initiate recovery failed";
                                                }
                                                toast.error(`Error: ${message}`);
                                            }}
                                            disabled={!newAdmin || isRecoveryActive}
                                            unstyled
                                            className="min-w-[150px] px-6 py-2 rounded-xl bg-primary hover:bg-primary/80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Initiate Emergency Recovery
                                        </TransactionButton>
                                        <p className="text-xs text-neutral-400">
                                            Initiates emergency recovery with new admin address
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-neutral-900 border border-neutral-700">
                                    <CardHeader>
                                        <CardTitle className="text-sm text-white flex items-center">
                                            <Siren className="h-4 w-4 mr-2" />
                                            Emergency Recovery Status
                                        </CardTitle>
                                        <CardDescription className="text-sm text-neutral-400">
                                            Check the status of the emergency recovery process. If initiated, it allows for a controlled transfer of admin rights.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {isRecoveryStatusPending ? (
                                            <p className="text-sm text-neutral-400">Loading recovery status...</p>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-white">Status</p>
                                                    <p className={`text-sm ${isRecoveryActive ? 'text-green-400' : 'text-neutral-400'}`}>
                                                        {isRecoveryActive ? 'Active' : 'Inactive'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-white">Pending Admin</p>
                                                    <p className="text-sm text-neutral-400">
                                                        {pendingAdmin === '0x0' ? 'None' : pendingAdmin}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-white">Initiated Time</p>
                                                    <p className="text-sm text-neutral-400">
                                                        {initiatedTime ? new Date(initiatedTime * 1000).toLocaleString() : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-white">Executable After</p>
                                                    <p className="text-sm text-neutral-400">
                                                        {executeTime ? new Date(executeTime * 1000).toLocaleString() : 'N/A'}
                                                    </p>
                                                </div>
                                                {isRecoveryActive && (
                                                    <div className="flex gap-4 mt-4">
                                                        <TransactionButton
                                                            transaction={() =>
                                                                prepareContractCall({
                                                                    contract,
                                                                    method: "function executeEmergencyRecovery()",
                                                                    params: [],
                                                                })
                                                            }
                                                            onTransactionSent={() => setIsExecutingRecovery(true)}
                                                            onTransactionConfirmed={() => {
                                                                toast.success("Emergency recovery executed successfully!");
                                                                setIsExecutingRecovery(false);
                                                                setNewAdmin("");
                                                            }}
                                                            onError={(err) => {
                                                                let message = err?.message || "Unknown error";
                                                                if (message.includes("execution reverted:")) {
                                                                    message = message.split("execution reverted:")[1]?.trim() || "Execute recovery failed";
                                                                }
                                                                toast.error(`Error: ${message}`);
                                                                setIsExecutingRecovery(false);
                                                            }}
                                                            disabled={!canExecuteRecovery || isCancelingRecovery}
                                                            unstyled
                                                            className="min-w-[150px] px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isExecutingRecovery ? (
                                                                <div className="flex items-center">
                                                                    <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
                                                                    Executing...
                                                                </div>
                                                            ) : (
                                                                "Execute Recovery"
                                                            )}
                                                        </TransactionButton>
                                                        <TransactionButton
                                                            transaction={() =>
                                                                prepareContractCall({
                                                                    contract,
                                                                    method: "function cancelEmergencyRecovery()",
                                                                    params: [],
                                                                })
                                                            }
                                                            onTransactionSent={() => setIsCancelingRecovery(true)}
                                                            onTransactionConfirmed={() => {
                                                                toast.success("Emergency recovery canceled successfully!");
                                                                setIsCancelingRecovery(false);
                                                                setNewAdmin("");
                                                            }}
                                                            onError={(err) => {
                                                                let message = err?.message || "Unknown error";
                                                                if (message.includes("execution reverted:")) {
                                                                    message = message.split("execution reverted:")[1]?.trim() || "Cancel recovery failed";
                                                                }
                                                                toast.error(`Error: ${message}`);
                                                                setIsCancelingRecovery(false);
                                                            }}
                                                            disabled={isExecutingRecovery}
                                                            unstyled
                                                            className="min-w-[150px] px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isCancelingRecovery ? (
                                                                <div className="flex items-center">
                                                                    <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full" />
                                                                    Canceling...
                                                                </div>
                                                            ) : (
                                                                "Cancel Recovery"
                                                            )}
                                                        </TransactionButton>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default SystemSettings;