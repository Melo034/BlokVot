import type { Poll } from "@/types";
import { PollStatus as ContractPollStatus } from "@/types";

export const getDerivedPollStatus = (
    startTime: number,
    endTime: number,
    contractStatus?: number,
): Poll["status"] => {
    const now = Math.floor(Date.now() / 1000);

    if (typeof contractStatus === "number") {
        if (
            contractStatus === ContractPollStatus.ENDED ||
            contractStatus === ContractPollStatus.FINALIZED ||
            contractStatus === ContractPollStatus.DISPUTED
        ) {
            return "ended";
        }

        if (contractStatus === ContractPollStatus.ACTIVE) {
            if (now >= endTime && endTime > 0) {
                return "ended";
            }
            if (now >= startTime) {
                return "active";
            }
        }

        if (contractStatus === ContractPollStatus.CREATED && now >= startTime && now < endTime) {
            return "active";
        }
    }

    if (endTime > 0 && now >= endTime) {
        return "ended";
    }

    if (startTime > 0 && now >= startTime) {
        return "active";
    }

    return "upcoming";
};
