import type { JSX } from "react";
import { Badge } from "@/components/ui/badge";
import type { Poll } from "@/types";

/**
 * Convert bigint or number to number
 */
export const toNumber = (value: number | bigint): number =>
    (typeof value === "bigint" ? Number(value) : value);

/**
 * Format plural labels
 */
export const formatPlural = (count: number | bigint, singular: string, plural?: string): string => {
    const numeric = Math.abs(toNumber(count));
    const label = numeric <= 1 ? singular : plural ?? `${singular}s`;
    return label;
};

/**
 * Format count with label (e.g., "5 votes")
 */
export const formatCountLabel = (count: number | bigint, singular: string, plural?: string): string => {
    const numeric = toNumber(count);
    return `${numeric.toLocaleString()} ${formatPlural(numeric, singular, plural)}`;
};

/**
 * Format compact number (e.g., 1.2K, 3.4M)
 */
export const formatCompactNumber = (value: number | bigint): string => {
    const numeric = toNumber(value);
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(numeric);
};

/**
 * Resolve IPFS URLs to HTTPS gateway URLs
 */
export const resolveImageUrl = (url: string): string => {
    if (!url) return "/placeholder.svg";
    return url.startsWith("ipfs://") ? url.replace("ipfs://", "https://ipfs.io/ipfs/") : url;
};

/**
 * Get initials from name (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
    return initials || "?";
};

/**
 * Format timestamp to locale date string
 */
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

/**
 * Format timestamp to locale date time string
 */
export const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Format duration in seconds to human-readable format
 */
export const formatDuration = (seconds: number | undefined): string => {
    if (!seconds || seconds <= 0) return "<1m";
    const days = Math.floor(seconds / 86_400);
    const hours = Math.floor((seconds % 86_400) / 3_600);
    const minutes = Math.floor((seconds % 3_600) / 60);
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (!days && minutes) parts.push(`${minutes}m`);
    return parts.join(" ") || "<1m";
};

/**
 * Get status badge component
 */
export const getStatusBadge = (status: Poll["status"]): JSX.Element => {
    switch (status) {
        case "active":
            return (
                <Badge className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-emerald-200">
                    Active
                </Badge>
            );
        case "ended":
            return (
                <Badge className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-neutral-300">
                    Ended
                </Badge>
            );
        default:
            return (
                <Badge className="rounded-full border border-sky-500/30 bg-sky-500/15 px-3 py-1 text-sky-200">
                    Upcoming
                </Badge>
            );
    }
};

/**
 * Calculate time display for polls (remaining time or until start)
 */
export const getTimeDisplay = (
    startTime: number,
    endTime: number,
    status: Poll["status"]
): { remaining: string | null; untilStart: string | null } => {
    const now = Date.now() / 1000;
    const remainingSeconds = endTime - now;
    const untilStartSeconds = startTime - now;

    if (status === "ended" || remainingSeconds <= 0) {
        return { remaining: "Ended", untilStart: null };
    }

    if (status === "upcoming" && untilStartSeconds > 0) {
        const days = Math.floor(untilStartSeconds / (24 * 60 * 60));
        const hours = Math.floor((untilStartSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((untilStartSeconds % (60 * 60)) / 60);
        if (days > 0) return { remaining: null, untilStart: `${days}d ${hours}h until start` };
        if (hours > 0) return { remaining: null, untilStart: `${hours}h ${minutes}m until start` };
        return { remaining: null, untilStart: `${minutes}m until start` };
    }

    const days = Math.floor(remainingSeconds / (24 * 60 * 60));
    const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    if (days > 0) return { remaining: `${days}d ${hours}h remaining`, untilStart: null };
    if (hours > 0) return { remaining: `${hours}h ${minutes}m remaining`, untilStart: null };
    return { remaining: `${minutes}m remaining`, untilStart: null };
};

/**
 * Get simple time display string (for PollVote page)
 */
export const getTimeDisplayString = (
    startTime: number,
    endTime: number,
    status: Poll["status"]
): string => {
    const { remaining, untilStart } = getTimeDisplay(startTime, endTime, status);
    return untilStart || remaining || "Ended";
};
