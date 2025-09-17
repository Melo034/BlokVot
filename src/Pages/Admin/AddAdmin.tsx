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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus } from "lucide-react";
import { toast } from "sonner";
import ConnButton from "./ConnButton";
import BackButton from "@/components/utils/BackButton";

const AddAdmin = () => {
    const [newAdmin, setAdminName] = useState<string>("");
    
    const resetForm = () => {
        setAdminName("");
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
                                    <BreadcrumbPage className="text-white">Add Admin</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                      <div className="flex-1 flex justify-end gap-3 sm:gap-3 pr-2 sm:pr-4">
                        <BackButton />
                        <ConnButton />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 bg-neutral-900 py-28">
                    <div className="w-full max-w-5xl mx-auto">
                        <Card className="bg-neutral-800 text-white border border-neutral-700 rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center font-lora text-lg md:text-xl font-semibold">
                                    <Users className="h-5 w-5 mr-2 text-green-500" />
                                    Add Admin
                                </CardTitle>
                                <CardDescription className="text-neutral-400">
                                    Add Admins to  manage the voting system. Admins can create, manage, and oversee polls.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="Admin-address">Admin Address *</Label>
                                    <Input
                                        id="Admin-address"
                                        value={newAdmin}
                                        onChange={(e) => setAdminName(e.target.value)}
                                        placeholder="Admin Address"
                                        className="bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-700"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <TransactionButton
                                        transaction={() =>
                                            prepareContractCall({
                                                contract,
                                                method:
                                                    "function addAdmin(address newAdmin)",
                                                params: [newAdmin],
                                            })
                                        }
                                        onTransactionConfirmed={() => {
                                            toast.success(`Admin added successfully`);
                                            resetForm();
                                        }}
                                        onError={(error) => {
                                            let message = error?.message || "Transaction failed";
                                            if (message.includes("execution reverted:")) {
                                                message = message.split("execution reverted:")[1]?.trim() || "Transaction failed";
                                            }
                                            toast.error(`Error: ${message}`);
                                            console.error("Add Admin error:", error);
                                        }}
                                        disabled={!newAdmin}
                                        unstyled
                                        className="min-w-[150px] px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Admin
                                        </div>
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

export default AddAdmin