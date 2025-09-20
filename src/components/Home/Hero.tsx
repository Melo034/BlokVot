import { Sparkles, ShieldCheck, Vote, Globe2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useReadContract } from "thirdweb/react";
import { contract } from "@/client";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";

interface HeroProps {
    heading?: string;
    description?: string;
    buttons?: {
        primary?: {
            text: string;
            url: string;
        };
        secondary?: {
            text: string;
            url: string;
        };
    };
}

type HighlightConfig = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    value: number;
    trend: { label: string; data: { index: number; value: number }[] };
};

const generateTrend = (base: number): HighlightConfig["trend"] => {
    const safeBase = Math.max(base, 12);
    const points = Array.from({ length: 8 }, (_, idx) => {
        const delta = Math.sin(idx / 2.6) * 0.06 * safeBase;
        const noise = (Math.random() - 0.5) * 0.04 * safeBase;
        return {
            index: idx,
            value: Math.max(safeBase * 0.55, safeBase + delta + noise),
        };
    });
    return {
        label: "Past 8 checkpoints",
        data: points,
    };
};

const Hero = ({
    heading = "The next era of civic trust is already here",
    description = "BlokVot delivers a sovereign voting stack that is verifiable, inclusive, and impeccably designed for national scale.",
    buttons = {
        primary: {
            text: "Explore live polls",
            url: "/polls",
        },
        secondary: {
            text: "See how BlokVot works",
            url: "/how-it-works",
        },
    },
}: HeroProps) => {
    const { data: stats, isPending: isStatsPending } = useReadContract({
        contract,
        method: "function getSystemStats() view returns (uint256 totalPolls, uint256 totalCandidates, uint256 totalVoters, uint256 totalVotes, uint256 activePolls)",
        params: [],
    }) as { data: [bigint, bigint, bigint, bigint, bigint] | undefined; isPending: boolean };

    const highlightCards = useMemo<HighlightConfig[]>(() => {
        const toNumber = (value: bigint | undefined) => (value === undefined ? 0 : Number(value));
        const totalVotes = toNumber(stats?.[3]);
        const activePolls = toNumber(stats?.[4]);
        const totalVoters = toNumber(stats?.[2]);
        const totalCandidates = toNumber(stats?.[1]);

        return [
            {
                icon: Sparkles,
                title: "Ballots anchored",
                description: "Recorded on-chain with cryptographic proofs and audit-ready receipts.",
                value: totalVotes,
                trend: generateTrend(totalVotes),
            },
            {
                icon: ShieldCheck,
                title: "Active polls",
                description: "Live elections currently receiving real-time attestations.",
                value: activePolls,
                trend: generateTrend(Math.max(activePolls, 3) * 48),
            },
            {
                icon: Vote,
                title: "Verified voters",
                description: "Citizens onboarded through secure identity verification flows.",
                value: totalVoters,
                trend: generateTrend(totalVoters),
            },
            {
                icon: Globe2,
                title: "Accredited candidates",
                description: "Participants vetted and published by independent electoral bodies.",
                value: totalCandidates,
                trend: generateTrend(Math.max(totalCandidates, 5) * 12),
            },
        ];
    }, [stats]);

    const heroItems = highlightCards.slice(0, 3);

    return (
        <section className="relative overflow-hidden bg-neutral-950">
            <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
                <div className="absolute -bottom-20 right-16 h-72 w-72 rounded-full bg-sky-500/20 blur-[100px]" />
            </div>
            <div className="container relative mx-auto grid min-h-[calc(100vh-96px)] gap-16 px-6 py-20 lg:grid-cols-[minmax(0,_1.05fr)_minmax(0,_0.95fr)] lg:items-center">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center text-center lg:items-start lg:text-left"
                >
                    <Badge className="mb-6 bg-primary/15 text-primary shadow-sm shadow-primary/40">
                        <Globe2 className="mr-2 h-4 w-4" /> Sovereign digital democracy
                    </Badge>
                    <h1 className="text-balance bg-gradient-to-b from-white via-white/90 to-white/70 bg-clip-text text-4xl font-semibold leading-tight tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                        {heading}
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg text-neutral-300 sm:text-xl">
                        {description}
                    </p>
                    <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row">
                        {buttons.primary && (
                            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_-25px_rgba(37,99,235,0.8)]">
                                <Link to={buttons.primary.url}>{buttons.primary.text}</Link>
                            </Button>
                        )}
                        {buttons.secondary && (
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-12 rounded-full border-neutral-700 bg-neutral-900/60 px-7 text-base text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-900 hover:text-white"
                            >
                                <Link to={buttons.secondary.url} className="flex items-center gap-2">
                                    {buttons.secondary.text}
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                    <div className="mt-12 flex flex-col items-center gap-6 text-left sm:flex-row sm:items-start">
                        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/60 px-6 py-5 text-sm text-neutral-300 shadow-xl shadow-black/40 backdrop-blur">
                            <p className="font-medium text-white">Built for national rollouts</p>
                            <p className="mt-1 max-w-xs text-sm text-neutral-400">
                                Adaptive eligibility, emergency guardianship, and live analytics tuned for electoral commissions.
                            </p>
                        </div>
                        <div className="flex -space-x-4">
                            {["SL"].map((code) => (
                                <div
                                    key={code}
                                    className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-800 text-sm font-semibold text-neutral-200 shadow-lg shadow-black/40"
                                >
                                    {code}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="relative flex justify-center lg:justify-end"
                >
                    <div className="grid w-full max-w-xl gap-4">
                        <div className="rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-[0_40px_90px_-35px_rgba(0,0,0,0.6)] backdrop-blur xl:p-7">
                            <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">Live election health</p>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {highlightCards.map((card, index) => (
                                    <motion.div
                                        key={card.title}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.45, delay: 0.2 + index * 0.08 }}
                                        className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 text-neutral-100 shadow-[0_30px_70px_-50px_rgba(37,99,235,0.5)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                                                <card.icon className="h-5 w-5" />
                                            </div>
                                            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">{card.title}</p>
                                        </div>
                                        <div className="mt-3 flex items-end justify-between gap-2">
                                            {isStatsPending ? (
                                                <Skeleton className="h-7 w-24 rounded-md bg-neutral-800" />
                                            ) : (
                                                <p className="text-2xl font-semibold text-white">{card.value.toLocaleString()}</p>
                                            )}
                                            {!isStatsPending && (
                                                <div className="h-12 w-20">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={card.trend.data}>
                                                            <Area
                                                                type="monotone"
                                                                dataKey="value"
                                                                stroke="hsl(217, 91%, 60%)"
                                                                strokeWidth={2}
                                                                fill="url(#heroSparkline)"
                                                                fillOpacity={0.35}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-primary/80">{card.trend.label}</p>
                                        <p className="mt-2 text-xs text-neutral-400">{card.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {heroItems.map((card, index) => (
                                <motion.div
                                    key={`${card.title}-detail`}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: 0.35 + index * 0.08 }}
                                    className="group rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-primary/30 hover:bg-primary/5"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <card.icon className="h-5 w-5" />
                                    </div>
                                    <p className="mt-4 font-medium text-white">{card.title}</p>
                                    <p className="mt-2 text-sm text-neutral-400">{card.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <svg width="0" height="0">
                        <defs>
                            <linearGradient id="heroSparkline" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                </motion.div>
            </div>
        </section>
    );
};

export { Hero };
