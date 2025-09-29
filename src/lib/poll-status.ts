import type { Poll } from "@/types";
import { PollStatus as ContractPollStatus } from "@/types";

const CONTRACT_STATUS_VALUES = new Set<ContractPollStatus>([
    ContractPollStatus.CREATED,
    ContractPollStatus.ACTIVE,
    ContractPollStatus.ENDED,
    ContractPollStatus.FINALIZED,
    ContractPollStatus.DISPUTED,
]);

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

export const getEffectiveContractPollStatus = (
    startTime: number,
    endTime: number,
    contractStatus?: number,
): ContractPollStatus => {
    const now = Math.floor(Date.now() / 1000);
    const normalizedStatus =
        typeof contractStatus === "number" && CONTRACT_STATUS_VALUES.has(contractStatus as ContractPollStatus)
            ? (contractStatus as ContractPollStatus)
            : ContractPollStatus.CREATED;

    if (
        normalizedStatus === ContractPollStatus.FINALIZED ||
        normalizedStatus === ContractPollStatus.DISPUTED
    ) {
        return normalizedStatus;
    }

    if (normalizedStatus === ContractPollStatus.ENDED) {
        return ContractPollStatus.ENDED;
    }

    const hasEnded = endTime > 0 && now >= endTime;
    if (hasEnded) {
        return ContractPollStatus.ENDED;
    }

    const hasStarted = startTime > 0 && now >= startTime;
    if (hasStarted) {
        return ContractPollStatus.ACTIVE;
    }

    return normalizedStatus;
};
