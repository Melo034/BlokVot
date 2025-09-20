import { type ReactNode } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import ConnButton from "@/Pages/Admin/ConnButton";
import Loading from "@/components/utils/Loading";
import { contract } from "@/client";

interface AdminGuardProps {
    children: ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
    const account = useActiveAccount();
    const address = account?.address;

    const { data: isSuperAdmin, isPending: isSuperAdminPending } = useReadContract({
        contract,
        method: "function isSuperAdmin(address addr) view returns (bool)",
        params: [address ?? "0x0000000000000000000000000000000000000000"],
        queryOptions: {
            enabled: !!address,
        },
    });

    const { data: isAdmin, isPending: isAdminPending } = useReadContract({
        contract,
        method: "function isAdmin(address addr) view returns (bool)",
        params: [address ?? "0x0000000000000000000000000000000000000000"],
        queryOptions: {
            enabled: !!address,
        },
    });

    if (!address) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="space-y-3 max-w-md">
                    <h1 className="text-3xl font-semibold font-lora">Admin access only</h1>
                    <p className="text-neutral-400">
                        Connect an authorized administration wallet to open the dashboard tools.
                    </p>
                </div>
                <ConnButton />
            </div>
        );
    }

    if (isAdminPending || isSuperAdminPending) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4">
                <Loading />
                <p className="text-neutral-400">Verifying administrator permissions�</p>
            </div>
        );
    }

    if (!isAdmin && !isSuperAdmin) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="space-y-3 max-w-md">
                    <h1 className="text-3xl font-semibold font-lora">Permission required</h1>
                    <p className="text-neutral-400">
                        This wallet is not registered as an administrator. Please switch to an authorized account or contact your system owner for access.
                    </p>
                </div>
                <ConnButton />
            </div>
        );
    }

    return <>{children}</>;
};
